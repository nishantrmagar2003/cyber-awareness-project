const { pool } = require("../config/db");

/* ===============================
   CREATE MODULE
================================ */
const createModule = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, level = "basic", is_public = true } = req.body;

    if (!title) return res.status(400).json({ error: "title is required" });

    const allowedLevels = ["basic", "intermediate", "advanced"];
    const finalLevel = allowedLevels.includes(level) ? level : "basic";

    const [result] = await pool.query(
      `INSERT INTO modules (title, description, level, is_public, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, finalLevel, !!is_public, user.id]
    );

    return res.status(201).json({
      message: "Module created",
      module_id: result.insertId
    });
  } catch (err) {
    console.error("CREATE MODULE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   GET ALL MODULES
================================ */
const getModules = async (req, res) => {
  try {

    const [modules] = await pool.query(`
      SELECT id, title, description
      FROM modules
      ORDER BY id ASC
    `);

    const [topics] = await pool.query(`
      SELECT id, module_id, title
      FROM topics
      ORDER BY module_id ASC, sort_order ASC
    `);

    const moduleMap = {};

    modules.forEach(m => {
      moduleMap[m.id] = {
        id: m.id,
        title: m.title,
        description: m.description,
        topics: []
      };
    });

    topics.forEach(t => {
      if (moduleMap[t.module_id]) {
        moduleMap[t.module_id].topics.push({
          id: t.id,
          title: t.title
        });
      }
    });

    const result = Object.values(moduleMap);

    res.json(result);

  } catch (err) {
    console.error("GET MODULES ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   GET MODULE BY ID
================================ */
const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM modules WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Module not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("GET MODULE BY ID ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   UPDATE MODULE
================================ */
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level, is_public } = req.body;

    await pool.query(
      `UPDATE modules 
       SET title = ?, description = ?, level = ?, is_public = ?
       WHERE id = ?`,
      [title, description, level, !!is_public, id]
    );

    return res.json({ message: "Module updated" });
  } catch (err) {
    console.error("UPDATE MODULE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   DELETE MODULE
================================ */
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM modules WHERE id = ?`, [id]);

    return res.json({ message: "Module deleted" });
  } catch (err) {
    console.error("DELETE MODULE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   CREATE TOPIC
================================ */
const createTopic = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, sort_order = 1, video_url } = req.body;

    if (!title) return res.status(400).json({ error: "title is required" });

    const [result] = await pool.query(
      `INSERT INTO topics (module_id, title, description, sort_order, video_url)
       VALUES (?, ?, ?, ?, ?)`,
      [moduleId, title, description || null, sort_order, video_url || null]
    );

    return res.status(201).json({
      message: "Topic created",
      topic_id: result.insertId
    });
  } catch (err) {
    console.error("CREATE TOPIC ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   GET TOPICS BY MODULE
================================ */
const getTopicsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM topics WHERE module_id = ? ORDER BY sort_order ASC`,
      [moduleId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET TOPICS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   CREATE RESOURCE
================================ */
const createResource = async (req, res) => {
  try {
    const { module_id, topic_id, title, resource_type, url, is_public = true } = req.body;

    const [result] = await pool.query(
      `INSERT INTO resources (module_id, topic_id, title, resource_type, url, is_public)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [module_id || null, topic_id || null, title, resource_type, url, !!is_public]
    );

    return res.status(201).json({
      message: "Resource created",
      resource_id: result.insertId
    });
  } catch (err) {
    console.error("CREATE RESOURCE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   GET RESOURCES
================================ */
const getResources = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM resources ORDER BY id DESC`);
    return res.json(rows);
  } catch (err) {
    console.error("GET RESOURCES ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   TOPIC PROGRESS (Dashboard)
================================ */
const getTopicProgress = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS totalTopics FROM topics`
    );

    return res.json({
      total: rows[0].totalTopics || 0
    });
  } catch (err) {
    console.error("GET TOPIC PROGRESS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  createTopic,
  getTopicsByModule,
  createResource,
  getResources,
  getTopicProgress
};