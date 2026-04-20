const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

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

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = buildDatabaseUrl();
}

module.exports = {
  buildDatabaseUrl,
  getDbConfig,
};
