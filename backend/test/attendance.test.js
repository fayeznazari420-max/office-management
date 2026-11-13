const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const {
    calculateWorkingMinutes,
    createAttendanceRouter,
    createMySqlAttendanceRepository,
    getDateInTimeZone,
    isValidDate,
    isValidTime
} = require("../attendance");
const { createAuthorizationMiddleware } = require("../rbac");

function createMemoryPool({ employees = [{ id: 1, name: "Amina Employee" }, { id: 2, name: "Bilal Employee" }], attendance = [], settings = {} } = {}) {
    let data = {
        employees: structuredClone(employees),
        attendance: structuredClone(attendance),
        audit: [],
        settings: {
            office_open: null,
            office_close: null,
            grace_period_minutes: 0,
            work_days: [],
            shifts: [],
            holidays: [],
            updated_at: null,
            ...structuredClone(settings)
        },
        nextId: Math.max(0, ...attendance.map((item) => item.id)) + 1
    };
    let transactionTail = Promise.resolve();

    function normalizeSql(sql) {
        return sql.replace(/\s+/g, " ").trim().toLowerCase();
    }

    function execute(state, sql, params) {
        const normalized = normalizeSql(sql);
        if (normalized.includes("from attendance_settings")) {
            return [{ ...state.settings }];
        }
        if (normalized.includes("from employees") && normalized.includes("order by name")) {
            return structuredClone(state.employees).sort((a, b) => a.name.localeCompare(b.name));
        }
        if (normalized.includes("select id from employees where id in")) {
            const ids = params[0].map(Number);
            return state.employees.filter((employee) => ids.includes(employee.id)).map(({ id }) => ({ id }));
        }
        if (normalized.includes("select id, employee_id, date, check_in") &&
            normalized.includes("where employee_id = ? and date = ?")) {
            return state.attendance.filter((record) =>
                Number(record.employee_id) === Number(params[0]) &&
                String(record.date).slice(0, 10) === String(params[1])
            ).slice(0, 1).map((record) => ({ ...record }));
        }
        if (normalized.includes("select id, employee_id, user_id, date, check_in") &&
            normalized.includes("where id = ?")) {
            return state.attendance.filter((record) => Number(record.id) === Number(params[0]))
                .slice(0, 1).map((record) => ({ ...record }));
        }
        if (normalized.startsWith("select a.id") && normalized.includes("from attendance a")) {
            let rows = state.attendance;
            let paramIndex = 0;
            if (normalized.includes("where a.user_id = ?")) {
                rows = rows.filter((record) => Number(record.user_id) === Number(params[paramIndex]));
                paramIndex += 1;
            }
            if (normalized.includes("a.date = ?")) {
                rows = rows.filter((record) => String(record.date).slice(0, 10) === String(params[paramIndex]));
                paramIndex += 1;
            } else if (normalized.includes("where a.date >= ? and a.date <= ?")) {
                rows = rows.filter((record) =>
                    String(record.date).slice(0, 10) >= String(params[paramIndex]) &&
                    String(record.date).slice(0, 10) <= String(params[paramIndex + 1])
                );
            } else if (normalized.includes("where a.id = ?")) {
                rows = rows.filter((record) => Number(record.id) === Number(params[paramIndex]));
            }
            return rows.map((record) => ({
                ...record,
                employee_name: state.employees.find((employee) => employee.id === Number(record.employee_id))?.name || null
            }));
        }
        if (normalized.startsWith("insert into attendance (")) {
            const [employee_id, date, check_in, check_out, status, notes, created_by, created_by_role] = params;
            const duplicate = state.attendance.some((record) =>
                Number(record.employee_id) === Number(employee_id) &&
                String(record.date).slice(0, 10) === String(date)
            );
            if (duplicate) {
                const error = new Error("Duplicate entry");
                error.code = "ER_DUP_ENTRY";
                throw error;
            }
            const id = state.nextId++;
            state.attendance.push({
                id,
                employee_id,
                user_id: null,
                date,
                check_in,
                check_out,
                status,
                notes,
                created_by,
                created_by_role,
                created_at: "2026-11-12 08:00:00"
            });
            return { insertId: id };
        }
        if (normalized.startsWith("update attendance set employee_id")) {
            const [employee_id, date, check_in, check_out, status, notes, id] = params;
            const record = state.attendance.find((item) => Number(item.id) === Number(id));
            if (record) Object.assign(record, { employee_id, user_id: null, date, check_in, check_out, status, notes });
            return { affectedRows: record ? 1 : 0 };
        }
        if (normalized.startsWith("update attendance set check_in") ||
            normalized.startsWith("update attendance set check_out")) {
            const field = normalized.startsWith("update attendance set check_in") ? "check_in" : "check_out";
            const record = state.attendance.find((item) => Number(item.id) === Number(params[1]));
            if (record && !record[field]) record[field] = params[0];
            return { affectedRows: record ? 1 : 0 };
        }
        if (normalized.startsWith("insert into attendance_audit")) {
            const [attendance_id, action, actor_id, actor_role, before_data, after_data] = params;
            state.audit.push({ attendance_id, action, actor_id, actor_role, before_data, after_data });
            return { insertId: state.audit.length };
        }
        if (normalized.startsWith("delete from attendance")) {
            const before = state.attendance.length;
            state.attendance = state.attendance.filter((record) => Number(record.id) !== Number(params[0]));
            return { affectedRows: before - state.attendance.length };
        }
        if (normalized.startsWith("update attendance_settings")) {
            const [office_open, office_close, grace_period_minutes, work_days, shifts, holidays, updated_by] = params;
            Object.assign(state.settings, {
                office_open, office_close, grace_period_minutes,
                work_days: JSON.parse(work_days),
                shifts: JSON.parse(shifts),
                holidays: JSON.parse(holidays),
                updated_by,
                updated_at: "2026-11-12 08:30:00"
            });
            return { affectedRows: 1 };
        }
        throw new Error(`Unimplemented SQL in isolated attendance test: ${sql}`);
    }

    function makeExecutor(state) {
        return {
            query(sql, params, callback) {
                if (typeof params === "function") {
                    callback = params;
                    params = [];
                }
                try {
                    callback(null, execute(state, sql, params || []));
                } catch (error) {
                    callback(error);
                }
            }
        };
    }

    return {
        query(sql, params, callback) {
            return makeExecutor(data).query(sql, params, callback);
        },
        getConnection(callback) {
            callback(null, {
                ...makeExecutor(data),
                beginTransaction(done) {
                    const previous = transactionTail;
                    let release;
                    transactionTail = new Promise((resolve) => { release = resolve; });
                    previous.then(() => {
                        this.transactionState = structuredClone(data);
                        this.transactionRelease = release;
                        this.query = makeExecutor(this.transactionState).query;
                        done(null);
                    });
                },
                commit(done) {
                    data = this.transactionState;
                    this.transactionRelease();
                    done(null);
                },
                rollback(done) {
                    this.transactionRelease?.();
                    done(null);
                },
                release() {}
            });
        },
        snapshot() {
            return structuredClone(data);
        }
    };
}

async function createApp(repository, role = "super_admin", userId = 7, timeZone = "UTC") {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        req.user = { id: userId, role };
        req.authenticated = true;
        next();
    });
    app.use(createAuthorizationMiddleware());
    app.use("/attendance", createAttendanceRouter({
        repository,
        authenticateToken: (req, res, next) => next(),
        timeZone
    }));
    const server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    return {
        request(path, options = {}) {
            return fetch(`${baseUrl}${path}`, {
                ...options,
                headers: { "Content-Type": "application/json", ...(options.headers || {}) }
            });
        },
        close() {
            return new Promise((resolve, reject) =>
                server.close((error) => error ? reject(error) : resolve())
            );
        }
    };
}

const today = () => getDateInTimeZone(new Date(), "UTC");
const entry = (overrides = {}) => ({
    employee_id: 1,
    status: "Present",
    check_in: null,
    check_out: null,
    notes: "",
    ...overrides
});

test("strict date/time validation and Kabul date boundaries are deterministic", () => {
    assert.equal(isValidDate("2026-11-12"), true);
    assert.equal(isValidDate("2026-02-29"), false);
    assert.equal(isValidDate("2026-1-02"), false);
    assert.equal(isValidTime("23:59"), true);
    assert.equal(isValidTime("24:00"), false);
    assert.equal(isValidTime(null), true);
    assert.equal(getDateInTimeZone(new Date("2026-11-12T20:00:00Z")), "2026-11-13");
    assert.equal(calculateWorkingMinutes("23:30", "00:30"), 60);
});

test("daily register returns real employee counts and marks unrecorded employees", async (t) => {
    const pool = createMemoryPool({
        attendance: [{ id: 1, employee_id: 1, date: today(), check_in: null, check_out: null, status: "Absent", notes: null }]
    });
    const app = await createApp(createMySqlAttendanceRepository(pool), "admin");
    t.after(() => app.close());

    const response = await app.request("/attendance/daily");
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.date, today());
    assert.deepEqual(result.summary, {
        total_employees: 2,
        present: 0,
        absent: 1,
        late: 0,
        half_day: 0,
        on_leave: 0,
        holiday: 0,
        not_marked: 1
    });
    assert.equal(result.employees[0].name, "Amina Employee");
});

test("daily register defaults to the current Asia/Kabul calendar date", async (t) => {
    const app = await createApp(createMySqlAttendanceRepository(createMemoryPool()), "admin", 7, "Asia/Kabul");
    t.after(() => app.close());

    const response = await app.request("/attendance/daily");
    assert.equal(response.status, 200);
    assert.equal((await response.json()).date, getDateInTimeZone(new Date(), "Asia/Kabul"));
});

test("individual and bulk creation persist notes and reject duplicates with HTTP 409", async (t) => {
    const pool = createMemoryPool();
    const app = await createApp(createMySqlAttendanceRepository(pool), "admin");
    t.after(() => app.close());

    const date = today();
    const created = await app.request("/attendance", {
        method: "POST",
        body: JSON.stringify(entry({ date, notes: "On time" }))
    });
    assert.equal(created.status, 201);
    assert.equal(pool.snapshot().attendance[0].notes, "On time");

    const duplicate = await app.request("/attendance", {
        method: "POST",
        body: JSON.stringify(entry({ date }))
    });
    assert.equal(duplicate.status, 409);

    const bulk = await app.request("/attendance/daily", {
        method: "POST",
        body: JSON.stringify({ date, entries: [entry({ employee_id: 2, status: "Half Day" })] })
    });
    assert.equal(bulk.status, 201);
    assert.equal(pool.snapshot().attendance.length, 2);
});

test("attendance writes reject missing, null, and nonexistent employee IDs", async (t) => {
    const pool = createMemoryPool();
    const app = await createApp(createMySqlAttendanceRepository(pool), "super_admin");
    t.after(() => app.close());

    for (const payload of [
        { date: today(), status: "Present" },
        entry({ employee_id: null, date: today() }),
        entry({ employee_id: 999, date: today() })
    ]) {
        const response = await app.request("/attendance", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        assert.equal(response.status, 400);
    }

    const bulk = await app.request("/attendance/daily", {
        method: "POST",
        body: JSON.stringify({ date: today(), entries: [entry({ employee_id: null })] })
    });
    assert.equal(bulk.status, 400);
    assert.equal(pool.snapshot().attendance.length, 0);
});

test("concurrent daily submissions serialize and only one row can be created", async (t) => {
    const pool = createMemoryPool();
    const app = await createApp(createMySqlAttendanceRepository(pool), "admin");
    t.after(() => app.close());
    const date = today();
    const payload = JSON.stringify({ date, entries: [entry()] });

    const responses = await Promise.all([
        app.request("/attendance/daily", { method: "POST", body: payload }),
        app.request("/attendance/daily", { method: "POST", body: payload })
    ]);
    assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
    assert.equal(pool.snapshot().attendance.length, 1);
});

test("same-day check-in and check-out update the register row without duplicate rows", async (t) => {
    const pool = createMemoryPool();
    const app = await createApp(createMySqlAttendanceRepository(pool), "admin");
    t.after(() => app.close());
    const created = await app.request("/attendance", {
        method: "POST",
        body: JSON.stringify(entry({ date: today() }))
    });
    const { id } = await created.json();

    const checkIn = await app.request(`/attendance/${id}/check-in`, {
        method: "POST",
        body: JSON.stringify({ time: "09:05" })
    });
    assert.equal(checkIn.status, 200);
    const checkOut = await app.request(`/attendance/${id}/check-out`, {
        method: "POST",
        body: JSON.stringify({ time: "17:15" })
    });
    assert.equal(checkOut.status, 200);
    assert.equal((await checkOut.json()).attendance.working_minutes, 490);
    assert.equal(pool.snapshot().attendance.length, 1);
    assert.deepEqual(pool.snapshot().audit.map(({ action }) => action), [
        "check_in_recorded",
        "check_out_recorded"
    ]);
    assert.equal(pool.snapshot().audit[0].actor_role, "admin");
    assert.match(pool.snapshot().audit[0].before_data, /"check_in":null/);
    assert.match(pool.snapshot().audit[0].after_data, /"check_in":"09:05"/);

    const repeated = await app.request(`/attendance/${id}/check-out`, {
        method: "POST",
        body: JSON.stringify({ time: "18:00" })
    });
    assert.equal(repeated.status, 409);
});

test("Super Admin historical check-in/out changes are audited with before and after values", async (t) => {
    const pool = createMemoryPool({
        attendance: [{
            id: 61,
            employee_id: 1,
            user_id: null,
            date: "2020-04-02",
            check_in: null,
            check_out: null,
            status: "Present",
            notes: "Historical record"
        }]
    });
    const app = await createApp(createMySqlAttendanceRepository(pool), "super_admin", 99);
    t.after(() => app.close());

    const response = await app.request("/attendance/61/check-in", {
        method: "POST",
        body: JSON.stringify({ time: "09:12" })
    });
    assert.equal(response.status, 200);
    const snapshot = pool.snapshot();
    assert.equal(snapshot.attendance[0].check_in, "09:12");
    assert.equal(snapshot.audit.length, 1);
    assert.equal(snapshot.audit[0].action, "check_in_recorded");
    assert.equal(snapshot.audit[0].actor_id, 99);
    assert.equal(snapshot.audit[0].actor_role, "super_admin");
    assert.match(snapshot.audit[0].before_data, /"check_in":null/);
    assert.match(snapshot.audit[0].after_data, /"check_in":"09:12"/);
});

test("configured workday, opening time, and grace period determine late status", async (t) => {
    const pool = createMemoryPool({
        settings: {
            office_open: "09:00:00",
            office_close: "17:00:00",
            grace_period_minutes: 15,
            work_days: [4],
            holidays: [],
            shifts: []
        }
    });
    const app = await createApp(createMySqlAttendanceRepository(pool), "super_admin");
    t.after(() => app.close());

    const response = await app.request("/attendance", {
        method: "POST",
        body: JSON.stringify(entry({ date: "2026-11-12", check_in: "09:16" }))
    });
    assert.equal(response.status, 201);
    assert.equal(pool.snapshot().attendance[0].status, "Late");
});

test("Admin can only submit today and cannot correct or delete saved records; User cannot submit", async (t) => {
    const pool = createMemoryPool();
    const admin = await createApp(createMySqlAttendanceRepository(pool), "admin");
    t.after(() => admin.close());
    const historical = await admin.request("/attendance", {
        method: "POST",
        body: JSON.stringify(entry({ date: "2020-01-01" }))
    });
    assert.equal(historical.status, 403);

    const created = await admin.request("/attendance", {
        method: "POST",
        body: JSON.stringify(entry({ date: today() }))
    });
    const { id } = await created.json();
    assert.equal((await admin.request(`/attendance/${id}`, {
        method: "PUT",
        body: JSON.stringify(entry({ date: today() }))
    })).status, 403);
    assert.equal((await admin.request(`/attendance/${id}`, { method: "DELETE" })).status, 403);
    assert.equal((await admin.request(`/attendance/${id}`, {
        method: "PUT",
        body: JSON.stringify(entry({ date: "2020-01-01" }))
    })).status, 403);

    const user = await createApp(createMySqlAttendanceRepository(pool), "user");
    t.after(() => user.close());
    assert.equal((await user.request("/attendance")).status, 200);
    assert.equal((await user.request("/attendance/daily")).status, 403);
    assert.equal((await user.request("/attendance", {
        method: "POST",
        body: JSON.stringify(entry({ date: today() }))
    })).status, 403);
});

test("User attendance reads are limited to records linked to their authenticated account", async (t) => {
    const pool = createMemoryPool({
        attendance: [
            { id: 51, employee_id: 1, user_id: 7, date: today(), check_in: null, check_out: null, status: "Present" },
            { id: 52, employee_id: 2, user_id: 8, date: today(), check_in: null, check_out: null, status: "Absent" }
        ]
    });
    const user = await createApp(createMySqlAttendanceRepository(pool), "user", 7);
    t.after(() => user.close());

    const response = await user.request("/attendance");
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).map((record) => record.id), [51]);
    assert.equal((await user.request("/attendance/52")).status, 404);
    assert.equal((await user.request("/attendance/51")).status, 200);
});

test("Super Admin corrections preserve history and atomically create an audit entry", async (t) => {
    const pool = createMemoryPool({
        attendance: [
            { id: 41, employee_id: 1, user_id: null, date: "2020-02-03", check_in: "09:00", check_out: null, status: "Present", notes: "Original", created_by: 3, created_by_role: "admin" },
            { id: 42, employee_id: 2, user_id: null, date: "2020-02-03", check_in: null, check_out: null, status: "Leave", notes: null, created_by: 3, created_by_role: "admin" }
        ]
    });
    const app = await createApp(createMySqlAttendanceRepository(pool), "super_admin");
    t.after(() => app.close());

    const response = await app.request("/attendance/41", {
        method: "PUT",
        body: JSON.stringify(entry({ employee_id: 1, date: "2020-02-03", status: "Late", check_in: "09:30", notes: "Corrected" }))
    });
    assert.equal(response.status, 200);
    const snapshot = pool.snapshot();
    assert.equal(snapshot.attendance.length, 2);
    assert.equal(snapshot.attendance.find((record) => record.id === 41).notes, "Corrected");
    assert.equal(snapshot.attendance.find((record) => record.id === 42).status, "Leave");
    assert.equal(snapshot.audit.length, 1);
    assert.equal(snapshot.audit[0].action, "corrected");
    assert.equal(snapshot.audit[0].actor_id, 7);
    assert.match(snapshot.audit[0].before_data, /Original/);
    assert.match(snapshot.audit[0].after_data, /Corrected/);
});

test("Super Admin alone changes attendance settings and settings changes are audited", async (t) => {
    const pool = createMemoryPool();
    const admin = await createApp(createMySqlAttendanceRepository(pool), "admin");
    t.after(() => admin.close());
    const forbidden = await admin.request("/attendance/settings", {
        method: "PUT",
        body: JSON.stringify({ office_open: "08:30", office_close: "16:30" })
    });
    assert.equal(forbidden.status, 403);

    const superAdmin = await createApp(createMySqlAttendanceRepository(pool), "super_admin");
    t.after(() => superAdmin.close());
    const response = await superAdmin.request("/attendance/settings", {
        method: "PUT",
        body: JSON.stringify({
            office_open: "08:30",
            office_close: "16:30",
            grace_period_minutes: 10,
            work_days: [1, 2, 3, 4, 5, 6],
            shifts: [{ name: "Day", start: "08:30", end: "16:30", grace_period_minutes: 10 }],
            holidays: ["2026-11-15"]
        })
    });
    assert.equal(response.status, 200);
    assert.equal(pool.snapshot().settings.office_open, "08:30");
    assert.equal(pool.snapshot().audit[0].action, "settings_updated");
    assert.match(pool.snapshot().audit[0].before_data, /"office_open":null/);
    assert.match(pool.snapshot().audit[0].after_data, /"office_open":"08:30"/);
});

test("concurrent partial settings changes preserve serial before/after audit snapshots", async (t) => {
    const pool = createMemoryPool();
    const app = await createApp(createMySqlAttendanceRepository(pool), "super_admin");
    t.after(() => app.close());

    const [opening, closing] = await Promise.all([
        app.request("/attendance/settings", {
            method: "PUT",
            body: JSON.stringify({ office_open: "08:30" })
        }),
        app.request("/attendance/settings", {
            method: "PUT",
            body: JSON.stringify({ office_close: "17:30" })
        })
    ]);
    assert.equal(opening.status, 200);
    assert.equal(closing.status, 200);
    const snapshot = pool.snapshot();
    assert.equal(snapshot.settings.office_open, "08:30");
    assert.equal(snapshot.settings.office_close, "17:30");
    assert.equal(snapshot.audit.length, 2);
    assert.match(snapshot.audit[1].before_data, /"office_open":"08:30"/);
    assert.match(snapshot.audit[1].before_data, /"office_close":null/);
    assert.match(snapshot.audit[1].after_data, /"office_close":"17:30"/);
});
