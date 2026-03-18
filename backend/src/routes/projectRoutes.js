const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { attachOrgScope, requireResourceOrg } = require("../middleware/orgMiddleware");
const projectController = require("../controllers/projectController");

// GET
router.get(
  "/org-projects",
  verifyToken,
  attachOrgScope,
  projectController.getOrgProjects
);

// CREATE
router.post(
  "/org-projects",
  verifyToken,
  attachOrgScope,
  projectController.createProject
);

// UPDATE
router.put(
  "/org-projects/:id",
  verifyToken,
  attachOrgScope,
  requireResourceOrg("projects"),
  projectController.updateProject
);

// DELETE
router.delete(
  "/org-projects/:id",
  verifyToken,
  attachOrgScope,
  requireResourceOrg("projects"),
  projectController.deleteProject
);

module.exports = router;