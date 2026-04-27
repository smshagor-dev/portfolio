const path = require("path");
const dotenv = require("dotenv");

const backendRoot = path.resolve(__dirname, "..");
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(backendRoot, ".env"),
  path.resolve(backendRoot, ".env.local"),
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath, override: false });
}

function getDbConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "portfolio",
  };
}

function buildDatabaseUrl() {
  const db = getDbConfig();
  const user = encodeURIComponent(db.user);
  const password = encodeURIComponent(db.password);
  const auth = password ? `${user}:${password}` : `${user}:`;

  return `mysql://${auth}@${db.host}:${db.port}/${db.database}`;
}

function isMysqlDatabaseUrl(value) {
  return String(value || "").trim().toLowerCase().startsWith("mysql://");
}

const builtDatabaseUrl = buildDatabaseUrl();

if (!isMysqlDatabaseUrl(process.env.DATABASE_URL)) {
  process.env.DATABASE_URL = builtDatabaseUrl;
}

module.exports = {
  buildDatabaseUrl,
  getDbConfig,
  isMysqlDatabaseUrl,
};
