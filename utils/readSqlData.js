const mysql = require("mysql2/promise");
const { Connector } = require("@google-cloud/cloud-sql-connector");
const asyncHandler = require("express-async-handler");

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
    const columns = ["yoruba"];

    // Query to select all fields from the specified table
    // const [table] = await pool.query(
    //   `SELECT english,yoruba,hausa  FROM ${tableName}`
    // );
    const [table] = await pool.query(`SELECT *  FROM ${tableName}`);
    // const [table] = await pool.query(
    //   `SELECT *  FROM ${tableName} WHERE file_id = "file_003"`
    // );

    // const [table] = await pool.query(
    //   `UPDATE ${tableName} SET english= "You are welcome."  WHERE english = "Thank you"`
    // );
    console.table(table); // prints returned time value from server

    await pool.end();
    connector.close();

    res.status(200).json({ message: "Read SQL Successfully." });
  } catch (error) {
    console.log("ERROR -->", error);

    res.status(500).json({ message: "Internal Server Error." });
  }
});

module.exports = { getDataBaseTable };
