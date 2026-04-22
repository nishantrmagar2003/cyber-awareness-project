require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { testConnection } = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const incidentRoutes = require("./src/routes/incidentRoutes");
const moduleRoutes = require("./src/routes/moduleRoutes");
const organizationRoutes = require("./src/routes/organizationRoutes");
const quizRoutes = require("./src/routes/quizRoutes");
const videoRoutes = require("./src/routes/videoRoutes");
const simulationRoutes = require("./src/routes/simulationRoutes");
const topicRoutes = require("./src/routes/topicRoutes");
const progressRoutes = require("./src/routes/progressRoutes");
const rewardRoutes = require("./src/routes/rewardRoutes");
const certificateRoutes = require("./src/routes/certificateRoutes");
const organizationBadgeRoutes = require("./src/routes/organizationBadgeRoutes");
const systemSettingsRoutes = require("./src/routes/systemSettingsRoutes");

const { verifyToken } = require("./src/middleware/authMiddleware");
const { requireRole } = require("./src/middleware/roleMiddleware");

const app = express();

/* =========================
   🔥 FINAL CORRECT CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS BLOCKED:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES
========================= */

app.use("/videos", express.static(path.join(__dirname, "uploads/videos")));

/* =========================
   LOGGER
========================= */

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/org-badges", organizationBadgeRoutes);
app.use("/api/system-settings", systemSettingsRoutes);

// video routes
app.use("/api", videoRoutes);

// simulation routes
app.use("/api/simulations", simulationRoutes);

// reward + certificate routes
app.use("/api/rewards", rewardRoutes);
app.use("/api/certificates", certificateRoutes);

/* =========================
   TEST ROUTES
========================= */

app.get("/", (req, res) => {
  res.send("Cyber Awareness Backend Working ✅");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    await testConnection();
    res.json({ status: "Database connected ✅" });
  } catch (err) {
    res.status(500).json({
      error: "DB connection failed",
      details: err.message,
    });
  }
});

app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected route working 🔐",
    user: req.user,
  });
});

app.get("/admin-only", verifyToken, requireRole("superadmin"), (req, res) => {
  res.json({
    message: "Welcome Superadmin 👑",
    user: req.user,
  });
});

/* =========================
   ERROR HANDLING
========================= */

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: err.message });
  }

  return res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log("=====================================");
  console.log("🚀 Cyber Awareness Platform Started");
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log("=====================================");
});