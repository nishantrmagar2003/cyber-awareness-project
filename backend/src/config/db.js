require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000
});

// TEST CONNECTION PROPERLY
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ DB Connected");
    connection.release();
    return true;
  } catch (err) {
    console.error("❌ DB ERROR:", err);
    throw err;
  }
}

module.exports = { pool, testConnection };
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);