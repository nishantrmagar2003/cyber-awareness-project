const { pool } = require("../config/db");

// =========================
// GET PROJECTS
// =========================
exports.getOrgProjects = async (req, res) => {
  try {
    const scope = req.orgScope;

    if (scope.mode === "all") {
      const [rows] = await pool.query(
        "SELECT * FROM projects ORDER BY id DESC"
      );
      return res.json(rows);
    }

    const [rows] = await pool.query(
      "SELECT * FROM projects WHERE organization_id = ? ORDER BY id DESC",
      [scope.organization_id]
    );

    res.json(rows);

  } catch (err) {
    console.error("GET PROJECT ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =========================
// CREATE PROJECT
// =========================
exports.createProject = async (req, res) => {
  try {
    const user = req.user;
    const scope = req.orgScope;
    const { name, organization_id } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Project name required" });
    }

    let orgId;

    if (user.role === "superadmin") {
      if (!organization_id) {
        return res.status(400).json({ error: "organization_id required" });
      }
      orgId = organization_id;
    } else {
      orgId = scope.organization_id;
    }

    const [result] = await pool.query(
      "INSERT INTO projects (name, organization_id) VALUES (?, ?)",
      [name.trim(), orgId]
    );

    res.status(201).json({
      message: "Project created successfully",
      project: {
        id: result.insertId,
        name: name.trim(),
        organization_id: orgId
      }
    });

  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =========================
// UPDATE PROJECT
// =========================
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Project name required" });
    }

    await pool.query(
      "UPDATE projects SET name = ? WHERE id = ?",
      [name.trim(), id]
    );

    res.json({ message: "Project updated successfully" });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =========================
// DELETE PROJECT
// =========================
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM projects WHERE id = ?",
      [id]
    );

    res.json({ message: "Project deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};