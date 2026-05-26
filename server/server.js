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
      password: dbConfig.password,
    });

    await temporaryDatabase.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`,
    );
    await temporaryDatabase.end();

    database = await mysql.createPool({
      ...dbConfig,
      multipleStatements: true, // Multi query execution patterns support tracking
    });
    console.log("Database: ✅ Connected");

    // Table Creation Trackers
    let genresCreated = false;
    let storiesCreated = false;
    let scriptsCreated = false;
    let tagsCreated = false;
    let scriptTagsCreated = false;
    let versionsCreated = false;

    // 1. Genres Table
    try {
      await database.query(`
        CREATE TABLE IF NOT EXISTS genres (
          genre_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      genresCreated = true;
      console.log(`Genres Table: ✅ Verified/Created`);
    } catch (e) {
      console.log(`Genres Table: ❌ Failed to create`);
    }

    // 2. Stories Table
    try {
      await database.query(`
        CREATE TABLE IF NOT EXISTS \`stories\` (
          id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
          title VARCHAR(225) NOT NULL,
          genres JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      storiesCreated = true;
      console.log(`Stories Table: ✅ Verified/Created`);
    } catch (e) {
      console.log(`Stories Table: ❌ Failed to create`);
    }

    // 3. Tags Table 🏷️
    try {
      await database.query(`
        CREATE TABLE IF NOT EXISTS tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          color VARCHAR(20) DEFAULT '#FFD700',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      tagsCreated = true;
      console.log(`Tags Master Table: ✅ Verified/Created`);
    } catch (e) {
      console.log(`Tags Table: ❌ Failed to create`);
    }

    // 4. Scripts Table (Depends on Stories) 📜
    if (storiesCreated) {
      try {
        await database.query(`
          CREATE TABLE IF NOT EXISTS \`scripts\` (
            id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            story_id INT NOT NULL,
            order_id INT NOT NULL,
            type ENUM('scene', 'speaking') NOT NULL,
            speaker_name VARCHAR(255),
            emotion VARCHAR(255),
            action VARCHAR(255),
            vocal TEXT NOT NULL,
            is_hidden TINYINT(1) DEFAULT 0,
            is_important TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES \`stories\`(id) ON DELETE CASCADE
          );
        `);
        scriptsCreated = true;
        console.log(`Scripts Table: ✅ Verified/Created`);
      } catch (e) {
        console.log(`Scripts Table: ❌ Failed to create (Logic Error)`);
      }
    }

    // 5. Script Tags Junction Table (Depends on Scripts & Tags) 🔗
    if (scriptsCreated && tagsCreated) {
      try {
        await database.query(`
          CREATE TABLE IF NOT EXISTS script_tags (
            id INT NOT NULL,
            tag_id INT NOT NULL,
            PRIMARY KEY (id, tag_id),
            FOREIGN KEY (id) REFERENCES scripts(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
          );
        `);
        scriptTagsCreated = true;
        console.log(`Script-Tags Bridge Table: ✅ Verified/Created`);
      } catch (e) {
        console.log(`Script-Tags Bridge Table: ❌ Failed to create`);
      }
    }

    // 6. Script Versions Snapshot Table (Depends on Stories) 🛡️
    if (storiesCreated) {
      try {
        await database.query(`
          CREATE TABLE IF NOT EXISTS script_versions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            story_id INT NOT NULL,
            version_name VARCHAR(100) NOT NULL,
            script_data LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`script_data\`)),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
          );
        `);
        versionsCreated = true;
        console.log(`Script Versions Table: ✅ Verified/Created`);
      } catch (e) {
        console.log(`Script Versions Table: ❌ Failed to create`);
      }
    }

    // Final Confirmation Logic
    if (
      genresCreated &&
      storiesCreated &&
      scriptsCreated &&
      tagsCreated &&
      scriptTagsCreated &&
      versionsCreated
    ) {
      console.log(`Database: 🚀 Full Setup Ready for ${dbConfig.database}`);
    } else {
      console.log(`Database: ⚠️ Partial Setup - Check table dependencies!`);
    }
  } catch (error) {
    console.log("Database: ❌ Connection Error:\n", error);
    process.exit(1);
  }
}

// ==========================================
// TAGS MANAGEMENT ROUTES 🏷️
// ==========================================

// 1. Create Tag
app.post("/api/tags", async (req, res) => {
  const { name, color } = req.body;
  if (!name || !color) {
    return res
      .status(400)
      .json({ status: "error", message: "Tag name and color are required" });
  }

  const query = `INSERT INTO tags (name, color) VALUES (?, ?)`;
  try {
    const [result] = await database.query(query, [
      name.trim(),
      color || "#FFD700",
    ]);
    return res.status(201).json({ status: "success", id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ status: "error", message: "Tag name already exists" });
    }
    res
      .status(500)
      .json({ status: "error", message: "Database creation failed" });
  }
});

// 2. Fetch All Tags
app.get("/api/tags", async (req, res) => {
  try {
    const [rows] = await database.query(`SELECT * FROM tags ORDER BY name ASC`);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch tags" });
  }
});

// 3. Link Multiple Tags to Script Line 🔗
app.post("/api/scripts/:id/tags", async (req, res) => {
  const script_id = req.params.id;
  const { tag_ids } = req.body; // Array expected: [1, 2, 4]

  if (!Array.isArray(tag_ids)) {
    return res.status(400).json({
      status: "error",
      message: "Tag IDs must be an array formatted entity",
    });
  }

  try {
    // Drop execution to rebuild links data parameters sequence
    await database.query(`DELETE FROM script_tags WHERE id = ?`, [script_id]);

    if (tag_ids.length > 0) {
      const values = tag_ids.map((tag_id) => [script_id, tag_id]);
      await database.query(`INSERT INTO script_tags (id, tag_id) VALUES ?`, [
        values,
      ]);
    }

    res
      .status(200)
      .json({ status: "success", message: "Script line linked tags updated" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Link compilation parameters alignment failed",
    });
  }
});

app.put("/api/tags/:id", async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ status: "error", message: "New tag name is required" });
  const query = `UPDATE tags SET name = ?, color = ? WHERE id = ?`;
  try {
    const [result] = await database.query(query, [
      name,
      color || "#FFD700",
      id,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Tag not found" });
    res
      .status(200)
      .json({ status: "success", message: "Tag updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database update failed" });
    console.error(error);
  }
});

app.delete("/api/tag/:id", async (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM tags WHERE id = ?`;
  try {
    const [result] = await database.query(query, [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Genre not found" });
    res
      .status(200)
      .json({ status: "success", message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Could not delete tag" });
  }
});

// ==========================================
// GENRES ROUTES
// ==========================================
app.post("/api/genres", async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ status: "error", message: "Genre name is required" });
  const query = `INSERT INTO genres (name) VALUES (?)`;
  try {
    const [result] = await database.query(query, [name.trim()]);
    res.status(201).json({
      status: "success",
      message: "Genre created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({ status: "error", message: "Genre already exists" });
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.get("/api/genres", async (req, res) => {
  const query = `SELECT * FROM genres ORDER BY name ASC`;
  try {
    const [rows] = await database.query(query);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch genres" });
  }
});

app.put("/api/genres/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ status: "error", message: "New genre name is required" });
  const query = `UPDATE genres SET name = ? WHERE id = ?`;
  try {
    const [result] = await database.query(query, [name.trim(), id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Genre not found" });
    res
      .status(200)
      .json({ status: "success", message: "Genre updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database update failed" });
  }
});

app.delete("/api/genres/:id", async (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM genres WHERE genre_id = ?`;
  try {
    const [result] = await database.query(query, [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Genre not found" });
    res
      .status(200)
      .json({ status: "success", message: "Genre deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Could not delete genre" });
  }
});

// ==========================================
// STORIES ROUTES
// ==========================================
app.post("/api/stories", async (req, res) => {
  const { title, genres } = req.body;
  if (!title)
    return res.status(400).json({
      status: "error",
      message: "Title and a valid Genre array are required",
    });
  const query = `INSERT INTO stories (title, genres) VALUES (?, ?)`;
  try {
    const [result] = await database.query(query, [title.trim(), JSON.stringify(genres)]);
    res.status(201).json({
      status: "success",
      message: "Story created successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error during story creation",
    });
  }
});

app.get("/api/stories/:id", async (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM stories WHERE id = ? ORDER BY created_at DESC`;
  try {
    const [rows] = await database.query(query, id);
    res.status(200).json({ status: "success", data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch stories" });
  }
});

app.get("/api/stories", async (req, res) => {
  const query = `SELECT * FROM stories ORDER BY created_at DESC`;
  try {
    const [rows] = await database.query(query);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch stories" });
  }
});

app.put("/api/stories/:id", async (req, res) => {
  const { id } = req.params;
  const { title, genres } = req.body;
  if (!title || !Array.isArray(genres))
    return res.status(400).json({
      status: "error",
      message: "Valid Title and Genre array required",
    });
  const query = `UPDATE stories SET title = ?, genres = ? WHERE id = ?`;
  try {
    const [result] = await database.query(query, [
      title.trim(),
      JSON.stringify(genres),
      id,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });
    res
      .status(200)
      .json({ status: "success", message: "Story updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database update failed" });
  }
});

app.delete("/api/stories/:id", async (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM stories WHERE id = ?`;
  try {
    const [result] = await database.query(query, [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });
    return res
      .status(200)
      .json({ status: "success", message: "Story deleted successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Could not delete story" });
  }
});

// ==========================================
// SCRIPTS ROUTES 📜
// ==========================================
app.post("/api/scripts", async (req, res) => {
  const {
    story_id,
    order_id,
    type,
    speaker_name,
    emotion,
    action,
    vocal,
    is_important,
  } = req.body;
  if (!story_id || !vocal || !type)
    return res
      .status(400)
      .json({ status: "error", message: "Required fields missing" });

  const query = `
        INSERT INTO scripts (story_id, order_id, type, speaker_name, emotion, action, vocal, is_important) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
  try {
    const [result] = await database.query(query, [
      story_id,
      order_id,
      type,
      speaker_name,
      emotion,
      action,
      vocal,
      is_important || 0,
    ]);
    res.status(201).json({ status: "success", id: result.insertId });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to add script line" });
  }
});

// 2. Optimized Reading with Multiple Tags Array Aggregation 🚀
app.get("/api/stories/:story_id/scripts", async (req, res) => {
  const { story_id } = req.params;
  const { include_hidden } = req.query;

  let baseQuery = `
    SELECT s.*,
    COALESCE(
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color))
       FROM script_tags st
       JOIN tags t ON st.tag_id = t.id
       WHERE st.id = s.id), 
      JSON_ARRAY()
    ) AS tags
    FROM scripts s
    WHERE s.story_id = ?
  `;

  if (include_hidden !== "true") {
    baseQuery += ` AND s.is_hidden = 0`;
  }
  baseQuery += ` ORDER BY s.order_id ASC`;

  try {
    const [rows] = await database.query(baseQuery, [story_id]);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error compiling script tags elements context output mapping",
    });
  }
});

// 3. Script Line Updates (Includes toggling Importance status) 🌟
app.put("/api/scripts/:id", async (req, res) => {
  const { id } = req.params;
  const {
    order_id,
    speaker_name,
    emotion,
    action,
    vocal,
    is_hidden,
    is_important,
  } = req.body;

  const query = `
        UPDATE scripts 
        SET order_id = ?, speaker_name = ?, emotion = ?, action = ?, vocal = ?, is_hidden = ?, is_important = ?
        WHERE id = ?
    `;
  try {
    const [result] = await database.query(query, [
      order_id,
      speaker_name,
      emotion,
      action,
      vocal,
      is_hidden,
      is_important,
      id,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Script line not found" });
    res.status(200).json({ status: "success", message: "Script updated" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Update failed" });
  }
});

app.delete("/api/scripts/:id", async (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM scripts WHERE id = ?`;
  try {
    await database.query(query, [id]);
    res.status(200).json({ status: "success", message: "Line deleted" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Delete failed" });
  }
});

// ==========================================
// EXPORTS ROUTES
// ==========================================
app.post("/api/exports", async (req, res) => {
  const { story_id, file_name, format } = req.body;
  if (!story_id || !file_name)
    return res
      .status(400)
      .json({ status: "error", message: "Missing export details" });
  const query = `INSERT INTO exports (story_id, file_name, format) VALUES (?, ?, ?)`;
  try {
    const [result] = await database.query(query, [
      story_id,
      file_name,
      format || "pdf",
    ]);
    res.status(201).json({
      status: "success",
      message: "Export history recorded",
      export_id: result.insertId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to log export history" });
  }
});

app.get("/api/stories/:story_id/exports", async (req, res) => {
  const { story_id } = req.params;
  const query = `SELECT * FROM exports WHERE story_id = ? ORDER BY created_at DESC`;
  try {
    const [rows] = await database.query(query, [story_id]);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Could not fetch export history" });
  }
});

app.put("/api/exports/:id", async (req, res) => {
  const { id } = req.params;
  const { new_file_name } = req.body;
  if (!new_file_name || new_file_name.trim() === "")
    return res.status(400).json({
      status: "error",
      message: "A valid new file name is required for renaming",
    });

  let sanitizedName = new_file_name.trim();
  if (!sanitizedName.toLowerCase().endsWith(".pdf")) sanitizedName += ".pdf";

  const query = `UPDATE exports SET file_name = ? WHERE id = ?`;
  try {
    const [result] = await database.query(query, [sanitizedName, id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Export record not found" });
    res.status(200).json({
      status: "success",
      message: "Export renamed successfully",
      updated_name: sanitizedName,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database error during rename" });
  }
});

// ==========================================
// VERSION SNAPSHOT ROUTES 🛡️
// ==========================================

// 1. Create Script Snapshot
app.post("/api/stories/:story_id/versions", async (req, res) => {
  const { story_id } = req.params;
  const { version_name, script_data } = req.body; // script_data is expected as full scripts array object data matrix

  if (!version_name || !script_data) {
    return res.status(400).json({
      status: "error",
      message: "Version name and script snapshot datasets are required",
    });
  }

  const query = `INSERT INTO script_versions (story_id, version_name, script_data) VALUES (?, ?, ?)`;
  try {
    const [result] = await database.query(query, [
      story_id,
      version_name.trim(),
      JSON.stringify(script_data),
    ]);
    res.status(201).json({
      status: "success",
      version_id: result.insertId,
      message: "Script version snapshot archived safely! 🛡️",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Snapshot archiving sequence failed" });
  }
});

// 2. Fetch Archived Snapshots for a Story
app.get("/api/stories/:story_id/versions", async (req, res) => {
  const { story_id } = req.params;
  const query = `SELECT id, version_name, created_at FROM script_versions WHERE story_id = ? ORDER BY created_at DESC`;
  try {
    const [rows] = await database.query(query, [story_id]);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to load story snapshots" });
  }
});

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
