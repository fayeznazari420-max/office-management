const INTEGER_TYPE = /^(tinyint|smallint|mediumint|int|integer|bigint)(?:\(\d+\))?( unsigned)?$/i;

const REQUIRED_ATTENDANCE_COLUMNS = [
    "id",
    "employee_id",
    "user_id",
    "date",
    "check_in",
    "check_out",
    "status",
    "created_by",
    "created_by_role",
    "created_at"
];

const TABLE_DEFINITIONS = {
    attendance_settings: {
        engine: "InnoDB",
        columns: {
            id: ["tinyint unsigned", "NO"],
            office_open: ["time", "YES"],
            office_close: ["time", "YES"],
            grace_period_minutes: ["smallint unsigned", "NO"],
            work_days: ["json", "YES"],
            shifts: ["json", "YES"],
            holidays: ["json", "YES"],
            updated_by: ["int", "YES"],
            updated_at: ["timestamp", "NO"]
        },
        primaryKey: ["id"]
    },
    attendance_audit: {
        engine: "InnoDB",
        columns: {
            id: ["bigint unsigned", "NO"],
            attendance_id: ["int", "YES"],
            action: ["varchar(32)", "NO"],
            actor_id: ["int", "NO"],
            actor_role: ["varchar(50)", "NO"],
            before_data: ["json", "YES"],
            after_data: ["json", "YES"],
            created_at: ["timestamp", "NO"]
        },
        primaryKey: ["id"],
        indexes: {
            idx_attendance_audit_record_created: ["attendance_id", "created_at"],
            idx_attendance_audit_actor_created: ["actor_id", "created_at"]
        }
    }
};

function query(pool, sql, params = []) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}

function normalizeInformationSchemaRows(rows) {
    return rows.map((row) => Object.fromEntries(
        Object.entries(row).map(([field, value]) => [field.toLowerCase(), value])
    ));
}

function normalizeType(type) {
    return String(type || "")
        .toLowerCase()
        .trim()
        .replace(/^(tinyint|smallint|mediumint|int|integer|bigint)\(\d+\)/, "$1")
        .replace(/\s+/g, " ");
}

function assertIntegerType(type, label) {
    if (!INTEGER_TYPE.test(String(type || ""))) {
        throw new Error(`${label} must use a supported integer type; found ${type || "missing"}.`);
    }
}

function compatibleIntegerTypes(left, right) {
    const normalize = (type) => normalizeType(type).replace(/\s+/g, " ").trim();
    return normalize(left) === normalize(right);
}

function validateTableDefinition(tableName, table, columns, indexes = []) {
    const expected = TABLE_DEFINITIONS[tableName];
    if (!expected) throw new Error(`No attendance schema definition is available for ${tableName}.`);
    if (!table || String(table.engine || "").toLowerCase() !== expected.engine.toLowerCase()) {
        throw new Error(`${tableName} must use ${expected.engine}; stop and review the existing table.`);
    }

    const byName = new Map(columns.map((column) => [column.column_name, column]));
    for (const [name, [type, nullable]] of Object.entries(expected.columns)) {
        const column = byName.get(name);
        if (!column ||
            normalizeType(column.column_type || column.data_type) !== normalizeType(type) ||
            String(column.is_nullable).toUpperCase() !== nullable) {
            throw new Error(`${tableName}.${name} has an incompatible or missing definition.`);
        }
    }

    const primary = indexes
        .filter((index) => index.index_name === "PRIMARY")
        .sort((left, right) => Number(left.seq_in_index) - Number(right.seq_in_index))
        .map((index) => index.column_name);
    if (JSON.stringify(primary) !== JSON.stringify(expected.primaryKey)) {
        throw new Error(`${tableName} has an incompatible primary key.`);
    }

    for (const [name, expectedColumns] of Object.entries(expected.indexes || {})) {
        const actual = indexes
            .filter((index) => index.index_name === name)
            .sort((left, right) => Number(left.seq_in_index) - Number(right.seq_in_index));
        if (actual.length !== expectedColumns.length ||
            actual.some((index, offset) =>
                index.column_name !== expectedColumns[offset] ||
                Number(index.non_unique) !== 1
            )) {
            throw new Error(`${tableName}.${name} has an incompatible or missing index.`);
        }
    }
}

async function getTable(pool, tableName) {
    const rows = await query(pool,
        `SELECT TABLE_NAME AS table_name, ENGINE AS engine
         FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [tableName]
    );
    return normalizeInformationSchemaRows(rows)[0] || null;
}

async function getColumns(pool, tableName) {
    const rows = await query(pool,
        `SELECT COLUMN_NAME AS column_name, DATA_TYPE AS data_type,
                COLUMN_TYPE AS column_type, IS_NULLABLE AS is_nullable,
                COLUMN_DEFAULT AS column_default, EXTRA AS extra
         FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [tableName]
    );
    return normalizeInformationSchemaRows(rows);
}

async function getIndexes(pool, tableName) {
    const rows = await query(pool,
        `SELECT INDEX_NAME AS index_name, SEQ_IN_INDEX AS seq_in_index,
                COLUMN_NAME AS column_name, NON_UNIQUE AS non_unique
         FROM information_schema.statistics
         WHERE table_schema = DATABASE() AND table_name = ?
         ORDER BY index_name, seq_in_index`,
        [tableName]
    );
    return normalizeInformationSchemaRows(rows);
}

async function inspectExistingAuxiliaryTable(pool, name) {
    const table = await getTable(pool, name);
    if (!table) return false;
    validateTableDefinition(
        name,
        table,
        await getColumns(pool, name),
        await getIndexes(pool, name)
    );
    return true;
}

async function preflightAttendance(pool) {
    const employeesTable = await getTable(pool, "employees");
    if (!employeesTable) throw new Error("The employees table is missing; prepare the core schema first.");
    if (String(employeesTable.engine || "").toLowerCase() !== "innodb") {
        throw new Error("The employees table must use InnoDB before attendance migration.");
    }
    const employeeColumns = await getColumns(pool, "employees");
    const employeeId = employeeColumns.find((column) => column.column_name === "id");
    if (!employeeId) throw new Error("The employees.id column is missing.");
    assertIntegerType(employeeId.column_type, "employees.id");

    const attendanceTable = await getTable(pool, "attendance");
    if (attendanceTable &&
        String(attendanceTable.engine || "").toLowerCase() !== "innodb") {
        throw new Error("The attendance table must use InnoDB before attendance migration.");
    }

    let attendanceColumns = [];
    let attendanceIndexes = [];
    let employeeIdColumn = null;
    let notesColumn = null;
    let uniqueIndexRows = [];
    if (attendanceTable) {
        attendanceColumns = await getColumns(pool, "attendance");
        const byName = new Map(attendanceColumns.map((column) => [column.column_name, column]));
        for (const name of REQUIRED_ATTENDANCE_COLUMNS) {
            if (!byName.has(name)) throw new Error(`The attendance.${name} column is missing.`);
        }
        employeeIdColumn = byName.get("employee_id");
        assertIntegerType(employeeIdColumn.column_type, "attendance.employee_id");
        if (!compatibleIntegerTypes(employeeIdColumn.column_type, employeeId.column_type)) {
            throw new Error("attendance.employee_id and employees.id integer type/signedness are incompatible.");
        }
        if (String(byName.get("date").data_type).toLowerCase() !== "date") {
            throw new Error("attendance.date must be a DATE column before migration.");
        }
        notesColumn = byName.get("notes") || null;
        if (notesColumn && !["text", "mediumtext", "longtext"].includes(
            String(notesColumn.data_type).toLowerCase()
        )) {
            throw new Error("attendance.notes exists with an incompatible type.");
        }

        attendanceIndexes = await getIndexes(pool, "attendance");
        uniqueIndexRows = attendanceIndexes.filter(
            (index) => index.index_name === "uq_attendance_employee_date"
        );
        if (uniqueIndexRows.length) {
            const ordered = [...uniqueIndexRows].sort(
                (left, right) => Number(left.seq_in_index) - Number(right.seq_in_index)
            );
            if (ordered.length !== 2 ||
                ordered[0].column_name !== "employee_id" ||
                ordered[1].column_name !== "date" ||
                ordered.some((index) => Number(index.non_unique) !== 0)) {
                throw new Error("uq_attendance_employee_date exists with an incompatible definition.");
            }
        }

        const counts = (await query(pool, `
            SELECT
                SUM(employee_id IS NULL) AS null_employee_ids,
                SUM(date IS NULL OR YEAR(date) = 0 OR MONTH(date) = 0 OR DAY(date) = 0) AS invalid_dates,
                SUM(employee_id IS NOT NULL AND NOT EXISTS (
                    SELECT 1 FROM employees e WHERE e.id = attendance.employee_id
                )) AS orphan_employee_ids
            FROM attendance
        `))[0] || {};
        const duplicates = (await query(pool, `
            SELECT COUNT(*) AS duplicate_groups
            FROM (
                SELECT employee_id, date
                FROM attendance
                GROUP BY employee_id, date
                HAVING COUNT(*) > 1
            ) duplicate_attendance
        `))[0] || {};
        const nullEmployeeIds = Number(counts.null_employee_ids || 0);
        const invalidDates = Number(counts.invalid_dates || 0);
        const orphanIds = Number(counts.orphan_employee_ids || 0);
        const duplicateGroups = Number(duplicates.duplicate_groups || 0);
        if (nullEmployeeIds || invalidDates || orphanIds || duplicateGroups) {
            throw new Error(
                `Attendance preflight stopped: NULL employee IDs=${nullEmployeeIds}, ` +
                `invalid/zero dates=${invalidDates}, orphan employees=${orphanIds}, ` +
                `duplicate employee/date groups=${duplicateGroups}. No schema changes were made.`
            );
        }
    }

    const settingsExists = await inspectExistingAuxiliaryTable(pool, "attendance_settings");
    const auditExists = await inspectExistingAuxiliaryTable(pool, "attendance_audit");

    return {
        employeeIdType: employeeId.column_type,
        attendanceExists: Boolean(attendanceTable),
        attendanceEmployeeNullable: employeeIdColumn?.is_nullable === "YES",
        notesExists: Boolean(notesColumn),
        attendanceIndexes,
        settingsExists,
        auditExists
    };
}

async function verifyAttendanceUniqueIndex(pool) {
    const rows = await getIndexes(pool, "attendance");
    const index = rows.filter((item) => item.index_name === "uq_attendance_employee_date")
        .sort((left, right) => Number(left.seq_in_index) - Number(right.seq_in_index));
    if (index.length !== 2 ||
        index[0].column_name !== "employee_id" ||
        index[1].column_name !== "date" ||
        index.some((item) => Number(item.non_unique) !== 0)) {
        throw new Error("Attendance unique index verification failed.");
    }
}

async function inspectAttendanceReadiness(pool) {
    const plan = await preflightAttendance(pool);
    const settingsDefault = plan.settingsExists
        ? await query(pool,
            "SELECT id FROM attendance_settings WHERE id = 1 LIMIT 1"
        )
        : [];
    const uniqueIndexExists = plan.attendanceIndexes.some(
        (index) => index.index_name === "uq_attendance_employee_date"
    );
    const missing = [];
    if (!plan.attendanceExists) missing.push("attendance table");
    if (plan.attendanceEmployeeNullable) missing.push("NOT NULL employee_id");
    if (!plan.notesExists) missing.push("attendance.notes");
    if (!uniqueIndexExists) missing.push("unique employee/date index");
    if (!plan.settingsExists) missing.push("attendance_settings table");
    else if (!settingsDefault.length) missing.push("default attendance settings row");
    if (!plan.auditExists) missing.push("attendance_audit table");
    return {
        ready: missing.length === 0,
        message: missing.length ? `Missing: ${missing.join(", ")}.` : ""
    };
}

async function runAttendanceMigration(pool) {
    const plan = await preflightAttendance(pool);
    if (!plan.attendanceExists) {
        await query(pool, `
            CREATE TABLE attendance (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                employee_id ${plan.employeeIdType} NOT NULL,
                user_id INT NULL,
                date DATE NOT NULL,
                check_in VARCHAR(50) NULL,
                check_out VARCHAR(50) NULL,
                status VARCHAR(100) NULL,
                notes TEXT NULL,
                created_by INT NULL,
                created_by_role VARCHAR(50) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_attendance_employee_date (employee_id, date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } else {
        if (!plan.notesExists) {
            await query(pool, "ALTER TABLE attendance ADD COLUMN notes TEXT NULL");
        }
        if (plan.attendanceEmployeeNullable) {
            await query(pool,
                `ALTER TABLE attendance MODIFY COLUMN employee_id ${plan.employeeIdType} NOT NULL`
            );
        }
        const uniqueIndexExists = plan.attendanceIndexes.some(
            (index) => index.index_name === "uq_attendance_employee_date"
        );
        if (!uniqueIndexExists) {
            await query(pool,
                "CREATE UNIQUE INDEX uq_attendance_employee_date ON attendance (employee_id, date)"
            );
        }
    }

    if (!plan.settingsExists) {
        await query(pool, `
            CREATE TABLE attendance_settings (
                id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
                office_open TIME NULL,
                office_close TIME NULL,
                grace_period_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 0,
                work_days JSON NULL,
                shifts JSON NULL,
                holidays JSON NULL,
                updated_by INT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }
    if (!plan.auditExists) {
        await query(pool, `
            CREATE TABLE attendance_audit (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                attendance_id INT NULL,
                action VARCHAR(32) NOT NULL,
                actor_id INT NOT NULL,
                actor_role VARCHAR(50) NOT NULL,
                before_data JSON NULL,
                after_data JSON NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                KEY idx_attendance_audit_record_created (attendance_id, created_at),
                KEY idx_attendance_audit_actor_created (actor_id, created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }

    await query(pool, `
        INSERT IGNORE INTO attendance_settings
            (id, office_open, office_close, grace_period_minutes, work_days, shifts, holidays)
        VALUES (1, NULL, NULL, 0, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())
    `);
    await verifyAttendanceUniqueIndex(pool);
}

if (require.main === module) {
    if (process.env.CONFIRM_ATTENDANCE_MIGRATION !== "yes") {
        console.error("Set CONFIRM_ATTENDANCE_MIGRATION=yes after taking a backup and pausing attendance writes.");
        process.exitCode = 2;
    } else {
        const pool = require("./db");
        runAttendanceMigration(pool)
            .then(() => console.log("Attendance migration completed and schema verified."))
            .catch((error) => {
                console.error("Attendance migration stopped:", error.message);
                process.exitCode = 1;
            })
            .finally(() => {
                pool.end();
            });
    }
}

module.exports = {
    compatibleIntegerTypes,
    inspectAttendanceReadiness,
    preflightAttendance,
    runAttendanceMigration,
    validateTableDefinition,
    verifyAttendanceUniqueIndex
};
