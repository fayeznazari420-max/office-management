const db = require("./db");
const { ROLE, normalizeRole } = require("./rbac");

const usernameFlag = process.argv.indexOf("--username");
const username =
    usernameFlag >= 0 ? String(process.argv[usernameFlag + 1] || "").trim() : "";

if (!username || username.startsWith("--")) {
    console.error(
        'Specify an existing account with: npm run promote:super-admin -- --username "username"'
    );
    process.exitCode = 1;
    db.end();
} else {
    db.query(
        "SELECT id, role, is_active FROM users WHERE username = ? LIMIT 1",
        [username],
        (lookupError, rows) => {
            if (lookupError) {
                console.error("Could not verify the account:", lookupError.code || "DB_ERROR");
                process.exitCode = 1;
                db.end();
                return;
            }

            if (!rows.length) {
                console.error("No account matched the specified username.");
                process.exitCode = 1;
                db.end();
                return;
            }

            const role = normalizeRole(rows[0].role);
            if (
                ![
                    ROLE.USER,
                    ROLE.ADMIN,
                    ROLE.SUPER_ADMIN
                ].includes(role)
            ) {
                console.error("Only an account with a supported role can be promoted.");
                process.exitCode = 1;
                db.end();
                return;
            }

            if (Number(rows[0].is_active) !== 1) {
                console.error("The selected account is disabled.");
                process.exitCode = 1;
                db.end();
                return;
            }

            db.query(
                "UPDATE users SET role = 'super_admin' WHERE id = ?",
                [rows[0].id],
                (updateError) => {
                    if (updateError) {
                        console.error("Could not promote the account:", updateError.code || "DB_ERROR");
                        process.exitCode = 1;
                        db.end();
                        return;
                    }

                    console.log("The selected account is now Super Admin.");
                    db.end();
                }
            );
        }
    );
}
