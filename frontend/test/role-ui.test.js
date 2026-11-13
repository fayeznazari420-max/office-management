import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { test } from "node:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
const uiFixtures = {
  "/customers": [{
    id: 21,
    name: "Test Customer",
    phone: "555-2100",
    shop_name: "Test Shop",
    shop_number: "21",
    address: "Test City",
    contract_id: "CT-21",
  }],
  "/users": [{
    id: 22,
    name: "Test User",
    username: "test-user",
    email: "test-user@example.test",
    role: "user",
    is_active: 1,
  }],
  "/employees": [{
    id: 23,
    name: "Test Employee",
    phone: "555-2300",
    email: "test-employee@example.test",
    position: "Coordinator",
    province: "Kabul",
  }],
  "/contracts": [{
    id: 24,
    person_name: "Test Customer",
    shop_name: "Test Shop",
    shop_number: "24",
    province: "Kabul",
    contract_start: "2026-01-01",
    contract_end: "2027-01-01",
    amount: 2400,
  }],
  "/attendance": [{
    id: 25,
    employee_id: 23,
    employee_name: "Test Employee",
    date: "2026-11-12",
    check_in: "08:00",
    check_out: "16:00",
    status: "Present",
  }],
  "/instructions": [{
    id: 26,
    title: "Test instruction",
    description: "Test instruction details",
    created_at: "2026-11-12",
  }],
  "/payments": [{
    id: 27,
    amount: 270,
    description: "Test payment",
    type: "Income",
    date: "2026-11-12",
  }],
  "/projects": [{
    id: 28,
    title: "Test project",
    user_id: roles.user.id,
    user_name: roles.user.name,
    status: "In Progress",
    deadline: "2027-01-01",
    employee: "Test Employee",
    testing: "In review",
    end_date: "2027-02-01",
  }],
  "/finance/income": [{
    id: 29,
    source: "Test source",
    amount: 290,
    date: "2026-11-12",
    description: "Test income",
  }],
  "/finance/expenses": [{
    id: 30,
    title: "Test expense",
    amount: 300,
    category: "Office",
    date: "2026-11-12",
    description: "Test expense",
  }],
  "/finance/debts": [{
    id: 31,
    customer_id: 21,
    customer_name: "Test Customer",
    amount: 310,
    paid_amount: 110,
    due_date: "2026-12-12",
    status: "Partially Paid",
    description: "Test receivable",
  }],
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

  const attendanceRecords = [];
  let attendanceSequence = 100;
  const attendanceSettings = {
    office_open: null,
    office_close: null,
    grace_period_minutes: 0,
    work_days: [],
    shifts: [],
    holidays: [],
  };
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
      sendJson(
        response,
        authenticatedRole === "super_admin" ? 200 : 403,
        request.method === "GET" && requestUrl.pathname === "/users"
          ? uiFixtures["/users"]
          : []
      );
      return;
    }

    if (requestUrl.pathname === "/employees" && authenticatedRole === "admin") {
      sendJson(response, 200, [
        { id: 1, name: "Attendance Employee" },
        { id: 2, name: "Second Attendance Employee" },
      ]);
      return;
    }

    if (requestUrl.pathname === "/attendance/daily" && request.method === "GET") {
      const dailyEmployees = authenticatedRole === "admin"
        ? [{ id: 1, name: "Attendance Employee" }, { id: 2, name: "Second Attendance Employee" }]
        : uiFixtures["/employees"];
      const date = requestUrl.searchParams.get("date");
      const recordsForDate = attendanceRecords.filter((record) => record.date === date);
      const employees = dailyEmployees.map((employee) => ({
        ...employee,
        attendance: recordsForDate.find((record) => Number(record.employee_id) === Number(employee.id)) || null,
      }));
      const statusCount = (status) => employees.filter(({ attendance }) => attendance?.status === status).length;
      sendJson(response, 200, {
        date,
        summary: {
          total_employees: employees.length,
          present: statusCount("Present"),
          absent: statusCount("Absent"),
          late: statusCount("Late"),
          half_day: statusCount("Half Day"),
          on_leave: statusCount("Leave"),
          holiday: statusCount("Holiday"),
          not_marked: employees.filter(({ attendance }) => !attendance).length,
        },
        employees,
      });
      return;
    }

    if (requestUrl.pathname === "/attendance/daily" && request.method === "POST") {
      const body = await requestBody(request);
      for (const entry of body.entries) {
        if (attendanceRecords.some((record) => Number(record.employee_id) === Number(entry.employee_id) && record.date === body.date)) {
          sendJson(response, 409, { message: "Attendance is already recorded for this employee and date." });
          return;
        }
        attendanceRecords.push({
          id: attendanceSequence++,
          ...entry,
          date: body.date,
          employee_name: entry.employee_id === 1 ? "Attendance Employee" : "Second Attendance Employee",
        });
      }
      sendJson(response, 201, { success: true });
      return;
    }

    const timeAction = requestUrl.pathname.match(/^\/attendance\/(\d+)\/(check-in|check-out)$/);
    if (timeAction && request.method === "POST") {
      const record = attendanceRecords.find((item) => item.id === Number(timeAction[1]));
      if (record) {
        record[timeAction[2] === "check-in" ? "check_in" : "check_out"] = timeAction[2] === "check-in" ? "08:45" : "17:00";
      }
      sendJson(response, 200, { success: true });
      return;
    }

    if (requestUrl.pathname === "/attendance/settings" && request.method === "GET") {
      sendJson(response, 200, attendanceSettings);
      return;
    }

    if (requestUrl.pathname === "/attendance/settings" && request.method === "PUT") {
      Object.assign(attendanceSettings, await requestBody(request));
      sendJson(response, 200, attendanceSettings);
      return;
    }

    if (requestUrl.pathname === "/attendance" && request.method === "GET") {
      const records = [
        ...uiFixtures["/attendance"],
        ...attendanceRecords,
      ];
      sendJson(response, 200, authenticatedRole === "user"
        ? records.filter((record) => Number(record.user_id) === Number(authenticatedUser.id))
        : records);
      return;
    }

    if (request.method === "GET" && uiFixtures[requestUrl.pathname]) {
      sendJson(response, 200, uiFixtures[requestUrl.pathname]);
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
  let activeRole = "logged-out";
  let screenshotNumber = 0;
  const previousApiUrl = process.env.VITE_API_URL;
  const screenshotDirectory = process.env.OFFICE_UI_SCREENSHOT_DIR;

  try {
    if (screenshotDirectory) mkdirSync(screenshotDirectory, { recursive: true });
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

    async function captureScreenshot(name) {
      if (!screenshotDirectory) return;
      if (await evaluate("window.innerWidth <= 700")) await delay(500);
      const { data } = await cdp("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      const safeName = name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
      const filename = `${String(++screenshotNumber).padStart(3, "0")}-${safeName}.png`;
      writeFileSync(path.join(screenshotDirectory, filename), Buffer.from(data, "base64"));
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
    await cdp("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp("Page.navigate", { url: `http://127.0.0.1:${appPort}/` });
    await waitFor("Boolean(document.querySelector('.login-box'))", "Login should render");
    await captureScreenshot("login-desktop-en");
    assert.equal(
      await evaluate(`(() => {
        const layout = getComputedStyle(document.querySelector(".login-layout"));
        const showcase = document.querySelector(".login-showcase").getBoundingClientRect();
        const form = document.querySelector(".login-box").getBoundingClientRect();
        return layout.gridTemplateColumns.split(" ").length === 2 &&
          getComputedStyle(document.querySelector(".login-showcase")).backgroundImage.includes("office-bg") &&
          showcase.left < form.left;
      })()`),
      true,
      "Desktop login should show the office image beside the sign-in form"
    );
    await evaluate(`document.querySelector(".login-language button:last-child").click()`);
    assert.equal(
      await evaluate(`document.querySelector(".login-page")?.getAttribute("dir") === "rtl" &&
        document.querySelector(".showcase-copy h2")?.textContent.includes("مدیریت دفتر")`),
      true,
      "Persian login should use translated copy and RTL direction"
    );
    await captureScreenshot("login-desktop-fa");
    await evaluate(`document.querySelector(".login-language button:first-child").click()`);

    async function loadRole(role, staleRole = "super_admin") {
      activeRole = role;
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

    async function inspectRenderedPage(pageKey, expectedDirection = "ltr") {
      const state = await evaluate(`(() => {
        const page = document.querySelector('.content[data-page="${pageKey}"]');
        if (!page) return null;
        const app = document.querySelector(".app");
        const main = document.querySelector(".main");
        const sidebar = document.querySelector(".sidebar");
        const sidebarRect = sidebar.getBoundingClientRect();
        const card = page.querySelector(".stat, .daily-attendance-stat, .form-card, .table-card, .daily-attendance-table-wrap, .dashboard-panel, .settings-card, .finance-card, .empty");
        return {
          heading: Boolean(page.querySelector(".page-title h1")),
          direction: getComputedStyle(app).direction,
          breadcrumbDirection: getComputedStyle(page.querySelector(".breadcrumbs")).flexDirection,
          sidebar: getComputedStyle(sidebar).backgroundColor,
          sidebarBounds: {
            left: sidebarRect.left,
            right: sidebarRect.right,
            width: sidebarRect.width,
          },
          sidebarPosition: (() => {
            const style = getComputedStyle(sidebar);
            return {
              position: style.position,
              left: style.left,
              right: style.right,
              insetInlineStart: style.insetInlineStart,
              insetInlineEnd: style.insetInlineEnd,
              transform: style.transform,
            };
          })(),
          mobileMenuOpen: app.classList.contains("mobile-menu-open"),
          workspace: getComputedStyle(main).backgroundColor,
          accent: getComputedStyle(page).getPropertyValue("--page-accent").trim(),
          cardRadius: card ? getComputedStyle(card).borderRadius : "",
          tableRows: page.querySelectorAll(".table-card tbody tr, .daily-attendance-table tbody tr").length,
          tableHeaderBackground: page.querySelector("th") ? getComputedStyle(page.querySelector("th")).backgroundColor : "",
          tableScroll: page.querySelector(".daily-attendance-table-wrap")
            ? getComputedStyle(page.querySelector(".daily-attendance-table-wrap")).overflowX
            : page.querySelector(".table-scroll") ? getComputedStyle(page.querySelector(".table-scroll")).overflowX : "",
          toolbarOnOneRow: (() => {
            const search = page.querySelector(".page-tools .page-search");
            const actions = page.querySelector(".page-tools .page-tool-actions");
            return search && actions
              ? Math.abs(search.querySelector("input").getBoundingClientRect().top - actions.getBoundingClientRect().top) < 10
              : null;
          })(),
          toolbarMetrics: (() => {
            const tools = page.querySelector(".page-tools");
            const search = page.querySelector(".page-tools .page-search");
            const actions = page.querySelector(".page-tools .page-tool-actions");
            const title = page.querySelector(".page-title");
            return tools && search && actions && title
              ? {
                tools: tools.getBoundingClientRect().width,
                search: search.getBoundingClientRect().width,
                searchTop: search.getBoundingClientRect().top,
                searchInputTop: search.querySelector("input").getBoundingClientRect().top,
                actions: actions.getBoundingClientRect().width,
                actionsTop: actions.getBoundingClientRect().top,
                title: title.getBoundingClientRect().width,
                header: page.querySelector(".page-heading-row").getBoundingClientRect().width,
              }
              : null;
          })(),
          dashboardStatColumns: page.querySelector(".dashboard-stat-grid")
            ? getComputedStyle(page.querySelector(".dashboard-stat-grid")).gridTemplateColumns.split(" ").length
            : null,
          dashboardMainColumns: page.querySelector(".dashboard-main-grid")
            ? getComputedStyle(page.querySelector(".dashboard-main-grid")).gridTemplateColumns.split(" ").length
            : null,
          financialColumns: page.querySelector(".dashboard-financial-summary")
            ? getComputedStyle(page.querySelector(".dashboard-financial-summary")).gridTemplateColumns.split(" ").length
            : null,
          headingMetrics: (() => {
            const heading = page.querySelector(".page-title h1");
            if (!heading) return null;
            const style = getComputedStyle(heading);
            return {
              height: heading.getBoundingClientRect().height,
              width: heading.getBoundingClientRect().width,
              lineHeight: style.lineHeight,
              minHeight: style.minHeight,
              padding: style.padding,
              margin: style.margin,
              display: style.display,
              text: heading.textContent,
            };
          })(),
          pageWidth: page.getBoundingClientRect().width,
          pageTitleHeight: page.querySelector(".page-title")?.getBoundingClientRect().height,
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth
        };
      })()`);
      assert.ok(state, `${pageKey} should render its own page container`);
      assert.equal(state.heading, true, `${pageKey} should render its heading`);
      assert.equal(state.direction, expectedDirection, `${pageKey} should use the current text direction`);
      assert.equal(state.breadcrumbDirection, "row", `${pageKey} breadcrumbs should stay aligned in a row`);
      assert.equal(state.sidebar, "rgb(20, 43, 57)", `${pageKey} should retain the navy sidebar`);
      assert.equal(state.workspace, "rgb(242, 245, 246)", `${pageKey} should use the light-gray workspace`);
      assert.ok(state.accent, `${pageKey} should apply its page-specific accent`);
      assert.ok(Number.parseFloat(state.cardRadius) > 0, `${pageKey} should render a styled content card`);
      if (["customers", "employees", "users", "attendance", "contracts", "income", "expenses", "debts", "payments", "projects"].includes(pageKey)) {
        assert.ok(state.tableRows > 0, `${pageKey} should render its business table with UI-test records`);
        assert.notEqual(state.tableHeaderBackground, "rgba(0, 0, 0, 0)", `${pageKey} table headers should be visibly styled`);
        if (state.viewportWidth > 700) {
          assert.equal(state.tableScroll, "auto", `${pageKey} table should remain horizontally scrollable inside its card`);
        }
      }
      assert.ok(state.pageWidth <= state.viewportWidth, `${pageKey} content should fit the viewport`);
      assert.ok(state.documentWidth <= state.viewportWidth, `${pageKey} should not create horizontal page overflow`);
      if (state.viewportWidth <= 700 && state.headingMetrics) {
        assert.ok(state.headingMetrics.height < 60, `${pageKey} heading should remain compact on mobile; metrics=${JSON.stringify(state.headingMetrics)}`);
        assert.ok(state.pageTitleHeight < 180, `${pageKey} page heading should not leave excessive mobile whitespace; height=${state.pageTitleHeight}`);
        if (!state.mobileMenuOpen) {
          assert.ok(
            expectedDirection === "rtl"
              ? state.sidebarBounds.left >= state.viewportWidth
              : state.sidebarBounds.right <= 0,
            `${pageKey} should fully hide the closed mobile navigation drawer: ${JSON.stringify({ bounds: state.sidebarBounds, position: state.sidebarPosition })}`
          );
        }
      }
      if (pageKey === "customers" && state.viewportWidth > 700) {
        assert.equal(state.toolbarOnOneRow, true, `Customer search and actions should share one desktop toolbar row: ${JSON.stringify(state.toolbarMetrics)}`);
      }
      if (state.dashboardStatColumns !== null) {
        assert.equal(
          state.dashboardStatColumns,
          state.viewportWidth > 700 ? 4 : 2,
          "Dashboard should show all four statistics in a responsive grid"
        );
        assert.equal(
          state.dashboardMainColumns,
          state.viewportWidth > 700 ? 2 : 1,
          "Dashboard chart and quick actions should use a responsive two-column layout"
        );
        assert.equal(
          state.financialColumns,
          state.viewportWidth > 700 ? 3 : 2,
          "Dashboard financial overview should show income, expenses, and balance"
        );
      }
    }

    async function visitPrimaryPage(label, pageKey = label) {
      await evaluate(`Array.from(document.querySelectorAll("#primary-navigation .nav-button")).find((button) => button.querySelector(".nav-label")?.textContent.toLowerCase().includes(${JSON.stringify(label)}))?.click()`);
      await waitFor(`Boolean(document.querySelector('.content[data-page="${pageKey}"]'))`, `${label} page should render its page container`);
      if (pageKey === "attendance") {
        await waitFor(
          `Boolean(document.querySelector('.daily-attendance-table tbody tr'))`,
          "Attendance register should load from the daily attendance API"
        );
      }
      await inspectRenderedPage(pageKey);
      await verifyPageBothLanguages(pageKey);
    }

    async function visitFinancePage(label) {
      await evaluate(`Array.from(document.querySelectorAll(".finance-subnav button")).find((button) => button.textContent.toLowerCase().includes(${JSON.stringify(label)}))?.click()`);
      const pageKey = label === "payments" ? "payments"
        : label === "income" ? "income"
          : label === "expenses" ? "expenses"
            : label === "debts" ? "debts"
              : "finance";
      await waitFor(`Boolean(document.querySelector('.content[data-page="${pageKey}"]'))`, `${label} finance page should render its page container`);
      await inspectRenderedPage(pageKey);
      await verifyPageBothLanguages(pageKey);
    }

    async function verifyPageBothLanguages(pageKey) {
      await evaluate(`document.querySelector(".top-language button[title='فارسی']").click()`);
      await waitFor("document.querySelector('.app')?.classList.contains('rtl')", `${pageKey} should switch to Persian RTL`);
      await delay(180);
      await inspectRenderedPage(pageKey, "rtl");
      await captureScreenshot(`${activeRole}-${pageKey}-fa-${await evaluate("window.innerWidth")}`);
      await evaluate(`document.querySelector(".top-language button[title='English']").click()`);
      await waitFor("!document.querySelector('.app')?.classList.contains('rtl')", `${pageKey} should switch back to English LTR`);
      await delay(180);
      await inspectRenderedPage(pageKey, "ltr");
      await captureScreenshot(`${activeRole}-${pageKey}-en-${await evaluate("window.innerWidth")}`);
    }

    async function verifyRecordForm(pageKey) {
      const createButton = await evaluate(`Boolean(document.querySelector('.page-tools[data-page-tools="${pageKey}"] .new-record-button'))`);
      if (!createButton) return;
      await evaluate(`document.querySelector('.page-tools[data-page-tools="${pageKey}"] .new-record-button').click()`);
      await waitFor(`Boolean(document.querySelector('.content[data-page="${pageKey}"] .form-card .form-grid'))`, `${pageKey} create form should render`);
      const form = await evaluate(`(() => {
        const element = document.querySelector('.content[data-page="${pageKey}"] .form-card .form-grid');
        const style = getComputedStyle(element);
        return {
          columns: style.gridTemplateColumns.split(" ").length,
          width: element.getBoundingClientRect().width,
          viewportWidth: document.documentElement.clientWidth
        };
      })()`);
      const expectedColumns = form.viewportWidth <= 700
        ? 1
        : pageKey === "attendance"
          ? 3
          : 2;
      assert.equal(form.columns, expectedColumns, `${pageKey} form should use a responsive ${expectedColumns}-column layout`);
      assert.ok(form.width > 0, `${pageKey} form should have a visible layout`);
      await evaluate(`Array.from(document.querySelectorAll('.content[data-page="${pageKey}"] .secondary-button')).find(button => button.textContent.toLowerCase().includes('back to list'))?.click()`);
      await waitFor(`!document.querySelector('.content[data-page="${pageKey}"] .form-card')`, `${pageKey} should return to its existing record list`);
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
      ["rgb(20, 43, 57)", "rgb(242, 245, 246)", "12px"],
      "The navy sidebar and white/light-gray workspace should be active"
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
    await inspectRenderedPage("dashboard");
    await verifyPageBothLanguages("dashboard");

    assert.equal(
      await evaluate(`document.querySelector(".header-account-entry")?.textContent.includes("Account")`),
      true,
      "The compact header should expose the current user's Account entry"
    );
    await evaluate(`document.querySelector(".header-account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.account-grid'))", "User Account page should open");
    await inspectRenderedPage("my-account");
    await verifyPageBothLanguages("my-account");
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
      await evaluate(`document.querySelector(".account-profile-copy")?.innerText.includes("yasmin@example.test") &&
        document.querySelector(".account-profile-copy")?.innerText.includes("555-1300")`),
      true,
      "My Account should show only the authenticated user's contact information"
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
    await inspectRenderedPage("dashboard");
    await verifyPageBothLanguages("dashboard");
    await visitPrimaryPage("attendance");
    await evaluate(`(() => {
      const row = document.querySelector(".daily-attendance-table tbody tr");
      row.querySelector("select[aria-label^='Status']").value = "Half Day";
      row.querySelector("select[aria-label^='Status']").dispatchEvent(new Event("change", { bubbles: true }));
      const note = row.querySelector("input[aria-label^='Notes']");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(note, "UI test attendance note");
      note.dispatchEvent(new Event("input", { bubbles: true }));
      row.querySelector(".daily-attendance-actions .primary-button").click();
    })()`);
    await waitFor(
      `document.querySelector(".daily-attendance-table tbody tr:first-child .attendance-status")?.textContent.trim() === "Half Day"`,
      "Individual attendance submission should persist its selected status"
    );
    assert.equal(attendanceRecords.length, 1);
    assert.equal(attendanceRecords[0].notes, "UI test attendance note");
    await evaluate(`document.querySelector(".daily-attendance-table tbody tr:first-child .daily-attendance-actions button")?.click()`);
    await waitFor(
      `document.querySelector(".daily-attendance-table tbody tr:first-child td[data-label='Check-in']")?.textContent.includes("08:45")`,
      "Check-in should update the existing daily register row"
    );
    await evaluate(`document.querySelector(".daily-attendance-table tbody tr:first-child .daily-attendance-actions button")?.click()`);
    await waitFor(
      `document.querySelector(".daily-attendance-table tbody tr:first-child td[data-label='Check-out']")?.textContent.includes("17:00")`,
      "Check-out should update the existing daily register row"
    );
    await evaluate(`document.querySelector(".daily-attendance-toolbar-actions .primary-button").click()`);
    await waitFor(
      `document.querySelector(".daily-attendance-table tbody tr:nth-child(2) .attendance-status")?.textContent.trim() === "Present"`,
      "Bulk submission should persist the remaining unmarked employee"
    );
    assert.equal(attendanceRecords.length, 2, "daily entries should be stored once per employee");
    await verifyRecordForm("attendance");
    await evaluate(`Array.from(document.querySelectorAll(".nav-button")).find((button) => button.textContent.toLowerCase().includes("instructions"))?.click()`);
    await waitFor("Boolean(document.querySelector('.content[data-page=\"instructions\"]'))", "Admin Instructions page should render");
    await inspectRenderedPage("instructions");
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
    await verifyPageBothLanguages("instructions");
    await evaluate(`document.querySelector(".account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.account-grid'))", "Admin Account page should open");
    await inspectRenderedPage("my-account");
    await verifyPageBothLanguages("my-account");
    assert.deepEqual(
      await evaluate(`Array.from(document.querySelectorAll(".account-grid input")).slice(0, 4).map((input) => input.value)`),
      ["Amin Operator", "amin-operator", "amin@example.test", "555-1200"]
    );

    await loadRole("super_admin", "user");
    nav = await labels();
    assert.equal(nav.some((label) => label.includes("users")), true);
    await evaluate(`document.querySelector("#primary-navigation .nav-button[title='USERS']")?.click()`);
    await waitFor(
      `document.querySelector('.content[data-page="users"] .page-title h1')?.textContent.trim().toLowerCase() === "users"`,
      "Super Admin should be able to open user management"
    );
    await inspectRenderedPage("users");
    assert.equal(
      await evaluate(`(() => {
        const role = document.querySelector(".user-role-badge");
        const status = document.querySelector(".account-status");
        return role?.textContent.trim() === "User" &&
          status?.textContent.trim() === "ACTIVE" &&
          getComputedStyle(role).borderRadius === "999px" &&
          getComputedStyle(status).borderRadius === "999px";
      })()`),
      true,
      "Users should display the existing role and account state as clear badges"
    );
    await verifyPageBothLanguages("users");
    await verifyRecordForm("users");
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
      await verifyRecordForm(pageLabel);
      if (pageLabel === "attendance") {
        await evaluate(`document.querySelector(".daily-attendance-settings > button").click()`);
        await waitFor("Boolean(document.querySelector('.daily-attendance-settings-form'))", "Super Admin attendance settings should open");
        await evaluate(`(() => {
          const opening = document.querySelector(".daily-attendance-settings-form input[type=time]");
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(opening, "08:30");
          opening.dispatchEvent(new Event("input", { bubbles: true }));
          opening.dispatchEvent(new Event("change", { bubbles: true }));
          document.querySelector(".daily-attendance-settings-form .primary-button").click();
        })()`);
        await waitFor(
          `document.querySelector(".daily-attendance-message.is-success")?.textContent.includes("Attendance settings saved")`,
          "Attendance settings should save successfully"
        );
        assert.equal(attendanceSettings.office_open, "08:30");
      }
    }
    await visitPrimaryPage("finance");
    for (const pageLabel of ["payments", "income", "expenses", "debts"]) {
      await visitFinancePage(pageLabel);
      await verifyRecordForm(pageLabel);
    }
    await verifyPageBothLanguages("debts");
    await evaluate(`document.querySelector(".header-account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.content[data-page=\"my-account\"]'))", "Super Admin Account should open");
    await inspectRenderedPage("my-account");
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
    await inspectRenderedPage("my-account");
    await verifyPageBothLanguages("my-account");
    await loadRole("user");
    await inspectRenderedPage("dashboard");
    await verifyPageBothLanguages("dashboard");
    assert.equal(
      await evaluate(`Array.from(document.querySelectorAll("#primary-navigation .nav-button")).some((button) => button.textContent.toLowerCase().includes("users"))`),
      false,
      "Mobile User navigation must not expose Users"
    );
    await evaluate(`document.querySelector(".header-account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.content[data-page=\"my-account\"]'))", "Mobile User Account page should render");
    await inspectRenderedPage("my-account");
    await verifyPageBothLanguages("my-account");
    await loadRole("admin");
    await inspectRenderedPage("dashboard");
    await visitPrimaryPage("attendance");
    await verifyRecordForm("attendance");
    await visitPrimaryPage("instructions");
    assert.equal(
      await evaluate(`getComputedStyle(document.querySelector('.content[data-page="instructions"] .form-grid')).gridTemplateColumns.split(" ").length === 1`),
      true,
      "Mobile instruction form should use a single-column layout"
    );
      await evaluate(`document.querySelector(".header-account-entry").click()`);
      await waitFor("Boolean(document.querySelector('.content[data-page=\"my-account\"]'))", "Mobile Admin Account page should render");
      await inspectRenderedPage("my-account");
      await verifyPageBothLanguages("my-account");

      await loadRole("super_admin");
    await inspectRenderedPage("dashboard");
    await evaluate(`document.querySelector("#primary-navigation .nav-button[title='USERS']")?.click()`);
    await waitFor("Boolean(document.querySelector('.content[data-page=\"users\"]'))", "Mobile Users page should render");
    await inspectRenderedPage("users");
    await verifyPageBothLanguages("users");
    await verifyRecordForm("users");
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
      await verifyRecordForm(pageLabel);
    }
    await visitPrimaryPage("finance");
    for (const pageLabel of ["payments", "income", "expenses", "debts"]) {
      await visitFinancePage(pageLabel);
      await verifyRecordForm(pageLabel);
    }
    await evaluate(`document.querySelector(".header-account-entry").click()`);
    await waitFor("Boolean(document.querySelector('.content[data-page=\"my-account\"]'))", "Mobile Account page should render");
    await inspectRenderedPage("my-account");
    await verifyPageBothLanguages("my-account");
    await evaluate(`document.querySelector(".logout-button").click()`);
    await waitFor("Boolean(document.querySelector('.login-box form'))", "Mobile logout should return to login");
    assert.equal(
      await evaluate(`(() => {
        const layout = getComputedStyle(document.querySelector(".login-layout"));
        return layout.gridTemplateColumns.split(" ").length === 1 &&
          document.documentElement.scrollWidth <= window.innerWidth;
      })()`),
      true,
      "Mobile login should use a single column without horizontal overflow"
    );
    await evaluate(`document.querySelector(".login-language button:last-child").click()`);
    await captureScreenshot("login-mobile-fa");
    assert.equal(
      await evaluate(`document.querySelector(".login-page")?.getAttribute("dir") === "rtl" &&
        document.documentElement.scrollWidth <= window.innerWidth`),
      true,
      "Persian mobile login should remain RTL without horizontal overflow"
    );
    await evaluate(`document.querySelector(".login-language button:first-child").click()`);
    await captureScreenshot("login-mobile-en");
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
