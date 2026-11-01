const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const useSSL =
  String(process.env.DB_SSL || "").toLowerCase() === "true";

const caPath =
  process.env.DB_CA_PATH ||
  path.join(__dirname, "certs", "ca.pem");

let ssl;

if (useSSL) {
  if (!fs.existsSync(caPath)) {
    throw new Error(`CA certificate not found: ${caPath}`);
  }

  ssl = {
    ca: fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  };
}

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "office_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  ...(ssl ? { ssl } : {}),
};

console.log("DB CONFIG:", {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
  ssl: useSSL,
  passwordSet: Boolean(config.password),
});

const pool = mysql.createPool(config);

pool.query("SELECT 1 AS database_test", (err) => {
  if (err) {
    console.error(
      "MySQL connection error:",
      err.code || "DB_ERROR",
      err.message
    );
  } else {
    console.log("MySQL Connected Successfully!");
  }
});

module.exports = pool;