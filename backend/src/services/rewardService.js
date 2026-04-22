const { pool } = require("../config/db");

/*
==================================================
GET USER INFO
==================================================
*/
async function getUserById(studentId) {
  const [rows] = await pool.query(
    `
    SELECT id, role, organization_id, account_type
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [studentId]
  );

  return rows[0] || null;
}

/*
==================================================
AWARD BADGE SAFELY
==================================================
*/
async function awardBadge(studentId, badgeId) {
  const [existing] = await pool.query(
    `
    SELECT id
    FROM student_badges
    WHERE student_id = ? AND badge_id = ?
    LIMIT 1
    `,
    [studentId, badgeId]
  );

  if (existing.length > 0) return false;

  await pool.query(
    `
    INSERT INTO student_badges (student_id, badge_id, awarded_at)
    VALUES (?, ?, NOW())
    `,
    [studentId, badgeId]
  );

  return true;
}

/*
==================================================
AWARD CERTIFICATE SAFELY
==================================================
*/
async function awardCertificate(studentId, certificateType, referenceId) {
  const [existing] = await pool.query(
    `
    SELECT id
    FROM certificates
    WHERE student_id = ?
      AND certificate_type = ?
      AND reference_id <=> ?
    LIMIT 1
    `,
    [studentId, certificateType, referenceId]
  );

  if (existing.length > 0) return false;

  const certificateNo = `CERT-${Date.now()}-${studentId}`;

  await pool.query(
    `
    INSERT INTO certificates
      (student_id, certificate_no, file_path, certificate_type, reference_id)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      studentId,
      certificateNo,
      `/certificates/${certificateNo}.pdf`,
      certificateType,
      referenceId,
    ]
  );

  return true;
}

/*
==================================================
CHECK + AWARD TOPIC BADGE
Only after full topic completion:
video + text + quiz + sim1 + sim2 + status=completed
==================================================
*/
async function checkTopicReward(studentId, topicId) {
  const [progressRows] = await pool.query(
    `
    SELECT
      status,
      video_completed,
      text_completed,
      best_quiz_score,
      best_simulation_score,
      simulations_completed
    FROM topic_progress
    WHERE student_id = ? AND topic_id = ?
    LIMIT 1
    `,
    [studentId, topicId]
  );

  if (progressRows.length === 0) {
    return { awarded: false, reason: "Topic progress not found" };
  }

  const progress = progressRows[0];

  const fullyCompleted =
    progress.status === "completed" &&
    Number(progress.video_completed || 0) === 1 &&
    Number(progress.text_completed || 0) === 1 &&
    Number(progress.best_quiz_score || 0) >= 70 &&
    Number(progress.best_simulation_score || 0) >= 70 &&
    Number(progress.simulations_completed || 0) >= 2;

  if (!fullyCompleted) {
    return { awarded: false, reason: "Topic not fully completed yet" };
  }

  const [badgeRows] = await pool.query(
    `
    SELECT id, name, badge_type, reference_id
    FROM badges
    WHERE badge_type = 'topic'
      AND reference_id = ?
    LIMIT 1
    `,
    [topicId]
  );

  if (badgeRows.length === 0) {
    return { awarded: false, reason: "No topic badge configured" };
  }

  const badge = badgeRows[0];
  const awarded = await awardBadge(studentId, badge.id);

  if (!awarded) {
    return { awarded: false, reason: "Badge already awarded" };
  }

  return { awarded: true, badge };
}

/*
==================================================
CHECK + MARK MODULE COMPLETED
General modules:
- mark module_progress completed
- NO module badge
- NO separate certificate

Org premium modules:
- mark module_progress completed
- NO module badge
- YES separate module certificate
==================================================
*/
async function checkModuleReward(studentId, moduleId) {
  const user = await getUserById(studentId);

  if (!user) {
    return { awarded: false, reason: "User not found" };
  }

  const [moduleRows] = await pool.query(
    `
    SELECT
      m.id,
      m.is_public,
      m.audience_type,
      om.id AS org_access_id
    FROM modules m
    LEFT JOIN organization_modules om
      ON om.module_id = m.id
     AND om.organization_id = ?
    WHERE m.id = ?
    LIMIT 1
    `,
    [user.organization_id || null, moduleId]
  );

  if (moduleRows.length === 0) {
    return { awarded: false, reason: "Module not found" };
  }

  const module = moduleRows[0];

  const isGeneralModule =
    Number(module.is_public) === 1 &&
    module.audience_type === "general";

  const isOrgPremiumModule =
    Number(module.is_public) === 0 &&
    module.audience_type === "organization" &&
    !!module.org_access_id;

  if (user.role === "general_user" && !isGeneralModule) {
    return {
      awarded: false,
      reason: "General user cannot receive module reward for this module",
    };
  }

  if (user.role === "org_student" && !isGeneralModule && !isOrgPremiumModule) {
    return {
      awarded: false,
      reason: "Org student does not have access to this module",
    };
  }

  const [topicRows] = await pool.query(
    `
    SELECT id
    FROM topics
    WHERE module_id = ?
    `,
    [moduleId]
  );

  const totalTopics = topicRows.length;

  if (totalTopics === 0) {
    return { awarded: false, reason: "No topics in module" };
  }

  const [completedRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM topic_progress tp
    JOIN topics t ON tp.topic_id = t.id
    WHERE tp.student_id = ?
      AND t.module_id = ?
      AND tp.status = 'completed'
    `,
    [studentId, moduleId]
  );

  const completedTopics = Number(completedRows[0]?.total || 0);

  if (completedTopics !== totalTopics) {
    return { awarded: false, reason: "Module not fully completed yet" };
  }

  await pool.query(
    `
    INSERT INTO module_progress (student_id, module_id, status, completed_at)
    VALUES (?, ?, 'completed', NOW())
    ON DUPLICATE KEY UPDATE
      status = 'completed',
      completed_at = NOW()
    `,
    [studentId, moduleId]
  );

  // General module: only mark completed, no badge, no module certificate
  if (!isOrgPremiumModule) {
    return {
      awarded: false,
      reason: "General module completed",
    };
  }

  // Premium org module: give module certificate only
  const certificateAwarded = await awardCertificate(
    studentId,
    "module",
    moduleId
  );

  return {
    awarded: certificateAwarded,
    certificateAwarded,
  };
}

/*
==================================================
CHECK + AWARD FINAL CERTIFICATE
GENERAL USER ONLY
Only for public general modules/topics
==================================================
*/
async function checkFinalReward(studentId) {
  const user = await getUserById(studentId);

  if (!user) {
    return { awarded: false, reason: "User not found" };
  }

  if (user.role !== "general_user") {
    return {
      awarded: false,
      reason: "Final certificate is only for general users",
    };
  }

  const [topicCountRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM topics t
    JOIN modules m ON t.module_id = m.id
    WHERE m.is_public = 1
      AND m.audience_type = 'general'
    `
  );

  const totalTopics = Number(topicCountRows[0]?.total || 0);

  if (totalTopics === 0) {
    return { awarded: false, reason: "No general topics found" };
  }

  const [completedRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM topic_progress tp
    JOIN topics t ON tp.topic_id = t.id
    JOIN modules m ON t.module_id = m.id
    WHERE tp.student_id = ?
      AND tp.status = 'completed'
      AND m.is_public = 1
      AND m.audience_type = 'general'
    `,
    [studentId]
  );

  const completedTopics = Number(completedRows[0]?.total || 0);

  if (completedTopics !== totalTopics) {
    return { awarded: false, reason: "All general topics not completed yet" };
  }

  const awarded = await awardCertificate(studentId, "final", null);

  return { awarded };
}

/*
==================================================
ORGANIZATION FINAL CERTIFICATE
DISABLED FOR NOW
==================================================
*/
async function checkOrganizationReward(studentId) {
  return {
    awarded: false,
    reason: "Organization final certificate not enabled yet",
  };
}

/*
==================================================
MAIN ENTRY POINT
==================================================
*/
async function processRewards(studentId, topicId = null, moduleId = null) {
  const result = {
    topicBadge: null,
    moduleReward: null,
    finalCertificate: false,
    organizationCertificate: false,
  };

  if (topicId) {
    const topicReward = await checkTopicReward(studentId, topicId);
    if (topicReward.awarded) {
      result.topicBadge = topicReward.badge;
    }
  }

  if (moduleId) {
    const moduleReward = await checkModuleReward(studentId, moduleId);
    if (moduleReward.awarded) {
      result.moduleReward = moduleReward;
    }
  }

  const finalReward = await checkFinalReward(studentId);
  if (finalReward.awarded) {
    result.finalCertificate = true;
  }

  const orgReward = await checkOrganizationReward(studentId);
  if (orgReward.awarded) {
    result.organizationCertificate = true;
  }

  return result;
}

module.exports = {
  processRewards,
};