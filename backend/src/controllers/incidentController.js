const { pool } = require("../config/db");

/* ===============================
   CREATE INCIDENT
================================ */
const createIncident = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, severity } = req.body;

    if (!title)
      return res.status(400).json({ error: "Title is required" });

    if (!user.organization_id)
      return res.status(403).json({ error: "No organization assigned" });

    const allowedSeverities = ["low", "medium", "high"];
    const finalSeverity = allowedSeverities.includes(severity)
      ? severity
      : "low";

    const [result] = await pool.query(
      `INSERT INTO incidents 
       (organization_id, title, description, severity, reported_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.organization_id,
        title,
        description || null,
        finalSeverity,
        user.id
      ]
    );

    await pool.query(
      `INSERT INTO incident_logs 
       (incident_id, user_id, action, details)
       VALUES (?, ?, ?, ?)`,
      [result.insertId, user.id, "created", "Incident created"]
    );

    return res.status(201).json({
      message: "Incident created successfully",
      incident_id: result.insertId
    });

  } catch (err) {
    console.error("CREATE INCIDENT ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/* ===============================
   GET INCIDENTS (ORG + FILTER + PAGINATION)
================================ */
const getIncidents = async (req, res) => {
  try {
    const user = req.user;
    const { status, severity, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    let query = `SELECT * FROM incidents WHERE is_deleted = FALSE`;
    const params = [];

    // 🔐 Organization isolation
    if (user.role !== "superadmin") {
      query += ` AND organization_id = ?`;
      params.push(user.organization_id);
    }

    // 🔎 Status filter
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    // 🔎 Severity filter
    if (severity) {
      query += ` AND severity = ?`;
      params.push(severity);
    }

    query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(limitNumber, offset);

    const [rows] = await pool.query(query, params);

    return res.json({
      page: pageNumber,
      limit: limitNumber,
      results: rows.length,
      data: rows
    });

  } catch (err) {
    console.error("GET INCIDENTS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/* ===============================
   UPDATE STATUS
================================ */
const updateIncidentStatus = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!status)
      return res.status(400).json({ error: "Status is required" });

    const allowedStatuses = ["open", "investigating", "closed"];
    if (!allowedStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status value" });

    const [rows] = await pool.query(
      "SELECT * FROM incidents WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Incident not found" });

    const incident = rows[0];

    if (
      user.role !== "superadmin" &&
      incident.organization_id !== user.organization_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await pool.query(
      "UPDATE incidents SET status = ? WHERE id = ?",
      [status, id]
    );

    await pool.query(
      `INSERT INTO incident_logs
       (incident_id, user_id, action, details)
       VALUES (?, ?, ?, ?)`,
      [id, user.id, "status_updated", `Status changed to ${status}`]
    );

    return res.json({ message: "Incident status updated" });

  } catch (err) {
    console.error("UPDATE INCIDENT ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/* ===============================
   ADD NOTE (WITH ORG CHECK)
================================ */
const addIncidentNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { note } = req.body;

    if (!note)
      return res.status(400).json({ error: "Note required" });

    // ✅ Check incident exists + org isolation
    const [rows] = await pool.query(
      "SELECT organization_id FROM incidents WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Incident not found" });

    if (
      user.role !== "superadmin" &&
      rows[0].organization_id !== user.organization_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await pool.query(
      `INSERT INTO incident_notes
       (incident_id, user_id, note)
       VALUES (?, ?, ?)`,
      [id, user.id, note]
    );

    return res.status(201).json({ message: "Note added" });

  } catch (err) {
    console.error("ADD NOTE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/* ===============================
   INCIDENT DASHBOARD STATS
================================ */
const getIncidentStats = async (req, res) => {
  try {
    const user = req.user;

    let baseCondition = "WHERE is_deleted = FALSE";
    const params = [];

    if (user.role !== "superadmin") {
      baseCondition += " AND organization_id = ?";
      params.push(user.organization_id);
    }

    const [totalRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM incidents ${baseCondition}`,
      params
    );

    const [statusRows] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM incidents ${baseCondition}
       GROUP BY status`,
      params
    );

    const [severityRows] = await pool.query(
      `SELECT severity, COUNT(*) AS count
       FROM incidents ${baseCondition}
       GROUP BY severity`,
      params
    );

    const stats = {
      total: totalRows[0]?.total || 0,
      open: 0,
      investigating: 0,
      closed: 0,
      high_severity: 0,
      medium_severity: 0,
      low_severity: 0
    };

    statusRows.forEach(r => {
      stats[r.status] = r.count;
    });

    severityRows.forEach(r => {
      if (r.severity === "high") stats.high_severity = r.count;
      if (r.severity === "medium") stats.medium_severity = r.count;
      if (r.severity === "low") stats.low_severity = r.count;
    });

    return res.json(stats);

  } catch (err) {
    console.error("GET STATS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const assignIncident = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to)
      return res.status(400).json({ error: "assigned_to is required" });
    if (user.role !== "org_admin" && user.role !== "superadmin")
      return res.status(403).json({ error: "Only org admin can assign incidents" });

    const [rows] = await pool.query(
      "SELECT organization_id FROM incidents WHERE id = ? AND is_deleted = FALSE",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Incident not found" });

    if (
      user.role !== "superadmin" &&
      rows[0].organization_id !== user.organization_id
    )
      return res.status(403).json({ error: "Access denied" });

    // ✅ Check if assigned user exists
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [assigned_to]
    );

    if (userRows.length === 0)
      return res.status(404).json({ error: "Assigned user not found" });

    // ✅ THIS WAS MISSING
    await pool.query(
      "UPDATE incidents SET assigned_to = ? WHERE id = ?",
      [assigned_to, id]
    );

    await pool.query(
      `INSERT INTO incident_logs
       (incident_id, user_id, action, details)
       VALUES (?, ?, ?, ?)`,
      [id, user.id, "assigned", `Assigned to user ${assigned_to}`]
    );

    return res.json({ message: "Incident assigned successfully" });

  } catch (err) {
    console.error("ASSIGN INCIDENT ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const deleteIncident = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT organization_id FROM incidents WHERE id = ? AND is_deleted = FALSE",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Incident not found" });

    if (
      user.role !== "superadmin" &&
      rows[0].organization_id !== user.organization_id
    )
      return res.status(403).json({ error: "Access denied" });

    await pool.query(
      "UPDATE incidents SET is_deleted = TRUE WHERE id = ?",
      [id]
    );

    await pool.query(
      `INSERT INTO incident_logs
       (incident_id, user_id, action, details)
       VALUES (?, ?, ?, ?)`,
      [id, user.id, "deleted", "Incident soft deleted"]
    );

    return res.json({ message: "Incident deleted (soft)" });

  } catch (err) {
    console.error("DELETE INCIDENT ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getSingleIncident = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const [rows] = await pool.query(
  "SELECT * FROM incidents WHERE id = ? AND is_deleted = FALSE",
  [id]
);

    if (rows.length === 0)
      return res.status(404).json({ error: "Incident not found" });

    if (
      user.role !== "superadmin" &&
      rows[0].organization_id !== user.organization_id
    )
      return res.status(403).json({ error: "Access denied" });

    return res.json(rows[0]);

  } catch (err) {
    console.error("GET SINGLE INCIDENT ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const restoreIncident = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT organization_id FROM incidents WHERE id = ? AND is_deleted = TRUE",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Deleted incident not found" });

    if (
      user.role !== "superadmin" &&
      rows[0].organization_id !== user.organization_id
    )
      return res.status(403).json({ error: "Access denied" });

    await pool.query(
      "UPDATE incidents SET is_deleted = FALSE WHERE id = ?",
      [id]
    );

    return res.json({ message: "Incident restored successfully" });

  } catch (err) {
    console.error("RESTORE INCIDENT ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getIncidentLogs = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const [incidentRows] = await pool.query(
      "SELECT organization_id FROM incidents WHERE id = ?",
      [id]
    );

    if (incidentRows.length === 0)
      return res.status(404).json({ error: "Incident not found" });

    if (
      user.role !== "superadmin" &&
      incidentRows[0].organization_id !== user.organization_id
    )
      return res.status(403).json({ error: "Access denied" });

    const [logs] = await pool.query(
      "SELECT * FROM incident_logs WHERE incident_id = ? ORDER BY created_at DESC",
      [id]
    );

    return res.json(logs);

  } catch (err) {
    console.error("GET LOGS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  updateIncidentStatus,
  addIncidentNote,   // 👈 ADD THIS BACK
  getIncidentStats,
  assignIncident,
  deleteIncident,
  getSingleIncident,
  restoreIncident,
  getIncidentLogs
};