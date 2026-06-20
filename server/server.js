const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/scriptigo";

async function initializeDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database: ✅ MongoDB Connected Safely via Mongoose");
  } catch (error) {
    console.error("Database: ❌ Connection Error:\n", error);
    process.exit(1);
  }
}

// ==========================================
// MONGOOSE SCHEMAS & MODELS DEFINITIONS
// ==========================================

const TagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    color: { type: String, default: "#FFD700" },
  },
  { timestamps: true },
);
const Tag = mongoose.model("Tag", TagSchema);

const GenreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);
const Genre = mongoose.model("Genre", GenreSchema);

const StorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    genres: [{ type: String, required: true }],
    tags: [{ type: String }],
    characters: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        name: { type: String, required: true, trim: true },
        age: { type: Number, min: 0 },
        role: { type: String, required: true, trim: true },
        isStarring: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);
const Story = mongoose.model("Story", StorySchema);

// Fixed Schema definition cleanly to avoid mutation errors
const ScriptLineSchema = new mongoose.Schema(
  {
    story_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    order_id: { type: Number, required: true },
    type: { type: String, enum: ["scene", "speaking"], required: true },
    speaker_name: { type: String, default: null },
    emotion: { type: String, default: null },
    action: { type: String, default: null },
    vocal: { type: String, required: true },
    is_hidden: { type: Boolean, default: false },
    is_important: { type: Boolean, default: false },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true },
);
const Script = mongoose.model("Script", ScriptLineSchema);

const ExportSchema = new mongoose.Schema(
  {
    story_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    file_name: { type: String, required: true },
    format: { type: String, enum: ["pdf", "txt", "json"], default: "pdf" },
    status: {
      type: String,
      enum: ["generated", "downloaded"],
      default: "generated",
    },
  },
  { timestamps: true },
);
const Export = mongoose.model("Export", ExportSchema);

const ScriptVersionSchema = new mongoose.Schema(
  {
    story_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    version_name: { type: String, required: true },
    script_data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);
const ScriptVersion = mongoose.model("ScriptVersion", ScriptVersionSchema);

// ==========================================
// TAGS MANAGEMENT ROUTES 🏷️
// ==========================================

app.post("/api/tags", async (req, res) => {
  const { name, color } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ status: "error", message: "Tag name is required" });

  try {
    const newTag = new Tag({ name: name.trim(), color: color || "#FFD700" });
    await newTag.save();
    return res.status(201).json({ status: "success", id: newTag._id });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ status: "error", message: "Tag name already exists" });
    res
      .status(500)
      .json({ status: "error", message: "Database creation failed" });
  }
});

app.get("/api/tags", async (req, res) => {
  try {
    const rows = await Tag.find().sort({ name: 1 });
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch tags" });
  }
});

app.post("/api/scripts/:id/tags", async (req, res) => {
  const script_id = req.params.id;
  const { tag_ids } = req.body;

  if (!Array.isArray(tag_ids))
    return res
      .status(400)
      .json({ status: "error", message: "Tag IDs must be an array" });

  try {
    const updatedLine = await Script.findByIdAndUpdate(
      script_id,
      { tags: tag_ids },
      { new: true },
    );
    if (!updatedLine)
      return res
        .status(404)
        .json({ status: "error", message: "Script line not found" });
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

  try {
    const result = await Tag.findByIdAndUpdate(
      id,
      { name: name.trim(), color: color || "#FFD700" },
      { new: true },
    );
    if (!result)
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
  }
});

app.delete("/api/tags/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Tag.findByIdAndDelete(id);
    if (!result)
      return res
        .status(404)
        .json({ status: "error", message: "Tag not found" });
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

  try {
    const newGenre = new Genre({ name: name.trim() });
    await newGenre.save();
    res.status(201).json({
      status: "success",
      message: "Genre created successfully",
      id: newGenre._id,
    });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ status: "error", message: "Genre already exists" });
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.get("/api/genres", async (req, res) => {
  try {
    const rows = await Genre.find().sort({ name: 1 });
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

  try {
    const result = await Genre.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true },
    );
    if (!result)
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
  try {
    const result = await Genre.findByIdAndDelete(id);
    if (!result)
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
      message: "Title and valid Genre array are required",
    });

  try {
    const newStory = new Story({ title: title.trim(), genres });
    await newStory.save();
    res.status(201).json({
      status: "success",
      message: "Story created successfully",
      id: newStory._id,
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
  try {
    const story = await Story.findById(id);
    if (!story)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });
    res.status(200).json({ status: "success", data: story });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch story" });
  }
});

app.get("/api/stories", async (req, res) => {
  try {
    const rows = await Story.find().sort({ createdAt: -1 });
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

  try {
    const result = await Story.findByIdAndUpdate(
      id,
      { title: title.trim(), genres },
      { new: true },
    );
    if (!result)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });
    res.status(200).json({
      status: "success",
      message: "Story updated successfully",
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database update failed" });
  }
});

app.delete("/api/stories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Story.findByIdAndDelete(id);
    if (!result)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });

    await Script.deleteMany({ story_id: id });
    await ScriptVersion.deleteMany({ story_id: id });
    await Export.deleteMany({ story_id: id });

    return res.status(200).json({
      status: "success",
      message: "Story and related assets deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Could not delete story" });
  }
});

// ==========================================
// STORY TAGS MANAGEMENT ROUTES
// ==========================================

app.post("/api/stories/:id/tags", async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  if (!tag)
    return res
      .status(400)
      .json({ status: "error", message: "Tag name is required" });

  try {
    const story = await Story.findById(id);
    if (!story)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });

    // Check if tag already exists in story
    if (story.tags.includes(tag)) {
      return res.status(409).json({
        status: "error",
        message: "Tag already assigned to this story",
      });
    }

    story.tags.push(tag);
    await story.save();
    res
      .status(200)
      .json({ status: "success", message: "Tag added to story successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to add tag to story" });
  }
});

app.delete("/api/stories/:id/tags/:tagName", async (req, res) => {
  const { id, tagName } = req.params;

  try {
    const story = await Story.findById(id);
    if (!story)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });

    story.tags = story.tags.filter((t) => t !== tagName);
    await story.save();
    res.status(200).json({
      status: "success",
      message: "Tag removed from story successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to remove tag from story" });
  }
});

// ==========================================
// STORY GENRES MANAGEMENT ROUTES (Additional)
// ==========================================

app.post("/api/stories/:id/genres", async (req, res) => {
  const { id } = req.params;
  const { genre } = req.body;
  if (!genre)
    return res
      .status(400)
      .json({ status: "error", message: "Genre name is required" });

  try {
    const story = await Story.findById(id);
    if (!story)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });

    // Check if genre already exists in story
    if (story.genres.includes(genre)) {
      return res.status(409).json({
        status: "error",
        message: "Genre already assigned to this story",
      });
    }

    story.genres.push(genre);
    await story.save();
    res.status(200).json({
      status: "success",
      message: "Genre added to story successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to add genre to story" });
  }
});

app.delete("/api/stories/:id/genres/:genreName", async (req, res) => {
  const { id, genreName } = req.params;

  try {
    const story = await Story.findById(id);
    if (!story)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });

    story.genres = story.genres.filter((g) => g !== genreName);
    await story.save();
    res.status(200).json({
      status: "success",
      message: "Genre removed from story successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to remove genre from story" });
  }
});

// ==========================================
// STORY GENRES MANAGEMENT ROUTES (Additional)
// ==========================================
app.post("/api/stories/:id/characters", async (req, res) => {
  const { id } = req.params;
  const { character } = req.body;
  if (!character)
    return res
      .status(400)
      .json({ status: "error", message: "Character details are required" });
  try {
    const story = await Story.findById(id);
    if (!story)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });
    if (story.characters.includes(character)) {
      return res.status(409).json({
        status: "error",
        message: "Character already assigned to this story",
      });
    }
    story.characters.push(character);
    await story.save();
    res.status(200).json({
      status: "success",
      message: "Character added to story successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to add character to story" });
  }
});

app.delete("/api/stories/:id/genres/:character", async (req, res) => {
  const { id, character } = req.params;
  try {
    const story = await Story.findById(id);
    if (!story)
      return res
        .status(404)
        .json({ status: "error", message: "Story not found" });

    story.genres = story.characters.filter((c) => c !== character);
    await story.save();
    res.status(200).json({
      status: "success",
      message: "Character removed from story successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to remove character from story",
      });
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

  try {
    const newLine = new Script({
      story_id,
      order_id,
      type,
      speaker_name,
      emotion,
      action,
      vocal,
      is_important: is_important || false,
    });
    await newLine.save();
    res.status(201).json({ status: "success", id: newLine._id });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to add script line" });
  }
});

app.get("/api/stories/:story_id/scripts", async (req, res) => {
  const { story_id } = req.params;
  const { include_hidden } = req.query;

  try {
    let filters = { story_id: story_id };
    if (include_hidden !== "true") filters.is_hidden = false;

    const rows = await Script.find(filters)
      .populate("tags")
      .sort({ order_id: 1 });
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error compiling script elements mapping",
    });
  }
});

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

  try {
    const result = await Script.findByIdAndUpdate(
      id,
      {
        order_id,
        speaker_name,
        emotion,
        action,
        vocal,
        is_hidden,
        is_important,
      },
      { new: true },
    );

    if (!result)
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
  try {
    const result = await Script.findByIdAndDelete(id);
    if (!result)
      return res
        .status(404)
        .json({ status: "error", message: "Line not found" });
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

  try {
    const newExport = new Export({
      story_id,
      file_name,
      format: format || "pdf",
    });
    await newExport.save();
    res.status(201).json({
      status: "success",
      message: "Export history recorded",
      export_id: newExport._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to log export history" });
  }
});

app.get("/api/stories/:story_id/exports", async (req, res) => {
  const { story_id } = req.params;
  try {
    const rows = await Export.find({ story_id }).sort({ createdAt: -1 });
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
    return res
      .status(400)
      .json({ status: "error", message: "Valid new file name required" });

  try {
    const currentExport = await Export.findById(id);
    if (!currentExport)
      return res
        .status(404)
        .json({ status: "error", message: "Export record not found" });

    let sanitizedName = new_file_name.trim();
    let ext = `.${currentExport.format}`;
    if (!sanitizedName.toLowerCase().endsWith(ext)) sanitizedName += ext;

    const result = await Export.findByIdAndUpdate(
      id,
      { file_name: sanitizedName },
      { new: true },
    );
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

app.post("/api/stories/:story_id/versions", async (req, res) => {
  const { story_id } = req.params;
  const { version_name, script_data } = req.body;

  if (!version_name || !script_data)
    return res.status(400).json({
      status: "error",
      message: "Required dataset properties missing",
    });

  try {
    const newVersion = new ScriptVersion({
      story_id,
      version_name: version_name.trim(),
      script_data,
    });
    await newVersion.save();
    res.status(201).json({
      status: "success",
      version_id: newVersion._id,
      message: "Script version snapshot archived safely! 🛡️",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Snapshot archiving sequence failed" });
  }
});

app.get("/api/stories/:story_id/versions", async (req, res) => {
  const { story_id } = req.params;
  try {
    const rows = await ScriptVersion.find(
      { story_id },
      "version_name createdAt",
    ).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to load story snapshots" });
  }
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================

const PORT = process.env.PORT || 5000;

async function StartServer() {
  await initializeDatabase();
  const server = app.listen(PORT, () => {
    console.log("Server: ✅ Running on port", PORT);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Server: ❌ Port ${PORT} is already in use.`);
    } else {
      console.error("Server: ❌ Critical Error:\n", error);
    }
    process.exit(1);
  });
}

StartServer();
