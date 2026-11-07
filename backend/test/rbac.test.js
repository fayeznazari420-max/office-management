const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const {
    ROLE,
    canAccessRequest,
    canAssignRole,
    canManageRecord,
    canManageUser,
    createAuthorizationMiddleware,
    getPermissions,
    hasForbiddenProfileFields,
    hasUnexpectedFields,
    isAccountActive,
    isActiveRole,
    normalizeRole,
    pickProfileFields
} = require("../rbac");

function requestStatus(role, method, path) {
    const middleware = createAuthorizationMiddleware();
    let statusCode = 200;
    let continued = false;
    const response = {
        status(code) {
            statusCode = code;
            return this;
        },
        json() {
            return this;
        }
    };

    middleware(
        { user: { role }, method, originalUrl: path },
        response,
        () => {
            continued = true;
        }
    );

    return { statusCode, continued };
}

async function directApiStatus(role, method, path) {
    const app = express();
    app.use((req, res, next) => {
        req.user = { role };
        next();
    });
    app.use(createAuthorizationMiddleware());
    app.use((req, res) => res.status(200).json({ success: true }));

    const server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    try {
        const response = await fetch(
            `http://127.0.0.1:${server.address().port}${path}`,
            { method }
        );
        return response.status;
    } finally {
        await new Promise((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve()))
        );
    }
}

test("exactly three roles are active; legacy Manager and pending roles remain blocked", () => {
    assert.deepEqual(Object.values(ROLE), ["super_admin", "admin", "user"]);
    assert.equal(isActiveRole("SUPER ADMIN"), true);
    assert.equal(isActiveRole("manager"), false);
    assert.equal(isActiveRole("pending"), false);
    assert.equal(isActiveRole("unexpected"), false);
    assert.equal(isAccountActive(1), true);
    assert.equal(isAccountActive("1"), true);
    assert.equal(isAccountActive(0), false);
    assert.equal(normalizeRole("Manager"), "manager");
    assert.equal(getPermissions("manager").canReadRecords, false);
});

test("Super Admin can access business, account, settings, and export APIs", () => {
    for (const [method, path] of [
        ["GET", "/users"],
        ["PUT", "/users/7"],
        ["DELETE", "/customers/4"],
        ["POST", "/finance/debts/5/pay"],
        ["PUT", "/instructions/2"],
        ["DELETE", "/instructions/2"],
        ["GET", "/system/datetime"],
        ["GET", "/backup/users"]
    ]) {
        assert.deepEqual(requestStatus(ROLE.SUPER_ADMIN, method, path), {
            statusCode: 200,
            continued: true
        });
    }

    assert.equal(getPermissions(ROLE.SUPER_ADMIN).canManageUsers, true);
    assert.equal(canManageRecord(ROLE.SUPER_ADMIN), true);
});

test("Admin can issue instructions and take attendance, but only see minimum employee list", () => {
    assert.equal(getPermissions(ROLE.ADMIN).canReadRecords, false);
    assert.equal(getPermissions(ROLE.ADMIN).canReadAttendance, true);
    assert.equal(getPermissions(ROLE.ADMIN).canIssueInstructions, true);
    for (const [method, path] of [
        ["GET", "/instructions"],
        ["POST", "/instructions"],
        ["GET", "/employees"],
        ["GET", "/attendance"],
        ["POST", "/attendance"]
    ]) {
        assert.equal(
            requestStatus(ROLE.ADMIN, method, path).continued,
            true,
            `${method} ${path} should be allowed`
        );
    }

    assert.equal(requestStatus(ROLE.ADMIN, "GET", "/employees/4").statusCode, 403);
    assert.equal(requestStatus(ROLE.ADMIN, "PUT", "/instructions/2").statusCode, 403);
    assert.equal(requestStatus(ROLE.ADMIN, "DELETE", "/instructions/2").statusCode, 403);
    assert.equal(requestStatus(ROLE.ADMIN, "PUT", "/attendance/4").statusCode, 403);
    assert.equal(requestStatus(ROLE.ADMIN, "DELETE", "/attendance/4").statusCode, 403);
});

test("Admin gets 403 for account, finance, settings, export, and unrelated modules", () => {
    for (const [method, path] of [
        ["GET", "/users"],
        ["GET", "/users/7"],
        ["POST", "/users"],
        ["GET", "/finance/summary"],
        ["GET", "/finance/income"],
        ["POST", "/finance/expenses"],
        ["GET", "/system/datetime"],
        ["GET", "/backup/customers"],
        ["GET", "/customers"],
        ["GET", "/projects"]
    ]) {
        assert.equal(
            requestStatus(ROLE.ADMIN, method, path).statusCode,
            403,
            `${method} ${path} should be forbidden`
        );
    }
});

test("User can read permitted records and create a business record", () => {
    assert.equal(requestStatus(ROLE.USER, "GET", "/customers").continued, true);
    assert.equal(requestStatus(ROLE.USER, "GET", "/finance/summary").continued, true);
    assert.equal(requestStatus(ROLE.USER, "POST", "/customers").continued, true);
    assert.equal(requestStatus(ROLE.USER, "POST", "/finance/income").continued, true);
    assert.equal(requestStatus(ROLE.USER, "GET", "/backup/customers").continued, true);
    assert.equal(getPermissions(ROLE.USER).canCreateRecords, true);
});

test("User cannot edit or delete records or perform nested record mutations", () => {
    for (const [method, path] of [
        ["PUT", "/customers/4"],
        ["DELETE", "/customers/4"],
        ["POST", "/finance/debts/4/pay"],
        ["PUT", "/attendance/4"],
        ["DELETE", "/projects/4"]
    ]) {
        assert.equal(requestStatus(ROLE.USER, method, path).statusCode, 403);
    }

    assert.equal(canManageRecord(ROLE.USER), false);
});

test("User cannot retrieve another account or enumerate accounts through direct requests", () => {
    for (const [method, path] of [
        ["GET", "/users"],
        ["GET", "/users/1"],
        ["GET", "/backup/users"]
    ]) {
        assert.equal(requestStatus(ROLE.USER, method, path).statusCode, 403);
    }
    assert.equal(requestStatus(ROLE.USER, "GET", "/api/me").continued, true);
    assert.equal(canManageUser(ROLE.USER), false);
    assert.equal(canManageUser(ROLE.SUPER_ADMIN, ROLE.USER, 1, 1), false);
    assert.equal(canManageUser(ROLE.SUPER_ADMIN, ROLE.USER, 1, 2), true);
});

test("only token-derived My Account endpoints are available for private profile access", () => {
    assert.equal(requestStatus(ROLE.USER, "GET", "/api/me").continued, true);
    assert.equal(requestStatus(ROLE.ADMIN, "GET", "/api/me").continued, true);
    assert.equal(requestStatus(ROLE.USER, "GET", "/users/9").statusCode, 403);
    assert.equal(requestStatus(ROLE.ADMIN, "GET", "/users/9").statusCode, 403);
});

test("self-service updates cannot change role, ID, status, or permissions", () => {
    for (const body of [
        { id: 8, name: "Changed" },
        { role: ROLE.SUPER_ADMIN, name: "Changed" },
        { status: "disabled", name: "Changed" },
        { permissions: { canManageUsers: true }, name: "Changed" }
    ]) {
        assert.equal(hasForbiddenProfileFields(body), true);
    }
    assert.equal(
        hasForbiddenProfileFields({ name: "Name", email: "name@example.test", phone: "555" }),
        false
    );
    assert.deepEqual(
        pickProfileFields({ id: 1, role: ROLE.SUPER_ADMIN, name: "Name" }),
        { name: "Name", email: undefined, phone: undefined }
    );
});

test("direct unauthorized API requests return HTTP 403", async () => {
    assert.equal(await directApiStatus(ROLE.ADMIN, "GET", "/finance/expenses"), 403);
    assert.equal(await directApiStatus(ROLE.USER, "DELETE", "/customers/1"), 403);
    assert.equal(await directApiStatus(ROLE.USER, "GET", "/users/2"), 403);
    assert.equal(await directApiStatus("manager", "GET", "/attendance"), 403);
});

test("Super Admin alone may assign supported roles; login roles are database-validated", () => {
    assert.equal(canAssignRole(ROLE.SUPER_ADMIN, ROLE.ADMIN), true);
    assert.equal(canAssignRole(ROLE.SUPER_ADMIN, ROLE.USER), true);
    assert.equal(canAssignRole(ROLE.SUPER_ADMIN, ROLE.SUPER_ADMIN), true);
    assert.equal(canAssignRole(ROLE.SUPER_ADMIN, "manager"), false);
    assert.equal(canAssignRole(ROLE.ADMIN, ROLE.USER), false);
    assert.equal(canAssignRole(ROLE.USER, ROLE.ADMIN), false);
    assert.equal(canAccessRequest("manager", "GET", "/attendance"), false);
});

test("profile and password payloads reject non-object and unexpected input", () => {
    assert.equal(hasUnexpectedFields([], ["currentPassword", "newPassword"]), true);
    assert.equal(hasUnexpectedFields({ currentPassword: "old", role: "admin" }, ["currentPassword", "newPassword"]), true);
});
