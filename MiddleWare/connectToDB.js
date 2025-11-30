// db.js
const sql = require("mssql");
require('dotenv').config();
const config = {
  user: process.env.user_DB, // your login
  password: process.env.password_DB, // your password
  server: "ES1AM-NAJM", // default instance
  database: "Restaurant", // your database
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
}

module.exports = { sql, connectDB };
