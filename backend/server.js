const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

function sendError(res, status, message, error = null) {
    return res.status(status).json({
        success: false,
        message,
        ...(error ? { error: error.message } : {})
    });
}

function sendSuccess(res, message, data = null) {
    return res.status(200).json({
        success: true,
        message,
        ...(data !== null ? { data } : {})
    });
}

// ======================================================
// JWT AUTHENTICATION
// ======================================================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Token is required."
        });
    }

    jwt.verify(
        token,
        JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired token."
                });
            }

            req.user = user;

            next();
        }
    );
}

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Office Management API is running",
        version: "1.0.0",
        port: PORT,
        endpoints: {
            login: "POST /login",
            users: "/users",
            customers: "/customers",
            attendance: "/attendance",
            payments: "/payments",
            projects: "/projects"
        }
    });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/health", (req, res) => {

    db.query("SELECT 1 AS database_test", (err, results) => {

        if (err) {

            return res.status(500).json({
                success: false,
                server: "running",
                database: "disconnected",
                error: err.message
            });
        }

        res.json({
            success: true,
            server: "running",
            database: "connected",
            database_test: results[0].database_test
        });
    });
});

// ======================================================
// LOGIN
// ======================================================

app.post("/login", (req, res) => {

    const {
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

    if (isEmpty(username) && isEmpty(email)) {
        return sendError(
            res,
            400,
            "Username or email is required."
        );
    }

    const loginValue = normalize(
        !isEmpty(username)
            ? username
            : email
    );

    const sql = `
        SELECT
            id,
            name,
            username,
            password,
            email
        FROM users
        WHERE username = ?
           OR email = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [loginValue, loginValue],
        async (err, results) => {

            if (err) {
                return sendError(
                    res,
                    500,
                    "Database error.",
                    err
                );
            }

            if (results.length === 0) {
                return sendError(
                    res,
                    401,
                    "Invalid username/email or password."
                );
            }

            const user = results[0];

            try {

                let passwordMatch = false;

                // ==================================================
                // BCRYPT PASSWORD
                // ==================================================

                if (
                    typeof user.password === "string" &&
                    user.password.startsWith("$2")
                ) {

                    passwordMatch =
                        await bcrypt.compare(
                            password,
                            user.password
                        );

                } else {

                    // ==================================================
                    // OLD / LEGACY PASSWORD
                    // ==================================================

                    passwordMatch =
                        password === user.password;

                    // Convert old password to bcrypt

                    if (passwordMatch) {

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

                if (!passwordMatch) {
                    return sendError(
                        res,
                        401,
                        "Invalid username/email or password."
                    );
                }

                // ==================================================
                // CREATE JWT TOKEN
                // ==================================================

                if (!JWT_SECRET) {

                    return sendError(
                        res,
                        500,
                        "JWT_SECRET is not configured."
                    );
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "2h"
                    }
                );

                return res.json({
                    success: true,
                    message: "Login successful.",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });

            } catch (error) {

                return sendError(
                    res,
                    500,
                    "Login error.",
                    error
                );
            }
        }
    );
});

// ======================================================
// USERS
// ======================================================

// ======================================================
// GET ALL USERS
// ======================================================

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
                email
            FROM users
            ORDER BY id DESC
            `,
            (err, results) => {

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

// ======================================================
// GET SINGLE USER
// ======================================================

app.get(
    "/users/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
                email
            FROM users
            WHERE id = ?
            `,
            [id],
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch user.",
                        err
                    );
                }

                if (results.length === 0) {
                    return sendError(
                        res,
                        404,
                        "User not found."
                    );
                }

                res.json(results[0]);
            }
        );
    }
);

// ======================================================
// CREATE USER
// ======================================================

app.post(
    "/users",
    authenticateToken,
    async (req, res) => {

        const {
            name,
            username,
            password,
            email
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
                    email
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    normalize(name),
                    normalize(username),
                    hashedPassword,
                    normalize(email)
                ],
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
                            "Failed to create user.",
                            err
                        );
                    }

                    res.status(201).json({
                        success: true,
                        message: "User created successfully.",
                        id: result.insertId
                    });
                }
            );

        } catch (error) {

            return sendError(
                res,
                500,
                "Password hashing failed.",
                error
            );
        }
    }
);

// ======================================================
// UPDATE USER
// ======================================================

app.put(
    "/users/:id",
    authenticateToken,
    async (req, res) => {

        const { id } = req.params;

        const {
            name,
            username,
            password,
            email
        } = req.body;

        if (!isValidId(id)) {
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

        try {

            let hashedPassword = null;

            if (!isEmpty(password)) {

                hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );
            }

            if (hashedPassword) {

                db.query(
                    `
                    UPDATE users
                    SET
                        name = ?,
                        username = ?,
                        password = ?,
                        email = ?
                    WHERE id = ?
                    `,
                    [
                        normalize(name),
                        normalize(username),
                        hashedPassword,
                        normalize(email),
                        id
                    ],
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
                                "Failed to update user.",
                                err
                            );
                        }

                        if (result.affectedRows === 0) {
                            return sendError(
                                res,
                                404,
                                "User not found."
                            );
                        }

                        res.json({
                            success: true,
                            message: "User updated successfully."
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
                        email = ?
                    WHERE id = ?
                    `,
                    [
                        normalize(name),
                        normalize(username),
                        normalize(email),
                        id
                    ],
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
                                "Failed to update user.",
                                err
                            );
                        }

                        if (result.affectedRows === 0) {
                            return sendError(
                                res,
                                404,
                                "User not found."
                            );
                        }

                        res.json({
                            success: true,
                            message: "User updated successfully."
                        });
                    }
                );
            }

        } catch (error) {

            return sendError(
                res,
                500,
                "Password hashing failed.",
                error
            );
        }
    }
);

// ======================================================
// DELETE USER
// ======================================================

app.delete(
    "/users/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete user.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "User not found."
                    );
                }

                res.json({
                    success: true,
                    message: "User deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// CUSTOMERS
// ======================================================

// ======================================================
// GET ALL CUSTOMERS
// ======================================================

app.get(
    "/customers",
    authenticateToken,
    (req, res) => {

        db.query(
            `
            SELECT *
            FROM customers
            ORDER BY id DESC
            `,
            (err, results) => {

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

// ======================================================
// GET SINGLE CUSTOMER
// ======================================================

app.get(
    "/customers/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch customer.",
                        err
                    );
                }

                if (results.length === 0) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                res.json(results[0]);
            }
        );
    }
);

// ======================================================
// CREATE CUSTOMER
// ======================================================

app.post(
    "/customers",
    authenticateToken,
    (req, res) => {

        const {
            name,
            phone,
            shop_name,
            shop_number,
            address,
            contract_id,
            date_id
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
                date_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(name),
                normalize(phone),
                normalize(shop_name),
                normalize(shop_number),
                normalize(address),
                normalize(contract_id),
                normalize(date_id)
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create customer.",
                        err
                    );
                }

                res.status(201).json({
                    success: true,
                    message: "Customer created successfully.",
                    id: result.insertId
                });
            }
        );
    }
);

// ======================================================
// UPDATE CUSTOMER
// ======================================================

app.put(
    "/customers/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        const {
            name,
            phone,
            shop_name,
            shop_number,
            address,
            contract_id,
            date_id
        } = req.body;

        if (!isValidId(id)) {
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
                date_id = ?
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
                id
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update customer.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Customer updated successfully."
                });
            }
        );
    }
);

// ======================================================
// DELETE CUSTOMER
// ======================================================

app.delete(
    "/customers/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete customer.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Customer not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Customer deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// ATTENDANCE
// ======================================================

// ======================================================
// GET ALL ATTENDANCE
// ======================================================

app.get(
    "/attendance",
    authenticateToken,
    (req, res) => {

        db.query(
            `
            SELECT *
            FROM attendance
            ORDER BY id DESC
            `,
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch attendance.",
                        err
                    );
                }

                res.json(results);
            }
        );
    }
);

// ======================================================
// GET SINGLE ATTENDANCE
// ======================================================

app.get(
    "/attendance/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid attendance ID."
            );
        }

        db.query(
            `
            SELECT *
            FROM attendance
            WHERE id = ?
            `,
            [id],
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch attendance.",
                        err
                    );
                }

                if (results.length === 0) {
                    return sendError(
                        res,
                        404,
                        "Attendance record not found."
                    );
                }

                res.json(results[0]);
            }
        );
    }
);

// ======================================================
// CREATE ATTENDANCE
// ======================================================

app.post(
    "/attendance",
    authenticateToken,
    (req, res) => {

        const {
            user_id,
            date,
            check_in,
            check_out,
            status
        } = req.body;

        if (
            isEmpty(user_id) ||
            isEmpty(date)
        ) {
            return sendError(
                res,
                400,
                "user_id and date are required."
            );
        }

        db.query(
            `
            INSERT INTO attendance
            (
                user_id,
                date,
                check_in,
                check_out,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                user_id,
                date,
                normalize(check_in),
                normalize(check_out),
                normalize(status)
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create attendance.",
                        err
                    );
                }

                res.status(201).json({
                    success: true,
                    message: "Attendance created successfully.",
                    id: result.insertId
                });
            }
        );
    }
);

// ======================================================
// UPDATE ATTENDANCE
// ======================================================

app.put(
    "/attendance/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        const {
            user_id,
            date,
            check_in,
            check_out,
            status
        } = req.body;

        if (!isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid attendance ID."
            );
        }

        db.query(
            `
            UPDATE attendance
            SET
                user_id = ?,
                date = ?,
                check_in = ?,
                check_out = ?,
                status = ?
            WHERE id = ?
            `,
            [
                user_id,
                date,
                normalize(check_in),
                normalize(check_out),
                normalize(status),
                id
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update attendance.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Attendance record not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Attendance updated successfully."
                });
            }
        );
    }
);

// ======================================================
// DELETE ATTENDANCE
// ======================================================

app.delete(
    "/attendance/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid attendance ID."
            );
        }

        db.query(
            `
            DELETE FROM attendance
            WHERE id = ?
            `,
            [id],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete attendance.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Attendance record not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Attendance deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// PAYMENTS
// ======================================================

// ======================================================
// GET ALL PAYMENTS
// ======================================================

app.get(
    "/payments",
    authenticateToken,
    (req, res) => {

        db.query(
            `
            SELECT *
            FROM payments
            ORDER BY id DESC
            `,
            (err, results) => {

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

// ======================================================
// GET SINGLE PAYMENT
// ======================================================

app.get(
    "/payments/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch payment.",
                        err
                    );
                }

                if (results.length === 0) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                res.json(results[0]);
            }
        );
    }
);

// ======================================================
// CREATE PAYMENT
// ======================================================

app.post(
    "/payments",
    authenticateToken,
    (req, res) => {

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
                description
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                customer_id,
                amount,
                normalize(type),
                date,
                normalize(description)
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create payment.",
                        err
                    );
                }

                res.status(201).json({
                    success: true,
                    message: "Payment created successfully.",
                    id: result.insertId
                });
            }
        );
    }
);

// ======================================================
// UPDATE PAYMENT
// ======================================================

app.put(
    "/payments/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        const {
            customer_id,
            amount,
            type,
            date,
            description
        } = req.body;

        if (!isValidId(id)) {
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
                normalize(description),
                id
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update payment.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Payment updated successfully."
                });
            }
        );
    }
);

// ======================================================
// DELETE PAYMENT
// ======================================================

app.delete(
    "/payments/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete payment.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Payment deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// PROJECTS
// ======================================================

// ======================================================
// GET ALL PROJECTS
// ======================================================

app.get(
    "/projects",
    authenticateToken,
    (req, res) => {

        db.query(
            `
            SELECT *
            FROM projects
            ORDER BY id DESC
            `,
            (err, results) => {

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

// ======================================================
// GET SINGLE PROJECT
// ======================================================

app.get(
    "/projects/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch project.",
                        err
                    );
                }

                if (results.length === 0) {
                    return sendError(
                        res,
                        404,
                        "Project not found."
                    );
                }

                res.json(results[0]);
            }
        );
    }
);

// ======================================================
// CREATE PROJECT
// ======================================================

app.post(
    "/projects",
    authenticateToken,
    (req, res) => {

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

        if (isEmpty(title)) {
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
                end_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalize(title),
                normalize(description),
                normalize(user_id),
                normalize(status),
                normalize(deadline),
                normalize(employee),
                normalize(testing),
                normalize(end_date)
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create project.",
                        err
                    );
                }

                res.status(201).json({
                    success: true,
                    message: "Project created successfully.",
                    id: result.insertId
                });
            }
        );
    }
);

// ======================================================
// UPDATE PROJECT
// ======================================================

app.put(
    "/projects/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

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

        if (!isValidId(id)) {
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
                normalize(description),
                normalize(user_id),
                normalize(status),
                normalize(deadline),
                normalize(employee),
                normalize(testing),
                normalize(end_date),
                id
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update project.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Project not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Project updated successfully."
                });
            }
        );
    }
);

// ======================================================
// DELETE PROJECT
// ======================================================

app.delete(
    "/projects/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete project.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Project not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Project deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// 404 NOT FOUND
// ======================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

    console.error("GLOBAL ERROR:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error.",
        error: err.message || "Unknown error"
    });
});

// ======================================================
// FINANCE - INCOME
// ======================================================

app.get(
    "/finance/income",
    authenticateToken,
    (req, res) => {

        db.query(
            `
            SELECT *
            FROM finance_income
            ORDER BY id DESC
            `,
            (err, results) => {

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
    (req, res) => {

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
            !Number.isFinite(Number(amount)) ||
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
                description
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                normalize(source),
                Number(amount),
                date,
                normalize(description)
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create income.",
                        err
                    );
                }

                res.status(201).json({
                    success: true,
                    message: "Income created successfully.",
                    id: result.insertId
                });
            }
        );
    }
);

app.put(
    "/finance/income/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        const {
            source,
            amount,
            date,
            description
        } = req.body;

        if (!isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid income ID."
            );
        }

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
                normalize(description),
                id
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update income.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Income not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Income updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/finance/income/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete income.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Income not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Income deleted successfully."
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
    (req, res) => {

        db.query(
            `
            SELECT *
            FROM finance_expenses
            ORDER BY id DESC
            `,
            (err, results) => {

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
    (req, res) => {

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
            !Number.isFinite(Number(amount)) ||
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
                description
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                normalize(title),
                Number(amount),
                normalize(category),
                date,
                normalize(description)
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create expense.",
                        err
                    );
                }

                res.status(201).json({
                    success: true,
                    message: "Expense created successfully.",
                    id: result.insertId
                });
            }
        );
    }
);

app.put(
    "/finance/expenses/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        const {
            title,
            amount,
            category,
            date,
            description
        } = req.body;

        if (!isValidId(id)) {
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
                normalize(category),
                date,
                normalize(description),
                id
            ],
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to update expense.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Expense not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Expense updated successfully."
                });
            }
        );
    }
);

app.delete(
    "/finance/expenses/:id",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete expense.",
                        err
                    );
                }

                if (result.affectedRows === 0) {
                    return sendError(
                        res,
                        404,
                        "Expense not found."
                    );
                }

                res.json({
                    success: true,
                    message: "Expense deleted successfully."
                });
            }
        );
    }
);


// ======================================================
// FINANCE - DEBTS / UNPAID MONEY
// ======================================================

app.get(
    "/finance/debts",
    authenticateToken,
    (req, res) => {

        db.query(
            `
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
            `,
            (err, results) => {

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
    (req, res) => {

        const {
            customer_id,
            amount,
            paid_amount,
            due_date,
            status,
            description
        } = req.body;

        if (
            isEmpty(customer_id) ||
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
            isEmpty(paid_amount)
                ? 0
                : Number(paid_amount);

        if (
            !Number.isFinite(totalAmount) ||
            totalAmount < 0
        ) {
            return sendError(
                res,
                400,
                "Invalid amount."
            );
        }

        if (
            !Number.isFinite(paidAmount) ||
            paidAmount < 0 ||
            paidAmount > totalAmount
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
            (customerErr, customers) => {

                if (customerErr) {
                    return sendError(
                        res,
                        500,
                        "Failed to check customer.",
                        customerErr
                    );
                }

                if (customers.length === 0) {
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
                        description
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        customer_id,
                        totalAmount,
                        paidAmount,
                        normalize(due_date),
                        normalize(status) || "Pending",
                        normalize(description)
                    ],
                    (err, result) => {

                        if (err) {
                            return sendError(
                                res,
                                500,
                                "Failed to create debt.",
                                err
                            );
                        }

                        res.status(201).json({
                            success: true,
                            message: "Debt created successfully.",
                            id: result.insertId
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
    (req, res) => {

        const { id } = req.params;

        const {
            customer_id,
            amount,
            paid_amount,
            due_date,
            status,
            description
        } = req.body;

        if (!isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid debt ID."
            );
        }

        if (
            isEmpty(customer_id) ||
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
            isEmpty(paid_amount)
                ? 0
                : Number(paid_amount);

        if (
            !Number.isFinite(totalAmount) ||
            totalAmount < 0
        ) {
            return sendError(
                res,
                400,
                "Invalid amount."
            );
        }

        if (
            !Number.isFinite(paidAmount) ||
            paidAmount < 0 ||
            paidAmount > totalAmount
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
            (customerErr, customers) => {

                if (customerErr) {
                    return sendError(
                        res,
                        500,
                        "Failed to check customer.",
                        customerErr
                    );
                }

                if (customers.length === 0) {
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
                        normalize(due_date),
                        normalize(status) || "Pending",
                        normalize(description),
                        id
                    ],
                    (err, result) => {

                        if (err) {
                            return sendError(
                                res,
                                500,
                                "Failed to update debt.",
                                err
                            );
                        }

                        if (
                            result.affectedRows === 0
                        ) {
                            return sendError(
                                res,
                                404,
                                "Debt not found."
                            );
                        }

                        res.json({
                            success: true,
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
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to delete debt.",
                        err
                    );
                }

                if (
                    result.affectedRows === 0
                ) {
                    return sendError(
                        res,
                        404,
                        "Debt not found."
                    );
                }

                res.json({
                    success: true,
                    message:
                        "Debt deleted successfully."
                });
            }
        );
    }
);

// ======================================================
// FINANCE TABLES
// ======================================================

// ------------------------------------------------------
// FINANCE INCOME TABLE
// ------------------------------------------------------

db.query(`
    CREATE TABLE IF NOT EXISTS finance_income (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        date DATE NOT NULL,
        description TEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`, (err) => {

    if (err) {
        console.error("Finance income table error:", err);
    } else {
        console.log("Finance income table ready.");
    }

});


// ------------------------------------------------------
// FINANCE EXPENSES TABLE
// ------------------------------------------------------

db.query(`
    CREATE TABLE IF NOT EXISTS finance_expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        category VARCHAR(255) NULL,
        date DATE NOT NULL,
        description TEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`, (err) => {

    if (err) {
        console.error("Finance expenses table error:", err);
    } else {
        console.log("Finance expenses table ready.");
    }

});


// ------------------------------------------------------
// FINANCE DEBTS TABLE
// ------------------------------------------------------

db.query(`
    CREATE TABLE IF NOT EXISTS finance_debts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        due_date DATE NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        description TEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`, (err) => {

    if (err) {
        console.error("Finance debts table error:", err);
    } else {
        console.log("Finance debts table ready.");
    }

});
// ======================================================
// EXTRA FEATURES
// ======================================================

// 1. تاریخ و ساعت فعلی سرور
app.get("/system/datetime", authenticateToken, (req, res) => {
    const now = new Date();

    const pad = (number) => String(number).padStart(2, "0");

    res.json({
        success: true,
        datetime: now.toISOString(),
        date:
            now.getFullYear() +
            "-" +
            pad(now.getMonth() + 1) +
            "-" +
            pad(now.getDate()),
        time:
            pad(now.getHours()) +
            ":" +
            pad(now.getMinutes()) +
            ":" +
            pad(now.getSeconds())
    });
});


// ======================================================
// 2. نمودار مصارف
// ======================================================

app.get(
    "/finance/expenses/chart",
    authenticateToken,
    (req, res) => {

        const year =
            Number(req.query.year) ||
            new Date().getFullYear();

        if (
            !Number.isInteger(year) ||
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
                COALESCE(SUM(amount), 0) AS total
            FROM finance_expenses
            WHERE YEAR(date) = ?
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
            `,
            [year],
            (err, results) => {

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
                        { length: 12 },
                        (_, index) => ({
                            month: index + 1,
                            total: 0
                        })
                    );

                results.forEach((row) => {

                    const month =
                        Number(row.month);

                    if (
                        month >= 1 &&
                        month <= 12
                    ) {
                        months[month - 1].total =
                            Number(row.total);
                    }
                });

                res.json({
                    success: true,
                    year: year,
                    data: months
                });
            }
        );
    }
);


// ======================================================
// 3. رسید پرداخت
// ======================================================

app.get(
    "/payments/:id/receipt",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        if (!isValidId(id)) {
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
                ON c.id = p.customer_id

            WHERE p.id = ?

            LIMIT 1
            `,
            [id],
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to create payment receipt.",
                        err
                    );
                }

                if (results.length === 0) {
                    return sendError(
                        res,
                        404,
                        "Payment not found."
                    );
                }

                const payment =
                    results[0];

                res.json({
                    success: true,

                    receipt: {

                        receipt_number:
                            "PAY-" +
                            String(payment.id)
                                .padStart(6, "0"),

                        payment_id:
                            payment.id,

                        customer_id:
                            payment.customer_id,

                        customer_name:
                            payment.customer_name || "",

                        customer_phone:
                            payment.customer_phone || "",

                        shop_name:
                            payment.shop_name || "",

                        shop_number:
                            payment.shop_number || "",

                        amount:
                            Number(payment.amount),

                        type:
                            payment.type || "",

                        date:
                            payment.date,

                        description:
                            payment.description || "",

                        issued_at:
                            new Date().toISOString()
                    }
                });
            }
        );
    }
);


// ======================================================
// 4. پرداخت قسمتی از بدهی
// ======================================================

app.post(
    "/finance/debts/:id/pay",
    authenticateToken,
    (req, res) => {

        const { id } = req.params;

        const paymentAmount =
            Number(req.body.amount);

        if (!isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid debt ID."
            );
        }

        if (
            !Number.isFinite(paymentAmount) ||
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
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch debt.",
                        err
                    );
                }

                if (results.length === 0) {
                    return sendError(
                        res,
                        404,
                        "Debt not found."
                    );
                }

                const debt =
                    results[0];

                const total =
                    Number(debt.amount);

                const paid =
                    Number(debt.paid_amount);

                const remaining =
                    Math.max(
                        total - paid,
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
                    paid + paymentAmount;

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
                    (updateErr) => {

                        if (updateErr) {
                            return sendError(
                                res,
                                500,
                                "Failed to record debt payment.",
                                updateErr
                            );
                        }

                        res.json({
                            success: true,

                            message:
                                "Debt payment recorded successfully.",

                            debt_id:
                                Number(id),

                            paid_amount:
                                newPaid,

                            remaining_amount:
                                Math.max(
                                    total - newPaid,
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
// 5. خلاصه مالی Dashboard
// ======================================================

app.get(
    "/finance/summary",
    authenticateToken,
    (req, res) => {

        const sql = `
            SELECT

                (
                    SELECT
                        COALESCE(SUM(amount), 0)
                    FROM finance_income
                ) AS income,

                (
                    SELECT
                        COALESCE(SUM(amount), 0)
                    FROM finance_expenses
                ) AS expenses,

                (
                    SELECT
                        COALESCE(
                            SUM(
                                GREATEST(
                                    amount - paid_amount,
                                    0
                                )
                            ),
                            0
                        )
                    FROM finance_debts
                ) AS receivables,

                (
                    SELECT
                        COALESCE(SUM(amount), 0)
                    FROM payments
                    WHERE type = 'Paid'
                ) AS paid_payments
        `;

        db.query(
            sql,
            (err, results) => {

                if (err) {
                    return sendError(
                        res,
                        500,
                        "Failed to fetch finance summary.",
                        err
                    );
                }

                const row =
                    results[0] || {};

                const income =
                    Number(row.income || 0);

                const expenses =
                    Number(row.expenses || 0);

                const receivables =
                    Number(
                        row.receivables || 0
                    );

                const paidPayments =
                    Number(
                        row.paid_payments || 0
                    );

                res.json({

                    success: true,

                    data: {

                        income:
                            income,

                        expenses:
                            expenses,

                        receivables:
                            receivables,

                        paid_payments:
                            paidPayments,

                        balance:
                            income - expenses
                    }
                });
            }
        );
    }
);
// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});