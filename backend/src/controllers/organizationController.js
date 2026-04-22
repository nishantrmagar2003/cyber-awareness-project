const { pool } = require("../config/db");
const bcrypt = require("bcrypt");

/* =====================================
   SUPERADMIN CREATES ORGANIZATION
===================================== */
exports.createOrganization = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can create organizations",
      });
    }

    const { name, industry } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Organization name is required",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM organizations WHERE name = ? LIMIT 1",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Organization already exists",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO organizations (name, industry, status, created_at)
      VALUES (?, ?, 'active', NOW())
      `,
      [name, industry || null]
    );

    return res.status(201).json({
      message: "Organization created successfully",
      organization_id: result.insertId,
    });
  } catch (error) {
    console.error("CREATE ORG ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =====================================
   SUPERADMIN CREATES ORGANIZATION ADMIN
===================================== */
exports.createOrganizationAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can create org admins",
      });
    }

    const { full_name, email, password, organization_id } = req.body;

    if (!full_name || !email || !password || !organization_id) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO users
      (full_name, email, password_hash, role, account_type, organization_id, status, created_at)
      VALUES (?, ?, ?, 'org_admin', 'organization', ?, 'active', NOW())
      `,
      [full_name, email, password_hash, organization_id]
    );

    return res.status(201).json({
      message: "Organization admin created successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("CREATE ORG ADMIN ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =====================================
   ORG ADMIN CREATES ORGANIZATION STUDENT
===================================== */
exports.createOrganizationStudent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only org admin can create organization students",
      });
    }

    const organization_id = req.user.organization_id;
    const { full_name, email, password, phone } = req.body;

    if (!organization_id) {
      return res.status(400).json({
        error: "Organization not found for logged in org admin",
      });
    }

    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: "full_name, email and password are required",
      });
    }

    if (phone && String(phone).length > 20) {
      return res.status(400).json({
        error: "Phone number is too long",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO users
      (full_name, email, phone, password_hash, role, account_type, organization_id, status, created_at)
      VALUES (?, ?, ?, ?, 'org_student', 'organization', ?, 'active', NOW())
      `,
      [full_name, email, phone || null, password_hash, organization_id]
    );

    return res.status(201).json({
      success: true,
      message: "Organization student created successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("CREATE ORG STUDENT ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =====================================
   ORG ADMIN GETS OWN STUDENTS
===================================== */
exports.getOrganizationStudents = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only org admin can view organization students",
      });
    }

    const organization_id = req.user.organization_id;

    if (!organization_id) {
      return res.status(400).json({
        error: "Organization not found for logged in org admin",
      });
    }

    const [studentRows] = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.account_type,
        u.organization_id,
        u.status,
        u.created_at
      FROM users u
      WHERE u.organization_id = ?
        AND u.role = 'org_student'
      ORDER BY u.id DESC
      `,
      [organization_id]
    );

    const [allowedTopicRows] = await pool.query(
      `
      SELECT
        t.id AS topic_id
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE
        (
          m.is_public = 1
          AND m.audience_type = 'general'
        )
        OR
        (
          m.audience_type = 'organization'
          AND EXISTS (
            SELECT 1
            FROM organization_modules om
            WHERE om.organization_id = ?
              AND om.module_id = m.id
          )
        )
      `,
      [organization_id]
    );

    const totalAllowedTopics = allowedTopicRows.length;

    const [completedRows] = await pool.query(
      `
      SELECT
        tp.student_id,
        COUNT(*) AS completed_topics
      FROM topic_progress tp
      JOIN users u ON u.id = tp.student_id
      JOIN topics t ON t.id = tp.topic_id
      JOIN modules m ON m.id = t.module_id
      WHERE u.organization_id = ?
        AND u.role = 'org_student'
        AND tp.status = 'completed'
        AND (
          (m.is_public = 1 AND m.audience_type = 'general')
          OR
          (
            m.audience_type = 'organization'
            AND EXISTS (
              SELECT 1
              FROM organization_modules om
              WHERE om.organization_id = ?
                AND om.module_id = m.id
            )
          )
        )
      GROUP BY tp.student_id
      `,
      [organization_id, organization_id]
    );

    const completedMap = new Map(
      completedRows.map((row) => [
        Number(row.student_id),
        Number(row.completed_topics || 0),
      ])
    );

    const mappedRows = studentRows.map((row) => {
      const completedTopics = completedMap.get(Number(row.id)) || 0;
      const totalTopics = totalAllowedTopics;

      return {
        ...row,
        total_topics: totalTopics,
        completed_topics: completedTopics,
        progress:
          totalTopics > 0
            ? Math.round((completedTopics / totalTopics) * 100)
            : 0,
      };
    });

    return res.json({
      success: true,
      data: mappedRows,
    });
  } catch (error) {
    console.error("GET ORG STUDENTS ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =====================================
   ORG ADMIN GET ONE STUDENT DETAIL
===================================== */
exports.getOrganizationStudentDetails = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only org admin can view student details",
      });
    }

    const organization_id = req.user.organization_id;
    const studentId = Number(req.params.id);

    if (!organization_id) {
      return res.status(400).json({
        error: "Organization not found for logged in org admin",
      });
    }

    if (!studentId || Number.isNaN(studentId)) {
      return res.status(400).json({
        error: "Valid student id is required",
      });
    }

    const [studentRows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        account_type,
        organization_id,
        status,
        created_at
      FROM users
      WHERE id = ?
        AND organization_id = ?
        AND role = 'org_student'
      LIMIT 1
      `,
      [studentId, organization_id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    const student = studentRows[0];

    /* -------------------------------------
       TOPIC PROGRESS
    ------------------------------------- */
    const [topicProgressRows] = await pool.query(
      `
      SELECT
        t.id AS topic_id,
        t.title AS topic_title,
        t.module_id,
        m.title AS module_title,
        m.is_public AS module_is_public,
        m.audience_type AS module_audience_type,
        COALESCE(tp.status, 'not_started') AS status,
        COALESCE(tp.video_completed, 0) AS video_completed,
        COALESCE(tp.text_completed, 0) AS text_completed,
        COALESCE(tp.best_quiz_score, 0) AS best_quiz_score,
        COALESCE(tp.best_simulation_score, 0) AS best_simulation_score,
        COALESCE(tp.simulations_completed, 0) AS simulations_completed,
        tp.updated_at
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      LEFT JOIN topic_progress tp
        ON tp.topic_id = t.id
       AND tp.student_id = ?
      WHERE
        (
          m.is_public = 1
          AND m.audience_type = 'general'
        )
        OR
        (
          m.audience_type = 'organization'
          AND EXISTS (
            SELECT 1
            FROM organization_modules om
            WHERE om.organization_id = ?
              AND om.module_id = m.id
          )
        )
      ORDER BY m.id ASC, t.id ASC
      `,
      [studentId, organization_id]
    );

    /* -------------------------------------
       QUIZ ATTEMPTS
    ------------------------------------- */
    const [quizRows] = await pool.query(
      `
      SELECT
        qa.id,
        qa.quiz_id,
        q.topic_id,
        t.title AS topic_title,
        q.title AS quiz_title,
        qa.score,
        qa.created_at,
        m.id AS module_id,
        m.title AS module_title,
        m.is_public AS module_is_public,
        m.audience_type AS module_audience_type,
        CASE
          WHEN qa.score >= 70 THEN 1
          ELSE 0
        END AS passed
      FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      JOIN topics t ON t.id = q.topic_id
      JOIN modules m ON m.id = t.module_id
      WHERE qa.student_id = ?
      ORDER BY qa.id DESC
      `,
      [studentId]
    );

    /* -------------------------------------
       SIMULATION ATTEMPTS
    ------------------------------------- */
    const [simulationRows] = await pool.query(
      `
      SELECT
        sa.id,
        sa.simulation_id,
        s.topic_id,
        t.title AS topic_title,
        s.title AS simulation_title,
        sa.score,
        sa.is_passed,
        m.id AS module_id,
        m.title AS module_title,
        m.is_public AS module_is_public,
        m.audience_type AS module_audience_type
      FROM simulation_attempts sa
      JOIN simulations s ON s.id = sa.simulation_id
      JOIN topics t ON t.id = s.topic_id
      JOIN modules m ON m.id = t.module_id
      WHERE sa.student_id = ?
      ORDER BY sa.id DESC
      `,
      [studentId]
    );

    /* -------------------------------------
       BEFORE VS AFTER
    ------------------------------------- */
    const [beforeAfterQueryRows] = await pool.query(
      `
      SELECT
        m.id AS module_id,
        m.title AS module_title,
        m.is_public AS module_is_public,
        m.audience_type AS module_audience_type,
        COALESCE(mp.pre_assessment_score, 0) AS before_score,
        ROUND(
          AVG(
            CASE
              WHEN tp.best_quiz_score IS NOT NULL AND tp.best_simulation_score IS NOT NULL
                THEN (tp.best_quiz_score + tp.best_simulation_score) / 2
              WHEN tp.best_quiz_score IS NOT NULL
                THEN tp.best_quiz_score
              WHEN tp.best_simulation_score IS NOT NULL
                THEN tp.best_simulation_score
              ELSE NULL
            END
          ),
          2
        ) AS after_score
      FROM modules m
      LEFT JOIN module_progress mp
        ON mp.module_id = m.id
       AND mp.student_id = ?
      LEFT JOIN topics t
        ON t.module_id = m.id
      LEFT JOIN topic_progress tp
        ON tp.topic_id = t.id
       AND tp.student_id = ?
      WHERE
        (
          m.is_public = 1
          AND m.audience_type = 'general'
        )
        OR
        (
          m.audience_type = 'organization'
          AND EXISTS (
            SELECT 1
            FROM organization_modules om
            WHERE om.organization_id = ?
              AND om.module_id = m.id
          )
        )
      GROUP BY
        m.id,
        m.title,
        m.is_public,
        m.audience_type,
        mp.pre_assessment_score
      ORDER BY m.id ASC
      `,
      [studentId, studentId, organization_id]
    );

    const beforeAfterRows = beforeAfterQueryRows.map((row) => {
      const beforeScore = Number(row.before_score || 0);
      const afterScore = Number(row.after_score || 0);

      return {
        module_id: row.module_id,
        module_title: row.module_title,
        module_is_public: Number(row.module_is_public || 0),
        module_audience_type: row.module_audience_type || null,
        before_score: beforeScore,
        after_score: afterScore,
        improvement: Number((afterScore - beforeScore).toFixed(2)),
      };
    });

    const completedTopics = topicProgressRows.filter(
      (row) => row.status === "completed"
    ).length;

    const totalTrackedTopics = topicProgressRows.length;

    const overallProgress =
      totalTrackedTopics > 0
        ? Math.round((completedTopics / totalTrackedTopics) * 100)
        : 0;

    const generalTopics = topicProgressRows.filter(
      (row) =>
        Number(row.module_is_public || 0) === 1 &&
        row.module_audience_type === "general"
    );

    const premiumTopics = topicProgressRows.filter(
      (row) =>
        !(
          Number(row.module_is_public || 0) === 1 &&
          row.module_audience_type === "general"
        )
    );

    const notAttemptedTopics = topicProgressRows.filter((row) => {
      const quizScore = Number(row.best_quiz_score || 0);
      const simScore = Number(row.best_simulation_score || 0);
      return quizScore === 0 && simScore === 0;
    });

    const lowQuizTopics = topicProgressRows.filter((row) => {
      const quizScore = Number(row.best_quiz_score || 0);
      return quizScore > 0 && quizScore < 70;
    });

    const lowSimulationTopics = topicProgressRows.filter((row) => {
      const simScore = Number(row.best_simulation_score || 0);
      return simScore > 0 && simScore < 70;
    });

    const generalCompleted = generalTopics.filter(
      (row) => row.status === "completed"
    ).length;

    const premiumCompleted = premiumTopics.filter(
      (row) => row.status === "completed"
    ).length;

    const generalProgress =
      generalTopics.length > 0
        ? Math.round((generalCompleted / generalTopics.length) * 100)
        : 0;

    const premiumProgress =
      premiumTopics.length > 0
        ? Math.round((premiumCompleted / premiumTopics.length) * 100)
        : 0;

    const weakAreaCandidates = [
      {
        key: "not_attempted",
        title: "Not Attempted Topics",
        value: notAttemptedTopics.length,
        description: `${notAttemptedTopics.length} topics not attempted yet`,
        topics: notAttemptedTopics.slice(0, 5).map((row) => row.topic_title),
      },
      {
        key: "quiz_weakness",
        title: "Quiz Weakness",
        value: lowQuizTopics.length,
        description: `${lowQuizTopics.length} topics have low quiz scores`,
        topics: lowQuizTopics.slice(0, 5).map((row) => row.topic_title),
      },
      {
        key: "simulation_weakness",
        title: "Simulation Weakness",
        value: lowSimulationTopics.length,
        description: `${lowSimulationTopics.length} topics have low simulation scores`,
        topics: lowSimulationTopics.slice(0, 5).map((row) => row.topic_title),
      },
      {
        key: "general_module_weakness",
        title: "General Module Weakness",
        value: generalTopics.length - generalCompleted,
        description: `General module progress is ${generalProgress}%`,
        topics: generalTopics
          .filter((row) => row.status !== "completed")
          .slice(0, 5)
          .map((row) => row.topic_title),
      },
      {
        key: "premium_module_weakness",
        title: "Premium Module Weakness",
        value: premiumTopics.length - premiumCompleted,
        description: `Premium module progress is ${premiumProgress}%`,
        topics: premiumTopics
          .filter((row) => row.status !== "completed")
          .slice(0, 5)
          .map((row) => row.topic_title),
      },
    ].sort((a, b) => b.value - a.value);

    const mainWeakArea = weakAreaCandidates[0] || {
      key: "none",
      title: "No major weak area",
      value: 0,
      description: "Student is progressing well",
      topics: [],
    };

    const weakAreaSummary = {
      overall_progress: overallProgress,
      general_progress: generalProgress,
      premium_progress: premiumProgress,
      not_attempted_count: notAttemptedTopics.length,
      low_quiz_count: lowQuizTopics.length,
      low_simulation_count: lowSimulationTopics.length,
      main_area: mainWeakArea,
      all_areas: weakAreaCandidates,
    };

    const weakTopics = topicProgressRows
      .filter((row) => {
        const quizScore = Number(row.best_quiz_score || 0);
        const simScore = Number(row.best_simulation_score || 0);

        return (
          row.status !== "completed" ||
          (quizScore > 0 && quizScore < 70) ||
          (simScore > 0 && simScore < 70) ||
          (quizScore === 0 && simScore === 0)
        );
      })
      .map((row) => {
        const quizScore = Number(row.best_quiz_score || 0);
        const simScore = Number(row.best_simulation_score || 0);

        let reason = "Topic not completed";

        if (quizScore > 0 && quizScore < 70) {
          reason = "Low quiz score";
        } else if (simScore > 0 && simScore < 70) {
          reason = "Low simulation score";
        } else if (quizScore === 0 && simScore === 0) {
          reason = "Not attempted yet";
        }

        return {
          topic_id: row.topic_id,
          topic_title: row.topic_title,
          module_id: row.module_id,
          module_title: row.module_title,
          module_is_public: Number(row.module_is_public || 0),
          module_audience_type: row.module_audience_type || "general",
          status: row.status,
          best_quiz_score: quizScore,
          best_simulation_score: simScore,
          reason,
        };
      });

    return res.json({
      success: true,
      data: {
        student,
        summary: {
          total_topics: totalTrackedTopics,
          completed_topics: completedTopics,
          overall_progress: overallProgress,
        },
        weak_summary: weakAreaSummary,
        weak_topics: weakTopics,
        before_after: beforeAfterRows,
        topic_progress: topicProgressRows,
        quiz_attempts: quizRows,
        simulation_attempts: simulationRows,
      },
    });
  } catch (error) {
    console.error("GET ORG STUDENT DETAIL ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

/* =====================================
   ORG ADMIN DASHBOARD SUMMARY
===================================== */
exports.getOrganizationDashboard = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only org admin can view organization dashboard",
      });
    }

    const organization_id = req.user.organization_id;

    if (!organization_id) {
      return res.status(400).json({
        error: "Organization not found for logged in org admin",
      });
    }

    const [[orgRow]] = await pool.query(
      `
      SELECT id, name, industry, status
      FROM organizations
      WHERE id = ?
      LIMIT 1
      `,
      [organization_id]
    );

    const [[studentCountRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_students
      FROM users
      WHERE organization_id = ?
        AND role = 'org_student'
      `,
      [organization_id]
    );

    const [[activeStudentCountRow]] = await pool.query(
      `
      SELECT COUNT(*) AS active_students
      FROM users
      WHERE organization_id = ?
        AND role = 'org_student'
        AND status = 'active'
      `,
      [organization_id]
    );

    const [[completedTopicsRow]] = await pool.query(
      `
      SELECT COUNT(*) AS completed_topics
      FROM topic_progress tp
      JOIN users u ON u.id = tp.student_id
      JOIN topics t ON t.id = tp.topic_id
      JOIN modules m ON m.id = t.module_id
      WHERE u.organization_id = ?
        AND u.role = 'org_student'
        AND tp.status = 'completed'
        AND (
          (m.is_public = 1 AND m.audience_type = 'general')
          OR
          (
            m.audience_type = 'organization'
            AND EXISTS (
              SELECT 1
              FROM organization_modules om
              WHERE om.organization_id = ?
                AND om.module_id = m.id
            )
          )
        )
      `,
      [organization_id, organization_id]
    );

    const [[avgQuizRow]] = await pool.query(
      `
      SELECT ROUND(AVG(qa.score), 2) AS avg_quiz_score
      FROM quiz_attempts qa
      JOIN users u ON u.id = qa.student_id
      WHERE u.organization_id = ?
        AND u.role = 'org_student'
      `,
      [organization_id]
    );

    const [[premiumModuleRow]] = await pool.query(
      `
      SELECT COUNT(*) AS premium_modules
      FROM organization_modules om
      JOIN modules m ON m.id = om.module_id
      WHERE om.organization_id = ?
      `,
      [organization_id]
    );

    const [studentRows] = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.status
      FROM users u
      WHERE u.organization_id = ?
        AND u.role = 'org_student'
      ORDER BY u.id DESC
      `,
      [organization_id]
    );

    const [allowedTopicRows] = await pool.query(
      `
      SELECT
        t.id AS topic_id
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE
        (
          m.is_public = 1
          AND m.audience_type = 'general'
        )
        OR
        (
          m.audience_type = 'organization'
          AND EXISTS (
            SELECT 1
            FROM organization_modules om
            WHERE om.organization_id = ?
              AND om.module_id = m.id
          )
        )
      `,
      [organization_id]
    );

    const totalAllowedTopics = allowedTopicRows.length;

    const [completedProgressRows] = await pool.query(
      `
      SELECT
        tp.student_id,
        COUNT(*) AS completed_topics
      FROM topic_progress tp
      JOIN users u ON u.id = tp.student_id
      JOIN topics t ON t.id = tp.topic_id
      JOIN modules m ON m.id = t.module_id
      WHERE u.organization_id = ?
        AND u.role = 'org_student'
        AND tp.status = 'completed'
        AND (
          (m.is_public = 1 AND m.audience_type = 'general')
          OR
          (
            m.audience_type = 'organization'
            AND EXISTS (
              SELECT 1
              FROM organization_modules om
              WHERE om.organization_id = ?
                AND om.module_id = m.id
            )
          )
        )
      GROUP BY tp.student_id
      `,
      [organization_id, organization_id]
    );

    const completedMap = new Map(
      completedProgressRows.map((row) => [
        Number(row.student_id),
        Number(row.completed_topics || 0),
      ])
    );

    const students = studentRows.map((row) => {
      const completedTopics = completedMap.get(Number(row.id)) || 0;
      const totalTopics = totalAllowedTopics;

      return {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        status: row.status,
        total_topics: totalTopics,
        completed_topics: completedTopics,
        progress:
          totalTopics > 0
            ? Math.round((completedTopics / totalTopics) * 100)
            : 0,
      };
    });

    const [weakTopicRows] = await pool.query(
      `
      SELECT
        t.id AS topic_id,
        t.title AS topic_title,
        m.id AS module_id,
        m.title AS module_title,
        COUNT(u.id) AS assigned_students,
        SUM(
          CASE
            WHEN tp.status = 'completed' THEN 1
            ELSE 0
          END
        ) AS completed_count
      FROM users u
      CROSS JOIN topics t
      JOIN modules m ON m.id = t.module_id
      LEFT JOIN topic_progress tp
        ON tp.student_id = u.id
       AND tp.topic_id = t.id
      WHERE u.organization_id = ?
        AND u.role = 'org_student'
        AND (
          (m.is_public = 1 AND m.audience_type = 'general')
          OR
          (
            m.audience_type = 'organization'
            AND EXISTS (
              SELECT 1
              FROM organization_modules om
              WHERE om.organization_id = ?
                AND om.module_id = m.id
            )
          )
        )
      GROUP BY t.id, t.title, m.id, m.title
      ORDER BY completed_count ASC, t.id ASC
      `,
      [organization_id, organization_id]
    );

    const weakTopics = weakTopicRows
      .map((row) => {
        const assignedStudents = Number(row.assigned_students || 0);
        const completedCount = Number(row.completed_count || 0);
        const completionRate =
          assignedStudents > 0
            ? Math.round((completedCount / assignedStudents) * 100)
            : 0;

        return {
          topic_id: row.topic_id,
          topic_title: row.topic_title,
          module_id: row.module_id,
          module_title: row.module_title,
          assigned_students: assignedStudents,
          completed_count: completedCount,
          completion_rate: completionRate,
        };
      })
      .filter((row) => row.completion_rate < 100)
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        organization: orgRow || null,
        stats: {
          total_students: Number(studentCountRow?.total_students || 0),
          active_students: Number(activeStudentCountRow?.active_students || 0),
          completed_topics: Number(completedTopicsRow?.completed_topics || 0),
          avg_quiz_score: Number(avgQuizRow?.avg_quiz_score || 0),
          premium_modules: Number(premiumModuleRow?.premium_modules || 0),
        },
        recent_students: students.slice(0, 5),
        all_students: students,
        weak_topics: weakTopics,
      },
    });
  } catch (error) {
    console.error("GET ORG DASHBOARD ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

/* =====================================
   ORG ADMIN GET SETTINGS
===================================== */
exports.getOrganizationSettings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only org admin can view organization settings",
      });
    }

    const userId = req.user.id;
    const organization_id = req.user.organization_id;

    if (!organization_id) {
      return res.status(400).json({
        error: "Organization not found for logged in org admin",
      });
    }

    const [orgRows] = await pool.query(
      `
      SELECT id, name, industry
      FROM organizations
      WHERE id = ?
      LIMIT 1
      `,
      [organization_id]
    );

    const [userRows] = await pool.query(
      `
      SELECT id, full_name, email, phone
      FROM users
      WHERE id = ?
        AND role = 'org_admin'
      LIMIT 1
      `,
      [userId]
    );

    if (orgRows.length === 0 || userRows.length === 0) {
      return res.status(404).json({
        error: "Settings data not found",
      });
    }

    return res.json({
      success: true,
      data: {
        organization: {
          id: orgRows[0].id,
          name: orgRows[0].name || "",
          industry: orgRows[0].industry || "",
          email: userRows[0].email || "",
        },
        profile: {
          id: userRows[0].id,
          name: userRows[0].full_name || "",
          email: userRows[0].email || "",
          phone: userRows[0].phone || "",
        },
      },
    });
  } catch (error) {
    console.error("GET ORG SETTINGS ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =====================================
   ORG ADMIN UPDATE ORGANIZATION SETTINGS
===================================== */
exports.updateOrganizationSettings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only org admin can update organization settings",
      });
    }

    const organization_id = req.user.organization_id;
    const { name, industry, email } = req.body;

    if (!organization_id) {
      return res.status(400).json({
        error: "Organization not found for logged in org admin",
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        error: "Organization name and email are required",
      });
    }

    await pool.query(
      `
      UPDATE organizations
      SET name = ?, industry = ?
      WHERE id = ?
      `,
      [name, industry || null, organization_id]
    );

    await pool.query(
      `
      UPDATE users
      SET email = ?
      WHERE id = ?
        AND role = 'org_admin'
      `,
      [email, req.user.id]
    );

    return res.json({
      success: true,
      message: "Organization settings updated successfully",
    });
  } catch (error) {
    console.error("UPDATE ORG SETTINGS ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =====================================
   ORG ADMIN UPDATE PROFILE / PASSWORD
===================================== */
exports.updateOrganizationAdminProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "org_admin") {
      return res.status(403).json({
        error: "Only org admin can update profile",
      });
    }

    const userId = req.user.id;
    const { full_name, email, phone, current_password, new_password } = req.body;

    const [userRows] = await pool.query(
      `
      SELECT id, full_name, email, phone, password_hash
      FROM users
      WHERE id = ?
        AND role = 'org_admin'
      LIMIT 1
      `,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        error: "Admin user not found",
      });
    }

    const user = userRows[0];

    if (phone && String(phone).length > 20) {
      return res.status(400).json({
        error: "Phone number is too long",
      });
    }

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          error: "Current password is required",
        });
      }

      const isMatch = await bcrypt.compare(current_password, user.password_hash);

      if (!isMatch) {
        return res.status(400).json({
          error: "Current password is incorrect",
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          error: "New password must be at least 6 characters",
        });
      }

      const newHash = await bcrypt.hash(new_password, 10);

      await pool.query(
        `
        UPDATE users
        SET full_name = ?, email = ?, phone = ?, password_hash = ?
        WHERE id = ?
          AND role = 'org_admin'
        `,
        [
          full_name || user.full_name,
          email || user.email,
          phone || null,
          newHash,
          userId,
        ]
      );

      return res.json({
        success: true,
        message: "Profile and password updated successfully",
      });
    }

    await pool.query(
      `
      UPDATE users
      SET full_name = ?, email = ?, phone = ?
      WHERE id = ?
        AND role = 'org_admin'
      `,
      [
        full_name || user.full_name,
        email || user.email,
        phone || null,
        userId,
      ]
    );

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("UPDATE ORG ADMIN PROFILE ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =====================================
   SUPERADMIN DASHBOARD SUMMARY
===================================== */
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can view superadmin dashboard",
      });
    }

    const [[organizationRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_organizations
      FROM organizations
      `
    );

    const [[orgAdminRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_org_admins
      FROM users
      WHERE role = 'org_admin'
      `
    );

    const [[studentRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_students
      FROM users
      WHERE role IN ('org_student', 'general_user')
      `
    );

    const [[premiumModuleRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_premium_modules
      FROM modules
      WHERE audience_type = 'organization'
      `
    );

    const [[quizRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_quizzes
      FROM quizzes
      `
    );

    const [[simulationRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_simulations
      FROM simulations
      `
    );

    const [recentOrganizations] = await pool.query(
      `
      SELECT
        id,
        name,
        industry,
        status,
        created_at
      FROM organizations
      ORDER BY created_at DESC, id DESC
      LIMIT 5
      `
    );

    const [recentUsers] = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        o.name AS organization_name
      FROM users u
      LEFT JOIN organizations o
        ON o.id = u.organization_id
      ORDER BY u.created_at DESC, u.id DESC
      LIMIT 5
      `
    );

    return res.json({
      success: true,
      data: {
        stats: {
          total_organizations: Number(
            organizationRow?.total_organizations || 0
          ),
          total_org_admins: Number(orgAdminRow?.total_org_admins || 0),
          total_students: Number(studentRow?.total_students || 0),
          total_premium_modules: Number(
            premiumModuleRow?.total_premium_modules || 0
          ),
          total_quizzes: Number(quizRow?.total_quizzes || 0),
          total_simulations: Number(
            simulationRow?.total_simulations || 0
          ),
        },
        recent_organizations: recentOrganizations.map((row) => ({
          id: row.id,
          name: row.name,
          industry: row.industry || "-",
          status: row.status || "inactive",
          created_at: row.created_at,
        })),
        recent_users: recentUsers.map((row) => ({
          id: row.id,
          full_name: row.full_name || "User",
          email: row.email || "-",
          role: row.role || "-",
          status: row.status || "inactive",
          organization_name: row.organization_name || "-",
          created_at: row.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("GET SUPERADMIN DASHBOARD ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
/* =====================================
   SUPERADMIN GET ALL ORGANIZATIONS
===================================== */
exports.getAllOrganizations = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can view organizations",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        o.id,
        o.name,
        o.industry,
        o.status,
        o.created_at,
        COUNT(CASE WHEN u.role = 'org_admin' THEN 1 END) AS total_org_admins,
        COUNT(CASE WHEN u.role = 'org_student' THEN 1 END) AS total_students
      FROM organizations o
      LEFT JOIN users u
        ON u.organization_id = o.id
      GROUP BY
        o.id,
        o.name,
        o.industry,
        o.status,
        o.created_at
      ORDER BY o.created_at DESC, o.id DESC
      `
    );

    return res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        industry: row.industry || "-",
        status: row.status || "inactive",
        created_at: row.created_at,
        total_org_admins: Number(row.total_org_admins || 0),
        total_students: Number(row.total_students || 0),
      })),
    });
  } catch (error) {
    console.error("GET ALL ORGANIZATIONS ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

/* =====================================
   SUPERADMIN GET ONE ORGANIZATION DETAIL
===================================== */
exports.getOrganizationByIdForSuperadmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can view organization details",
      });
    }

    const organizationId = Number(req.params.id);

    if (!organizationId || Number.isNaN(organizationId)) {
      return res.status(400).json({
        error: "Valid organization id is required",
      });
    }

    const [orgRows] = await pool.query(
      `
      SELECT
        id,
        name,
        industry,
        status,
        created_at
      FROM organizations
      WHERE id = ?
      LIMIT 1
      `,
      [organizationId]
    );

    if (orgRows.length === 0) {
      return res.status(404).json({
        error: "Organization not found",
      });
    }

    const organization = orgRows[0];

    const [adminRows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        status,
        created_at
      FROM users
      WHERE organization_id = ?
        AND role = 'org_admin'
      ORDER BY created_at DESC, id DESC
      `,
      [organizationId]
    );

    const [studentRows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        status,
        created_at
      FROM users
      WHERE organization_id = ?
        AND role = 'org_student'
      ORDER BY created_at DESC, id DESC
      `,
      [organizationId]
    );

    const [moduleRows] = await pool.query(
      `
      SELECT
        m.id,
        m.title,
        m.description,
        m.audience_type,
        m.is_public
      FROM organization_modules om
      JOIN modules m
        ON m.id = om.module_id
      WHERE om.organization_id = ?
      ORDER BY m.id DESC
      `,
      [organizationId]
    );

    return res.json({
      success: true,
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          industry: organization.industry || "-",
          status: organization.status || "inactive",
          created_at: organization.created_at,
        },
        admins: adminRows.map((row) => ({
          id: row.id,
          full_name: row.full_name || "Admin",
          email: row.email || "-",
          phone: row.phone || "-",
          status: row.status || "inactive",
          created_at: row.created_at,
        })),
        students: studentRows.map((row) => ({
          id: row.id,
          full_name: row.full_name || "Student",
          email: row.email || "-",
          phone: row.phone || "-",
          status: row.status || "inactive",
          created_at: row.created_at,
        })),
        premium_modules: moduleRows.map((row) => ({
          id: row.id,
          title: row.title || "Module",
          description: row.description || "",
          audience_type: row.audience_type || "",
          is_public: Number(row.is_public || 0),
        })),
      },
    });
  } catch (error) {
    console.error("GET ORGANIZATION DETAIL FOR SUPERADMIN ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
/* =====================================
   SUPERADMIN GET ALL PREMIUM MODULES FOR ASSIGNMENT
===================================== */
exports.getAllPremiumModulesForAssignment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can view premium modules",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        level,
        audience_type,
        is_public,
        created_at
      FROM modules
      WHERE is_public = 0
        AND audience_type = 'organization'
      ORDER BY created_at DESC, id DESC
      `
    );

    return res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        title: row.title || "Module",
        description: row.description || "",
        level: row.level || "basic",
        audience_type: row.audience_type || "organization",
        is_public: Number(row.is_public || 0),
        created_at: row.created_at,
      })),
    });
  } catch (error) {
    console.error("GET ALL PREMIUM MODULES FOR ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

/* =====================================
   SUPERADMIN ASSIGN PREMIUM MODULE TO ORGANIZATION
===================================== */
exports.assignPremiumModuleToOrganization = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can assign premium modules",
      });
    }

    const organizationId = Number(req.params.id);
    const moduleId = Number(req.body.module_id);

    if (!organizationId || Number.isNaN(organizationId)) {
      return res.status(400).json({
        error: "Valid organization id is required",
      });
    }

    if (!moduleId || Number.isNaN(moduleId)) {
      return res.status(400).json({
        error: "Valid module_id is required",
      });
    }

    const [orgRows] = await pool.query(
      `
      SELECT id
      FROM organizations
      WHERE id = ?
      LIMIT 1
      `,
      [organizationId]
    );

    if (orgRows.length === 0) {
      return res.status(404).json({
        error: "Organization not found",
      });
    }

    const [moduleRows] = await pool.query(
      `
      SELECT id, is_public, audience_type
      FROM modules
      WHERE id = ?
      LIMIT 1
      `,
      [moduleId]
    );

    if (moduleRows.length === 0) {
      return res.status(404).json({
        error: "Module not found",
      });
    }

    const moduleRow = moduleRows[0];

    if (
      Number(moduleRow.is_public || 0) !== 0 ||
      moduleRow.audience_type !== "organization"
    ) {
      return res.status(400).json({
        error: "Only premium organization modules can be assigned",
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT organization_id, module_id
      FROM organization_modules
      WHERE organization_id = ?
        AND module_id = ?
      LIMIT 1
      `,
      [organizationId, moduleId]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        error: "Module already assigned to this organization",
      });
    }

    await pool.query(
      `
      INSERT INTO organization_modules (organization_id, module_id)
      VALUES (?, ?)
      `,
      [organizationId, moduleId]
    );

    return res.json({
      success: true,
      message: "Premium module assigned successfully",
    });
  } catch (error) {
    console.error("ASSIGN PREMIUM MODULE TO ORGANIZATION ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

/* =====================================
   SUPERADMIN REMOVE PREMIUM MODULE FROM ORGANIZATION
===================================== */
exports.removePremiumModuleFromOrganization = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can remove premium modules",
      });
    }

    const organizationId = Number(req.params.id);
    const moduleId = Number(req.params.moduleId);

    if (!organizationId || Number.isNaN(organizationId)) {
      return res.status(400).json({
        error: "Valid organization id is required",
      });
    }

    if (!moduleId || Number.isNaN(moduleId)) {
      return res.status(400).json({
        error: "Valid module id is required",
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT organization_id, module_id
      FROM organization_modules
      WHERE organization_id = ?
        AND module_id = ?
      LIMIT 1
      `,
      [organizationId, moduleId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        error: "Assigned premium module not found for this organization",
      });
    }

    await pool.query(
      `
      DELETE FROM organization_modules
      WHERE organization_id = ?
        AND module_id = ?
      `,
      [organizationId, moduleId]
    );

    return res.json({
      success: true,
      message: "Premium module removed successfully",
    });
  } catch (error) {
    console.error("REMOVE PREMIUM MODULE FROM ORGANIZATION ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
/* =====================================
   SUPERADMIN TOGGLE ORGANIZATION STATUS
===================================== */
exports.toggleOrganizationStatusBySuperadmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmin can update organization status",
      });
    }

    const organizationId = Number(req.params.id);

    if (!organizationId || Number.isNaN(organizationId)) {
      return res.status(400).json({
        error: "Valid organization id is required",
      });
    }

    const [orgRows] = await pool.query(
      `
      SELECT id, status
      FROM organizations
      WHERE id = ?
      LIMIT 1
      `,
      [organizationId]
    );

    if (orgRows.length === 0) {
      return res.status(404).json({
        error: "Organization not found",
      });
    }

    const currentStatus = String(orgRows[0].status || "").toLowerCase();
    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    await pool.query(
      `
      UPDATE organizations
      SET status = ?
      WHERE id = ?
      `,
      [nextStatus, organizationId]
    );

    await pool.query(
      `
      UPDATE users
      SET status = ?
      WHERE organization_id = ?
        AND role IN ('org_admin', 'org_student')
      `,
      [nextStatus, organizationId]
    );

    return res.json({
      success: true,
      message:
        nextStatus === "active"
          ? "Organization activated successfully"
          : "Organization deactivated successfully",
      data: {
        organization_id: organizationId,
        status: nextStatus,
      },
    });
  } catch (error) {
    console.error("TOGGLE ORGANIZATION STATUS ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};