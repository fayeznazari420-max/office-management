const db = require("./db");

const OWNER_TABLES = [
    "customers",
    "employees",
    "attendance",
    "contracts",
    "payments",
    "projects",
    "finance_income",
    "finance_expenses",
    "finance_debts"
];

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, result) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(result);
        });
    });
}

async function ensureColumn(table, column, definition) {
    const rows = await query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
          AND column_name = ?
        `,
        [table, column]
    );

    if (rows.length === 0) {
        await query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`Added ${table}.${column}.`);
    }
}

async function migrate() {
    for (const table of ["users", ...OWNER_TABLES]) {
        const rows = await query(
            `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = ?
            `,
            [table]
        );

        if (rows.length === 0) {
            throw new Error(
                `Required table '${table}' is missing. Start the server once to create existing tables, then rerun this migration.`
            );
        }

        if (table === "users") {
            await ensureColumn(table, "phone", "VARCHAR(100) NULL");
            await ensureColumn(table, "role", "VARCHAR(50) NULL");
            await ensureColumn(table, "is_active", "TINYINT(1) NOT NULL DEFAULT 1");
        } else {
            await ensureColumn(table, "created_by", "INT NULL");
            await ensureColumn(table, "created_by_role", "VARCHAR(50) NULL");
        }
    }

    await query(`
        CREATE TABLE IF NOT EXISTS instructions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            created_by INT NULL,
            created_by_role VARCHAR(50) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
    `);

    console.log(
        "RBAC migration completed. Existing creator IDs remain NULL; existing records and users were preserved."
    );
}

migrate()
    .catch((error) => {
        console.error("RBAC migration failed:", error.message);
        process.exitCode = 1;
    })
    .finally(() => {
        db.end();
    });
