// src/controllers/simulationController.js
const { pool } = require("../config/db");
const rewardService = require("../services/rewardService");

/*
=========================================================
IMPORTANT (Pro LMS Lock Feature)
=========================================================
This controller supports the "After 3 fails -> lock + requires_review" flow.

✅ To fully enable the unlock-after-rewatch behavior, your DB should have
these columns in `topic_progress` (recommended):

- requires_review TINYINT(1) NOT NULL DEFAULT 0
- requires_review_reason VARCHAR(255) NULL
- requires_review_set_at DATETIME NULL
- video_completed_at DATETIME NULL

If you don't have them yet, the code will still work for scoring/attempts,
but the lock/unlock flow may not function until you add those columns.
(You can add them later and this code will start using them automatically.)
*/

function normalizeAnswer(val) {
    if (val === null || val === undefined) return "";
  
    val = String(val).trim().toLowerCase();
  
    // boolean compatibility (both directions safe)
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
  const device = req.headers["x-device-info"] || null; // optional custom header
  const browser = ua ? ua.slice(0, 250) : null;

  return {
    ip_address: ip ? String(ip).slice(0, 45) : null,
    device_info: device ? String(device).slice(0, 255) : null,
    browser_info: browser,
  };
}

// ---- small helpers (safe checks) ----
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
    // If INFO_SCHEMA query fails, assume column does not exist
    _colCache.set(key, false);
    return false;
  }
}

/*
====================================================
LIST SIMULATIONS FOR A TOPIC (CORE + ORG)
GET /api/topics/:topicId/simulations
====================================================
*/
exports.listTopicSimulations = async (req, res) => {
  try {
    const user = req.user;
    const topicId = Number(req.params.topicId);

    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!topicId) return res.status(400).json({ error: "Invalid topicId" });

    // Multi-tenant rule:
    // - general users => only core simulations (organization_id IS NULL)
    // - org users => core + their org simulations
    const orgId = user.organization_id || null;

    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.topic_id,
        s.title,
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
        AND (
          s.organization_id IS NULL
          OR ( ? IS NOT NULL AND s.organization_id = ? )
        )
      ORDER BY s.id ASC
      `,
      [topicId, orgId, orgId]
    );

    res.json({ simulations: rows });
  } catch (err) {
    console.error("LIST SIMULATIONS ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/*
====================================================
START SIMULATION ATTEMPT
POST /api/simulations/:simulationId/start
Body: { meta_json?: {...} }
====================================================
Returns: attempt_id + simulation + scenarios
====================================================
*/
exports.startSimulation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const user = req.user;
    const simulationId = Number(req.params.simulationId);

    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!simulationId) return res.status(400).json({ error: "Invalid simulationId" });

    // Only students can start
    if (!["org_student", "general_user"].includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const orgId = user.organization_id || null;

    await conn.beginTransaction();

    // Get simulation (tenant safe)
    const [simRows] = await conn.query(
      `
      SELECT *
      FROM simulations
      WHERE id = ?
        AND is_active = 1
        AND (
          organization_id IS NULL
          OR ( ? IS NOT NULL AND organization_id = ? )
        )
      LIMIT 1
      `,
      [simulationId, orgId, orgId]
    );

    if (simRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Simulation not found or access denied" });
    }

    const sim = simRows[0];
    const topicId = Number(sim.topic_id);

    // ================================
// SEQUENTIAL RULE (Sim 1 -> Sim 2)
// ================================

// Get all simulations for this topic ordered
const [allSims] = await conn.query(
    `SELECT id FROM simulations WHERE topic_id = ? AND is_active = 1 ORDER BY id ASC`,
    [topicId]
  );
  
  if (allSims.length >= 2) {
    const firstSimId = allSims[0].id;
    const secondSimId = allSims[1].id;
  
    // If trying to access Simulation 2
    if (simulationId === secondSimId) {
  
      const [passCheck] = await conn.query(
        `
        SELECT COUNT(*) AS c
        FROM simulation_attempts
        WHERE student_id = ?
          AND simulation_id = ?
          AND is_passed = 1
        `,
        [user.id, firstSimId]
      );
  
      const passedSim1 = Number(passCheck[0]?.c || 0) > 0;
  
      if (!passedSim1) {
        await conn.rollback();
        return res.status(403).json({
          error: "You must pass Simulation 1 before attempting Simulation 2."
        });
      }
    }
  }

    // ---- PRO LOCK RULE (after max fails) ----
    // We store lock state in topic_progress.requires_review if columns exist.
    // If columns don't exist, we still block by counting fails >= max_attempts (basic fallback).
    const hasRequiresReview = await columnExists(conn, "topic_progress", "requires_review");
    const hasRequiresReviewSetAt = await columnExists(conn, "topic_progress", "requires_review_set_at");
    const hasVideoCompletedAt = await columnExists(conn, "topic_progress", "video_completed_at");

    // Ensure topic_progress row exists
    await conn.query(
      `
      INSERT INTO topic_progress (student_id, topic_id, status, video_completed)
      VALUES (?, ?, 'not_started', 0)
      ON DUPLICATE KEY UPDATE student_id = student_id
      `,
      [user.id, topicId]
    );

    // If locked, block startSimulation unless video was re-completed AFTER lock time.
    if (hasRequiresReview) {
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
        // unlock condition: user re-watched video after lock time (video_completed_at > requires_review_set_at)
        const canAutoUnlock =
          hasVideoCompletedAt &&
          hasRequiresReviewSetAt &&
          tp.video_completed_at &&
          tp.requires_review_set_at &&
          new Date(tp.video_completed_at).getTime() > new Date(tp.requires_review_set_at).getTime();

        if (canAutoUnlock) {
          // reset lock
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

          // reset attempts for THIS topic simulations (recommended behavior)
          // (You can keep history if you want; but you asked "reset attempt counter to 0")
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

    // ---- attempt limit ----
    const maxAttempts = Number(sim.max_attempts || 3);

    // Fallback blocking: if fails >= maxAttempts and never passed, block (even if no requires_review column)
    if (!hasRequiresReview) {
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
          error: "Maximum failed attempts reached. Please review the video before retrying.",
        });
      }
    }

   

    // Determine next attempt number
    const [maxAttemptRows] = await conn.query(
      `
      SELECT COALESCE(MAX(attempt_number), 0) AS maxn
      FROM simulation_attempts
      WHERE student_id = ? AND simulation_id = ?
      `,
      [user.id, simulationId]
    );
    const nextAttempt = Number(maxAttemptRows[0]?.maxn || 0) + 1;

    // Insert attempt (start time: NOW, submitted_at should be NULL until submit)
    const meta = req.body?.meta_json ?? null;
    const clientInfo = getClientInfo(req);

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

    const attemptId = ins.insertId;

    // Load scenarios
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

    res.status(201).json({
      message: "Simulation attempt started",
      attempt_id: attemptId,
      simulation: {
        id: sim.id,
        topic_id: sim.topic_id,
        title: sim.title,
        sim_type: sim.sim_type,
        pass_score: Number(sim.pass_score || 70),
        max_attempts: maxAttempts,
        difficulty: sim.difficulty,
        estimated_time_seconds: Number(sim.estimated_time_seconds || 300),
      },
      scenarios: scenarios.map((s) => ({
        id: s.id,
        prompt: s.prompt,
        data_json: s.data_json, // frontend can use this to render UI
        sort_order: s.sort_order,
      })),
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}
    console.error("START SIMULATION ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
};

/*
====================================================
SUBMIT SIMULATION ATTEMPT
POST /api/simulation-attempts/:attemptId/submit
Body:
{
  time_taken_seconds: 123,
  answers: [
    { scenario_id: 1, answer: "A" },
    { scenario_id: 2, answer: "B" }
  ]
}
====================================================
PRO FEATURES INCLUDED:
- score + pass/fail
- store per scenario answers
- per-student simulation stats
- topic_progress tracking for "2 simulations per topic"
- LOCK after max fails => requires_review=1
- topic completion check
- rewardService trigger when topic completes
====================================================
*/
exports.submitSimulationAttempt = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const user = req.user;
    const attemptId = Number(req.params.attemptId);

    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!attemptId) return res.status(400).json({ error: "Invalid attemptId" });

    // Only students can submit
    if (!["org_student", "general_user"].includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const timeTaken = Number(req.body?.time_taken_seconds || 0);
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

    if (answers.length === 0) {
      return res.status(400).json({ error: "answers[] is required" });
    }

    await conn.beginTransaction();

    // Load attempt
    const [attemptRows] = await conn.query(
      `SELECT * FROM simulation_attempts WHERE id = ? LIMIT 1`,
      [attemptId]
    );

    if (attemptRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Attempt not found" });
    }

    const attempt = attemptRows[0];

    // ownership check
    if (Number(attempt.student_id) !== Number(user.id)) {
      await conn.rollback();
      return res.status(403).json({ error: "Forbidden" });
    }

    // Already submitted check
    if (attempt.is_passed !== null) {
      await conn.rollback();
      return res.status(400).json({ error: "Attempt already submitted" });
    }

    const simulationId = Number(attempt.simulation_id);

    // Get simulation (and rules)
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

    // Load correct answers
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

    // Score
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

      // Upsert answer (safe if user resubmits same attempt - but we block resubmit anyway)
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

    // Suspicious flags example (very basic): 1 = too fast
    let suspiciousFlags = Number(attempt.suspicious_flags || 0);
    const minTime = Math.max(
      5,
      Math.floor(Number(sim.estimated_time_seconds || 300) * 0.15)
    );
    if (timeTaken > 0 && timeTaken < minTime) {
      suspiciousFlags = suspiciousFlags | 1;
    }

    const clientInfo = getClientInfo(req);

    // Update attempt
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

    // Update student_simulation_stats (upsert)
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

    // Ensure topic_progress exists
    await conn.query(
      `
      INSERT INTO topic_progress (student_id, topic_id, status, video_completed)
      VALUES (?, ?, 'not_started', 0)
      ON DUPLICATE KEY UPDATE student_id = student_id
      `,
      [user.id, topicId]
    );

    // Increment simulation_attempts_count always
    await conn.query(
      `
      UPDATE topic_progress
      SET simulation_attempts_count = simulation_attempts_count + 1
      WHERE student_id = ? AND topic_id = ?
      `,
      [user.id, topicId]
    );

    // Update best_simulation_score if improved
    await conn.query(
      `
      UPDATE topic_progress
      SET best_simulation_score = GREATEST(COALESCE(best_simulation_score, 0), ?)
      WHERE student_id = ? AND topic_id = ?
      `,
      [score, user.id, topicId]
    );

    // If passed, count it as completed simulation (ONLY ONCE per simulation)
    if (isPassed) {
      const [alreadyPassedRows] = await conn.query(
        `
        SELECT COUNT(*) AS c
        FROM simulation_attempts
        WHERE student_id = ?
          AND simulation_id = ?
          AND is_passed = 1
          AND id <> ?
        `,
        [user.id, simulationId, attemptId]
      );

      const alreadyPassedBefore = Number(alreadyPassedRows[0]?.c || 0) > 0;
      if (!alreadyPassedBefore) {
        await conn.query(
          `
          UPDATE topic_progress
          SET simulations_completed = simulations_completed + 1
          WHERE student_id = ? AND topic_id = ?
          `,
          [user.id, topicId]
        );
      }
    }

    // ---- PRO LOCK: after MAX_ATTEMPTS failed submissions, lock topic simulations ----
    // (Your requested: lock simulation + requires_review=1 + block startSimulation)
    const hasRequiresReview = await columnExists(conn, "topic_progress", "requires_review");
    const hasReason = await columnExists(conn, "topic_progress", "requires_review_reason");
    const hasSetAt = await columnExists(conn, "topic_progress", "requires_review_set_at");

 // ======================================
// LOCK AFTER 3 FAILS IN THIS SIMULATION
// ======================================

if (!isPassed && MAX_ATTEMPTS > 0) {

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
        `,
        [
          `Failed this simulation 3 times. Re-watch video to unlock.`,
          user.id,
          topicId
        ]
      );
    }
  }

    // ---- Topic completion rule (your style) ----
    // video_completed=1 AND quiz>=70 AND best_simulation_score>=70 AND simulations_completed>=2
    const [tpRows] = await conn.query(
      `
      SELECT video_completed, best_quiz_score, best_simulation_score, simulations_completed, status
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      LIMIT 1
      `,
      [user.id, topicId]
    );

    let topicCompletedNow = false;

    if (tpRows.length > 0) {
      const tp = tpRows[0];
      const canComplete =
        Number(tp.video_completed) === 1 &&
        Number(tp.best_quiz_score || 0) >= 70 &&
        Number(tp.best_simulation_score || 0) >= 70 &&
        Number(tp.simulations_completed || 0) >= 2;

      if (canComplete && tp.status !== "completed") {
        await conn.query(
          `
          UPDATE topic_progress
          SET status = 'completed', completed_at = NOW()
          WHERE student_id = ? AND topic_id = ?
          `,
          [user.id, topicId]
        );
        topicCompletedNow = true;
      }
    }

    // If topic completed, trigger rewards (topic badge + maybe module/cert)
    if (topicCompletedNow) {
      // get module id for rewards
      const [topicRows] = await conn.query(
        `SELECT module_id FROM topics WHERE id = ? LIMIT 1`,
        [topicId]
      );
      const moduleId = topicRows[0]?.module_id || null;

      // Call reward service AFTER topic completion
      if (moduleId) {
        // rewardService uses its own pool queries; safe after commit,
        // but we can call it now before commit too. We'll do after commit.
        // (store IDs now)
        attempt._rewardModuleId = moduleId;
      }
    }

    await conn.commit();

    // Call reward service after commit (cleaner)
    if (topicCompletedNow && attempt._rewardModuleId) {
      try {
        await rewardService.processRewards(user.id, topicId, attempt._rewardModuleId);
      } catch (e) {
        console.error("REWARD SERVICE ERROR (simulation submit):", e);
        // Do not fail simulation submit if reward service fails
      }
    }

    res.json({
      message: "Simulation submitted",
      attempt_id: attemptId,
      score,
      is_passed: Boolean(isPassed),
      pass_score: PASS_SCORE,
      correct,
      total,
      suspicious_flags: suspiciousFlags,
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