const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "scriptigo",
};

let database;

async function initializeDatabase() {
  try {
    const temporaryDatabase = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    await temporaryDatabase.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`
    );
    await temporaryDatabase.end();
    database = await mysql.createPool(dbConfig);
    console.log("Database: ✅ Connected");
    await database.query(`
      CREATE TABLE IF NOT EXISTS genres (
        genre_id INT AUTO_INCREMENT PRIMARY KEY,
        genre_name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS \`stories\` (
        id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        title VARCHAR(225) NOT NULL,
        genres JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log(`Database: Connected to ${dbConfig.database}`);
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Genres Table: Created`);
    console.log(`Stories Table: Created`);
    console.log("Database: ✅ Ready");
  } catch (error) {
    console.log("Database: ❌ Not connected");
    console.log("Database: Connection Error:\n", error);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

async function StartServer() {
  await initializeDatabase();
  app.listen(PORT, async () => {
    try {
      console.log("Server: ✅ Running on port", PORT);
    } catch (error) {
      console.log("Server: Connection Error:\n", error);
    }
  });
}

StartServer();