const mysql = require("mysql2/promise");
const { Connector } = require("@google-cloud/cloud-sql-connector");
const { GoogleAuth } = require("google-auth-library");
const asyncHandler = require("express-async-handler");
const path = require("path");

const keyFilePath = process.env.PATH_TO_SQL_SERVICE_KEY;

process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath;

const getDataBaseTable = asyncHandler(async (req, res) => {
  try {
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
      type: "PUBLIC",
    });

    const pool = await mysql.createPool({
      ...clientOpts,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const conn = await pool.getConnection();

    const [result] = await conn.query(`SELECT NOW();`);
    // Define the table name
    const tableName = "translations"; // Replace with your actual table name

    // Query to select all fields from the specified table
    const [rows] = await pool.query(`SELECT * FROM ??`, [tableName]);
    console.table(rows); // prints returned time value from server

    await pool.end();
    connector.close();

    res.status(200).json({ message: "Read SQL Successfully." });
  } catch (error) {
    console.log("ERROR -->", error);

    res.status(500).json({ message: "Internal Server Error." });
  }
});

module.exports = { getDataBaseTable };
