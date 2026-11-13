const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const {
    createAttendanceRouter,
    createMySqlAttendanceRepository
} = require("./attendance");
const { inspectAttendanceReadiness } = require("./migrate-attendance");
const {
    ROLE,
    canAssignRole,
    canManageRecord,
    canManageUser,
    createAuthorizationMiddleware,
    getPermissions,
    hasForbiddenProfileFields,
    hasUnexpectedFields,
    isAccountActive,
    normalizeRole,
    isActiveRole,
    pickProfileFields
} = require("./rbac");
const path = require("path");
const fs = require("fs");
let XLSX = null;
try {
    XLSX = require("xlsx");
} catch (error) {
    console.warn(
        "Excel backup is disabled because the 'xlsx' package is not installed. " +
        "Run: npm install xlsx"
    );
}

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const authorizeRequest = createAuthorizationMiddleware();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "20mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "20mb"
    })
);

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function isEmpty(value) {
    return (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    );
}

function isValidId(id) {
    return /^\d+$/.test(String(id));
}

function normalize(value) {
    if (value === undefined || value === null) {
        return null;
    }

    return String(value).trim();
}

function sendError(
    res,
    status,
    message,
    error = null
) {
    return res.status(status).json({
        success: false,
        message,
        ...(error
            ? {
                  error: error.message
              }
            : {})
    });
}

function sendSuccess(
    res,
    message,
    data = null
) {
    return res.status(200).json({
        success: true,
        message,
        ...(data !== null
            ? {
                  data
              }
            : {})
    });
}

function dbQueryPromise(
    sql,
    params = []
) {
    return new Promise(
        (resolve, reject) => {
            db.query(
                sql,
                params,
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(results);
                }
            );
        }
    );
}

// ======================================================
// JWT AUTHENTICATION
// ======================================================

function authenticateToken(
    req,
    res,
    next
) {
    if (req.authenticated === true && req.user?.id) {
        return next();
    }

    const authHeader =
        req.headers["authorization"];

    const token =
        authHeader &&
        authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message:
                "Access denied. Token is required."
        });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message:
                "JWT_SECRET is not configured."
        });
    }

    jwt.verify(
        token,
        JWT_SECRET,
        (err, tokenUser) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid or expired token."
                });
            }

            if (!tokenUser?.id || !isValidId(tokenUser.id)) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authentication token."
                });
            }

            db.query(
                `
                SELECT id, name, username, email, role, photo, phone, is_active
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [tokenUser.id],
                (lookupError, rows) => {
                    if (lookupError) {
                        return sendError(res, 500, "Failed to verify account.", lookupError);
                    }

                    if (!rows.length) {
                        return res.status(401).json({
                            success: false,
                            message: "Account is no longer available."
                        });
                    }

                    const account = rows[0];
                    const role = normalizeRole(account.role);

                    if (!isAccountActive(account.is_active)) {
                        return res.status(403).json({
                            success: false,
                            message: "This account is disabled."
                        });
                    }

                    if (!isActiveRole(role)) {
                        return res.status(403).json({
                            success: false,
                            message: "This account role is not active."
                        });
                    }

                    req.user = {
                        id: account.id,
                        name: account.name,
                        username: account.username,
                        email: account.email,
                        phone: account.phone,
                        photo: account.photo,
                        role
                    };
                    req.authenticated = true;

                    return authorizeRequest(req, res, next);
                }
            );
        }
    );
}

const RECORD_RESOURCES = [
    { path: "/customers", table: "customers" },
    { path: "/employees", table: "employees" },
    { path: "/attendance", table: "attendance" },
    { path: "/contracts", table: "contracts" },
    { path: "/payments", table: "payments" },
    { path: "/projects", table: "projects" },
    { path: "/finance/income", table: "finance_income" },
    { path: "/finance/expenses", table: "finance_expenses" },
    { path: "/finance/debts", table: "finance_debts" }
];

function authorizeRecordRequest(req, res, next) {
    const resource = RECORD_RESOURCES.find(({ path: prefix }) =>
        req.path === prefix || req.path.startsWith(`${prefix}/`)
    );

    if (!resource) {
        return next();
    }

    return authenticateToken(req, res, () => {
        const resourcePath = req.path.replace(/\/+$/, "");
        const isCollection = resourcePath === resource.path;
        const isRead = req.method === "GET";
        const isAttendanceSettings = resource.path === "/attendance" &&
            resourcePath === "/attendance/settings";
        const isAttendanceTimeAction = resource.path === "/attendance" &&
            /^\/attendance\/\d+\/(check-in|check-out)$/.test(resourcePath) &&
            req.method === "POST";
        if (isAttendanceSettings) {
            if (req.method === "GET" ||
                (req.method === "PUT" && req.user.role === ROLE.SUPER_ADMIN)) {
                return next();
            }
            return res.status(403).json({
                success: false,
                message: "You are not allowed to manage attendance settings."
            });
        }
        if (isAttendanceTimeAction) {
            return next();
        }
        const isCreate = req.method === "POST" &&
            (isCollection ||
                (resource.path === "/attendance" && resourcePath === "/attendance/daily"));
        const isUpdate =
            req.method === "PUT" ||
            req.method === "DELETE" ||
            (req.method === "POST" && !isCollection);

        if (isRead) {
            const sendJson = res.json.bind(res);
            res.json = (body) => {
                const records = Array.isArray(body)
                    ? body
                    : body && typeof body === "object"
                        ? [body]
                        : [];
                const creatorIds = [
                    ...new Set(
                        records
                            .filter(
                                (record) =>
                                    record?.created_by != null &&
                                    record.created_by_role == null
                            )
                            .map((record) => record.created_by)
                    )
                ];

                const setRecordPermissions = (rolesById) => {
                    records.forEach((record) => {
                        if (record && Object.hasOwn(record, "created_by")) {
                            record.can_edit = canManageRecord(
                                req.user.role,
                                req.user.id,
                                record.created_by,
                                record.created_by_role ||
                                    rolesById.get(String(record.created_by)) ||
                                    null
                            );
                            delete record.created_by_role;
                        }
                    });
                };

                if (!creatorIds.length) {
                    setRecordPermissions(new Map());
                    return sendJson(body);
                }

                db.query(
                    "SELECT id, role FROM users WHERE id IN (?)",
                    [creatorIds],
                    (error, users) => {
                        if (error) {
                            console.error("Failed to load record creator roles:", error.message);
                            return res.status(500).json({
                                success: false,
                                message: "Failed to load record permissions."
                            });
                        }

                        const rolesById = new Map(
                            users.map((user) => [String(user.id), user.role])
                        );

                        setRecordPermissions(rolesById);

                        return sendJson(body);
                    }
                );

                return res;
            };

            return next();
        }

        if (isCreate) {
            return next();
        }

        if (!isUpdate) {
            return res.status(403).json({
                success: false,
                message: "This operation is not permitted."
            });
        }

        const idMatch = resourcePath.match(
            new RegExp(`^${resource.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(\\d+)(?:/pay)?$`)
        );

        if (!idMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid record ID."
            });
        }

        db.query(
            `SELECT created_by, created_by_role FROM \`${resource.table}\` WHERE id = ? LIMIT 1`,
            [idMatch[1]],
            (recordError, records) => {
                if (recordError) {
                    return sendError(res, 500, "Failed to verify record ownership.", recordError);
                }

                if (!records.length) {
                    return next();
                }

                const creatorId = records[0].created_by;
                const recordedCreatorRole = records[0].created_by_role;
                const resolveCreatorRole = (callback) => {
                    if (recordedCreatorRole) {
                        return callback(recordedCreatorRole);
                    }

                    if (creatorId === null || creatorId === undefined) {
                        return callback(null);
                    }

                    db.query(
                        "SELECT role FROM users WHERE id = ? LIMIT 1",
                        [creatorId],
                        (creatorError, users) => {
                            if (creatorError) {
                                return sendError(
                                    res,
                                    500,
                                    "Failed to verify record creator.",
                                    creatorError
                                );
                            }

                            callback(users.length ? users[0].role : null);
                        }
                    );
                };

                resolveCreatorRole((creatorRole) => {
                    if (
                        !canManageRecord(
                            req.user.role,
                            req.user.id,
                            creatorId,
                            creatorRole
                        )
                    ) {
                        return res.status(403).json({
                            success: false,
                            message: "You are not allowed to modify this record."
                        });
                    }

                    return next();
                });
            }
        );
    });
}

app.use(authorizeRecordRequest);

function requireUserAdministration(req, res, next) {
    if (!getPermissions(req.user.role).canManageUsers) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to manage user accounts."
        });
    }

    return next();
}

function authorizeUserTarget(req, res, next) {
    if (!isValidId(req.params.id)) {
        return sendError(res, 400, "Invalid user ID.");
    }

    db.query(
        "SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1",
        [req.params.id],
        (error, rows) => {
            if (error) {
                return sendError(res, 500, "Failed to verify user account.", error);
            }

            if (!rows.length) {
                return sendError(res, 404, "User not found.");
            }

            if (
                !canManageUser(
                    req.user.role,
                    rows[0].role,
                    req.user.id,
                    rows[0].id
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to modify this user account."
                });
            }

            req.targetUser = rows[0];

            if (
                req.method === "PUT" &&
                req.body?.role !== undefined &&
                !["super_admin", "admin", "user"].includes(
                    normalizeRole(req.body.role)
                )
            ) {
                return sendError(res, 400, "Invalid user role.");
            }

            if (
                req.method === "PUT" &&
                req.body?.role !== undefined &&
                !canAssignRole(req.user.role, req.body.role)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to assign this role."
                });
            }

            return next();
        }
    );
}

app.use("/users", authenticateToken, (req, res, next) => {
    if (req.method === "GET" || req.method === "POST") {
        if (
            req.method === "POST" &&
            req.body?.role !== undefined &&
            !["super_admin", "admin", "user"].includes(
                normalizeRole(req.body.role)
            )
        ) {
            return sendError(res, 400, "Invalid user role.");
        }

        if (
            req.method === "POST" &&
            req.body?.role !== undefined &&
            !canAssignRole(req.user.role, req.body.role)
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to assign this role."
            });
        }

        return requireUserAdministration(req, res, next);
    }

    const userIdMatch = req.path.match(/^\/(\d+)$/);
    if (["PUT", "DELETE"].includes(req.method) && userIdMatch) {
        req.params.id = userIdMatch[1];
        return authorizeUserTarget(req, res, next);
    }

    return next();
});

// ======================================================
// ROOT
// ======================================================

app.get(
    "/api",
    (req, res) => {
        res.json({
            success: true,
            message:
                "Office Management API is running",
            version: "2.0.0",
            port: PORT,
            endpoints: {
                login: "POST /login",
                register: "POST /register",
                users: "/users",
                employees: "/employees",
                customers: "/customers",
                attendance: "/attendance",
                instructions: "/instructions",
                contracts: "/contracts",
                payments: "/payments",
                projects: "/projects",
                income:
                    "/finance/income",
                expenses:
                    "/finance/expenses",
                debts:
                    "/finance/debts",
                backup:
                    "/backup/:entity"
            }
        });
    }
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/health",
    (req, res) => {
        db.query(
            "SELECT 1 AS database_test",
            (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        server: "running",
                        database:
                            "disconnected",
                        error:
                            err.message
                    });
                }

                res.json({
                    success: true,
                    server: "running",
                    database:
                        "connected",
                    database_test:
                        results[0]
                            .database_test
                });
            }
        );
    }
);

// ======================================================
// EXCEL BACKUP SYSTEM
// ======================================================

const BACKUP_DIR =
    path.join(
        __dirname,
        "backups"
    );

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(
        BACKUP_DIR,
        {
            recursive: true
        }
    );
}

const BACKUP_QUERIES = {
    users: `
        SELECT
            id,
            name,
            username,
            email,
            role,
            photo,
            created_at,
            is_active
        FROM users
        ORDER BY id DESC
    `,

    customers: `
        SELECT
            id,
            name,
            phone,
            shop_name,
            shop_number,
            address,
            contract_id,
            date_id,
            photo,
            created_at
        FROM customers
        ORDER BY id DESC
    `,

    employees: `
        SELECT
            id,
            name,
            phone,
            email,
            position,
            province,
            address,
            photo,
            created_by,
            created_by_role,
            created_at
        FROM employees
        ORDER BY id DESC
    `,

    attendance: `
        SELECT
            a.id,
            a.employee_id,
            a.user_id,
            COALESCE(
                e.name,
                u.name
            ) AS employee_name,
            a.date,
            a.check_in,
            a.check_out,
            a.status,
            a.created_at
        FROM attendance a
        LEFT JOIN employees e
            ON e.id = a.employee_id
        LEFT JOIN users u
            ON u.id = a.user_id
        ORDER BY a.id DESC
    `,

    contracts: `
        SELECT
            id,
            person_name,
            line_number,
            shop_name,
            shop_number,
            shop_location,
            province,
            tazkira_id,
            contract_start,
            contract_end,
            amount,
            photo,
            created_at
        FROM contracts
        ORDER BY
            contract_end ASC,
            id DESC
    `,

    payments: `
        SELECT
            p.id,
            p.customer_id,
            c.name AS customer_name,
            p.amount,
            p.type,
            p.date,
            p.description,
            p.created_at
        FROM payments p
        LEFT JOIN customers c
            ON c.id = p.customer_id
        ORDER BY p.id DESC
    `,

    projects: `
        SELECT
            id,
            title,
            description,
            user_id,
            status,
            deadline,
            employee,
            testing,
            end_date,
            created_at
        FROM projects
        ORDER BY id DESC
    `,

    income: `
        SELECT
            id,
            source,
            amount,
            date,
            description
        FROM finance_income
        ORDER BY id DESC
    `,

    expenses: `
        SELECT
            id,
            title,
            amount,
            category,
            date,
            description
        FROM finance_expenses
        ORDER BY id DESC
    `,

    debts: `
        SELECT
            d.id,
            d.customer_id,
            c.name AS customer_name,
            d.amount,
            d.paid_amount,
            GREATEST(
                d.amount - d.paid_amount,
                0
            ) AS remaining_amount,
            d.due_date,
            d.status,
            d.description
        FROM finance_debts d
        LEFT JOIN customers c
            ON c.id = d.customer_id
        ORDER BY d.id DESC
    `
};

function backupEntityFromPath(
    method,
    requestPath
) {
    if (
        method !== "POST" &&
        method !== "PUT"
    ) {
        return null;
    }

    if (
        requestPath === "/login"
    ) {
        return null;
    }

    if (
        requestPath === "/users" ||
        /^\/users\/\d+$/.test(
            requestPath
        )
    ) {
        return "users";
    }

    if (
        requestPath === "/customers" ||
        /^\/customers\/\d+$/.test(
            requestPath
        )
    ) {
        return "customers";
    }

    // Employee Excel backups are manual-only via GET /backup/employees.

    if (
        requestPath === "/attendance" ||
        /^\/attendance\/\d+$/.test(
            requestPath
        )
    ) {
        return "attendance";
    }

    if (
        requestPath === "/contracts" ||
        /^\/contracts\/\d+$/.test(
            requestPath
        )
    ) {
        return "contracts";
    }

    if (
        requestPath === "/payments" ||
        /^\/payments\/\d+$/.test(
            requestPath
        )
    ) {
        return "payments";
    }

    if (
        requestPath === "/projects" ||
        /^\/projects\/\d+$/.test(
            requestPath
        )
    ) {
        return "projects";
    }

    if (
        requestPath ===
            "/finance/income" ||
        /^\/finance\/income\/\d+$/.test(
            requestPath
        )
    ) {
        return "income";
    }

    if (
        requestPath ===
            "/finance/expenses" ||
        /^\/finance\/expenses\/\d+$/.test(
            requestPath
        )
    ) {
        return "expenses";
    }

    if (
        requestPath ===
            "/finance/debts" ||
        /^\/finance\/debts\/\d+$/.test(
            requestPath
        ) ||
        /^\/finance\/debts\/\d+\/pay$/.test(
            requestPath
        )
    ) {
        return "debts";
    }

    return null;
}

async function createExcelBackup(
    entity
) {
    if (!XLSX) {
        throw new Error(
            "Excel backup requires the xlsx package. Run: npm install xlsx"
        );
    }

    const sql =
        BACKUP_QUERIES[entity];

    if (!sql) {
        return null;
    }

    const rows =
        await dbQueryPromise(
            sql
        );

    const safeRows =
        rows.map((row) => {
            const copy = {
                ...row
            };

            if (copy.photo) {
                copy.photo =
                    "[PHOTO STORED]";
            }

            return copy;
        });

    const worksheet =
        XLSX.utils.json_to_sheet(
            safeRows.length
                ? safeRows
                : [{}]
        );

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        entity.substring(0, 31)
    );

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );

    const filename =
        `${entity}-backup-${timestamp}.xlsx`;

    const filePath =
        path.join(
            BACKUP_DIR,
            filename
        );

    XLSX.writeFile(
        workbook,
        filePath
    );

    return filePath;
}

// ======================================================
// AUTOMATIC EXCEL BACKUP AFTER SAVE
// ======================================================

app.use(
    (req, res, next) => {
        res.on(
            "finish",
            () => {
                if (
                    res.statusCode < 200 ||
                    res.statusCode >= 300
                ) {
                    return;
                }

                const entity =
                    backupEntityFromPath(
                        req.method,
                        req.path
                    );

                if (!entity) {
                    return;
                }

                createExcelBackup(
                    entity
                )
                    .then(() => {
                        console.log(
                            `Excel backup created: ${entity}`
                        );
                    })
                    .catch((error) => {
                        console.error(
                            `Excel backup error (${entity}):`,
                            error.message
                        );
                    });
            }
        );

        next();
    }
);

// ======================================================
// MANUAL EXCEL BACKUP DOWNLOAD
// ======================================================

app.get(
    "/backup/:entity",
    authenticateToken,
    async (req, res) => {
        const entity =
            String(
                req.params.entity || ""
            ).toLowerCase();

        if (
            entity === "users" &&
            !getPermissions(req.user.role).canManageUsers
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to export user accounts."
            });
        }

        if (
            !BACKUP_QUERIES[entity]
        ) {
            return sendError(
                res,
                404,
                "Backup type not found."
            );
        }

        try {
            const filePath =
                await createExcelBackup(
                    entity
                );

            return res.download(
                filePath,
                path.basename(filePath)
            );
        } catch (error) {
            return sendError(
                res,
                500,
                "Failed to create Excel backup.",
                error
            );
        }
    }
);

// ======================================================
// PUBLIC REGISTRATION
// New accounts remain inactive until a Super Admin assigns a supported role.
// The client cannot choose an account role.
// ======================================================

app.post(
    "/register",
    async (req, res) => {
        const name = normalize(req.body?.name);
        const username = normalize(req.body?.username);
        const email = isEmpty(req.body?.email)
            ? null
            : normalize(req.body.email).toLowerCase();
        const password = req.body?.password;

        if (isEmpty(name) || isEmpty(username) || isEmpty(password)) {
            return sendError(
                res,
                400,
                "Name, username and password are required."
            );
        }

        if (name.length > 255 || username.length > 255) {
            return sendError(res, 400, "Name or username is too long.");
        }

        if (username.length < 3) {
            return sendError(res, 400, "Username must contain at least 3 characters.");
        }

        if (email && (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            return sendError(res, 400, "Please enter a valid email address.");
        }

        if (typeof password !== "string" || password.length < 8) {
            return sendError(res, 400, "Password must contain at least 8 characters.");
        }

        if (password.length > 72) {
            return sendError(res, 400, "Password is too long.");
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                `
                INSERT INTO users (name, username, password, email, role)
                VALUES (?, ?, ?, ?, 'pending')
                `,
                [name, username, hashedPassword, email],
                (err, result) => {
                    if (err) {
                        if (err.code === "ER_DUP_ENTRY") {
                            return sendError(
                                res,
                                409,
                                "Username or email already exists."
                            );
                        }

                        return sendError(
                            res,
                            500,
                            "Failed to create account.",
                            err
                        );
                    }

                    return res.status(201).json({
                        success: true,
                        message: "Account created. Wait for a Super Admin to assign an active role.",
                        id: result.insertId
                    });
                }
            );
        } catch (error) {
            return sendError(res, 500, "Password hashing failed.", error);
        }
    }
);

// ======================================================
// LOGIN
// ======================================================

app.post(
    "/login",
    (req, res) => {
        const {
            identity,
            username,
            email,
            password
        } = req.body;

       

        if (isEmpty(password)) {
            return sendError(
                res,
                400,
                "Password is required."
            );
        }

        if (
            isEmpty(identity) &&
            isEmpty(username) &&
            isEmpty(email)
        ) {
            return sendError(
                res,
                400,
                "Username or email is required."
            );
        }

        const loginValue =
            normalize(
                !isEmpty(identity)
                    ? identity
                    : !isEmpty(username)
                        ? username
                        : email
            );

        const sql = `
            SELECT
                id,
                name,
                username,
                password,
                email,
                role,
                photo,
                phone,
                is_active
            FROM users
            WHERE username = ?
               OR email = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [
                loginValue,
                loginValue
            ],
            async (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Database error.",
                        err
                    );
                }

                if (
                    results.length === 0
                ) {
                    return sendError(
                        res,
                        401,
                        "Invalid username/email or password."
                    );
                }

                const user =
                    results[0];

                try {
                    let passwordMatch =
                        false;

                    if (
                        typeof user.password ===
                            "string" &&
                        user.password.startsWith(
                            "$2"
                        )
                    ) {
                        passwordMatch =
                            await bcrypt.compare(
                                password,
                                user.password
                            );
                    } else {
                        passwordMatch =
                            password ===
                            user.password;

                        if (
                            passwordMatch
                        ) {
                            const hashedPassword =
                                await bcrypt.hash(
                                    password,
                                    10
                                );

                            db.query(
                                `
                                UPDATE users
                                SET password = ?
                                WHERE id = ?
                                `,
                                [
                                    hashedPassword,
                                    user.id
                                ]
                            );
                        }
                    }

                    if (
                        !passwordMatch
                    ) {
                        return sendError(
                            res,
                            401,
                            "Invalid username/email or password."
                        );
                    }

                    if (!isAccountActive(user.is_active)) {
                        return sendError(res, 403, "This account is disabled.");
                    }

                    if (!isActiveRole(user.role)) {
                        return sendError(
                            res,
                            403,
                            "Account is not assigned an active role. Please contact a Super Admin."
                        );
                    }

                    if (!JWT_SECRET) {
                        return sendError(
                            res,
                            500,
                            "JWT_SECRET is not configured."
                        );
                    }

                    const token =
                        jwt.sign(
                            {
                                id:
                                    user.id,
                                username:
                                    user.username,
                                email:
                                    user.email,
                                role:
                                    normalizeRole(user.role)
                            },
                            JWT_SECRET,
                            {
                                expiresIn:
                                    "2h"
                            }
                        );

                    return res.json({
                        success:
                            true,
                        message:
                            "Login successful.",
                        token,
                        user: {
                            id:
                                user.id,
                            name:
                                user.name,
                            username:
                                user.username,
                            email:
                                user.email,
                            role:
                                normalizeRole(user.role),
                            photo: user.photo || "",
                            permissions: getPermissions(
                                normalizeRole(user.role)
                            )
                        }
                    });
                } catch (
                    error
                ) {
                    return sendError(
                        res,
                        500,
                        "Login error.",
                        error
                    );
                }
            }
        );
    }
);

// ======================================================
// USERS
// ======================================================

app.get(
    "/api/me",
    authenticateToken,
    (req, res) => {
        return res.json({
            id: req.user.id,
            name: req.user.name,
            username: req.user.username,
            email: req.user.email,
            phone: req.user.phone || "",
            photo: req.user.photo || "",
            role: req.user.role,
            permissions: getPermissions(req.user.role)
        });
    }
);

app.put(
    "/api/me",
    authenticateToken,
    (req, res) => {
        if (hasForbiddenProfileFields(req.body)) {
            return res.status(403).json({
                success: false,
                message: "Only name, email, and phone can be changed here."
            });
        }

        const profile = pickProfileFields(req.body);
        const name = normalize(profile.name);
        const email = isEmpty(profile.email)
            ? null
            : normalize(profile.email).toLowerCase();
        const phone = isEmpty(profile.phone)
            ? null
            : normalize(profile.phone);

        if (isEmpty(name) || name.length > 255) {
            return sendError(res, 400, "A valid name is required.");
        }

        if (
            email &&
            (email.length > 255 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        ) {
            return sendError(res, 400, "Please enter a valid email address.");
        }

        if (phone && phone.length > 100) {
            return sendError(res, 400, "Phone number is too long.");
        }

        db.query(
            "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
            [name, email, phone, req.user.id],
            (error, result) => {
                if (error) {
                    if (error.code === "ER_DUP_ENTRY") {
                        return sendError(res, 409, "Email is already in use.");
                    }

                    return sendError(res, 500, "Failed to update account.", error);
                }

                return res.json({
                    success: true,
                    message: "Account updated successfully."
                });
            }
        );
    }
);

app.post(
    "/api/me/password",
    authenticateToken,
    async (req, res) => {
        if (hasUnexpectedFields(req.body, ["currentPassword", "newPassword"])) {
            return res.status(403).json({
                success: false,
                message: "Only password fields are allowed here."
            });
        }

        const { currentPassword, newPassword } = req.body || {};

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            newPassword.length > 72
        ) {
            return sendError(
                res,
                400,
                "Current password and a new password of 8 to 72 characters are required."
            );
        }

        db.query(
            "SELECT password FROM users WHERE id = ? LIMIT 1",
            [req.user.id],
            async (error, rows) => {
                if (error) {
                    return sendError(res, 500, "Failed to verify password.", error);
                }

                if (!rows.length) {
                    return sendError(res, 404, "Account not found.");
                }

                try {
                    const storedPassword = rows[0].password;
                    const matches =
                        typeof storedPassword === "string" &&
                        storedPassword.startsWith("$2")
                            ? await bcrypt.compare(currentPassword, storedPassword)
                            : currentPassword === storedPassword;

                    if (!matches) {
                        return sendError(res, 403, "Current password is incorrect.");
                    }

                    const hash = await bcrypt.hash(newPassword, 10);
                    db.query(
                        "UPDATE users SET password = ? WHERE id = ?",
                        [hash, req.user.id],
                        (updateError) => {
                            if (updateError) {
                                return sendError(
                                    res,
                                    500,
                                    "Failed to change password.",
                                    updateError
                                );
                            }

                            return res.json({
                                success: true,
                                message: "Password changed successfully."
                            });
                        }
                    );
                } catch (hashError) {
                    return sendError(res, 500, "Failed to change password.", hashError);
                }
            }
        );
    }
);

app.get(
    "/users",
    authenticateToken,
    (req, res) => {
        db.query(
            `
            SELECT
                id,
                name,
                username,
                email,
                role,
                photo,
                created_at,
                is_active
            FROM users
            ORDER BY id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch users.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.get(
    "/users/:id",
    authenticateToken,
    (req, res) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid user ID."
            );
        }

        db.query(
            `
            SELECT
                id,
                name,
                username,
                email,
                photo,
                created_at,
                is_active
            FROM users
            WHERE id = ?
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch user.",
                        err
                    );
                }

                if (
                    results.length === 0
                ) {
                    return sendError(
                        res,
                        404,
                        "User not found."
                    );
                }

                res.json(
                    results[0]
                );
            }
        );
    }
);

app.post(
    "/users",
    authenticateToken,
    async (
        req,
        res
    ) => {
        const {
            name,
            username,
            password,
            email,
            role,
            photo,
            is_active = 1
        } = req.body;

        if (
            isEmpty(name) ||
            isEmpty(username) ||
            isEmpty(password)
        ) {
            return sendError(
                res,
                400,
                "Name, username and password are required."
            );
        }

        if (![0, 1, false, true, "0", "1"].includes(is_active)) {
            return sendError(res, 400, "Account status must be active or disabled.");
        }

        try {
            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            db.query(
                `
                INSERT INTO users
                (
                    name,
                    username,
                    password,
                    email,
                    role,
                    photo,
                    is_active
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    normalize(name),
                    normalize(username),
                    hashedPassword,
                    normalize(email),
                    normalize(role || "user"),
                    normalize(photo),
                    Number(is_active)
                ],
                (
                    err,
                    result
                ) => {
                    if (err) {
                        if (
                            err.code ===
                            "ER_DUP_ENTRY"
                        ) {
                            return sendError(
                                res,
                                409,
                                "Username or email already exists."
                            );
                        }

                        return sendError(
                            res,
                            500,
                            "Failed to create user.",
                            err
                        );
                    }

                    res.status(
                        201
                    ).json({
                        success:
                            true,
                        message:
                            "User created successfully.",
                        id:
                            result.insertId
                    });
                }
            );
        } catch (
            error
        ) {
            return sendError(
                res,
                500,
                "Password hashing failed.",
                error
            );
        }
    }
);

app.put(
    "/users/:id",
    authenticateToken,
    async (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            name,
            username,
            password,
            email,
            role,
            photo,
            is_active
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid user ID."
            );
        }

        if (
            isEmpty(name) ||
            isEmpty(username)
        ) {
            return sendError(
                res,
                400,
                "Name and username are required."
            );
        }

        if (
            is_active !== undefined &&
            ![0, 1, false, true, "0", "1"].includes(is_active)
        ) {
            return sendError(res, 400, "Account status must be active or disabled.");
        }

        try {
            let hashedPassword =
                null;

            if (
                !isEmpty(password)
            ) {
                hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );
            }

            if (
                hashedPassword
            ) {
                db.query(
                    `
                    UPDATE users
                    SET
                        name = ?,
                        username = ?,
                        password = ?,
                        email = ?,
                        role = ?,
                        photo = ?,
                        is_active = ?
                    WHERE id = ?
                    `,
                    [
                        normalize(name),
                        normalize(username),
                        hashedPassword,
                        normalize(email),
                        normalize(role ?? req.targetUser.role),
                        normalize(photo),
                        Number(is_active ?? req.targetUser.is_active),
                        id
                    ],
                    (
                        err,
                        result
                    ) => {
                        if (err) {
                            if (
                                err.code ===
                                "ER_DUP_ENTRY"
                            ) {
                                return sendError(
                                    res,
                                    409,
                                    "Username or email already exists."
                                );
                            }

                            return sendError(
                                res,
                                500,
                                "Failed to update user.",
                                err
                            );
                        }

                        if (
                            result.affectedRows ===
                            0
                        ) {
                            return sendError(
                                res,
                                404,
                                "User not found."
                            );
                        }

                        res.json({
                            success:
                                true,
                            message:
                                "User updated successfully."
                        });
                    }
                );
            } else {
                db.query(
                    `
                    UPDATE users
                    SET
                        name = ?,
                        username = ?,
                        email = ?,
                        role = ?,
                        photo = ?,
                        is_active = ?
                    WHERE id = ?
                    `,
                    [
                        normalize(name),
                        normalize(username),
                        normalize(email),
                        normalize(role ?? req.targetUser.role),
                        normalize(photo),
                        Number(is_active ?? req.targetUser.is_active),
                        id
                    ],
                    (
                        err,
                        result
                    ) => {
                        if (err) {
                            if (
                                err.code ===
                                "ER_DUP_ENTRY"
                            ) {
                                return sendError(
                                    res,
                                    409,
                                    "Username or email already exists."
                                );
                            }

                            return sendError(
                                res,
                                500,
                                "Failed to update user.",
                                err
                            );
                        }

                        if (
                            result.affectedRows ===
                            0
                        ) {
                            return sendError(
                                res,
                                404,
                                "User not found."
                            );
                        }

                        res.json({
                            success:
                                true,
                            message:
                                "User updated successfully."
                        });
                    }
                );
            }
        } catch (
            error
        ) {
            return sendError(
                res,
                500,
                "Password hashing failed.",
                error
            );
        }
    }
);

app.delete(
    "/users/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid user ID."
            );
        }

        db.query(
            `
            DELETE FROM users
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete user.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "User not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "User deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// EMPLOYEES
// ======================================================

app.get(
    "/employees",
    authenticateToken,
    (
        req,
        res
    ) => {
        const sql = req.user.role === ROLE.ADMIN
            ? "SELECT id, name FROM employees ORDER BY id DESC"
            : `
                SELECT
                    id,
                    name,
                    phone,
                    email,
                    position,
                    province,
                    address,
                    photo,
                    created_by,
                    created_by_role,
                    created_at
                FROM employees
                ORDER BY id DESC
            `;

        db.query(
            sql,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch employees.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.get(
    "/employees/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid employee ID."
            );
        }

        db.query(
            `
            SELECT
                id,
                name,
                phone,
                email,
                position,
                province,
                address,
                photo,
                created_at
            FROM employees
            WHERE id = ?
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch employee.",
                        err
                    );
                }

                if (
                    results.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Employee not found."
                    );
                }

                res.json(
                    results[0]
                );
            }
        );
    }
);

app.post(
    "/employees",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            name,
            phone,
            email,
            position,
            province,
            address,
            photo
        } = req.body;

        if (
            isEmpty(name) ||
            isEmpty(phone)
        ) {
            return sendError(
                res,
                400,
                "Name and phone are required."
            );
        }

        db.query(
            `
            INSERT INTO employees
            (
                name,
                phone,
                email,
                position,
                province,
                address,
                photo,
                created_by,
                created_by_role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(name),
                normalize(phone),
                normalize(email),
                normalize(position),
                normalize(province),
                normalize(address),
                normalize(photo),
                req.user.id,
                req.user.role
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create employee.",
                        err
                    );
                }

                res.status(
                    201
                ).json({
                    success:
                        true,
                    message:
                        "Employee created successfully.",
                    id:
                        result.insertId
                });
            }
        );
    }
);

app.put(
    "/employees/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            name,
            phone,
            email,
            position,
            province,
            address,
            photo
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid employee ID."
            );
        }

        db.query(
            `
            UPDATE employees
            SET
                name = ?,
                phone = ?,
                email = ?,
                position = ?,
                province = ?,
                address = ?,
                photo = ?
            WHERE id = ?
            `,
            [
                normalize(name),
                normalize(phone),
                normalize(email),
                normalize(position),
                normalize(province),
                normalize(address),
                normalize(photo),
                id
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update employee.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Employee not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Employee updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/employees/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid employee ID."
            );
        }

        db.query(
            `
            DELETE FROM employees
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete employee.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Employee not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Employee deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// CUSTOMERS
// ======================================================

app.get(
    "/customers",
    authenticateToken,
    (
        req,
        res
    ) => {
        db.query(
            `
            SELECT *
            FROM customers
            ORDER BY id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch customers.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.get(
    "/customers/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid customer ID."
            );
        }

        db.query(
            `
            SELECT *
            FROM customers
            WHERE id = ?
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch customer.",
                        err
                    );
                }

                if (
                    results.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                res.json(
                    results[0]
                );
            }
        );
    }
);

app.post(
    "/customers",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            name,
            phone,
            shop_name,
            shop_number,
            address,
            contract_id,
            date_id,
            photo
        } = req.body;

        if (
            isEmpty(name) ||
            isEmpty(phone)
        ) {
            return sendError(
                res,
                400,
                "Name and phone are required."
            );
        }

        db.query(
            `
            INSERT INTO customers
            (
                name,
                phone,
                shop_name,
                shop_number,
                address,
                contract_id,
                date_id,
                photo,
                created_by,
                created_by_role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(name),
                normalize(phone),
                normalize(shop_name),
                normalize(shop_number),
                normalize(address),
                normalize(contract_id),
                normalize(date_id),
                normalize(photo),
                req.user.id,
                req.user.role
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create customer.",
                        err
                    );
                }

                res.status(
                    201
                ).json({
                    success:
                        true,
                    message:
                        "Customer created successfully.",
                    id:
                        result.insertId
                });
            }
        );
    }
);

app.put(
    "/customers/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            name,
            phone,
            shop_name,
            shop_number,
            address,
            contract_id,
            date_id,
            photo
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid customer ID."
            );
        }

        db.query(
            `
            UPDATE customers
            SET
                name = ?,
                phone = ?,
                shop_name = ?,
                shop_number = ?,
                address = ?,
                contract_id = ?,
                date_id = ?,
                photo = ?
            WHERE id = ?
            `,
            [
                normalize(name),
                normalize(phone),
                normalize(shop_name),
                normalize(shop_number),
                normalize(address),
                normalize(contract_id),
                normalize(date_id),
                normalize(photo),
                id
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update customer.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Customer updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/customers/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid customer ID."
            );
        }

        db.query(
            `
            DELETE FROM customers
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete customer.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Customer deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// ATTENDANCE
// ======================================================

const attendanceSchemaState = {
    ready: false,
    reason: "Attendance schema readiness check is pending."
};
let attendanceSchemaCheck = null;
let nextAttendanceSchemaCheck = 0;

function refreshAttendanceSchemaReadiness() {
    if (attendanceSchemaState.ready) return Promise.resolve(attendanceSchemaState);
    if (attendanceSchemaCheck) return attendanceSchemaCheck;
    if (Date.now() < nextAttendanceSchemaCheck) {
        return Promise.resolve(attendanceSchemaState);
    }

    nextAttendanceSchemaCheck = Date.now() + 5000;
    attendanceSchemaCheck = inspectAttendanceReadiness(db)
        .then((result) => {
            attendanceSchemaState.ready = result.ready;
            attendanceSchemaState.reason = result.message;
            if (!result.ready) {
                console.error(
                    "Attendance schema migration is required:",
                    result.message || "preflight checks did not pass."
                );
            }
            return attendanceSchemaState;
        })
        .catch((error) => {
            attendanceSchemaState.reason = "Attendance schema preflight failed.";
            console.error(
                "Attendance schema preflight failed:",
                error.message
            );
            return attendanceSchemaState;
        })
        .finally(() => {
            attendanceSchemaCheck = null;
        });
    return attendanceSchemaCheck;
}

setImmediate(() => {
    refreshAttendanceSchemaReadiness();
});

app.use(
    "/attendance",
    async (req, res, next) => {
        await refreshAttendanceSchemaReadiness();
        if (attendanceSchemaState.ready) return next();
        return res.status(503).json({
            success: false,
            message: "Attendance is unavailable until its schema migration and preflight checks are complete."
        });
    },
    createAttendanceRouter({
        repository: createMySqlAttendanceRepository(db),
        authenticateToken
    })
);

// ======================================================
// INSTRUCTIONS / ORDERS
// ======================================================

app.get(
    "/instructions",
    authenticateToken,
    (req, res) => {
        db.query(
            `
            SELECT id, title, description, created_at
            FROM instructions
            ORDER BY id DESC
            `,
            (error, rows) => {
                if (error) {
                    return sendError(res, 500, "Failed to fetch instructions.", error);
                }

                return res.json(rows);
            }
        );
    }
);

app.post(
    "/instructions",
    authenticateToken,
    (req, res) => {
        if (hasUnexpectedFields(req.body, ["title", "description"])) {
            return sendError(res, 400, "Only title and description are accepted.");
        }

        const title = normalize(req.body.title);
        const description = isEmpty(req.body.description)
            ? null
            : normalize(req.body.description);

        if (isEmpty(title) || title.length > 255) {
            return sendError(res, 400, "A title of 1 to 255 characters is required.");
        }

        db.query(
            `
            INSERT INTO instructions
                (title, description, created_by, created_by_role)
            VALUES (?, ?, ?, ?)
            `,
            [title, description, req.user.id, req.user.role],
            (error, result) => {
                if (error) {
                    return sendError(res, 500, "Failed to issue instruction.", error);
                }

                return res.status(201).json({
                    success: true,
                    message: "Instruction issued successfully.",
                    id: result.insertId
                });
            }
        );
    }
);

app.put(
    "/instructions/:id",
    authenticateToken,
    (req, res) => {
        if (hasUnexpectedFields(req.body, ["title", "description"])) {
            return sendError(res, 400, "Only title and description are accepted.");
        }

        const title = normalize(req.body.title);
        const description = isEmpty(req.body.description)
            ? null
            : normalize(req.body.description);

        if (!isValidId(req.params.id)) {
            return sendError(res, 400, "Invalid instruction ID.");
        }
        if (isEmpty(title) || title.length > 255) {
            return sendError(res, 400, "A title of 1 to 255 characters is required.");
        }

        db.query(
            "UPDATE instructions SET title = ?, description = ? WHERE id = ?",
            [title, description, req.params.id],
            (error, result) => {
                if (error) {
                    return sendError(res, 500, "Failed to update instruction.", error);
                }
                if (result.affectedRows === 0) {
                    return sendError(res, 404, "Instruction not found.");
                }
                return res.json({ success: true, message: "Instruction updated." });
            }
        );
    }
);

app.delete(
    "/instructions/:id",
    authenticateToken,
    (req, res) => {
        if (!isValidId(req.params.id)) {
            return sendError(res, 400, "Invalid instruction ID.");
        }

        db.query(
            "DELETE FROM instructions WHERE id = ?",
            [req.params.id],
            (error, result) => {
                if (error) {
                    return sendError(res, 500, "Failed to delete instruction.", error);
                }
                if (result.affectedRows === 0) {
                    return sendError(res, 404, "Instruction not found.");
                }
                return res.json({ success: true, message: "Instruction deleted." });
            }
        );
    }
);

// ======================================================
// CONTRACTS
// ======================================================

function getContractState(
    endDate
) {
    if (!endDate) {
        return {
            days_left:
                null,
            contract_status:
                "NO_DATE"
        };
    }

    const end =
        new Date(
            `${String(
                endDate
            ).slice(
                0,
                10
            )}T23:59:59`
        );

    const now =
        new Date();

    const days =
        Math.ceil(
            (
                end.getTime() -
                now.getTime()
            ) /
                86400000
        );

    if (days < 0) {
        return {
            days_left:
                days,
            contract_status:
                "EXPIRED"
        };
    }

    if (days <= 7) {
        return {
            days_left:
                days,
            contract_status:
                "ENDING_SOON"
        };
    }

    return {
        days_left:
            days,
        contract_status:
            "ACTIVE"
    };
}

app.get(
    "/contracts",
    authenticateToken,
    (
        req,
        res
    ) => {
        db.query(
            `
            SELECT
                id,
                person_name,
                line_number,
                shop_name,
                shop_number,
                shop_location,
                province,
                tazkira_id,
                contract_start,
                contract_end,
                amount,
                photo,
                created_by,
                created_by_role,
                created_at
            FROM contracts
            ORDER BY
                contract_end ASC,
                id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch contracts.",
                        err
                    );
                }

                res.json(
                    results.map(
                        (
                            item
                        ) => ({
                            ...item,
                            ...getContractState(
                                item.contract_end
                            )
                        })
                    )
                );
            }
        );
    }
);

app.get(
    "/contracts/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid contract ID."
            );
        }

        db.query(
            `
            SELECT *
            FROM contracts
            WHERE id = ?
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch contract.",
                        err
                    );
                }

                if (
                    results.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Contract not found."
                    );
                }

                res.json({
                    ...results[0],
                    ...getContractState(
                        results[0]
                            .contract_end
                    )
                });
            }
        );
    }
);

app.post(
    "/contracts",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            person_name,
            line_number,
            shop_name,
            shop_number,
            shop_location,
            province,
            tazkira_id,
            contract_start,
            contract_end,
            amount,
            photo
        } = req.body;

        if (
            isEmpty(
                person_name
            ) ||
            isEmpty(
                contract_start
            ) ||
            isEmpty(
                contract_end
            )
        ) {
            return sendError(
                res,
                400,
                "Person name, start date and end date are required."
            );
        }

        db.query(
            `
            INSERT INTO contracts
            (
                person_name,
                line_number,
                shop_name,
                shop_number,
                shop_location,
                province,
                tazkira_id,
                contract_start,
                contract_end,
                amount,
                photo,
                created_by,
                created_by_role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(
                    person_name
                ),
                normalize(
                    line_number
                ),
                normalize(
                    shop_name
                ),
                normalize(
                    shop_number
                ),
                normalize(
                    shop_location
                ),
                normalize(
                    province
                ),
                normalize(
                    tazkira_id
                ),
                contract_start,
                contract_end,
                Number(
                    amount || 0
                ),
                normalize(
                    photo
                ),
                req.user.id,
                req.user.role
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create contract.",
                        err
                    );
                }

                res.status(
                    201
                ).json({
                    success:
                        true,
                    message:
                        "Contract created successfully.",
                    id:
                        result.insertId
                });
            }
        );
    }
);

app.put(
    "/contracts/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            person_name,
            line_number,
            shop_name,
            shop_number,
            shop_location,
            province,
            tazkira_id,
            contract_start,
            contract_end,
            amount,
            photo
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid contract ID."
            );
        }

        db.query(
            `
            UPDATE contracts
            SET
                person_name = ?,
                line_number = ?,
                shop_name = ?,
                shop_number = ?,
                shop_location = ?,
                province = ?,
                tazkira_id = ?,
                contract_start = ?,
                contract_end = ?,
                amount = ?,
                photo = ?
            WHERE id = ?
            `,
            [
                normalize(
                    person_name
                ),
                normalize(
                    line_number
                ),
                normalize(
                    shop_name
                ),
                normalize(
                    shop_number
                ),
                normalize(
                    shop_location
                ),
                normalize(
                    province
                ),
                normalize(
                    tazkira_id
                ),
                contract_start,
                contract_end,
                Number(
                    amount || 0
                ),
                normalize(
                    photo
                ),
                id
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update contract.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Contract not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Contract updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/contracts/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid contract ID."
            );
        }

        db.query(
            `
            DELETE FROM contracts
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete contract.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Contract not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Contract deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// PAYMENTS
// ======================================================

app.get(
    "/payments",
    authenticateToken,
    (
        req,
        res
    ) => {
        db.query(
            `
            SELECT *
            FROM payments
            ORDER BY id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch payments.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.get(
    "/payments/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid payment ID."
            );
        }

        db.query(
            `
            SELECT *
            FROM payments
            WHERE id = ?
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch payment.",
                        err
                    );
                }

                if (
                    results.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                res.json(
                    results[0]
                );
            }
        );
    }
);

app.post(
    "/payments",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            customer_id,
            amount,
            type,
            date,
            description
        } = req.body;

        if (
            isEmpty(customer_id) ||
            isEmpty(amount) ||
            isEmpty(type) ||
            isEmpty(date)
        ) {
            return sendError(
                res,
                400,
                "customer_id, amount, type and date are required."
            );
        }

        db.query(
            `
            INSERT INTO payments
            (
                customer_id,
                amount,
                type,
                date,
                description,
                created_by,
                created_by_role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                customer_id,
                amount,
                normalize(type),
                date,
                normalize(
                    description
                ),
                req.user.id,
                req.user.role
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create payment.",
                        err
                    );
                }

                res.status(
                    201
                ).json({
                    success:
                        true,
                    message:
                        "Payment created successfully.",
                    id:
                        result.insertId
                });
            }
        );
    }
);

app.put(
    "/payments/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            customer_id,
            amount,
            type,
            date,
            description
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid payment ID."
            );
        }

        db.query(
            `
            UPDATE payments
            SET
                customer_id = ?,
                amount = ?,
                type = ?,
                date = ?,
                description = ?
            WHERE id = ?
            `,
            [
                customer_id,
                amount,
                normalize(type),
                date,
                normalize(
                    description
                ),
                id
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update payment.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Payment updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/payments/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid payment ID."
            );
        }

        db.query(
            `
            DELETE FROM payments
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete payment.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Payment deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// PAYMENT RECEIPT
// ======================================================

app.get(
    "/payments/:id/receipt",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid payment ID."
            );
        }

        db.query(
            `
            SELECT
                p.id,
                p.customer_id,
                c.name AS customer_name,
                c.phone AS customer_phone,
                c.shop_name,
                c.shop_number,
                p.amount,
                p.type,
                p.date,
                p.description
            FROM payments p
            LEFT JOIN customers c
                ON c.id =
                    p.customer_id
            WHERE p.id = ?
            LIMIT 1
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create payment receipt.",
                        err
                    );
                }

                if (
                    results.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                const payment =
                    results[0];

                res.json({
                    success:
                        true,
                    receipt: {
                        receipt_number:
                            "PAY-" +
                            String(
                                payment.id
                            ).padStart(
                                6,
                                "0"
                            ),
                        payment_id:
                            payment.id,
                        customer_id:
                            payment.customer_id,
                        customer_name:
                            payment.customer_name ||
                            "",
                        customer_phone:
                            payment.customer_phone ||
                            "",
                        shop_name:
                            payment.shop_name ||
                            "",
                        shop_number:
                            payment.shop_number ||
                            "",
                        amount:
                            Number(
                                payment.amount
                            ),
                        type:
                            payment.type ||
                            "",
                        date:
                            payment.date,
                        description:
                            payment.description ||
                            "",
                        issued_at:
                            new Date().toISOString()
                    }
                });
            }
        );
    }
);

// ======================================================
// PROJECTS
// ======================================================

app.get(
    "/projects",
    authenticateToken,
    (
        req,
        res
    ) => {
        db.query(
            `
            SELECT *
            FROM projects
            ORDER BY id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch projects.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.get(
    "/projects/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid project ID."
            );
        }

        db.query(
            `
            SELECT *
            FROM projects
            WHERE id = ?
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch project.",
                        err
                    );
                }

                if (
                    results.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Project not found."
                    );
                }

                res.json(
                    results[0]
                );
            }
        );
    }
);

app.post(
    "/projects",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            title,
            description,
            user_id,
            status,
            deadline,
            employee,
            testing,
            end_date
        } = req.body;

        if (
            isEmpty(title)
        ) {
            return sendError(
                res,
                400,
                "Title is required."
            );
        }

        db.query(
            `
            INSERT INTO projects
            (
                title,
                description,
                user_id,
                status,
                deadline,
                employee,
                testing,
                end_date,
                created_by,
                created_by_role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(title),
                normalize(
                    description
                ),
                normalize(
                    user_id
                ),
                normalize(status),
                normalize(
                    deadline
                ),
                normalize(
                    employee
                ),
                normalize(
                    testing
                ),
                normalize(
                    end_date
                ),
                req.user.id,
                req.user.role
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create project.",
                        err
                    );
                }

                res.status(
                    201
                ).json({
                    success:
                        true,
                    message:
                        "Project created successfully.",
                    id:
                        result.insertId
                });
            }
        );
    }
);

app.put(
    "/projects/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            title,
            description,
            user_id,
            status,
            deadline,
            employee,
            testing,
            end_date
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid project ID."
            );
        }

        db.query(
            `
            UPDATE projects
            SET
                title = ?,
                description = ?,
                user_id = ?,
                status = ?,
                deadline = ?,
                employee = ?,
                testing = ?,
                end_date = ?
            WHERE id = ?
            `,
            [
                normalize(title),
                normalize(
                    description
                ),
                normalize(
                    user_id
                ),
                normalize(status),
                normalize(
                    deadline
                ),
                normalize(
                    employee
                ),
                normalize(
                    testing
                ),
                normalize(
                    end_date
                ),
                id
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update project.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Project not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Project updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/projects/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid project ID."
            );
        }

        db.query(
            `
            DELETE FROM projects
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete project.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Project not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Project deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// FINANCE - INCOME
// ======================================================

app.get(
    "/finance/income",
    authenticateToken,
    (
        req,
        res
    ) => {
        db.query(
            `
            SELECT *
            FROM finance_income
            ORDER BY id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch income.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.post(
    "/finance/income",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            source,
            amount,
            date,
            description
        } = req.body;

        if (
            isEmpty(source) ||
            isEmpty(amount) ||
            isEmpty(date)
        ) {
            return sendError(
                res,
                400,
                "Source, amount and date are required."
            );
        }

        if (
            !Number.isFinite(
                Number(amount)
            ) ||
            Number(amount) < 0
        ) {
            return sendError(
                res,
                400,
                "Invalid amount."
            );
        }

        db.query(
            `
            INSERT INTO finance_income
            (
                source,
                amount,
                date,
                description,
                created_by,
                created_by_role
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(source),
                Number(amount),
                date,
                normalize(
                    description
                ),
                req.user.id,
                req.user.role
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create income.",
                        err
                    );
                }

                res.status(
                    201
                ).json({
                    success:
                        true,
                    message:
                        "Income created successfully.",
                    id:
                        result.insertId
                });
            }
        );
    }
);

app.put(
    "/finance/income/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            source,
            amount,
            date,
            description
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid income ID."
            );
        }

        db.query(
            `
            UPDATE finance_income
            SET
                source = ?,
                amount = ?,
                date = ?,
                description = ?
            WHERE id = ?
            `,
            [
                normalize(source),
                Number(amount),
                date,
                normalize(
                    description
                ),
                id
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update income.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Income not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Income updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/finance/income/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid income ID."
            );
        }

        db.query(
            `
            DELETE FROM finance_income
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete income.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Income not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Income deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// FINANCE - EXPENSES
// ======================================================

app.get(
    "/finance/expenses",
    authenticateToken,
    (
        req,
        res
    ) => {
        db.query(
            `
            SELECT *
            FROM finance_expenses
            ORDER BY id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch expenses.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.post(
    "/finance/expenses",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            title,
            amount,
            category,
            date,
            description
        } = req.body;

        if (
            isEmpty(title) ||
            isEmpty(amount) ||
            isEmpty(date)
        ) {
            return sendError(
                res,
                400,
                "Title, amount and date are required."
            );
        }

        if (
            !Number.isFinite(
                Number(amount)
            ) ||
            Number(amount) < 0
        ) {
            return sendError(
                res,
                400,
                "Invalid amount."
            );
        }

        db.query(
            `
            INSERT INTO finance_expenses
            (
                title,
                amount,
                category,
                date,
                description,
                created_by,
                created_by_role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(title),
                Number(amount),
                normalize(
                    category
                ),
                date,
                normalize(
                    description
                ),
                req.user.id,
                req.user.role
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create expense.",
                        err
                    );
                }

                res.status(
                    201
                ).json({
                    success:
                        true,
                    message:
                        "Expense created successfully.",
                    id:
                        result.insertId
                });
            }
        );
    }
);

app.put(
    "/finance/expenses/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            title,
            amount,
            category,
            date,
            description
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid expense ID."
            );
        }

        db.query(
            `
            UPDATE finance_expenses
            SET
                title = ?,
                amount = ?,
                category = ?,
                date = ?,
                description = ?
            WHERE id = ?
            `,
            [
                normalize(title),
                Number(amount),
                normalize(
                    category
                ),
                date,
                normalize(
                    description
                ),
                id
            ],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update expense.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Expense not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Expense updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/finance/expenses/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid expense ID."
            );
        }

        db.query(
            `
            DELETE FROM finance_expenses
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete expense.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Expense not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Expense deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// FINANCE - DEBTS
// ======================================================

app.get(
    "/finance/debts",
    authenticateToken,
    (
        req,
        res
    ) => {
        db.query(
            `
            SELECT
                d.id,
                d.customer_id,
                c.name AS customer_name,
                d.amount,
                d.paid_amount,
                GREATEST(
                    d.amount -
                    d.paid_amount,
                    0
                ) AS remaining_amount,
                d.due_date,
                d.status,
                d.created_by,
                d.created_by_role,
                d.description
            FROM finance_debts d
            LEFT JOIN customers c
                ON c.id =
                    d.customer_id
            ORDER BY d.id DESC
            `,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch debts.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

app.post(
    "/finance/debts",
    authenticateToken,
    (
        req,
        res
    ) => {
        const {
            customer_id,
            amount,
            paid_amount,
            due_date,
            status,
            description
        } = req.body;

        if (
            isEmpty(
                customer_id
            ) ||
            isEmpty(amount)
        ) {
            return sendError(
                res,
                400,
                "Customer and amount are required."
            );
        }

        const totalAmount =
            Number(amount);

        const paidAmount =
            isEmpty(
                paid_amount
            )
                ? 0
                : Number(
                      paid_amount
                  );

        if (
            !Number.isFinite(
                totalAmount
            ) ||
            totalAmount < 0
        ) {
            return sendError(
                res,
                400,
                "Invalid amount."
            );
        }

        if (
            !Number.isFinite(
                paidAmount
            ) ||
            paidAmount < 0 ||
            paidAmount >
                totalAmount
        ) {
            return sendError(
                res,
                400,
                "Paid amount must be between 0 and total amount."
            );
        }

        db.query(
            `
            SELECT id
            FROM customers
            WHERE id = ?
            LIMIT 1
            `,
            [customer_id],
            (
                customerErr,
                customers
            ) => {
                if (customerErr) {
                    return sendError(
                        res,
                        500,
                        "Failed to check customer.",
                        customerErr
                    );
                }

                if (
                    customers.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                db.query(
                    `
                    INSERT INTO finance_debts
                    (
                        customer_id,
                        amount,
                        paid_amount,
                        due_date,
                        status,
                        description,
                        created_by,
                        created_by_role
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        customer_id,
                        totalAmount,
                        paidAmount,
                        normalize(
                            due_date
                        ),
                        normalize(
                            status
                        ) ||
                            "Pending",
                        normalize(
                            description
                        ),
                        req.user.id,
                        req.user.role
                    ],
                    (
                        err,
                        result
                    ) => {
                        if (err) {
                            return sendError(
                                res,
                                500,
                                "Failed to create debt.",
                                err
                            );
                        }

                        res.status(
                            201
                        ).json({
                            success:
                                true,
                            message:
                                "Debt created successfully.",
                            id:
                                result.insertId
                        });
                    }
                );
            }
        );
    }
);

app.put(
    "/finance/debts/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const {
            customer_id,
            amount,
            paid_amount,
            due_date,
            status,
            description
        } = req.body;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid debt ID."
            );
        }

        if (
            isEmpty(
                customer_id
            ) ||
            isEmpty(amount)
        ) {
            return sendError(
                res,
                400,
                "Customer and amount are required."
            );
        }

        const totalAmount =
            Number(amount);

        const paidAmount =
            isEmpty(
                paid_amount
            )
                ? 0
                : Number(
                      paid_amount
                  );

        if (
            !Number.isFinite(
                totalAmount
            ) ||
            totalAmount < 0
        ) {
            return sendError(
                res,
                400,
                "Invalid amount."
            );
        }

        if (
            !Number.isFinite(
                paidAmount
            ) ||
            paidAmount < 0 ||
            paidAmount >
                totalAmount
        ) {
            return sendError(
                res,
                400,
                "Paid amount must be between 0 and total amount."
            );
        }

        db.query(
            `
            SELECT id
            FROM customers
            WHERE id = ?
            LIMIT 1
            `,
            [customer_id],
            (
                customerErr,
                customers
            ) => {
                if (customerErr) {
                    return sendError(
                        res,
                        500,
                        "Failed to check customer.",
                        customerErr
                    );
                }

                if (
                    customers.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                db.query(
                    `
                    UPDATE finance_debts
                    SET
                        customer_id = ?,
                        amount = ?,
                        paid_amount = ?,
                        due_date = ?,
                        status = ?,
                        description = ?
                    WHERE id = ?
                    `,
                    [
                        customer_id,
                        totalAmount,
                        paidAmount,
                        normalize(
                            due_date
                        ),
                        normalize(
                            status
                        ) ||
                            "Pending",
                        normalize(
                            description
                        ),
                        id
                    ],
                    (
                        err,
                        result
                    ) => {
                        if (err) {
                            return sendError(
                                res,
                                500,
                                "Failed to update debt.",
                                err
                            );
                        }

                        if (
                            result.affectedRows ===
                            0
                        ) {
                            return sendError(
                                res,
                                404,
                                "Debt not found."
                            );
                        }

                        res.json({
                            success:
                                true,
                            message:
                                "Debt updated successfully."
                        });
                    }
                );
            }
        );
    }
);

app.delete(
    "/finance/debts/:id",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid debt ID."
            );
        }

        db.query(
            `
            DELETE FROM finance_debts
            WHERE id = ?
            `,
            [id],
            (
                err,
                result
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete debt.",
                        err
                    );
                }

                if (
                    result.affectedRows ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Debt not found."
                    );
                }

                res.json({
                    success:
                        true,
                    message:
                        "Debt deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// PARTIAL DEBT PAYMENT
// ======================================================

app.post(
    "/finance/debts/:id/pay",
    authenticateToken,
    (
        req,
        res
    ) => {
        const { id } =
            req.params;

        const paymentAmount =
            Number(
                req.body.amount
            );

        if (
            !isValidId(id)
        ) {
            return sendError(
                res,
                400,
                "Invalid debt ID."
            );
        }

        if (
            !Number.isFinite(
                paymentAmount
            ) ||
            paymentAmount <= 0
        ) {
            return sendError(
                res,
                400,
                "Payment amount must be greater than zero."
            );
        }

        db.query(
            `
            SELECT
                id,
                amount,
                paid_amount
            FROM finance_debts
            WHERE id = ?
            LIMIT 1
            `,
            [id],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch debt.",
                        err
                    );
                }

                if (
                    results.length ===
                    0
                ) {
                    return sendError(
                        res,
                        404,
                        "Debt not found."
                    );
                }

                const debt =
                    results[0];

                const total =
                    Number(
                        debt.amount
                    );

                const paid =
                    Number(
                        debt.paid_amount
                    );

                const remaining =
                    Math.max(
                        total -
                            paid,
                        0
                    );

                if (
                    paymentAmount >
                    remaining
                ) {
                    return sendError(
                        res,
                        400,
                        "Payment is greater than remaining debt."
                    );
                }

                const newPaid =
                    paid +
                    paymentAmount;

                const newStatus =
                    newPaid >= total
                        ? "Paid"
                        : "Pending";

                db.query(
                    `
                    UPDATE finance_debts
                    SET
                        paid_amount = ?,
                        status = ?
                    WHERE id = ?
                    `,
                    [
                        newPaid,
                        newStatus,
                        id
                    ],
                    (
                        updateErr
                    ) => {
                        if (
                            updateErr
                        ) {
                            return sendError(
                                res,
                                500,
                                "Failed to record debt payment.",
                                updateErr
                            );
                        }

                        res.json({
                            success:
                                true,
                            message:
                                "Debt payment recorded successfully.",
                            debt_id:
                                Number(
                                    id
                                ),
                            paid_amount:
                                newPaid,
                            remaining_amount:
                                Math.max(
                                    total -
                                        newPaid,
                                    0
                                ),
                            status:
                                newStatus
                        });
                    }
                );
            }
        );
    }
);

// ======================================================
// FINANCE SUMMARY
// ======================================================

app.get(
    "/finance/summary",
    authenticateToken,
    (
        req,
        res
    ) => {
        const sql = `
            SELECT
                (
                    SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        )
                    FROM finance_income
                ) AS income,

                (
                    SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        )
                    FROM finance_expenses
                ) AS expenses,

                (
                    SELECT
                        COALESCE(
                            SUM(
                                GREATEST(
                                    amount -
                                    paid_amount,
                                    0
                                )
                            ),
                            0
                        )
                    FROM finance_debts
                ) AS receivables,

                (
                    SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        )
                    FROM payments
                    WHERE type =
                        'Paid'
                ) AS paid_payments
        `;

        db.query(
            sql,
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch finance summary.",
                        err
                    );
                }

                const row =
                    results[0] ||
                    {};

                const income =
                    Number(
                        row.income ||
                            0
                    );

                const expenses =
                    Number(
                        row.expenses ||
                            0
                    );

                const receivables =
                    Number(
                        row.receivables ||
                            0
                    );

                const paidPayments =
                    Number(
                        row.paid_payments ||
                            0
                    );

                res.json({
                    success:
                        true,
                    data: {
                        income,
                        expenses,
                        receivables,
                        paid_payments:
                            paidPayments,
                        balance:
                            income -
                            expenses
                    }
                });
            }
        );
    }
);

// ======================================================
// EXPENSE CHART
// ======================================================

app.get(
    "/finance/expenses/chart",
    authenticateToken,
    (
        req,
        res
    ) => {
        const year =
            Number(
                req.query.year
            ) ||
            new Date().getFullYear();

        if (
            !Number.isInteger(
                year
            ) ||
            year < 2000 ||
            year > 2100
        ) {
            return sendError(
                res,
                400,
                "Invalid year."
            );
        }

        db.query(
            `
            SELECT
                MONTH(date) AS month,
                COALESCE(
                    SUM(amount),
                    0
                ) AS total
            FROM finance_expenses
            WHERE YEAR(date) = ?
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
            `,
            [year],
            (
                err,
                results
            ) => {
                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch expense chart data.",
                        err
                    );
                }

                const months =
                    Array.from(
                        {
                            length: 12
                        },
                        (
                            _,
                            index
                        ) => ({
                            month:
                                index +
                                1,
                            total: 0
                        })
                    );

                results.forEach(
                    (row) => {
                        const month =
                            Number(
                                row.month
                            );

                        if (
                            month >=
                                1 &&
                            month <=
                                12
                        ) {
                            months[
                                month - 1
                            ].total =
                                Number(
                                    row.total
                                );
                        }
                    }
                );

                res.json({
                    success:
                        true,
                    year,
                    data:
                        months
                });
            }
        );
    }
);

// ======================================================
// SYSTEM DATE / TIME
// ======================================================

app.get(
    "/system/datetime",
    authenticateToken,
    (
        req,
        res
    ) => {
        const now =
            new Date();

        const pad =
            (number) =>
                String(
                    number
                ).padStart(
                    2,
                    "0"
                );

        res.json({
            success:
                true,
            datetime:
                now.toISOString(),
            date:
                now.getFullYear() +
                "-" +
                pad(
                    now.getMonth() +
                        1
                ) +
                "-" +
                pad(
                    now.getDate()
                ),
            time:
                pad(
                    now.getHours()
                ) +
                ":" +
                pad(
                    now.getMinutes()
                ) +
                ":" +
                pad(
                    now.getSeconds()
                )
        });
    }
);

// ======================================================
// DATABASE TABLES
// ======================================================

// USERS

db.query(
    `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL UNIQUE,
        phone VARCHAR(100) NULL,
        photo LONGTEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Users table error:",
                err
            );
        } else {
            console.log(
                "Users table ready."
            );

            db.query(
                `
                ALTER TABLE users
                ADD COLUMN photo LONGTEXT NULL
                `,
                (
                    alterErr
                ) => {
                    if (
                        alterErr &&
                        alterErr.code !==
                            "ER_DUP_FIELDNAME"
                    ) {
                        console.error(
                            "Users photo migration:",
                            alterErr.message
                        );
                    }
                }
            );
        }
    }
);

// CUSTOMERS

db.query(
    `
    CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        shop_name VARCHAR(255) NULL,
        shop_number VARCHAR(100) NULL,
        address TEXT NULL,
        contract_id VARCHAR(255) NULL,
        date_id VARCHAR(255) NULL,
        photo LONGTEXT NULL,
        created_by INT NULL,
        created_by_role VARCHAR(50) NULL,
        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Customers table error:",
                err
            );
        } else {
            console.log(
                "Customers table ready."
            );

            db.query(
                `
                ALTER TABLE customers
                ADD COLUMN photo LONGTEXT NULL
                `,
                (
                    alterErr
                ) => {
                    if (
                        alterErr &&
                        alterErr.code !==
                            "ER_DUP_FIELDNAME"
                    ) {
                        console.error(
                            "Customers photo migration:",
                            alterErr.message
                        );
                    }
                }
            );
        }
    }
);

// CONTRACTS

db.query(
    `
    CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,

        person_name VARCHAR(255) NOT NULL,

        line_number VARCHAR(100) NULL,

        shop_name VARCHAR(255) NULL,

        shop_number VARCHAR(100) NULL,

        shop_location TEXT NULL,

        province VARCHAR(255) NULL,

        tazkira_id VARCHAR(255) NULL,

        contract_start DATE NOT NULL,

        contract_end DATE NOT NULL,

        amount DECIMAL(15,2)
            NOT NULL DEFAULT 0,

        photo LONGTEXT NULL,
        created_by INT NULL,
        created_by_role VARCHAR(50) NULL,

        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Contracts table error:",
                err
            );
        } else {
            console.log(
                "Contracts table ready."
            );
        }
    }
);

// PAYMENTS

db.query(
    `
    CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        amount DECIMAL(15,2)
            NOT NULL DEFAULT 0,
        type VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        description TEXT NULL,
        created_by INT NULL,
        created_by_role VARCHAR(50) NULL,
        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Payments table error:",
                err
            );
        } else {
            console.log(
                "Payments table ready."
            );
        }
    }
);

// PROJECTS

db.query(
    `
    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        user_id VARCHAR(255) NULL,
        status VARCHAR(100) NULL,
        deadline DATE NULL,
        employee VARCHAR(255) NULL,
        testing VARCHAR(255) NULL,
        end_date DATE NULL,
        created_by INT NULL,
        created_by_role VARCHAR(50) NULL,
        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Projects table error:",
                err
            );
        } else {
            console.log(
                "Projects table ready."
            );
        }
    }
);

// FINANCE INCOME

db.query(
    `
    CREATE TABLE IF NOT EXISTS finance_income (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2)
            NOT NULL DEFAULT 0,
        date DATE NOT NULL,
        description TEXT NULL,
        created_by INT NULL,
        created_by_role VARCHAR(50) NULL,
        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Finance income table error:",
                err
            );
        } else {
            console.log(
                "Finance income table ready."
            );
        }
    }
);

// FINANCE EXPENSES

db.query(
    `
    CREATE TABLE IF NOT EXISTS finance_expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2)
            NOT NULL DEFAULT 0,
        category VARCHAR(255) NULL,
        date DATE NOT NULL,
        description TEXT NULL,
        created_by INT NULL,
        created_by_role VARCHAR(50) NULL,
        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Finance expenses table error:",
                err
            );
        } else {
            console.log(
                "Finance expenses table ready."
            );
        }
    }
);

// FINANCE DEBTS

db.query(
    `
    CREATE TABLE IF NOT EXISTS finance_debts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        amount DECIMAL(15,2)
            NOT NULL DEFAULT 0,
        paid_amount DECIMAL(15,2)
            NOT NULL DEFAULT 0,
        due_date DATE NULL,
        status VARCHAR(50)
            NOT NULL DEFAULT 'Pending',
        description TEXT NULL,
        created_by INT NULL,
        created_by_role VARCHAR(50) NULL,
        created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    `,
    (err) => {
        if (err) {
            console.error(
                "Finance debts table error:",
                err
            );
        } else {
            console.log(
                "Finance debts table ready."
            );
        }
    }
);

// ======================================================
// SERVE FRONTEND
// ======================================================

const frontendDist =
    path.join(
        __dirname,
        "../frontend/dist"
    );

app.use(
    express.static(
        frontendDist
    )
);

const API_PREFIXES = [
    "/api",
    "/login",
    "/register",
    "/users",
    "/employees",
    "/customers",
    "/attendance",
    "/contracts",
    "/payments",
    "/projects",
    "/finance",
    "/backup",
    "/system",
    "/health"
];

app.use(
    (
        req,
        res,
        next
    ) => {
        const isApiRequest =
            API_PREFIXES.some(
                (prefix) =>
                    req.path ===
                        prefix ||
                    req.path.startsWith(
                        prefix + "/"
                    )
            );

        if (
            req.method === "GET" &&
            !isApiRequest
        ) {
            const indexPath =
                path.join(
                    frontendDist,
                    "index.html"
                );

            if (
                fs.existsSync(
                    indexPath
                )
            ) {
                return res.sendFile(
                    indexPath
                );
            }
        }

        next();
    }
);

// ======================================================
// 404 NOT FOUND
// ======================================================

app.use(
    (
        req,
        res
    ) => {
        res.status(404).json({
            success:
                false,
            message:
                "Route not found."
        });
    }
);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {
        console.error(
            "GLOBAL ERROR:",
            err
        );

        res.status(500).json({
            success:
                false,
            message:
                "Internal server error.",
            error:
                err.message ||
                "Unknown error"
        });
    }
);

// ======================================================
// USERS ROLE COLUMN MIGRATION
// ======================================================

function ensureUserRoleColumn() {
    db.query(
        `ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user' AFTER email`,
        (err) => {
            if (err && err.code !== "ER_DUP_FIELDNAME") {
                console.error("Users role migration error:", err.message);
            } else if (!err) {
                console.log("Users role column created successfully.");
            }
        }
    );
}

ensureUserRoleColumn();

// ======================================================
// START SERVER
// ======================================================

const server = app.listen(
    PORT,
       "0.0.0.0",
    () => {
        console.log(`Office Management API is running on port ${PORT}.`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    }
);

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(
            `Port ${PORT} is already in use. Stop the other server or change PORT in .env.`
        );
    } else {
        console.error("Failed to start server:", error.message);
    }
    process.exitCode = 1;
});