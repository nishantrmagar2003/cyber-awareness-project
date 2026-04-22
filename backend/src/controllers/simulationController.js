const { pool } = require("../config/db");
const rewardService = require("../services/rewardService");

async function getAccessibleTopicForSimulation(user, topicId, conn = pool) {
  const [rows] = await conn.query(
    `
    SELECT 
      t.id,
      t.module_id,
      m.is_public,
      m.audience_type
    FROM topics t
    JOIN modules m ON m.id = t.module_id
    WHERE t.id = ?
    LIMIT 1
    `,
    [topicId]
  );

  if (rows.length === 0) {
    return {
      ok: false,
      status: 404,
      error: "Topic not found",
    };
  }

  const topic = rows[0];

  if (Number(topic.is_public) === 1 && topic.audience_type === "general") {
    return {
      ok: true,
      topic,
    };
  }

  if (Number(topic.is_public) === 0 && topic.audience_type === "organization") {
    if (user.role !== "org_student") {
      return {
        ok: false,
        status: 403,
        error: "Only org students can access premium simulations",
      };
    }

    if (!user.organization_id) {
      return {
        ok: false,
        status: 403,
        error: "No organization assigned",
      };
    }

    const [accessRows] = await conn.query(
      `
      SELECT om.id
      FROM organization_modules om
      WHERE om.organization_id = ?
        AND om.module_id = ?
      LIMIT 1
      `,
      [user.organization_id, topic.module_id]
    );

    if (accessRows.length === 0) {
      return {
        ok: false,
        status: 403,
        error: "You do not have access to this premium simulation",
      };
    }

    return {
      ok: true,
      topic,
    };
  }

  return {
    ok: false,
    status: 403,
    error: "Access denied",
  };
}

function normalizeAnswer(val) {
  if (val === null || val === undefined) return "";

  val = String(val).trim().toLowerCase();

  if (val === "yes" || val === "true") return "true";
  if (val === "no" || val === "false") return "false";

  return val;
}

function getClientInfo(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null;

  const ua = req.headers["user-agent"] || null;
  const device = req.headers["x-device-info"] || null;
  const browser = ua ? ua.slice(0, 250) : null;

  return {
    ip_address: ip ? String(ip).slice(0, 45) : null,
    device_info: device ? String(device).slice(0, 255) : null,
    browser_info: browser,
  };
}

const _colCache = new Map();
async function columnExists(conn, table, column) {
  const key = `${table}.${column}`;
  if (_colCache.has(key)) return _colCache.get(key);

  try {
    const [rows] = await conn.query(
      `
      SELECT 1 AS ok
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
      `,
      [table, column]
    );
    const ok = rows.length > 0;
    _colCache.set(key, ok);
    return ok;
  } catch (e) {
    _colCache.set(key, false);
    return false;
  }
}

async function markSimulationSlotAndMaybeCompleteTopic(
  conn,
  userId,
  topicId,
  simulationId
) {
  const [progressRows] = await conn.query(
    `
    SELECT
      video_completed,
      text_completed,
      best_quiz_score,
      simulations_completed,
      status
    FROM topic_progress
    WHERE student_id = ? AND topic_id = ?
    LIMIT 1
    `,
    [userId, topicId]
  );

  const progress = progressRows[0];

  if (!progress) {
    return { topicCompletedNow: false };
  }

  const fullyCompleted =
    Number(progress.video_completed || 0) === 1 &&
    Number(progress.text_completed || 0) === 1 &&
    Number(progress.best_quiz_score || 0) >= 70 &&
    Number(progress.simulations_completed || 0) >= 2 &&
    progress.status !== "completed";

  if (!fullyCompleted) {
    return { topicCompletedNow: false };
  }

  await conn.query(
    `
    UPDATE topic_progress
    SET status = 'completed',
        completed_at = COALESCE(completed_at, NOW())
    WHERE student_id = ? AND topic_id = ?
      AND status <> 'completed'
    `,
    [userId, topicId]
  );

  return { topicCompletedNow: true };
}
/*
====================================================
LIST SIMULATIONS FOR A TOPIC
GET /api/topics/:topicId/simulations
====================================================
*/
exports.listTopicSimulations = async (req, res) => {
  try {
    const user = req.user;
    const topicId = Number(req.params.topicId);

    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!topicId) return res.status(400).json({ error: "Invalid topicId" });

    const access = await getAccessibleTopicForSimulation(user, topicId);

    if (!access.ok) {
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const [rows] = await pool.query(
      `
SELECT
  s.id,
  s.topic_id,
  s.simulation_no,
  s.title,
  s.component_key,
  s.sim_type,
        s.pass_score,
        s.max_attempts,
        s.difficulty,
        s.is_active,
        s.organization_id,
        s.estimated_time_seconds,
        (SELECT COUNT(*) FROM simulation_scenarios sc WHERE sc.simulation_id = s.id) AS total_scenarios
      FROM simulations s
      WHERE s.topic_id = ?
        AND s.is_active = 1
      ORDER BY s.simulation_no ASC, s.id ASC
      `,
      [topicId]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("LIST SIMULATIONS ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/*
====================================================
START SIMULATION ATTEMPT
POST /api/simulations/:simulationId/start
====================================================
*/
exports.startSimulation = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const user = req.user;
    const simulationId = Number(req.params.simulationId);

    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!simulationId) {
      return res.status(400).json({ error: "Invalid simulationId" });
    }

    if (!["org_student", "general_user"].includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await conn.beginTransaction();

    const [simRows] = await conn.query(
      `
      SELECT *
      FROM simulations
      WHERE id = ?
        AND is_active = 1
      LIMIT 1
      `,
      [simulationId]
    );

    if (simRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ error: "Simulation not found or access denied" });
    }

    const sim = simRows[0];
    const topicId = Number(sim.topic_id);

    const access = await getAccessibleTopicForSimulation(user, topicId, conn);

    if (!access.ok) {
      await conn.rollback();
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const [progressRows] = await conn.query(
      `
      SELECT best_quiz_score, status
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      LIMIT 1
      `,
      [user.id, topicId]
    );
    
    const topicProgress = progressRows[0] || null;
    const bestQuizScore = Number(topicProgress?.best_quiz_score || 0);
    const topicAlreadyCompleted = topicProgress?.status === "completed";
    
    if (!topicAlreadyCompleted && bestQuizScore < 70) {
      await conn.rollback();
      return res.status(403).json({
        error: "You must pass the quiz before attempting simulations.",
      });
    }
    

    const [allSims] = await conn.query(
      `
      SELECT id, simulation_no
      FROM simulations
      WHERE topic_id = ?
        AND is_active = 1
      ORDER BY simulation_no ASC, id ASC
      `,
      [topicId]
    );

    const currentSimulationNo = Number(sim.simulation_no || 1);

    if (!topicAlreadyCompleted && currentSimulationNo === 2) {
      const sim1Row = allSims.find(
        (row) => Number(row.simulation_no) === 1
      );
    
      if (sim1Row) {
        const [passCheck] = await conn.query(
          `
          SELECT COUNT(*) AS c
          FROM simulation_attempts
          WHERE student_id = ?
            AND simulation_id = ?
            AND is_passed = 1
          `,
          [user.id, sim1Row.id]
        );
    
        const passedSim1 = Number(passCheck[0]?.c || 0) > 0;
    
        if (!passedSim1) {
          await conn.rollback();
          return res.status(403).json({
            error: "You must pass Simulation 1 before attempting Simulation 2.",
          });
        }
      }
    }

    const hasRequiresReview = await columnExists(
      conn,
      "topic_progress",
      "requires_review"
    );
    const hasRequiresReviewSetAt = await columnExists(
      conn,
      "topic_progress",
      "requires_review_set_at"
    );
    const hasVideoCompletedAt = await columnExists(
      conn,
      "topic_progress",
      "video_completed_at"
    );

    await conn.query(
      `
      INSERT INTO topic_progress (student_id, topic_id, status, video_completed)
      VALUES (?, ?, 'not_started', 0)
      ON DUPLICATE KEY UPDATE student_id = student_id
      `,
      [user.id, topicId]
    );
    if (hasRequiresReview && !topicAlreadyCompleted) {
      const [tpRows] = await conn.query(
        `
        SELECT
          video_completed,
          ${hasVideoCompletedAt ? "video_completed_at," : "NULL AS video_completed_at,"}
          requires_review,
          ${hasRequiresReviewSetAt ? "requires_review_set_at" : "NULL AS requires_review_set_at"}
        FROM topic_progress
        WHERE student_id = ? AND topic_id = ?
        LIMIT 1
        `,
        [user.id, topicId]
      );

      const tp = tpRows[0] || {};
      const locked = Number(tp.requires_review || 0) === 1;

      if (locked) {
        const canAutoUnlock =
          hasVideoCompletedAt &&
          hasRequiresReviewSetAt &&
          tp.video_completed_at &&
          tp.requires_review_set_at &&
          new Date(tp.video_completed_at).getTime() >
            new Date(tp.requires_review_set_at).getTime();

        if (canAutoUnlock) {
          await conn.query(
            `
            UPDATE topic_progress
            SET requires_review = 0,
                requires_review_reason = NULL,
                requires_review_set_at = NULL
            WHERE student_id = ? AND topic_id = ?
            `,
            [user.id, topicId]
          );

          await conn.query(
            `
            DELETE sa
            FROM simulation_answers sa
            JOIN simulation_attempts satt ON sa.simulation_attempt_id = satt.id
            JOIN simulations s ON satt.simulation_id = s.id
            WHERE satt.student_id = ?
              AND s.topic_id = ?
            `,
            [user.id, topicId]
          );

          await conn.query(
            `
            DELETE satt
            FROM simulation_attempts satt
            JOIN simulations s ON satt.simulation_id = s.id
            WHERE satt.student_id = ?
              AND s.topic_id = ?
            `,
            [user.id, topicId]
          );
        } else {
          await conn.rollback();
          return res.status(403).json({
            error: "Simulation locked. Please re-watch the topic video to unlock.",
            requires_review: 1,
          });
        }
      }
    }

    const maxAttempts = Number(sim.max_attempts || 3);

    if (!hasRequiresReview && !topicAlreadyCompleted) {
      const [failRows] = await conn.query(
        `
        SELECT COUNT(*) AS fails
        FROM simulation_attempts
        WHERE student_id = ?
          AND simulation_id = ?
          AND is_passed = 0
        `,
        [user.id, simulationId]
      );

      const fails = Number(failRows[0]?.fails || 0);

      if (fails >= maxAttempts) {
        await conn.rollback();
        return res.status(403).json({
          error:
            "Maximum failed attempts reached. Please review the video before retrying.",
        });
      }
    }

    const [maxAttemptRows] = await conn.query(
      `
      SELECT COALESCE(MAX(attempt_number), 0) AS maxn
      FROM simulation_attempts
      WHERE student_id = ? AND simulation_id = ?
      `,
      [user.id, simulationId]
    );

    const meta = req.body?.meta_json ?? null;
    const clientInfo = getClientInfo(req);

    let nextAttempt = Number(maxAttemptRows[0]?.maxn || 0) + 1;
    let attemptId;
    let inserted = false;

    while (!inserted) {
      try {
        const [ins] = await conn.query(
          `
          INSERT INTO simulation_attempts
            (student_id, simulation_id, attempt_number, time_taken_seconds, score, is_passed, meta_json,
             suspicious_flags, device_info, ip_address, browser_info, submitted_at)
          VALUES
            (?, ?, ?, 0, 0, NULL, ?, 0, ?, ?, ?, NULL)
          `,
          [
            user.id,
            simulationId,
            nextAttempt,
            meta ? JSON.stringify(meta) : null,
            clientInfo.device_info,
            clientInfo.ip_address,
            clientInfo.browser_info,
          ]
        );

        attemptId = ins.insertId;
        inserted = true;
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          nextAttempt++;
        } else {
          throw err;
        }
      }
    }

    const [scenarios] = await conn.query(
      `
      SELECT id, simulation_id, prompt, data_json, sort_order
      FROM simulation_scenarios
      WHERE simulation_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [simulationId]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      data: {
        message: "Simulation attempt started",
        attempt_id: attemptId,
        simulation: {
          id: sim.id,
          topic_id: sim.topic_id,
          title: sim.title,
          component_key: sim.component_key,
          sim_type: sim.sim_type,
          pass_score: Number(sim.pass_score || 70),
          max_attempts: maxAttempts,
          difficulty: sim.difficulty,
          estimated_time_seconds: Number(sim.estimated_time_seconds || 300),
        },
        scenarios: scenarios.map((s) => ({
          id: s.id,
          prompt: s.prompt,
          data_json: s.data_json,
          sort_order: s.sort_order,
        })),
      },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}

    console.error("START SIMULATION ERROR:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  } finally {
    conn.release();
  }
};

/*
====================================================
SUBMIT SIMULATION ATTEMPT
POST /api/simulation-attempts/:attemptId/submit
====================================================
*/
exports.submitSimulationAttempt = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const user = req.user;
    const attemptId = Number(req.params.attemptId);

    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!attemptId) return res.status(400).json({ error: "Invalid attemptId" });

    if (!["org_student", "general_user"].includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const timeTaken = Number(req.body?.time_taken_seconds || 0);
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

    if (answers.length === 0) {
      return res.status(400).json({ error: "answers[] is required" });
    }

    await conn.beginTransaction();

    const [attemptRows] = await conn.query(
      `SELECT * FROM simulation_attempts WHERE id = ? LIMIT 1`,
      [attemptId]
    );

    if (attemptRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Attempt not found" });
    }

    const attempt = attemptRows[0];

    if (Number(attempt.student_id) !== Number(user.id)) {
      await conn.rollback();
      return res.status(403).json({ error: "Forbidden" });
    }

    if (attempt.is_passed !== null) {
      await conn.rollback();
      return res.status(400).json({ error: "Attempt already submitted" });
    }

    const simulationId = Number(attempt.simulation_id);

    const [simRows] = await conn.query(
      `SELECT * FROM simulations WHERE id = ? LIMIT 1`,
      [simulationId]
    );

    if (simRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Simulation not found" });
    }

    const sim = simRows[0];
    const PASS_SCORE = Number(sim.pass_score || 70);
    const MAX_ATTEMPTS = Number(sim.max_attempts || 3);
    const topicId = Number(sim.topic_id);

    const access = await getAccessibleTopicForSimulation(user, topicId, conn);

    if (!access.ok) {
      await conn.rollback();
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const moduleId = Number(access.topic.module_id);
    let topicCompletedNow = false;
    const [topicProgressRows] = await conn.query(
      `
      SELECT status
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      LIMIT 1
      `,
      [user.id, topicId]
    );
    
    const topicAlreadyCompleted =
      topicProgressRows[0]?.status === "completed";

    const [scenarioRows] = await conn.query(
      `
      SELECT id, correct_answer
      FROM simulation_scenarios
      WHERE simulation_id = ?
      `,
      [simulationId]
    );

    const correctMap = new Map(
      scenarioRows.map((r) => [Number(r.id), normalizeAnswer(r.correct_answer)])
    );

    let total = 0;
    let correct = 0;

    for (const a of answers) {
      const scenarioId = Number(a.scenario_id);
      if (!scenarioId || !correctMap.has(scenarioId)) continue;

      total += 1;

      const userAnswer = normalizeAnswer(a.answer);
      const correctAnswer = correctMap.get(scenarioId);

      const isCorrect = userAnswer !== "" && userAnswer === correctAnswer ? 1 : 0;
      if (isCorrect) correct += 1;

      await conn.query(
        `
        INSERT INTO simulation_answers
          (simulation_attempt_id, scenario_id, answer, is_correct, feedback)
        VALUES (?, ?, ?, ?, NULL)
        ON DUPLICATE KEY UPDATE
          answer = VALUES(answer),
          is_correct = VALUES(is_correct)
        `,
        [attemptId, scenarioId, String(a.answer ?? ""), isCorrect]
      );
    }

    if (total === 0) {
      await conn.rollback();
      return res.status(400).json({ error: "No valid scenario answers submitted" });
    }

    const score = Number(((correct / total) * 100).toFixed(2));
    const isPassed = score >= PASS_SCORE ? 1 : 0;

    let suspiciousFlags = Number(attempt.suspicious_flags || 0);
    const minTime = Math.max(
      5,
      Math.floor(Number(sim.estimated_time_seconds || 300) * 0.15)
    );

    if (timeTaken > 0 && timeTaken < minTime) {
      suspiciousFlags = suspiciousFlags | 1;
    }

    const clientInfo = getClientInfo(req);

    await conn.query(
      `
      UPDATE simulation_attempts
      SET time_taken_seconds = ?,
          score = ?,
          is_passed = ?,
          suspicious_flags = ?,
          device_info = COALESCE(?, device_info),
          ip_address = COALESCE(?, ip_address),
          browser_info = COALESCE(?, browser_info),
          submitted_at = NOW()
      WHERE id = ?
      `,
      [
        timeTaken,
        score,
        isPassed,
        suspiciousFlags,
        clientInfo.device_info,
        clientInfo.ip_address,
        clientInfo.browser_info,
        attemptId,
      ]
    );

    await conn.query(
      `
      INSERT INTO student_simulation_stats
        (student_id, simulation_id, total_attempts, best_score, average_score, total_time_spent, last_attempt_at)
      VALUES
        (?, ?, 1, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        total_attempts = total_attempts + 1,
        best_score = GREATEST(best_score, VALUES(best_score)),
        average_score = (
          (average_score * (total_attempts) + VALUES(average_score)) / (total_attempts + 1)
        ),
        total_time_spent = total_time_spent + VALUES(total_time_spent),
        last_attempt_at = NOW()
      `,
      [user.id, simulationId, score, score, timeTaken]
    );

    await conn.query(
      `
      INSERT INTO topic_progress (student_id, topic_id, status, video_completed)
      VALUES (?, ?, 'not_started', 0)
      ON DUPLICATE KEY UPDATE student_id = student_id
      `,
      [user.id, topicId]
    );

    if (!topicAlreadyCompleted) {
      await conn.query(
        `
UPDATE topic_progress
SET simulation_attempts_count = COALESCE(simulation_attempts_count, 0) + 1
WHERE student_id = ? AND topic_id = ?
        `,
        [user.id, topicId]
      );
    
      await conn.query(
        `
        UPDATE topic_progress
        SET best_simulation_score = GREATEST(COALESCE(best_simulation_score, 0), ?)
        WHERE student_id = ? AND topic_id = ?
        `,
        [score, user.id, topicId]
      );
    }

    if (isPassed) {
      if (!topicAlreadyCompleted) {
        const [alreadyCounted] = await conn.query(
          `
          SELECT COUNT(*) AS c
          FROM simulation_attempts
          WHERE student_id = ?
            AND simulation_id = ?
            AND is_passed = 1
          `,
          [user.id, simulationId]
        );
    
        if (Number(alreadyCounted[0]?.c || 0) === 1) {
          await conn.query(
            `
            UPDATE topic_progress
            SET simulations_completed = COALESCE(simulations_completed, 0) + 1
            WHERE student_id = ? AND topic_id = ?
            `,
            [user.id, topicId]
          );
        }
    
        const completionResult = await markSimulationSlotAndMaybeCompleteTopic(
          conn,
          user.id,
          topicId,
          simulationId
        );
    
        topicCompletedNow = completionResult.topicCompletedNow;
      }
    }

    const hasRequiresReview = await columnExists(
      conn,
      "topic_progress",
      "requires_review"
    );

    if (!topicAlreadyCompleted && !isPassed && MAX_ATTEMPTS > 0) {
      const [failRows] = await conn.query(
        `
        SELECT COUNT(*) AS fail_count
        FROM simulation_attempts
        WHERE student_id = ?
          AND simulation_id = ?
          AND is_passed = 0
          AND submitted_at IS NOT NULL
        `,
        [user.id, simulationId]
      );

      const failCount = Number(failRows[0]?.fail_count || 0);

      if (failCount >= MAX_ATTEMPTS && hasRequiresReview) {
        await conn.query(
          `
          UPDATE topic_progress
          SET requires_review = 1,
              requires_review_reason = ?,
              requires_review_set_at = NOW()
          WHERE student_id = ? AND topic_id = ?
  AND status <> 'completed'
          `,
          [
            `Failed this simulation 3 times. Re-watch video to unlock.`,
            user.id,
            topicId,
          ]
        );
      }
    }

    await conn.commit();

    if (topicCompletedNow) {
      try {
        await rewardService.processRewards(user.id, topicId, moduleId);
      } catch (rewardErr) {
        console.error("REWARD ERROR:", rewardErr);
      }
    }

    return res.json({
      success: true,
      data: {
        message: "Simulation submitted",
        attempt_id: attemptId,
        score,
        is_passed: Boolean(isPassed),
        pass_score: PASS_SCORE,
        correct,
        total,
        suspicious_flags: suspiciousFlags,
      },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}
    console.error("SUBMIT SIMULATION ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
};

/*
====================================================
COMPLETE SIMULATION ATTEMPT (UI-DRIVEN SIMS)
POST /api/simulations/simulation-attempts/:attemptId/complete
====================================================
*/
exports.completeSimulationAttempt = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const user = req.user;
    const attemptId = Number(req.params.attemptId);

    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!attemptId) return res.status(400).json({ error: "Invalid attemptId" });

    await conn.beginTransaction();

    const [attemptRows] = await conn.query(
      `SELECT * FROM simulation_attempts WHERE id = ? LIMIT 1`,
      [attemptId]
    );

    if (attemptRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Attempt not found" });
    }

    const attempt = attemptRows[0];

    if (Number(attempt.student_id) !== Number(user.id)) {
      await conn.rollback();
      return res.status(403).json({ error: "Forbidden" });
    }

    const simulationId = Number(attempt.simulation_id);

    const [simRows] = await conn.query(
      `SELECT * FROM simulations WHERE id = ? LIMIT 1`,
      [simulationId]
    );

    if (simRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Simulation not found" });
    }

    const sim = simRows[0];
    const topicId = Number(sim.topic_id);
    const score = Number(req.body?.score || 100);

    const access = await getAccessibleTopicForSimulation(user, topicId, conn);

    if (!access.ok) {
      await conn.rollback();
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const moduleId = Number(access.topic.module_id);
    let topicCompletedNow = false;
    
    const [topicProgressRows] = await conn.query(
      `
      SELECT status
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      LIMIT 1
      `,
      [user.id, topicId]
    );
    
    const topicAlreadyCompleted =
      topicProgressRows[0]?.status === "completed";

    const timeTaken = Number(req.body?.time_taken_seconds || 0);

    if (attempt.is_passed !== null) {
      await conn.commit();
      return res.json({
        success: true,
        data: {
          message: "Simulation already completed",
          attempt_id: attemptId,
          score: Number(attempt.score || score),
          is_passed: Boolean(attempt.is_passed),
        },
      });
    }

    await conn.query(
      `
      UPDATE simulation_attempts
      SET time_taken_seconds = ?,
          score = ?,
          is_passed = 1,
          submitted_at = NOW()
      WHERE id = ?
      `,
      [timeTaken, score, attemptId]
    );

    await conn.query(
      `
      INSERT INTO student_simulation_stats
        (student_id, simulation_id, total_attempts, best_score, average_score, total_time_spent, last_attempt_at)
      VALUES
        (?, ?, 1, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        total_attempts = total_attempts + 1,
        best_score = GREATEST(best_score, VALUES(best_score)),
        average_score = ((average_score * total_attempts) + VALUES(average_score)) / (total_attempts + 1),
        total_time_spent = total_time_spent + VALUES(total_time_spent),
        last_attempt_at = NOW()
      `,
      [user.id, simulationId, score, score, timeTaken]
    );

    await conn.query(
      `
      INSERT INTO topic_progress (student_id, topic_id, status, video_completed)
      VALUES (?, ?, 'not_started', 0)
      ON DUPLICATE KEY UPDATE student_id = student_id
      `,
      [user.id, topicId]
    );

    if (!topicAlreadyCompleted) {
      await conn.query(
        `
        UPDATE topic_progress
        SET simulation_attempts_count = COALESCE(simulation_attempts_count, 0) + 1,
            best_simulation_score = GREATEST(COALESCE(best_simulation_score, 0), ?)
        WHERE student_id = ? AND topic_id = ?
        `,
        [score, user.id, topicId]
      );
    
      const [alreadyCounted] = await conn.query(
        `
        SELECT COUNT(*) AS c
        FROM simulation_attempts
        WHERE student_id = ?
          AND simulation_id = ?
          AND is_passed = 1
        `,
        [user.id, simulationId]
      );
    
      if (Number(alreadyCounted[0]?.c || 0) === 1) {
        await conn.query(
          `
          UPDATE topic_progress
          SET simulations_completed = COALESCE(simulations_completed, 0) + 1
          WHERE student_id = ? AND topic_id = ?
          `,
          [user.id, topicId]
        );
      }
    
      const completionResult = await markSimulationSlotAndMaybeCompleteTopic(
        conn,
        user.id,
        topicId,
        simulationId
      );
    
      topicCompletedNow = completionResult.topicCompletedNow;
    }

    await conn.commit();

    if (topicCompletedNow) {
      try {
        await rewardService.processRewards(user.id, topicId, moduleId);
      } catch (rewardErr) {
        console.error("REWARD ERROR:", rewardErr);
      }
    }

    return res.json({
      success: true,
      data: {
        message: "Simulation completed",
        attempt_id: attemptId,
        score,
        is_passed: true,
      },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}
    console.error("COMPLETE SIMULATION ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
};

/*
====================================================
SUPERADMIN: GET ALL SIMULATIONS
====================================================
*/
exports.getAdminSimulations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
    SELECT
      s.id,
      s.topic_id,
      s.simulation_no,
      s.title,
      s.component_key,
      s.sim_type,
      s.pass_score,
      s.max_attempts,
      s.difficulty,
      s.is_active,
      s.organization_id,
      s.estimated_time_seconds,
      s.created_at,
      s.slug,
      s.category,
      t.title AS topic_title,
      t.module_id,
      m.title AS module_title
    FROM simulations s
    JOIN topics t ON t.id = s.topic_id
    JOIN modules m ON m.id = t.module_id
    ORDER BY m.id ASC, t.sort_order ASC, s.simulation_no ASC, s.id ASC
      `
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET ADMIN SIMULATIONS ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/*
====================================================
SUPERADMIN: CREATE SIMULATION
====================================================
*/
exports.createSimulation = async (req, res) => {
  try {
    const {
      topic_id,
      simulation_no = 1,
      title,
      component_key,
      sim_type,
      pass_score = 70,
      max_attempts = 3,
      difficulty = "medium",
      is_active = 1,
      estimated_time_seconds = 300,
    } = req.body;

    if (!topic_id) {
      return res.status(400).json({ error: "topic_id is required" });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    if (!component_key || !String(component_key).trim()) {
      return res.status(400).json({ error: "component_key is required" });
    }

    if (!sim_type || !String(sim_type).trim()) {
      return res.status(400).json({ error: "sim_type is required" });
    }

    const passScoreNum = Number(pass_score);
    const maxAttemptsNum = Number(max_attempts);
    const estimatedTimeNum = Number(estimated_time_seconds);
    const allowedDifficulty = ["easy", "medium", "hard"];
    const simulationNoNum = Number(simulation_no);

if (![1, 2].includes(simulationNoNum)) {
  return res.status(400).json({
    error: "simulation_no must be 1 or 2",
  });
}

    if (!Number.isInteger(passScoreNum) || passScoreNum < 1 || passScoreNum > 100) {
      return res.status(400).json({
        error: "pass_score must be between 1 and 100",
      });
    }

    if (!Number.isInteger(maxAttemptsNum) || maxAttemptsNum < 1 || maxAttemptsNum > 10) {
      return res.status(400).json({
        error: "max_attempts must be between 1 and 10",
      });
    }

    if (!Number.isInteger(estimatedTimeNum) || estimatedTimeNum < 30) {
      return res.status(400).json({
        error: "estimated_time_seconds must be at least 30",
      });
    }

    if (!allowedDifficulty.includes(String(difficulty))) {
      return res.status(400).json({
        error: "difficulty must be easy, medium, or hard",
      });
    }

    const [topicRows] = await pool.query(
      `
      SELECT t.id, t.module_id, m.is_public, m.audience_type
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE t.id = ?
      LIMIT 1
      `,
      [topic_id]
    );

    if (topicRows.length === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const topicRow = topicRows[0];


    const [duplicateRows] = await pool.query(
      `
      SELECT id
      FROM simulations
      WHERE topic_id = ?
        AND simulation_no = ?
      LIMIT 1
      `,
      [topic_id, simulationNoNum]
    );
    
    if (duplicateRows.length > 0) {
      return res.status(400).json({
        error: `Simulation ${simulationNoNum} already exists for this topic`,
      });
    }

    const [result] = await pool.query(
      `
INSERT INTO simulations
(
  topic_id,
  simulation_no,
  title,
  component_key,
  sim_type,
  pass_score,
  max_attempts,
  difficulty,
  is_active,
  estimated_time_seconds
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Number(topic_id),
        simulationNoNum,
        String(title).trim(),
        String(component_key).trim(),
        String(sim_type).trim(),
        passScoreNum,
        maxAttemptsNum,
        String(difficulty),
        Number(is_active) === 1 ? 1 : 0,
        estimatedTimeNum,
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Simulation created successfully",
        simulation_id: result.insertId,
      },
    });
  } catch (err) {
    console.error("CREATE SIMULATION ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/*
====================================================
SUPERADMIN: UPDATE SIMULATION
====================================================
*/
exports.updateSimulation = async (req, res) => {
  try {
    const { simulationId } = req.params;
    const {
      topic_id,
      simulation_no,
      title,
      component_key,
      sim_type,
      pass_score,
      max_attempts,
      difficulty,
      is_active,
      estimated_time_seconds,
    } = req.body;

    if (!simulationId) {
      return res.status(400).json({ error: "simulationId is required" });
    }

    if (!topic_id) {
      return res.status(400).json({ error: "topic_id is required" });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    if (!component_key || !String(component_key).trim()) {
      return res.status(400).json({ error: "component_key is required" });
    }

    if (!sim_type || !String(sim_type).trim()) {
      return res.status(400).json({ error: "sim_type is required" });
    }

    const passScoreNum = Number(pass_score);
    const maxAttemptsNum = Number(max_attempts);
    const estimatedTimeNum = Number(estimated_time_seconds);
    const allowedDifficulty = ["easy", "medium", "hard"];
    const simulationNoNum = Number(simulation_no);

if (![1, 2].includes(simulationNoNum)) {
  return res.status(400).json({
    error: "simulation_no must be 1 or 2",
  });
}

    if (!Number.isInteger(passScoreNum) || passScoreNum < 1 || passScoreNum > 100) {
      return res.status(400).json({
        error: "pass_score must be between 1 and 100",
      });
    }

    if (!Number.isInteger(maxAttemptsNum) || maxAttemptsNum < 1 || maxAttemptsNum > 10) {
      return res.status(400).json({
        error: "max_attempts must be between 1 and 10",
      });
    }

    if (!Number.isInteger(estimatedTimeNum) || estimatedTimeNum < 30) {
      return res.status(400).json({
        error: "estimated_time_seconds must be at least 30",
      });
    }

    if (!allowedDifficulty.includes(String(difficulty))) {
      return res.status(400).json({
        error: "difficulty must be easy, medium, or hard",
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT s.id
      FROM simulations s
      WHERE s.id = ?
      LIMIT 1
      `,
      [simulationId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    const [topicRows] = await pool.query(
      `
      SELECT t.id, m.is_public, m.audience_type
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE t.id = ?
      LIMIT 1
      `,
      [topic_id]
    );

    if (topicRows.length === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const topicRow = topicRows[0];


    const [duplicateRows] = await pool.query(
      `
      SELECT id
      FROM simulations
      WHERE topic_id = ?
        AND simulation_no = ?
        AND id <> ?
      LIMIT 1
      `,
      [topic_id, simulationNoNum, simulationId]
    );
    
    if (duplicateRows.length > 0) {
      return res.status(400).json({
        error: `Simulation ${simulationNoNum} already exists for this topic`,
      });
    }

    await pool.query(
      `
UPDATE simulations
SET
  topic_id = ?,
  simulation_no = ?,
  title = ?,
  component_key = ?,
  sim_type = ?,
  pass_score = ?,
  max_attempts = ?,
  difficulty = ?,
  is_active = ?,
  estimated_time_seconds = ?
WHERE id = ?
      `,
      [
        Number(topic_id),
        simulationNoNum,
        String(title).trim(),
        String(component_key).trim(),
        String(sim_type).trim(),
        passScoreNum,
        maxAttemptsNum,
        String(difficulty),
        Number(is_active) === 1 ? 1 : 0,
        estimatedTimeNum,
        Number(simulationId),
      ]
    );

    return res.json({
      success: true,
      data: {
        message: "Simulation updated successfully",
      },
    });
  } catch (err) {
    console.error("UPDATE SIMULATION ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/*
====================================================
SUPERADMIN: DELETE SIMULATION
====================================================
*/
exports.deleteSimulation = async (req, res) => {
  try {
    const { simulationId } = req.params;

    if (!simulationId) {
      return res.status(400).json({ error: "simulationId is required" });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM simulations
      WHERE id = ?
      LIMIT 1
      `,
      [simulationId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    const [attemptRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM simulation_attempts
      WHERE simulation_id = ?
      `,
      [simulationId]
    );

    const hasAttempts = Number(attemptRows[0]?.total || 0) > 0;

    if (hasAttempts) {
      await pool.query(
        `
        UPDATE simulations
        SET is_active = 0
        WHERE id = ?
        `,
        [simulationId]
      );

      return res.json({
        success: true,
        data: {
          message: "Simulation has attempts, so it was deactivated instead of deleted",
        },
      });
    }

    await pool.query(
      `
      DELETE FROM simulation_scenarios
      WHERE simulation_id = ?
      `,
      [simulationId]
    );

    await pool.query(
      `
      DELETE FROM simulations
      WHERE id = ?
      `,
      [simulationId]
    );

    return res.json({
      success: true,
      data: {
        message: "Simulation deleted successfully",
      },
    });
  } catch (err) {
    console.error("DELETE SIMULATION ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getSimulationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT COUNT(DISTINCT simulation_id) AS completed
      FROM simulation_attempts
      WHERE student_id = ? AND is_passed = 1
      `,
      [userId]
    );

    return res.json({
      success: true,
      data: {
        completed: rows[0]?.completed || 0,
      },
    });
  } catch (err) {
    console.error("GET SIMULATION STATS ERROR:", err);
    return res.status(500).json({
      error: "Failed to fetch simulation stats",
    });
  }
};