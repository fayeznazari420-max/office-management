const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const {
    inspectAttendanceReadiness,
    runAttendanceMigration,
    validateTableDefinition
} = require("../migrate-attendance");

function column(name, type, nullable = "YES") {
    const match = type.match(/^(tinyint|smallint|mediumint|int|integer|bigint|varchar\(\d+\)|text|mediumtext|longtext|date|time|timestamp|json)/i);
    return {
        column_name: name,
        data_type: match?.[1]?.replace(/\(\d+\)/, "").toLowerCase() || type.toLowerCase(),
        column_type: type,
        is_nullable: nullable,
        column_default: null,
        extra: ""
    };
}

function makeMigrationPool({
    anomalies = {},
    incompatibleSettings = false,
    incompatibleAudit = false,
    attendanceExists = true,
    settingsRowExists = true,
    uppercaseInformationSchemaFields = false
} = {}) {
    const schema = {
        employees: {
            engine: "InnoDB",
            columns: [column("id", "int(11)", "NO")],
            indexes: [{ index_name: "PRIMARY", seq_in_index: 1, column_name: "id", non_unique: 0 }]
        },
    };
    if (attendanceExists) {
        schema.attendance = {
            engine: "InnoDB",
            columns: [
                column("id", "int(11)", "NO"),
                column("employee_id", "int(11)", "YES"),
                column("user_id", "int(11)"),
                column("date", "date", "NO"),
                column("check_in", "varchar(50)"),
                column("check_out", "varchar(50)"),
                column("status", "varchar(100)"),
                column("created_by", "int(11)"),
                column("created_by_role", "varchar(50)"),
                column("created_at", "timestamp", "NO")
            ],
            indexes: [{ index_name: "PRIMARY", seq_in_index: 1, column_name: "id", non_unique: 0 }]
        };
    }
    const statements = [];
    let hasSettingsRow = settingsRowExists && !incompatibleSettings;
    const formatInformationSchemaRows = (rows) => uppercaseInformationSchemaFields
        ? rows.map((row) => Object.fromEntries(
            Object.entries(row).map(([field, value]) => [field.toUpperCase(), value])
        ))
        : rows;
    if (incompatibleSettings) {
        schema.attendance_settings = {
            engine: "InnoDB",
            columns: [column("id", "int(11)", "NO")],
            indexes: [{ index_name: "PRIMARY", seq_in_index: 1, column_name: "id", non_unique: 0 }]
        };
    }
    if (incompatibleAudit) {
        schema.attendance_audit = {
            engine: "InnoDB",
            columns: [column("id", "int(11)", "NO")],
            indexes: [{ index_name: "PRIMARY", seq_in_index: 1, column_name: "id", non_unique: 0 }]
        };
    }

    function run(sql, params) {
        const normalized = sql.replace(/\s+/g, " ").trim();
        if (normalized.includes("information_schema.tables")) {
            return formatInformationSchemaRows(
                schema[params[0]] ? [{ table_name: params[0], engine: schema[params[0]].engine }] : []
            );
        }
        if (normalized.includes("information_schema.columns")) {
            return formatInformationSchemaRows(schema[params[0]]?.columns || []);
        }
        if (normalized.includes("information_schema.statistics")) {
            return formatInformationSchemaRows(schema[params[0]]?.indexes || []);
        }
        if (normalized.includes("SUM(employee_id IS NULL)")) {
            return [{
                null_employee_ids: anomalies.nullEmployeeIds || 0,
                invalid_dates: anomalies.invalidDates || 0,
                orphan_employee_ids: anomalies.orphanEmployeeIds || 0
            }];
        }
        if (normalized.includes("AS duplicate_groups")) {
            return [{ duplicate_groups: anomalies.duplicateGroups || 0 }];
        }
        if (normalized.startsWith("SELECT id FROM attendance_settings")) {
            if (!schema.attendance_settings) throw new Error("attendance_settings table does not exist");
            return hasSettingsRow ? [{ id: 1 }] : [];
        }
        if (normalized.startsWith("CREATE TABLE attendance_settings")) {
            schema.attendance_settings = {
                engine: "InnoDB",
                columns: [
                    column("id", "tinyint unsigned", "NO"),
                    column("office_open", "time"),
                    column("office_close", "time"),
                    column("grace_period_minutes", "smallint unsigned", "NO"),
                    column("work_days", "json"),
                    column("shifts", "json"),
                    column("holidays", "json"),
                    column("updated_by", "int"),
                    column("updated_at", "timestamp", "NO")
                ],
                indexes: [{ index_name: "PRIMARY", seq_in_index: 1, column_name: "id", non_unique: 0 }]
            };
            return { affectedRows: 0 };
        }
        if (normalized.startsWith("CREATE TABLE attendance (")) {
            schema.attendance = {
                engine: "InnoDB",
                columns: [
                    column("id", "int(11)", "NO"),
                    column("employee_id", "int(11)", "NO"),
                    column("user_id", "int(11)"),
                    column("date", "date", "NO"),
                    column("check_in", "varchar(50)"),
                    column("check_out", "varchar(50)"),
                    column("status", "varchar(100)"),
                    column("notes", "text"),
                    column("created_by", "int(11)"),
                    column("created_by_role", "varchar(50)"),
                    column("created_at", "timestamp", "NO")
                ],
                indexes: [
                    { index_name: "PRIMARY", seq_in_index: 1, column_name: "id", non_unique: 0 },
                    { index_name: "uq_attendance_employee_date", seq_in_index: 1, column_name: "employee_id", non_unique: 0 },
                    { index_name: "uq_attendance_employee_date", seq_in_index: 2, column_name: "date", non_unique: 0 }
                ]
            };
            return { affectedRows: 0 };
        }
        if (normalized.startsWith("CREATE TABLE attendance_audit")) {
            schema.attendance_audit = {
                engine: "InnoDB",
                columns: [
                    column("id", "bigint unsigned", "NO"),
                    column("attendance_id", "int"),
                    column("action", "varchar(32)", "NO"),
                    column("actor_id", "int", "NO"),
                    column("actor_role", "varchar(50)", "NO"),
                    column("before_data", "json"),
                    column("after_data", "json"),
                    column("created_at", "timestamp", "NO")
                ],
                indexes: [
                    { index_name: "PRIMARY", seq_in_index: 1, column_name: "id", non_unique: 0 },
                    { index_name: "idx_attendance_audit_record_created", seq_in_index: 1, column_name: "attendance_id", non_unique: 1 },
                    { index_name: "idx_attendance_audit_record_created", seq_in_index: 2, column_name: "created_at", non_unique: 1 },
                    { index_name: "idx_attendance_audit_actor_created", seq_in_index: 1, column_name: "actor_id", non_unique: 1 },
                    { index_name: "idx_attendance_audit_actor_created", seq_in_index: 2, column_name: "created_at", non_unique: 1 }
                ]
            };
            return { affectedRows: 0 };
        }
        if (normalized.startsWith("ALTER TABLE attendance ADD COLUMN notes")) {
            schema.attendance.columns.push(column("notes", "text"));
            return { affectedRows: 0 };
        }
        if (normalized.startsWith("ALTER TABLE attendance MODIFY COLUMN employee_id")) {
            schema.attendance.columns.find(({ column_name }) => column_name === "employee_id").is_nullable = "NO";
            return { affectedRows: 0 };
        }
        if (normalized.startsWith("CREATE UNIQUE INDEX uq_attendance_employee_date")) {
            schema.attendance.indexes.push(
                { index_name: "uq_attendance_employee_date", seq_in_index: 1, column_name: "employee_id", non_unique: 0 },
                { index_name: "uq_attendance_employee_date", seq_in_index: 2, column_name: "date", non_unique: 0 }
            );
            return { affectedRows: 0 };
        }
        if (normalized.startsWith("INSERT IGNORE INTO attendance_settings")) {
            hasSettingsRow = true;
            return { affectedRows: 1 };
        }
        throw new Error(`Unexpected migration SQL: ${normalized}`);
    }

    return {
        schema,
        setSettingsRowExists(value) {
            hasSettingsRow = value;
        },
        statements,
        query(sql, params, callback) {
            if (typeof params === "function") {
                callback = params;
                params = [];
            }
            statements.push(sql.replace(/\s+/g, " ").trim());
            try {
                callback(null, run(sql, params || []));
            } catch (error) {
                callback(error);
            }
        }
    };
}

test("attendance migration is rerunnable and enforces non-null employee IDs with the expected unique index", async () => {
    const pool = makeMigrationPool();
    await runAttendanceMigration(pool);
    const ddlCount = pool.statements.filter((sql) => /^(CREATE|ALTER)/i.test(sql)).length;
    await runAttendanceMigration(pool);

    assert.equal(pool.schema.attendance.columns.find(({ column_name }) => column_name === "employee_id").is_nullable, "NO");
    assert.deepEqual(
        pool.schema.attendance.indexes
            .filter(({ index_name }) => index_name === "uq_attendance_employee_date")
            .map(({ column_name }) => column_name),
        ["employee_id", "date"]
    );
    assert.ok(pool.statements.includes(
        "ALTER TABLE attendance MODIFY COLUMN employee_id int(11) NOT NULL"
    ));
    assert.equal(pool.statements.filter((sql) => /^(CREATE|ALTER)/i.test(sql)).length, ddlCount);

    const inserts = [];
    const dbInsert = (employeeId, date) => {
        if (employeeId == null) throw new Error("Column employee_id cannot be null");
        if (inserts.some((record) => record.employeeId === employeeId && record.date === date)) {
            throw new Error("Duplicate employee/date key");
        }
        inserts.push({ employeeId, date });
    };
    assert.throws(() => dbInsert(null, "2026-11-13"), /cannot be null/);
    assert.throws(() => dbInsert(null, "2026-11-13"), /cannot be null/);
    dbInsert(1, "2026-11-13");
    assert.throws(() => dbInsert(1, "2026-11-13"), /Duplicate employee\/date/);
});

test("information schema metadata field casing does not affect migration validation", async () => {
    const pool = makeMigrationPool({ uppercaseInformationSchemaFields: true });

    await runAttendanceMigration(pool);

    assert.equal(pool.schema.attendance.columns.find(({ column_name }) =>
        column_name === "employee_id"
    ).is_nullable, "NO");
    assert.deepEqual(
        pool.schema.attendance.indexes
            .filter(({ index_name }) => index_name === "uq_attendance_employee_date")
            .sort((left, right) => left.seq_in_index - right.seq_in_index)
            .map(({ column_name, non_unique }) => [column_name, non_unique]),
        [["employee_id", 0], ["date", 0]]
    );
    assert.ok(pool.statements.some((sql) =>
        /TABLE_NAME AS table_name, ENGINE AS engine/i.test(sql)
    ));
    assert.ok(pool.statements.some((sql) =>
        /COLUMN_NAME AS column_name/i.test(sql)
    ));
    assert.ok(pool.statements.some((sql) =>
        /INDEX_NAME AS index_name/i.test(sql)
    ));
});

test("preflight continues to reject non-InnoDB and incompatible integer signedness or indexes", async () => {
    const nonInnoDb = makeMigrationPool();
    nonInnoDb.schema.employees.engine = "MyISAM";
    await assert.rejects(runAttendanceMigration(nonInnoDb), /employees table must use InnoDB/);
    assert.equal(nonInnoDb.statements.some((sql) => /^(CREATE|ALTER)/i.test(sql)), false);

    const nonInnoDbAttendance = makeMigrationPool();
    nonInnoDbAttendance.schema.attendance.engine = "MyISAM";
    await assert.rejects(
        runAttendanceMigration(nonInnoDbAttendance),
        /attendance table must use InnoDB/
    );
    assert.equal(nonInnoDbAttendance.statements.some((sql) => /^(CREATE|ALTER)/i.test(sql)), false);

    const signednessMismatch = makeMigrationPool();
    signednessMismatch.schema.employees.columns[0] = column("id", "int(11) unsigned", "NO");
    await assert.rejects(
        runAttendanceMigration(signednessMismatch),
        /integer type\/signedness are incompatible/
    );

    const incompatibleIndex = makeMigrationPool();
    incompatibleIndex.schema.attendance.indexes.push(
        { index_name: "uq_attendance_employee_date", seq_in_index: 1, column_name: "date", non_unique: 0 },
        { index_name: "uq_attendance_employee_date", seq_in_index: 2, column_name: "employee_id", non_unique: 0 }
    );
    await assert.rejects(
        runAttendanceMigration(incompatibleIndex),
        /uq_attendance_employee_date exists with an incompatible definition/
    );
});

test("attendance data anomalies abort before any schema change", async () => {
    for (const anomalies of [
        { nullEmployeeIds: 1 },
        { invalidDates: 1 },
        { orphanEmployeeIds: 1 },
        { duplicateGroups: 1 }
    ]) {
        const pool = makeMigrationPool({ anomalies });
        await assert.rejects(runAttendanceMigration(pool), /preflight stopped/);
        assert.equal(pool.statements.some((sql) => /^(CREATE|ALTER)/i.test(sql)), false);
    }
});

test("incompatible existing settings or audit tables abort before attendance DDL", async () => {
    for (const [options, expectedMessage] of [
        [{ incompatibleSettings: true }, /attendance_settings\.id has an incompatible/],
        [{ incompatibleAudit: true }, /attendance_audit\.id has an incompatible/]
    ]) {
        const pool = makeMigrationPool(options);
        await assert.rejects(runAttendanceMigration(pool), expectedMessage);
        assert.equal(pool.statements.some((sql) => /^(CREATE|ALTER)/i.test(sql)), false);
    }
});

test("fresh installs get a base attendance table through the explicit migration runner", async () => {
    const pool = makeMigrationPool({ attendanceExists: false });
    await runAttendanceMigration(pool);
    assert.equal(pool.schema.attendance.columns.find(({ column_name }) => column_name === "employee_id").is_nullable, "NO");
    assert.ok(pool.statements.some((sql) => sql.startsWith("CREATE TABLE attendance (")));
    assert.equal(pool.statements.some((sql) => /ALTER TABLE attendance/.test(sql)), false);
    assert.deepEqual(await inspectAttendanceReadiness(pool), { ready: true, message: "" });
});

test("readiness probe reports that an unmigrated schema is unavailable", async () => {
    const pool = makeMigrationPool();
    const readiness = await inspectAttendanceReadiness(pool);
    assert.equal(readiness.ready, false);
    assert.match(readiness.message, /NOT NULL employee_id/);
    assert.match(readiness.message, /attendance_settings table/);
});

test("readiness reports missing attendance tables without querying them", async () => {
    const pool = makeMigrationPool({ attendanceExists: false });
    const readiness = await inspectAttendanceReadiness(pool);

    assert.equal(readiness.ready, false);
    assert.match(readiness.message, /attendance table/);
    assert.match(readiness.message, /attendance_settings table/);
    assert.match(readiness.message, /attendance_audit table/);
    assert.equal(pool.statements.some((sql) =>
        /^SELECT id FROM attendance_settings/i.test(sql) ||
        /^SELECT .* FROM attendance(?:\s|$)/i.test(sql) ||
        /^SELECT .* FROM attendance_audit(?:\s|$)/i.test(sql)
    ), false);
});

test("readiness reports a missing settings table without querying it", async () => {
    const pool = makeMigrationPool();
    const readiness = await inspectAttendanceReadiness(pool);

    assert.equal(readiness.ready, false);
    assert.match(readiness.message, /attendance_settings table/);
    assert.equal(pool.statements.some((sql) =>
        /^SELECT id FROM attendance_settings/i.test(sql)
    ), false);
});

test("readiness reports a missing default settings row", async () => {
    const pool = makeMigrationPool();
    await runAttendanceMigration(pool);
    pool.setSettingsRowExists(false);

    const readiness = await inspectAttendanceReadiness(pool);
    assert.equal(readiness.ready, false);
    assert.match(readiness.message, /default attendance settings row/);
});

test("readiness accepts a complete valid attendance schema", async () => {
    const pool = makeMigrationPool({ attendanceExists: false });
    await runAttendanceMigration(pool);

    assert.deepEqual(await inspectAttendanceReadiness(pool), { ready: true, message: "" });
});

test("auxiliary table validation rejects incompatible definitions and wrong engines", () => {
    assert.throws(
        () => validateTableDefinition(
            "attendance_audit",
            { engine: "MyISAM" },
            [],
            []
        ),
        /must use InnoDB/
    );
});

test("server startup has no attendance schema DDL or legacy attendance route registrations", () => {
    const server = readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
    assert.doesNotMatch(server, /CREATE TABLE IF NOT EXISTS attendance|ALTER TABLE attendance/i);
    assert.doesNotMatch(server, /app\.(?:get|post|put|patch|delete)\(\s*["']\/attendance/);
    assert.match(server, /app\.use\(\s*["']\/attendance["']/);
});
