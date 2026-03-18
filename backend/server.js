// Load environment variables FIRST (only once)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { testConnection } = require("./src/config/db");

// 🔹 ROUTES
const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const incidentRoutes = require("./src/routes/incidentRoutes");
const moduleRoutes = require("./src/routes/moduleRoutes");
const organizationRoutes = require("./src/routes/organizationRoutes");
const quizRoutes = require("./src/routes/quizRoutes"); // ✅ ADDED
const videoRoutes = require("./src/routes/videoRoutes");
const simulationRoutes = require("./src/routes/simulationRoutes");

const { verifyToken } = require("./src/middleware/authMiddleware");
const { requireRole } = require("./src/middleware/roleMiddleware");

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */

// CORS (can restrict later if needed)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  })
);

// JSON parser
app.use(express.json());

// ✅ VIDEO STATIC FOLDER
app.use("/videos", express.static(path.join(__dirname, "uploads/videos")));

// 🔥 Request logger (debug mode)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* =========================
   ROUTES
========================= */

// Auth
app.use("/api/auth", authRoutes);

// Organizations
app.use("/api/organizations", organizationRoutes);

// Projects
app.use("/api/projects", projectRoutes);

// Incidents
app.use("/api/incidents", incidentRoutes);

// Modules
app.use("/api/modules", moduleRoutes);

// Topics alias for frontend compatibility
app.use("/api/topics", moduleRoutes);

// Quizzes
app.use("/api/quizzes", quizRoutes); // ✅ QUIZ ROUTES ACTIVE

// Video
app.use("/api", videoRoutes);

// Simulation
app.use("/api", simulationRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Cyber Awareness Backend Working ✅");
});

// Health Check (Professional addition)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development"
  });
});

// DB Test
app.get("/db-test", async (req, res) => {
  try {
    await testConnection();
    res.json({ status: "Database connected ✅" });
  } catch (err) {
    res.status(500).json({
      error: "DB connection failed",
      details: err.message
    });
  }
});

// Protected test
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected route working 🔐",
    user: req.user
  });
});

// Superadmin test
app.get(
  "/admin-only",
  verifyToken,
  requireRole("superadmin"),
  (req, res) => {
    res.json({
      message: "Welcome Superadmin 👑",
      user: req.user
    });
  }
);

/* =========================
   ERROR HANDLING
========================= */

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log("=====================================");
  console.log("🚀 Cyber Awareness Platform Started");
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log("🔐 JWT_SECRET Loaded:", !!process.env.JWT_SECRET);
  console.log("=====================================");
});