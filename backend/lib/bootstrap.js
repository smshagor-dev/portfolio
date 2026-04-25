const mysql = require("mysql2/promise");
const { getDbConfig } = require("./config");

async function ensureDatabaseExists() {
  const db = getDbConfig();
  let connection;

  try {
    connection = await mysql.createConnection({
      host: db.host,
      port: db.port,
      user: db.user,
      password: db.password,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
  } catch (error) {
    throw new Error(
      `Unable to connect to MySQL with ${db.user}@${db.host}:${db.port}. Update DB_USER/DB_PASSWORD in .env if your local MySQL root account needs a password.`,
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = {
  ensureDatabaseExists,
};
