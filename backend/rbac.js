const ROLE = Object.freeze({
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    USER: "user"
});

const BUSINESS_RESOURCES = Object.freeze([
    "/customers",
    "/employees",
    "/attendance",
    "/contracts",
    "/payments",
    "/projects",
    "/finance/income",
    "/finance/expenses",
    "/finance/debts"
]);

function normalizeRole(role) {
    const value = String(role ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

    return value === "superadmin" ? ROLE.SUPER_ADMIN : value;
}

function isActiveRole(role) {
    return Object.values(ROLE).includes(normalizeRole(role));
}

function isAccountActive(value) {
    return Number(value) === 1;
}

function getPermissions(role) {
    const normalizedRole = normalizeRole(role);
    const isSuperAdmin = normalizedRole === ROLE.SUPER_ADMIN;
    const isAdmin = normalizedRole === ROLE.ADMIN;
    const isUser = normalizedRole === ROLE.USER;
    const active = isSuperAdmin || isAdmin || isUser;

    return {
        canReadRecords: isSuperAdmin || isUser,
        canReadAttendance: active,
        canReadInstructions: active,
        canCreateRecords: isSuperAdmin || isUser,
        canEditRecords: isSuperAdmin,
        canDeleteRecords: isSuperAdmin,
        canManageOwnRecords: isSuperAdmin,
        canManageAllRecords: isSuperAdmin,
        canManageUsers: isSuperAdmin,
        canManageSystemSettings: isSuperAdmin,
        canManagePersonalAccount: active,
        canManageSuperAdmin: isSuperAdmin,
        canTakeAttendance: isSuperAdmin || isAdmin,
        canIssueInstructions: isSuperAdmin || isAdmin
    };
}

function isBusinessResource(path) {
    return BUSINESS_RESOURCES.some(
        (resource) => path === resource || path.startsWith(`${resource}/`)
    );
}

function isCollectionCreate(method, path) {
    return method === "POST" && BUSINESS_RESOURCES.includes(path);
}

function canAccessRequest(role, method, rawPath) {
    const normalizedRole = normalizeRole(role);
    const requestMethod = String(method || "").toUpperCase();
    const path = String(rawPath || "").split("?")[0].replace(/\/+$/, "") || "/";

    if (!isActiveRole(normalizedRole)) {
        return false;
    }

    if (normalizedRole === ROLE.SUPER_ADMIN) {
        return true;
    }

    if (
        path === "/api/me" &&
        ["GET", "PUT"].includes(requestMethod)
    ) {
        return true;
    }
    if (path === "/api/me/password" && requestMethod === "POST") {
        return true;
    }

    if (normalizedRole === ROLE.ADMIN) {
        if (path === "/employees" && requestMethod === "GET") {
            return true;
        }
        if (
            path === "/attendance" &&
            ["GET", "POST"].includes(requestMethod)
        ) {
            return true;
        }
        if (
            ["/attendance/daily", "/attendance/settings"].includes(path) &&
            requestMethod === "GET"
        ) {
            return true;
        }
        if (path === "/attendance/daily" && requestMethod === "POST") {
            return true;
        }
        if (
            /^\/attendance\/\d+\/(check-in|check-out)$/.test(path) &&
            requestMethod === "POST"
        ) {
            return true;
        }
        if (
            path.startsWith("/attendance/") &&
            requestMethod === "GET"
        ) {
            return true;
        }
        if (
            path === "/instructions" &&
            ["GET", "POST"].includes(requestMethod)
        ) {
            return true;
        }
        return false;
    }

    if (normalizedRole !== ROLE.USER) {
        return false;
    }

    if (
        path === "/attendance/settings" ||
        path === "/attendance/daily" ||
        (path.startsWith("/attendance") && requestMethod === "POST")
    ) {
        return false;
    }

    if (isBusinessResource(path)) {
        return requestMethod === "GET" || isCollectionCreate(requestMethod, path);
    }

    if (
        ["/finance/summary", "/finance/expenses/chart"].includes(path) &&
        requestMethod === "GET"
    ) {
        return true;
    }

    const backupMatch = path.match(/^\/backup\/([^/]+)$/);
    if (backupMatch) {
        return requestMethod === "GET" && backupMatch[1] !== "users";
    }

    if (path === "/instructions" && requestMethod === "GET") {
        return true;
    }

    return false;
}

function createAuthorizationMiddleware() {
    return function authorizeRequest(req, res, next) {
        const requestPath = req.originalUrl || req.path || "/";
        if (canAccessRequest(req.user?.role, req.method, requestPath)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "You are not allowed to perform this operation."
        });
    };
}

function canManageRecord(role) {
    return normalizeRole(role) === ROLE.SUPER_ADMIN;
}

function canManageUser(actorRole, targetRole, actorId, targetId) {
    return (
        normalizeRole(actorRole) === ROLE.SUPER_ADMIN &&
        (actorId == null ||
            targetId == null ||
            String(actorId) !== String(targetId))
    );
}

function canAssignRole(actorRole, requestedRole) {
    return (
        normalizeRole(actorRole) === ROLE.SUPER_ADMIN &&
        isActiveRole(requestedRole)
    );
}

function pickProfileFields(body = {}) {
    const profile = body && typeof body === "object" ? body : {};

    return {
        name: profile.name,
        email: profile.email,
        phone: profile.phone
    };
}

function hasUnexpectedFields(body, allowedFields) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return true;
    }

    const allowed = new Set(allowedFields);
    return Object.keys(body).some((field) => !allowed.has(field));
}

function hasForbiddenProfileFields(body) {
    return hasUnexpectedFields(body, ["name", "email", "phone"]);
}

module.exports = {
    ROLE,
    BUSINESS_RESOURCES,
    canAccessRequest,
    canAssignRole,
    canManageRecord,
    canManageUser,
    createAuthorizationMiddleware,
    getPermissions,
    hasForbiddenProfileFields,
    hasUnexpectedFields,
    isActiveRole,
    isAccountActive,
    normalizeRole,
    pickProfileFields
};
