import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { test } from "node:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = path.resolve(import.meta.dirname, "..");
const roles = {
  "super_admin": {
    id: 11,
    name: "Roya Administrator",
    username: "roya-admin",
    email: "roya@example.test",
    phone: "555-1100",
    role: "super_admin",
  },
  admin: {
    id: 12,
    name: "Amin Operator",
    username: "amin-operator",
    email: "amin@example.test",
    phone: "555-1200",
    role: "admin",
  },
  user: {
    id: 13,
    name: "Yasmin Clerk",
    username: "yasmin-clerk",
    email: "yasmin@example.test",
    phone: "555-1300",
    role: "user",
  },
};

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  return candidates.find(existsSync);
}

async function listen(server, port, host = "127.0.0.1") {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  return server.address().port;
}

async function closeServer(server) {
  if (!server?.listening) return;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(value));
}

async function requestBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

test("role-aware UI, Account privacy, direct navigation, and role switching", async (t) => {
  const chromePath = findChrome();
  if (!chromePath) {
    t.skip("Chrome/Edge is not installed; browser smoke test is unavailable.");
    return;
  }

  const apiServer = createHttpServer(async (request, response) => {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      });
      response.end();
      return;
    }

    const requestUrl = new URL(request.url, "http://localhost");
    const token = request.headers.authorization?.replace(/^Bearer /, "");
    const authenticatedRole = token?.replace(/^e2e-/, "");
    const authenticatedUser = roles[authenticatedRole];

    if (requestUrl.pathname === "/login" && request.method === "POST") {
      const body = await requestBody(request);
      const identity = body.identity || body.username || body.email || "";
      const role = identity.includes("admin")
        ? identity.includes("super")
          ? "super_admin"
          : "admin"
        : "user";
      sendJson(response, 200, {
        token: `e2e-${role}`,
        user: roles[role],
      });
      return;
    }

    if (requestUrl.pathname === "/api/me") {
      if (!authenticatedUser) {
        sendJson(response, 401, { message: "Unauthorized" });
        return;
      }
      sendJson(response, 200, {
        ...authenticatedUser,
        permissions: {
          canManageUsers: authenticatedRole === "super_admin",
          canManagePersonalAccount: true,
        },
      });
      return;
    }

    if (requestUrl.pathname === "/users" || requestUrl.pathname.startsWith("/users/")) {
      sendJson(response, authenticatedRole === "super_admin" ? 200 : 403, []);
      return;
    }

    if (requestUrl.pathname === "/employees" && authenticatedRole === "admin") {
      sendJson(response, 200, [{ id: 1, name: "Attendance Employee" }]);
      return;
    }

    if (requestUrl.pathname === "/instructions") {
      sendJson(response, 200, []);
      return;
    }

    if (request.method === "GET") {
      sendJson(response, 200, []);
      return;
    }
    sendJson(response, 200, { success: true });
  });

  const tempProfile = mkdtempSync(path.join(tmpdir(), "office-management-ui-"));
  let browser;
  let vite;
  let socket;
  let closeBrowser;
  let apiPort;
  const pending = new Map();
  let commandId = 0;
  const previousApiUrl = process.env.VITE_API_URL;

  try {
    apiPort = await listen(apiServer, 0);
    process.env.VITE_API_URL = `http://127.0.0.1:${apiPort}`;
    vite = await createViteServer({
      configFile: path.join(root, "vite.config.js"),
      logLevel: "error",
      server: { host: "127.0.0.1", port: 0 },
    });
    await vite.listen();
    const appPort = vite.httpServer.address().port;

    const debugServer = createHttpServer();
    const debugPort = await listen(debugServer, 0);
    await closeServer(debugServer);

    browser = spawn(
      chromePath,
      [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--remote-allow-origins=*",
        `--remote-debugging-port=${debugPort}`,
        `--user-data-dir=${tempProfile}`,
        "about:blank",
      ],
      { stdio: "ignore" }
    );

    let version;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (browser.exitCode !== null) {
        throw new Error(`Browser exited with code ${browser.exitCode}.`);
      }
      try {
        const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
        if (response.ok) {
          version = await response.json();
          break;
        }
      } catch {
        await delay(100);
      }
    }
    assert.ok(version?.webSocketDebuggerUrl, "Chrome DevTools should start");

    const targetResponse = await fetch(
      `http://127.0.0.1:${debugPort}/json/new?about:blank`,
      { method: "PUT" }
    );
    assert.equal(targetResponse.ok, true, "Chrome should create a test page");
    const target = await targetResponse.json();
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const callback = pending.get(message.id);
      if (callback) {
        pending.delete(message.id);
        if (message.error) callback.reject(new Error(message.error.message));
        else callback.resolve(message.result);
      }
    });

    function cdp(method, params = {}) {
      const id = ++commandId;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    }
    closeBrowser = () => cdp("Browser.close");

    async function evaluate(expression) {
      const result = await cdp("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.text);
      }
      return result.result?.value;
    }

    async function waitFor(expression, message) {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        if (await evaluate(expression)) return;
        await delay(100);
      }
      assert.fail(message);
    }

    await cdp("Page.enable");
    await cdp("Runtime.enable");
    await cdp("Page.navigate", { url: `http://127.0.0.1:${appPort}/` });
    await waitFor("Boolean(document.querySelector('.login-box'))", "Login should render");

    async function loadRole(role, staleRole = "super_admin") {
      await evaluate(`(() => {
        localStorage.setItem("office_token", "e2e-${role}");
        localStorage.setItem("office_logged_in", "true");
        localStorage.setItem("office_user", JSON.stringify({
          ...${JSON.stringify(roles[staleRole])},
          role: ${JSON.stringify(staleRole)}
        }));
        localStorage.setItem("office_language", "en");
        location.href = ${JSON.stringify(`http://127.0.0.1:${appPort}/`)};
      })()`);
      await waitFor("Boolean(document.querySelector('.app .account-entry'))", `${role} app should render`);
      await waitFor(
        `document.querySelector('.sidebar-role-badge')?.textContent.toLowerCase().includes(${JSON.stringify(role === "super_admin" ? "super admin" : role)})`,
        `${role} role from /api/me should replace stale cached role`
      );
    }

    async function labels() {
      return evaluate(
        `Array.from(document.querySelectorAll("#primary-navigation .nav-button .nav-label")).map((item) => item.textContent.trim().toLowerCase())`
      );
    }

    async function visitPrimaryPage(label) {
      await evaluate(`Array.from(document.querySelectorAll("#primary-navigation .nav-button")).find((button) => button.querySelector(".nav-label")?.textContent.toLowerCase().includes(${JSON.stringify(label)}))?.click()`);
      await delay(120);
      assert.equal(
        await evaluate(`(document.querySelector(".content .page-title h1")?.getClientRects().length || 0) > 0`),
        true,
        `${label} page should render its heading`
      );
      assert.equal(
        await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`),
        true,
        `${label} page should not overflow horizontally`
      );
    }

    async function visitFinancePage(label) {
      await evaluate(`Array.from(document.querySelectorAll(".finance-subnav button")).find((button) => button.textContent.toLowerCase().includes(${JSON.stringify(label)}))?.click()`);
      await delay(120);
      assert.equal(
        await evaluate(`(document.querySelector(".content .page-title h1")?.getClientRects().length || 0) > 0`),
        true,
        `${label} finance page should render its heading`
      );
      assert.equal(
        await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`),
        true,
        `${label} finance page should not overflow horizontally`
      );
    }

    await loadRole("user");
    assert.deepEqual(
      await evaluate(`(() => {
        const sidebar = getComputedStyle(document.querySelector(".sidebar"));
        const workspace = getComputedStyle(document.querySelector(".main"));
        const account = getComputedStyle(document.querySelector(".account-entry"));
        return [
          sidebar.backgroundColor,
          workspace.backgroundColor,
          account.borderRadius
        ];
      })()`),
      ["rgb(20, 43, 57)", "rgb(243, 246, 247)", "12px"],
      "The premium navy/teal design tokens should be active"
    );
    assert.equal(
      await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`),
      true,
      "Desktop layout should not overflow horizontally"
    );
    await evaluate(`(() => {
      localStorage.setItem("office_language", "fa");
      location.reload();
    })()`);
    await waitFor("Boolean(document.querySelector('.app .account-entry'))", "Persian Account entry should render");
    assert.equal(
      await evaluate(`document.querySelector(".account-entry-label")?.textContent.includes("حساب کاربری")`),
      true,
      "Persian navigation should show the Account label"
    );
    assert.equal(await evaluate(`document.querySelector(".app")?.classList.contains("rtl")`), true);
    await evaluate(`(() => {
      localStorage.setItem("office_language", "en");
      location.reload();
    })()`);
    await waitFor("Boolean(document.querySelector('.app .account-entry'))", "English Account entry should render");
    let nav = await labels();
    assert.equal(nav.some((label) => label.includes("users")), false);
    assert.equal(
      await evaluate(`document.body.innerText.toLowerCase().includes("users")`),
      false,
      "User dashboard and quick actions must not reveal Users or a user count"
    );

    assert.equal(
      await evaluate(`document.querySelector(".header-account-entry")?.textContent.includes("Account")`),
      true,
      "The compact header should expose the current user's Account entry"
    );
    await evaluate(`document.querySelector(".header-account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.account-grid'))", "User Account page should open");
    assert.deepEqual(
      await evaluate(`Array.from(document.querySelectorAll(".account-grid input")).slice(0, 4).map((input) => input.value)`),
      ["Yasmin Clerk", "yasmin-clerk", "yasmin@example.test", "555-1300"]
    );
    assert.equal(
      await evaluate(`Boolean(document.querySelector(".account-avatar"))`),
      true,
      "My Account should show its profile avatar"
    );
    assert.equal(
      await evaluate(`document.querySelector(".account-role")?.innerText.includes("User")`),
      true
    );
    assert.equal(
      await evaluate(`Boolean(document.querySelector(".account-grid h3"))`),
      false,
      "Account must not expose internal permissions or another account's data"
    );
    assert.equal(
      await evaluate(`document.querySelector(".account-grid input")?.readOnly`),
      false
    );
    assert.equal(
      await evaluate(`document.querySelectorAll(".account-grid input[readonly]").length`),
      1,
      "Username should be visible but not editable"
    );

    await loadRole("admin", "user");
    nav = await labels();
    assert.equal(nav.some((label) => label.includes("users")), false);
    assert.equal(nav.some((label) => label.includes("attendance")), true);
    assert.equal(nav.some((label) => label.includes("instructions")), true);
    for (const forbidden of ["customers", "finance", "projects", "contracts", "settings"]) {
      assert.equal(nav.some((label) => label.includes(forbidden)), false, `${forbidden} is hidden from Admin`);
    }
    await evaluate(`Array.from(document.querySelectorAll(".nav-button")).find((button) => button.textContent.toLowerCase().includes("instructions"))?.click()`);
    await waitFor(
      `document.querySelector(".instructions-description")?.textContent.includes("Create and issue administrative instructions")`,
      "Instructions page should show the requested description"
    );
    assert.equal(
      await evaluate(`Boolean(document.querySelector(".content:has(.instructions-description) .form-card"))`),
      true,
      "Instructions should retain its existing issue form"
    );
    assert.equal(
      await evaluate(`getComputedStyle(document.querySelector(".content:has(.instructions-description) .form-grid")).gridTemplateColumns.trim().split(/\\s+/).length === 3`),
      true,
      "Instruction fields should use the compact desktop layout"
    );
    await evaluate(`document.querySelector(".account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.account-grid'))", "Admin Account page should open");
    assert.deepEqual(
      await evaluate(`Array.from(document.querySelectorAll(".account-grid input")).slice(0, 4).map((input) => input.value)`),
      ["Amin Operator", "amin-operator", "amin@example.test", "555-1200"]
    );

    await loadRole("super_admin", "user");
    nav = await labels();
    assert.equal(nav.some((label) => label.includes("users")), true);
    await evaluate(`document.querySelector("#primary-navigation .nav-button[title='USERS']")?.click()`);
    await waitFor(
      `document.querySelector(".content h1")?.textContent.trim().toLowerCase() === "users"`,
      "Super Admin should be able to open user management"
    );
    for (const pageLabel of [
      "dashboard",
      "customers",
      "employees",
      "contracts",
      "attendance",
      "instructions",
      "projects",
      "settings",
    ]) {
      await visitPrimaryPage(pageLabel);
    }
    await visitPrimaryPage("finance");
    for (const pageLabel of ["payments", "income", "expenses", "debts"]) {
      await visitFinancePage(pageLabel);
    }
    await evaluate(`document.querySelector(".header-account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.account-grid'))", "Super Admin Account page should render");

    await loadRole("user", "super_admin");
    await cdp("Page.navigate", { url: `http://127.0.0.1:${appPort}/users` });
    await waitFor("Boolean(document.querySelector('.app .account-entry'))", "Direct URL fallback should remain authenticated");
    assert.equal(
      await evaluate(`document.querySelector(".content h1")?.textContent.trim().toLowerCase() === "users"`),
      false,
      "Direct /users URL must not render the Users page for User"
    );
    assert.equal(
      await evaluate(`Array.from(document.querySelectorAll("#primary-navigation .nav-button")).some((button) => button.textContent.toLowerCase().includes("users"))`),
      false
    );

    await evaluate(`document.querySelector(".logout-button").click()`);
    await waitFor("Boolean(document.querySelector('.login-box form'))", "Logout should return to login");
    await evaluate(`(() => {
      const inputs = document.querySelectorAll(".login-box form input");
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setValue.call(inputs[0], "login-admin");
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      setValue.call(inputs[1], "valid-password");
      inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      document.querySelector(".login-box form button[type=submit]").click();
    })()`);
    await waitFor("Boolean(document.querySelector('.app .account-entry'))", "Admin should sign in after logout");
    assert.equal(
      await evaluate(`document.querySelector(".sidebar-role-badge")?.textContent.trim() === "Admin"`),
      true,
      "Role-specific navigation must update after logout/login"
    );
    nav = await labels();
    assert.equal(nav.some((label) => label.includes("users")), false);

    await cdp("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await evaluate(`document.querySelector(".mobile-menu-toggle").click()`);
    await waitFor("document.querySelector('.app').classList.contains('mobile-menu-open')", "Mobile navigation drawer should open");
    assert.equal(
      await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`),
      true,
      "Mobile navigation should not create horizontal page overflow"
    );
    await evaluate(`document.querySelector(".account-entry").click()`);
    assert.equal(
      await evaluate(`document.querySelector(".app").classList.contains("mobile-menu-open")`),
      false,
      "Choosing Account should close the mobile drawer"
    );
  } finally {
    try {
      if (socket?.readyState === WebSocket.OPEN && browser?.exitCode === null) {
        await closeBrowser();
      }
    } finally {
      socket?.close();
      if (browser?.exitCode === null) {
        const exited = new Promise((resolve) => browser.once("exit", resolve));
        browser.kill();
        await Promise.race([exited, delay(3000)]);
      }
      await vite?.close();
      await closeServer(apiServer);
      rmSync(tempProfile, { recursive: true, force: true });
      if (previousApiUrl === undefined) delete process.env.VITE_API_URL;
      else process.env.VITE_API_URL = previousApiUrl;
    }
  }
});
