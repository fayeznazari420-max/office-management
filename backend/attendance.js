const express = require("express");
const { ROLE, normalizeRole } = require("./rbac");

const ATTENDANCE_TIME_ZONE = "Asia/Kabul";
const ALLOWED_STATUSES = new Map([
    ["present", "Present"],
    ["absent", "Absent"],
    ["late", "Late"],
    ["half day", "Half Day"],
    ["leave", "Leave"],
    ["on leave", "Leave"],
    ["holiday", "Holiday"]
]);

class AttendanceError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function isValidDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
}

function isValidTime(value, nullable = true) {
    if (value == null || value === "") return nullable;
    if (typeof value !== "string") return false;
    const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    return Boolean(match);
}

function getDateInTimeZone(value = new Date(), timeZone = ATTENDANCE_TIME_ZONE) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(value);
    const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
    return `${values.year}-${values.month}-${values.day}`;
}

function getTimeInTimeZone(value = new Date(), timeZone = ATTENDANCE_TIME_ZONE) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(value);
    const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
    return `${values.hour}:${values.minute}`;
}

function minutesFromTime(value) {
    if (!isValidTime(value, false)) return null;
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

function calculateWorkingMinutes(checkIn, checkOut) {
    const start = minutesFromTime(checkIn);
    const end = minutesFromTime(checkOut);
    if (start == null || end == null) return null;
    return (end >= start ? end : end + 24 * 60) - start;
}

function normalizeSettings(settings = {}) {
    const parseArray = (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        }
        return [];
    };

    return {
        office_open: settings.office_open || null,
        office_close: settings.office_close || null,
        grace_period_minutes: Number(settings.grace_period_minutes || 0),
        work_days: parseArray(settings.work_days),
        shifts: parseArray(settings.shifts),
        holidays: parseArray(settings.holidays),
        updated_at: settings.updated_at || null
    };
}

function validateSettingsPayload(body, current) {
    const allowed = [
        "office_open",
        "office_close",
        "grace_period_minutes",
        "work_days",
        "shifts",
        "holidays"
    ];
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).some((key) => !allowed.includes(key))) {
        throw new AttendanceError(400, "Invalid attendance settings.");
    }

    const next = { ...current, ...body };
    if (!isValidTime(next.office_open) || !isValidTime(next.office_close)) {
        throw new AttendanceError(400, "Office opening and closing times must be valid.");
    }
    if (!Number.isInteger(Number(next.grace_period_minutes)) ||
        Number(next.grace_period_minutes) < 0 ||
        Number(next.grace_period_minutes) > 360) {
        throw new AttendanceError(400, "Grace period must be between 0 and 360 minutes.");
    }
    if (!Array.isArray(next.work_days) ||
        next.work_days.some((day) => !Number.isInteger(day) || day < 1 || day > 7) ||
        new Set(next.work_days).size !== next.work_days.length) {
        throw new AttendanceError(400, "Work days must be unique ISO weekdays from 1 to 7.");
    }
    if (!Array.isArray(next.holidays) || next.holidays.some((date) => !isValidDate(date))) {
        throw new AttendanceError(400, "Holiday dates must use YYYY-MM-DD.");
    }
    if (!Array.isArray(next.shifts) || next.shifts.length > 20 ||
        next.shifts.some((shift) =>
            !shift || typeof shift !== "object" ||
            typeof shift.name !== "string" || !shift.name.trim() ||
            !isValidTime(shift.start, false) || !isValidTime(shift.end, false) ||
            !Number.isInteger(Number(shift.grace_period_minutes || 0)) ||
            Number(shift.grace_period_minutes || 0) < 0 ||
            Number(shift.grace_period_minutes || 0) > 360
        )) {
        throw new AttendanceError(400, "Shift schedules must include a name, valid times, and a valid grace period.");
    }

    return {
        ...next,
        office_open: next.office_open || null,
        office_close: next.office_close || null,
        grace_period_minutes: Number(next.grace_period_minutes),
        work_days: next.work_days,
        shifts: next.shifts,
        holidays: next.holidays
    };
}

function validateAttendanceEntry(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry) ||
        !/^\d+$/.test(String(entry.employee_id ?? "")) ||
        Number(entry.employee_id) < 1) {
        throw new AttendanceError(400, "Select a valid employee.");
    }
    if (!isValidTime(entry.check_in) || !isValidTime(entry.check_out)) {
        throw new AttendanceError(400, "Check-in and check-out must use a valid 24-hour time.");
    }
    if (entry.notes != null && (typeof entry.notes !== "string" || entry.notes.length > 2000)) {
        throw new AttendanceError(400, "Notes must be 2,000 characters or fewer.");
    }
    const status = ALLOWED_STATUSES.get(String(entry.status || "").trim().toLowerCase());
    if (!status) {
        throw new AttendanceError(400, "Choose a valid attendance status.");
    }

    return {
        employee_id: Number(entry.employee_id),
        status,
        check_in: entry.check_in || null,
        check_out: entry.check_out || null,
        notes: entry.notes?.trim() || null
    };
}

function deriveStatus(entry, date, settings) {
    if (entry.status !== "Present" || !settings.office_open) return entry.status;
    if (settings.holidays.includes(date)) return "Holiday";

    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay() || 7;
    if (settings.work_days.length && !settings.work_days.includes(weekday)) {
        return entry.status;
    }

    const shift = settings.shifts[0];
    const opening = shift?.start || settings.office_open;
    const grace = Number(shift?.grace_period_minutes ?? settings.grace_period_minutes);
    const checkIn = minutesFromTime(entry.check_in);
    const shiftStart = minutesFromTime(opening);
    return checkIn != null && shiftStart != null && checkIn > shiftStart + grace
        ? "Late"
        : entry.status;
}

function enrichRecord(record) {
    return {
        ...record,
        working_minutes: calculateWorkingMinutes(record.check_in, record.check_out)
    };
}

function ensureDate(value, label = "Attendance date") {
    if (!isValidDate(value)) {
        throw new AttendanceError(400, `${label} must use a valid YYYY-MM-DD date.`);
    }
    return value;
}

function ensureManagerRole(user) {
    const role = normalizeRole(user?.role);
    if (role !== ROLE.ADMIN && role !== ROLE.SUPER_ADMIN) {
        throw new AttendanceError(403, "You are not allowed to record attendance.");
    }
}

function ensureSuperAdmin(user) {
    if (normalizeRole(user?.role) !== ROLE.SUPER_ADMIN) {
        throw new AttendanceError(403, "Only Super Admin can correct attendance records or settings.");
    }
}

function ensureCurrentDateForAdmin(user, date, timeZone) {
    if (normalizeRole(user?.role) === ROLE.ADMIN && date !== getDateInTimeZone(new Date(), timeZone)) {
        throw new AttendanceError(403, "Admins can record or complete attendance only for today.");
    }
}

function createAttendanceRouter({ repository, authenticateToken, timeZone = ATTENDANCE_TIME_ZONE }) {
    const router = express.Router();
    router.use(authenticateToken);

    const respond = (handler) => async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            if (error instanceof AttendanceError) {
                return res.status(error.status).json({ success: false, message: error.message });
            }
            if (error?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "Attendance is already recorded for this employee and date."
                });
            }
            if (error?.code === "ER_NO_SUCH_TABLE" || error?.code === "ER_BAD_FIELD_ERROR") {
                return res.status(503).json({
                    success: false,
                    message: "Attendance schema is not ready. Back up the database, pause attendance writes, and run npm run migrate:attendance --prefix backend."
                });
            }
            console.error("Attendance request failed:", error?.code || error?.message || "UNKNOWN_ERROR");
            return res.status(500).json({
                success: false,
                message: "Attendance could not be processed."
            });
        }
    };

    router.get("/settings", respond(async (req, res) => {
        const role = normalizeRole(req.user?.role);
        if (role !== ROLE.ADMIN && role !== ROLE.SUPER_ADMIN) {
            throw new AttendanceError(403, "You are not allowed to view attendance settings.");
        }
        res.json(normalizeSettings(await repository.getSettings()));
    }));

    router.put("/settings", respond(async (req, res) => {
        ensureSuperAdmin(req.user);
        res.json(await repository.saveSettings(req.body, req.user));
    }));

    router.get("/daily", respond(async (req, res) => {
        ensureManagerRole(req.user);
        const date = ensureDate(req.query.date || getDateInTimeZone(new Date(), timeZone));
        const result = await repository.getDailyRegister(date);
        const settings = normalizeSettings(await repository.getSettings());
        const employees = result.employees.map((employee) => {
            const record = result.attendanceByEmployee.get(String(employee.id));
            const attendance = record
                ? enrichRecord({ ...record, status: deriveStatus({
                    status: record.status,
                    check_in: record.check_in
                }, date, settings) })
                : null;
            return { ...employee, attendance };
        });
        const summary = employees.reduce((counts, employee) => {
            const status = employee.attendance?.status;
            if (!status) counts.not_marked += 1;
            else if (status === "Present") counts.present += 1;
            else if (status === "Absent") counts.absent += 1;
            else if (status === "Late") counts.late += 1;
            else if (status === "Half Day") counts.half_day += 1;
            else if (status === "Leave") counts.on_leave += 1;
            else if (status === "Holiday") counts.holiday += 1;
            return counts;
        }, {
            total_employees: employees.length,
            present: 0,
            absent: 0,
            late: 0,
            half_day: 0,
            on_leave: 0,
            holiday: 0,
            not_marked: 0
        });
        res.json({ date, summary, employees });
    }));

    router.get("/", respond(async (req, res) => {
        const date = req.query.date ? ensureDate(String(req.query.date)) : null;
        const from = req.query.from ? ensureDate(String(req.query.from), "Start date") : null;
        const to = req.query.to ? ensureDate(String(req.query.to), "End date") : null;
        if ((from && !to) || (!from && to) || (from && from > to)) {
            throw new AttendanceError(400, "Provide a valid start and end date range.");
        }
        const userId = normalizeRole(req.user?.role) === ROLE.USER
            ? Number(req.user.id)
            : null;
        const records = await repository.listAttendance({ date, from, to, userId });
        res.json(records.map(enrichRecord));
    }));

    router.get("/:id", respond(async (req, res) => {
        if (!/^\d+$/.test(req.params.id)) throw new AttendanceError(400, "Invalid attendance ID.");
        const record = await repository.getAttendance(Number(req.params.id));
        if (!record) throw new AttendanceError(404, "Attendance record not found.");
        if (normalizeRole(req.user?.role) === ROLE.USER &&
            String(record.user_id) !== String(req.user.id)) {
            throw new AttendanceError(404, "Attendance record not found.");
        }
        res.json(enrichRecord(record));
    }));

    router.post("/daily", respond(async (req, res) => {
        ensureManagerRole(req.user);
        const date = ensureDate(req.body?.date);
        ensureCurrentDateForAdmin(req.user, date, timeZone);
        if (!Array.isArray(req.body?.entries) || req.body.entries.length < 1 ||
            req.body.entries.length > 500) {
            throw new AttendanceError(400, "Submit between 1 and 500 attendance entries.");
        }
        const entries = req.body.entries.map(validateAttendanceEntry);
        if (new Set(entries.map(({ employee_id }) => employee_id)).size !== entries.length) {
            throw new AttendanceError(400, "An employee can appear only once in a daily submission.");
        }
        const settings = normalizeSettings(await repository.getSettings());
        entries.forEach((entry) => {
            entry.status = deriveStatus(entry, date, settings);
        });
        const saved = await repository.createDaily(date, entries, req.user);
        res.status(201).json({
            success: true,
            date,
            count: saved.length,
            attendance: saved.map(enrichRecord)
        });
    }));

    router.post("/", respond(async (req, res) => {
        ensureManagerRole(req.user);
        const date = ensureDate(req.body?.date);
        ensureCurrentDateForAdmin(req.user, date, timeZone);
        const entry = validateAttendanceEntry(req.body);
        const settings = normalizeSettings(await repository.getSettings());
        entry.status = deriveStatus(entry, date, settings);
        const record = await repository.createDaily(date, [entry], req.user);
        res.status(201).json({
            success: true,
            message: "Attendance recorded successfully.",
            id: record[0].id,
            attendance: enrichRecord(record[0])
        });
    }));

    for (const field of ["check_in", "check_out"]) {
        router.post("/:id/" + field.replace("_", "-"), respond(async (req, res) => {
            ensureManagerRole(req.user);
            if (!/^\d+$/.test(req.params.id)) throw new AttendanceError(400, "Invalid attendance ID.");
            const record = await repository.getAttendance(Number(req.params.id));
            if (!record) throw new AttendanceError(404, "Attendance record not found.");
            ensureCurrentDateForAdmin(req.user, record.date, timeZone);
            const time = req.body?.time || getTimeInTimeZone(new Date(), timeZone);
            if (!isValidTime(time, false)) {
                throw new AttendanceError(400, "Provide a valid 24-hour attendance time.");
            }
            const updated = await repository.recordTime(
                Number(req.params.id),
                field,
                time,
                record,
                req.user
            );
            res.json({ success: true, attendance: enrichRecord(updated) });
        }));
    }

    router.put("/:id", respond(async (req, res) => {
        ensureSuperAdmin(req.user);
        if (!/^\d+$/.test(req.params.id)) throw new AttendanceError(400, "Invalid attendance ID.");
        const date = ensureDate(req.body?.date);
        const entry = validateAttendanceEntry(req.body);
        const settings = normalizeSettings(await repository.getSettings());
        entry.status = deriveStatus(entry, date, settings);
        const updated = await repository.correctAttendance(
            Number(req.params.id),
            date,
            entry,
            req.user
        );
        res.json({
            success: true,
            message: "Attendance corrected successfully.",
            attendance: enrichRecord(updated)
        });
    }));

    router.delete("/:id", respond(async (req, res) => {
        ensureSuperAdmin(req.user);
        if (!/^\d+$/.test(req.params.id)) throw new AttendanceError(400, "Invalid attendance ID.");
        await repository.deleteAttendance(Number(req.params.id), req.user);
        res.json({ success: true, message: "Attendance deleted successfully." });
    }));

    return router;
}

function query(executor, sql, params = []) {
    return new Promise((resolve, reject) => {
        executor.query(sql, params, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}

function acquireConnection(pool) {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) reject(error);
            else resolve(connection);
        });
    });
}

async function inTransaction(pool, callback) {
    const connection = await acquireConnection(pool);
    try {
        await new Promise((resolve, reject) =>
            connection.beginTransaction((error) => error ? reject(error) : resolve())
        );
        const result = await callback(connection);
        await new Promise((resolve, reject) =>
            connection.commit((error) => error ? reject(error) : resolve())
        );
        return result;
    } catch (error) {
        await new Promise((resolve) => connection.rollback(() => resolve()));
        throw error;
    } finally {
        connection.release();
    }
}

function createMySqlAttendanceRepository(pool) {
    const selectAttendance = `
        SELECT a.id, a.employee_id, a.user_id, e.name AS employee_name,
               a.date, a.check_in, a.check_out, a.status, a.notes,
               a.created_by, a.created_by_role, a.created_at
        FROM attendance a
        LEFT JOIN employees e ON e.id = a.employee_id
    `;

    const txRepository = (connection) => ({
        async lockEmployees(ids) {
            if (!ids.length) return [];
            return query(connection,
                "SELECT id FROM employees WHERE id IN (?) ORDER BY id FOR UPDATE",
                [ids]
            );
        },
        async findByEmployeeDate(employeeId, date) {
            const rows = await query(connection,
                "SELECT id, employee_id, date, check_in, check_out, status, notes, created_by, created_by_role, created_at FROM attendance WHERE employee_id = ? AND date = ? LIMIT 1 FOR UPDATE",
                [employeeId, date]
            );
            return rows[0] || null;
        },
        async getById(id, forUpdate = false) {
            const rows = await query(connection,
                `SELECT id, employee_id, user_id, date, check_in, check_out, status, notes, created_by, created_by_role, created_at FROM attendance WHERE id = ? LIMIT 1${forUpdate ? " FOR UPDATE" : ""}`,
                [id]
            );
            return rows[0] || null;
        },
        async insert(date, entry, actor) {
            const result = await query(connection,
                `INSERT INTO attendance
                    (employee_id, user_id, date, check_in, check_out, status, notes, created_by, created_by_role)
                 VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    entry.employee_id, date, entry.check_in, entry.check_out,
                    entry.status, entry.notes, actor.id, actor.role
                ]
            );
            return { id: result.insertId, employee_id: entry.employee_id, user_id: null, date, ...entry, created_by: actor.id, created_by_role: actor.role };
        },
        async update(id, date, entry) {
            await query(connection,
                `UPDATE attendance SET employee_id = ?, user_id = NULL, date = ?,
                    check_in = ?, check_out = ?, status = ?, notes = ? WHERE id = ?`,
                [entry.employee_id, date, entry.check_in, entry.check_out, entry.status, entry.notes, id]
            );
        },
        async updateTime(id, field, time) {
            await query(connection, `UPDATE attendance SET ${field} = ? WHERE id = ?`, [time, id]);
        },
        async audit(attendanceId, action, actor, before, after) {
            await query(connection,
                `INSERT INTO attendance_audit
                    (attendance_id, action, actor_id, actor_role, before_data, after_data)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    attendanceId,
                    action,
                    actor.id,
                    actor.role,
                    before == null ? null : JSON.stringify(before),
                    after == null ? null : JSON.stringify(after)
                ]
            );
        },
        async delete(id) {
            await query(connection, "DELETE FROM attendance WHERE id = ?", [id]);
        },
        async saveSettings(payload, actor) {
            const rowsBefore = await query(connection,
                "SELECT office_open, office_close, grace_period_minutes, work_days, shifts, holidays, updated_at FROM attendance_settings WHERE id = 1 FOR UPDATE"
            );
            if (!rowsBefore.length) throw new Error("Attendance settings row is missing.");
            const before = normalizeSettings(rowsBefore[0]);
            const settings = validateSettingsPayload(payload, before);
            await query(connection,
                `UPDATE attendance_settings SET office_open = ?, office_close = ?,
                    grace_period_minutes = ?, work_days = ?, shifts = ?, holidays = ?,
                    updated_by = ? WHERE id = 1`,
                [
                    settings.office_open,
                    settings.office_close,
                    settings.grace_period_minutes,
                    JSON.stringify(settings.work_days),
                    JSON.stringify(settings.shifts),
                    JSON.stringify(settings.holidays),
                    actor.id
                ]
            );
            const rows = await query(connection,
                "SELECT office_open, office_close, grace_period_minutes, work_days, shifts, holidays, updated_at FROM attendance_settings WHERE id = 1"
            );
            const updated = normalizeSettings(rows[0] || settings);
            await this.audit(null, "settings_updated", actor, before, updated);
            return updated;
        }
    });

    return {
        async listAttendance({ date, from, to, userId }) {
            const conditions = [];
            const params = [];
            if (userId != null) {
                conditions.push("a.user_id = ?");
                params.push(userId);
            }
            if (date) {
                conditions.push("a.date = ?");
                params.push(date);
            } else if (from && to) {
                conditions.push("a.date >= ? AND a.date <= ?");
                params.push(from, to);
            }
            const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
            return query(pool, `${selectAttendance}${where} ORDER BY a.date DESC, a.id DESC`, params);
        },
        async getAttendance(id) {
            const rows = await query(pool, `${selectAttendance} WHERE a.id = ? LIMIT 1`, [id]);
            return rows[0] || null;
        },
        async getSettings() {
            const rows = await query(pool,
                "SELECT office_open, office_close, grace_period_minutes, work_days, shifts, holidays, updated_at FROM attendance_settings WHERE id = 1"
            );
            if (!rows.length) throw new Error("Attendance settings row is missing.");
            return rows[0];
        },
        async saveSettings(settings, actor) {
            return inTransaction(pool, (connection) =>
                txRepository(connection).saveSettings(settings, actor)
            );
        },
        async getDailyRegister(date) {
            const [employees, records] = await Promise.all([
                query(pool, "SELECT id, name FROM employees ORDER BY name, id"),
                query(pool, `${selectAttendance} WHERE a.date = ? ORDER BY a.id DESC`, [date])
            ]);
            return {
                employees,
                attendanceByEmployee: new Map(
                    records.filter((record) => record.employee_id != null)
                        .map((record) => [String(record.employee_id), record])
                )
            };
        },
        async createDaily(date, entries, actor) {
            return inTransaction(pool, async (connection) => {
                const tx = txRepository(connection);
                const employeeIds = entries.map(({ employee_id }) => employee_id).sort((a, b) => a - b);
                const employees = await tx.lockEmployees(employeeIds);
                if (employees.length !== employeeIds.length) {
                    throw new AttendanceError(400, "One or more selected employees do not exist.");
                }
                const saved = [];
                for (const entry of entries) {
                    if (await tx.findByEmployeeDate(entry.employee_id, date)) {
                        throw new AttendanceError(409, "Attendance is already recorded for an employee on this date.");
                    }
                    saved.push(await tx.insert(date, entry, actor));
                }
                return saved;
            });
        },
        async recordTime(id, field, time, initialRecord, actor) {
            return inTransaction(pool, async (connection) => {
                const tx = txRepository(connection);
                const employees = initialRecord.employee_id == null
                    ? []
                    : await tx.lockEmployees([Number(initialRecord.employee_id)]);
                const current = await tx.getById(id, true);
                if (!current) throw new AttendanceError(404, "Attendance record not found.");
                if (String(current.date).slice(0, 10) !== String(initialRecord.date).slice(0, 10) ||
                    String(current.employee_id) !== String(initialRecord.employee_id)) {
                    throw new AttendanceError(409, "Attendance changed. Refresh the register and try again.");
                }
                if (current.employee_id == null || !employees.length) {
                    throw new AttendanceError(409, "This historical attendance cannot be checked in or out.");
                }
                if (current[field]) {
                    throw new AttendanceError(409, `${field === "check_in" ? "Check-in" : "Check-out"} has already been recorded.`);
                }
                await tx.updateTime(id, field, time);
                await tx.audit(
                    id,
                    `${field}_recorded`,
                    actor,
                    {
                        employee_id: current.employee_id,
                        date: String(current.date).slice(0, 10),
                        check_in: current.check_in,
                        check_out: current.check_out,
                        status: current.status,
                        notes: current.notes
                    },
                    {
                        employee_id: current.employee_id,
                        date: String(current.date).slice(0, 10),
                        check_in: field === "check_in" ? time : current.check_in,
                        check_out: field === "check_out" ? time : current.check_out,
                        status: current.status,
                        notes: current.notes
                    }
                );
                return { ...current, [field]: time };
            });
        },
        async correctAttendance(id, date, entry, actor) {
            return inTransaction(pool, async (connection) => {
                const tx = txRepository(connection);
                const snapshot = await tx.getById(id);
                if (!snapshot) throw new AttendanceError(404, "Attendance record not found.");
                const employeeIds = [snapshot.employee_id, entry.employee_id]
                    .filter((employeeId) => employeeId != null)
                    .map(Number)
                    .sort((a, b) => a - b);
                const uniqueIds = [...new Set(employeeIds)];
                const employees = await tx.lockEmployees(uniqueIds);
                if (!employees.some((employee) => Number(employee.id) === entry.employee_id)) {
                    throw new AttendanceError(400, "Selected employee does not exist.");
                }
                const current = await tx.getById(id, true);
                if (!current) throw new AttendanceError(404, "Attendance record not found.");
                if (String(current.employee_id) !== String(snapshot.employee_id) ||
                    String(current.date).slice(0, 10) !== String(snapshot.date).slice(0, 10)) {
                    throw new AttendanceError(409, "Attendance changed. Refresh and retry the correction.");
                }
                await tx.lockEmployees([entry.employee_id]);
                const duplicate = await tx.findByEmployeeDate(entry.employee_id, date);
                if (duplicate && Number(duplicate.id) !== id) {
                    throw new AttendanceError(409, "Attendance is already recorded for this employee and date.");
                }
                const before = {
                    employee_id: current.employee_id,
                    date: String(current.date).slice(0, 10),
                    check_in: current.check_in,
                    check_out: current.check_out,
                    status: current.status,
                    notes: current.notes
                };
                const after = { ...entry, date };
                await tx.update(id, date, entry);
                await tx.audit(id, "corrected", actor, before, after);
                return { ...current, ...after };
            });
        },
        async deleteAttendance(id, actor) {
            return inTransaction(pool, async (connection) => {
                const tx = txRepository(connection);
                const current = await tx.getById(id);
                if (!current) throw new AttendanceError(404, "Attendance record not found.");
                if (current.employee_id != null) {
                    await tx.lockEmployees([Number(current.employee_id)]);
                }
                const locked = await tx.getById(id, true);
                if (!locked) throw new AttendanceError(404, "Attendance record not found.");
                await tx.audit(id, "deleted", actor, {
                    employee_id: locked.employee_id,
                    date: String(locked.date).slice(0, 10),
                    check_in: locked.check_in,
                    check_out: locked.check_out,
                    status: locked.status,
                    notes: locked.notes
                }, null);
                await tx.delete(id);
            });
        }
    };
}

module.exports = {
    ATTENDANCE_TIME_ZONE,
    AttendanceError,
    calculateWorkingMinutes,
    createAttendanceRouter,
    createMySqlAttendanceRepository,
    deriveStatus,
    getDateInTimeZone,
    getTimeInTimeZone,
    isValidDate,
    isValidTime,
    validateAttendanceEntry,
    validateSettingsPayload
};
