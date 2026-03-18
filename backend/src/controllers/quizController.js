// src/controllers/quizController.js
const { pool } = require("../config/db");
const rewardService = require('../services/rewardService');
/* =====================================================
   SUPERADMIN: Create quiz for a topic
===================================================== */
exports.createQuiz = async (req, res) => {
  try {
    const { topic_id, title, max_attempts = 3 } = req.body;

    if (!topic_id || !title) {
      return res.status(400).json({ error: "topic_id and title are required" });
    }

    const maxAttemptsNum = Number(max_attempts);
    if (!Number.isInteger(maxAttemptsNum) || maxAttemptsNum < 1 || maxAttemptsNum > 10) {
      return res.status(400).json({ error: "max_attempts must be an integer between 1 and 10" });
    }

    const [topic] = await pool.query("SELECT id FROM topics WHERE id = ?", [topic_id]);

    if (topic.length === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const [result] = await pool.query(
      "INSERT INTO quizzes (topic_id, title, max_attempts) VALUES (?, ?, ?)",
      [topic_id, String(title).trim(), maxAttemptsNum]
    );

    res.status(201).json({
      message: "Quiz created successfully",
      quiz_id: result.insertId
    });
  } catch (err) {
    console.error("CREATE QUIZ ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   SUPERADMIN: Add Question
===================================================== */
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;

    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation_nepali = null,
      explanation_english = null
    } = req.body;

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const allowed = ["A", "B", "C", "D"];
    const correct = String(correct_option).toUpperCase().trim();
    if (!allowed.includes(correct)) {
      return res.status(400).json({ error: "correct_option must be A/B/C/D" });
    }

    const [quiz] = await pool.query("SELECT id FROM quizzes WHERE id = ?", [quizId]);
    if (quiz.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO questions
       (quiz_id, question_text, option_a, option_b, option_c, option_d,
        correct_option, explanation_nepali, explanation_english)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quizId,
        String(question_text).trim(),
        String(option_a).trim(),
        String(option_b).trim(),
        String(option_c).trim(),
        String(option_d).trim(),
        correct,
        explanation_nepali ? String(explanation_nepali) : null,
        explanation_english ? String(explanation_english) : null
      ]
    );

    res.status(201).json({
      message: "Question added successfully",
      question_id: result.insertId
    });
  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   GET QUIZ (Random Order + SAFE Option Shuffle)
===================================================== */
exports.getQuizById = async (req, res) => {
  try {
    const quiz_id = req.params.quizId || req.params.id;
    const user = req.user;

    if (!quiz_id) return res.status(400).json({ error: "quizId is required" });
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const [quizRows] = await pool.query(
      `SELECT q.id, q.topic_id, q.title, q.created_at, q.max_attempts,
              t.organization_id
       FROM quizzes q
       JOIN topics t ON q.topic_id = t.id
       WHERE q.id = ?`,
      [quiz_id]
    );

    if (quizRows.length === 0) return res.status(404).json({ error: "Quiz not found" });

    const quiz = quizRows[0];

    // org isolation
    if (user.role !== "superadmin") {
      const quizOrgId = quiz.organization_id ?? null;

      if (user.role === "general_user") {
        if (quizOrgId !== null) {
          return res.status(403).json({ error: "Access denied (organization-only quiz)" });
        }
      } else {
        if (!user.organization_id) {
          return res.status(403).json({ error: "No organization assigned" });
        }
        if (quizOrgId !== null && Number(quizOrgId) !== Number(user.organization_id)) {
          return res.status(403).json({ error: "Access denied (cross-organization)" });
        }
      }
    }

    const [questions] = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d
       FROM questions
       WHERE quiz_id = ?
       ORDER BY RAND()
       LIMIT 5`,
      [quiz_id]
    );

    if (questions.length < 5) {
      return res.status(400).json({ error: "Quiz must have at least 5 questions" });
    }
    // shuffle questions
    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    // SAFE option shuffle (keeps original key A/B/C/D for grading)
    const finalQuestions = shuffledQuestions.map((q) => {
      const options = [
        { key: "A", text: q.option_a },
        { key: "B", text: q.option_b },
        { key: "C", text: q.option_c },
        { key: "D", text: q.option_d }
      ];

      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: q.id,
        question_text: q.question_text,
        options
      };
    });

    return res.json({
      quiz: {
        id: quiz.id,
        topic_id: quiz.topic_id,
        title: quiz.title,
        created_at: quiz.created_at,
        max_attempts: quiz.max_attempts,
        questions: finalQuestions
      }
    });
  } catch (error) {
    console.error("GET QUIZ ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getQuizByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;
    const user = req.user;

    if (!topicId) {
      return res.status(400).json({ error: "topicId is required" });
    }

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [quizRows] = await pool.query(
      `SELECT q.id, q.topic_id, q.title, q.created_at, q.max_attempts,
              t.organization_id
       FROM quizzes q
       JOIN topics t ON q.topic_id = t.id
       WHERE q.topic_id = ?
       LIMIT 1`,
      [topicId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ error: "Quiz not found for this topic" });
    }

    const quiz = quizRows[0];

    if (user.role !== "superadmin") {
      const quizOrgId = quiz.organization_id ?? null;

      if (user.role === "general_user") {
        if (quizOrgId !== null) {
          return res.status(403).json({ error: "Access denied (organization-only quiz)" });
        }
      } else {
        if (!user.organization_id) {
          return res.status(403).json({ error: "No organization assigned" });
        }
        if (quizOrgId !== null && Number(quizOrgId) !== Number(user.organization_id)) {
          return res.status(403).json({ error: "Access denied (cross-organization)" });
        }
      }
    }

    const [questions] = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d
       FROM questions
       WHERE quiz_id = ?
       ORDER BY RAND()
       LIMIT 5`,
      [quiz.id]
    );

    if (questions.length < 5) {
      return res.status(400).json({ error: "Quiz must have at least 5 questions" });
    }

    const finalQuestions = questions.map((q) => {
      const options = [
        { key: "A", text: q.option_a },
        { key: "B", text: q.option_b },
        { key: "C", text: q.option_c },
        { key: "D", text: q.option_d }
      ];

      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: q.id,
        question_text: q.question_text,
        options
      };
    });

    return res.json({
      quiz: {
        id: quiz.id,
        topic_id: quiz.topic_id,
        title: quiz.title,
        created_at: quiz.created_at,
        max_attempts: quiz.max_attempts,
        questions: finalQuestions
      }
    });
  } catch (error) {
    console.error("GET QUIZ BY TOPIC ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* =====================================================
   STUDENT: Submit Quiz (ADVANCED VERSION)
===================================================== */
exports.submitQuiz = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const quizId = req.params.quizId || req.params.id;
    const user = req.user;
    const student_id = user?.id;

    const { time_taken_seconds = 0, answers = [] } = req.body;

    if (!user || !student_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!["org_student", "general_user"].includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const timeTakenNum = Number(time_taken_seconds);
    if (!Number.isFinite(timeTakenNum) || timeTakenNum < 0 || timeTakenNum > 3600) {
      return res.status(400).json({ error: "time_taken_seconds must be 0..3600" });
    }

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ error: "Exactly 5 answers are required" });
    }

    // Load quiz (+ org from topics)
    const [quizRows] = await connection.query(
      `SELECT q.id, q.topic_id, q.max_attempts,
              t.organization_id
       FROM quizzes q
       JOIN topics t ON q.topic_id = t.id
       WHERE q.id = ?`,
      [quizId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quiz = quizRows[0];

    // Cross-org isolation for submit
    if (user.role !== "superadmin") {
      const quizOrgId = quiz.organization_id ?? null;

      if (user.role === "general_user") {
        if (quizOrgId !== null) {
          return res.status(403).json({ error: "Access denied (organization-only quiz)" });
        }
      } else {
        if (!user.organization_id) {
          return res.status(403).json({ error: "No organization assigned" });
        }
        if (quizOrgId !== null && Number(quizOrgId) !== Number(user.organization_id)) {
          return res.status(403).json({ error: "Access denied (cross-organization)" });
        }
      }
    }

    // Check max attempts
    const [attemptCountRows] = await connection.query(
      "SELECT COUNT(*) as total FROM quiz_attempts WHERE student_id=? AND quiz_id=?",
      [student_id, quizId]
    );

    if (attemptCountRows[0].total >= quiz.max_attempts) {
      return res.status(403).json({
        error: `Maximum attempts (${quiz.max_attempts}) reached`
      });
    }

    // Next attempt number
    const [maxAttemptRows] = await connection.query(
      "SELECT COALESCE(MAX(attempt_number),0) as maxAttempt FROM quiz_attempts WHERE student_id=? AND quiz_id=?",
      [student_id, quizId]
    );
    const attemptNumber = maxAttemptRows[0].maxAttempt + 1;

    // Load questions for grading
    const [questionRows] = await connection.query(
      "SELECT id, correct_option, explanation_nepali, explanation_english FROM questions WHERE quiz_id=? ORDER BY id",
      [quizId]
    );
    if (questionRows.length < 5) {
      return res.status(400).json({ error: "Quiz is misconfigured" });
    }

    const totalQuestions = answers.length;

    const correctMap = new Map();
    questionRows.forEach((q) => correctMap.set(Number(q.id), q));

    // Validate answers count


    const allowedOptions = ["A", "B", "C", "D"];
    const seen = new Set();

    for (const a of answers) {
      if (!a || typeof a !== "object") {
        return res.status(400).json({ error: "Invalid answers format" });
      }
      if (a.question_id == null || a.selected_option == null) {
        return res.status(400).json({ error: "Each answer must have question_id and selected_option" });
      }

      const qid = Number(a.question_id);
      if (!Number.isInteger(qid)) {
        return res.status(400).json({ error: "Invalid question_id" });
      }

      const opt = String(a.selected_option).toUpperCase().trim();
      if (!allowedOptions.includes(opt)) {
        return res.status(400).json({ error: "selected_option must be A/B/C/D" });
      }

      if (seen.has(qid)) {
        return res.status(400).json({ error: "Duplicate question_id in answers" });
      }
      seen.add(qid);

      if (!correctMap.has(qid)) {
        return res.status(400).json({ error: "Invalid question in submission" });
      }
    }

    let correctCount = 0;
    const review = [];

    for (const a of answers) {
      const qid = Number(a.question_id);
      const selected = String(a.selected_option).toUpperCase().trim();
      const q = correctMap.get(qid);

      const isCorrect = q.correct_option === selected;
      if (isCorrect) correctCount++;

      review.push({
        question_id: qid,
        selected,
        correct: q.correct_option,
        isCorrect,
        explanation_nepali: q.explanation_nepali,
        explanation_english: q.explanation_english
      });
    }

    const score = Number(((correctCount / totalQuestions) * 100).toFixed(2));

    const avgTimePerQuestion = timeTakenNum / totalQuestions;

    let minAvgTime;
    if (attemptNumber === 1) minAvgTime = 12;
    else if (attemptNumber === 2) minAvgTime = 8;
    else minAvgTime = 6;

    let is_suspicious = 0;
    let suspicious_reason = null;

    if (avgTimePerQuestion < 6) {
      is_suspicious = 2;
      suspicious_reason = `Extremely fast (${avgTimePerQuestion.toFixed(2)}s per question)`;
    } else if (avgTimePerQuestion < minAvgTime) {
      is_suspicious = 1;
      suspicious_reason = `Faster than expected for attempt ${attemptNumber} (${avgTimePerQuestion.toFixed(
        2
      )}s per question)`;
    }

    await connection.beginTransaction();

    const [attemptResult] = await connection.query(
      `INSERT INTO quiz_attempts
       (student_id, quiz_id, attempt_number, time_taken_seconds, score,
        is_suspicious, suspicious_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, quizId, attemptNumber, timeTakenNum, score, is_suspicious, suspicious_reason]
    );

    const quiz_attempt_id = attemptResult.insertId;

    for (const a of review) {
      await connection.query(
        `INSERT INTO quiz_answers
         (quiz_attempt_id, question_id, selected_option, is_correct)
         VALUES (?, ?, ?, ?)`,
        [quiz_attempt_id, a.question_id, a.selected, a.isCorrect ? 1 : 0]
      );
    }

    await connection.query(
      `INSERT INTO topic_progress
       (student_id, topic_id, status, best_quiz_score,
        last_quiz_score, avg_quiz_score,
        quiz_attempts_count, last_quiz_at,
        suspicious_attempts_count)
       VALUES (?, ?, 'in_progress', ?, ?, ?, 1, NOW(), ?)
       ON DUPLICATE KEY UPDATE
         best_quiz_score = GREATEST(COALESCE(best_quiz_score,0), VALUES(best_quiz_score)),
         last_quiz_score = VALUES(last_quiz_score),
         avg_quiz_score =
           ((COALESCE(avg_quiz_score,0) * quiz_attempts_count) + VALUES(last_quiz_score))
           / (quiz_attempts_count + 1),
         quiz_attempts_count = quiz_attempts_count + 1,
         suspicious_attempts_count = suspicious_attempts_count + VALUES(suspicious_attempts_count),
         last_quiz_at = NOW()`,
      [student_id, quiz.topic_id, score, score, score, is_suspicious]
    );

    await connection.commit();

    const [topicRow] = await pool.query(
      "SELECT module_id FROM topics WHERE id = ?",
      [quiz.topic_id]
    );

    const moduleId = topicRow.length ? topicRow[0].module_id : null;

    if (moduleId) {
      await rewardService.processRewards(
        student_id,
        quiz.topic_id,
        moduleId
      );
    }

    res.status(201).json({
      message: "Quiz submitted successfully",
      attemptNumber,
      score,
      correct: correctCount,
      total: totalQuestions,
      average_time_per_question: avgTimePerQuestion.toFixed(2),
      is_suspicious,
      suspicious_reason,
      review
    });
  } catch (err) {
    try {
      await connection.rollback();
    } catch (e) {
      // ignore rollback errors
    }
    console.error("SUBMIT QUIZ ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

/* =====================================================
   PHASE 2: Admin Suspicious Attempts Dashboard
   - org_admin: only their organization
   - superadmin: all
===================================================== */
exports.getSuspiciousAttempts = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // superadmin sees all, org_admin sees only their organization students
    let orgCondition = "";
    const params = [];

    if (user.role === "org_admin") {
      if (!user.organization_id) {
        return res.status(403).json({ error: "No organization assigned" });
      }

      // ✅ FIXED: filter by student organization (NOT topic)
      orgCondition = "AND u.organization_id = ?";
      params.push(user.organization_id);

    } else if (user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [rows] = await pool.query(
      `SELECT qa.id, qa.score, qa.time_taken_seconds,
              qa.suspicious_reason, qa.created_at,
              u.full_name AS student_name,
              q.title AS quiz_title,
              q.id AS quiz_id
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.is_suspicious > 0
       ${orgCondition}
       ORDER BY qa.created_at DESC`,
      params
    );

    return res.json({ suspicious_attempts: rows });

  } catch (err) {
    console.error("SUSPICIOUS DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   PHASE 3: Question Difficulty Analytics (per quiz)
   - org_admin: only their organization quiz data
   - superadmin: all
===================================================== */
exports.getQuestionAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    let orgCondition = "";
    const params = [quizId];

    if (user.role === "org_admin") {
      if (!user.organization_id) {
        return res.status(403).json({ error: "No organization assigned" });
      }
      orgCondition = "AND t.organization_id = ?";
      params.push(user.organization_id);
    } else if (user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [rows] = await pool.query(
      `SELECT qa.question_id,
              COUNT(*) as total_attempts,
              SUM(qa.is_correct) as correct_count
       FROM quiz_answers qa
       JOIN quiz_attempts qatt ON qa.quiz_attempt_id = qatt.id
       JOIN quizzes q ON qatt.quiz_id = q.id
       JOIN topics t ON q.topic_id = t.id
       WHERE q.id = ?
       ${orgCondition}
       GROUP BY qa.question_id`,
      params
    );

    const analytics = rows.map((r) => {
      const total = Number(r.total_attempts) || 0;
      const correct = Number(r.correct_count) || 0;

      const rateNum = total > 0 ? (correct / total) * 100 : 0;

      let difficulty = "Medium";
      if (rateNum > 80) difficulty = "Easy";
      else if (rateNum < 50) difficulty = "Hard";

      return {
        question_id: r.question_id,
        total_attempts: total,
        correct_count: correct,
        correct_rate: rateNum.toFixed(2) + "%",
        difficulty
      };
    });

    return res.json({ analytics });
  } catch (err) {
    console.error("QUESTION ANALYTICS ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
/* =====================================================
   DASHBOARD: Quiz Stats
===================================================== */
exports.getQuizStats = async (req, res) => {
  try {

    const [quizCount] = await pool.query(
      `SELECT COUNT(*) AS total_quizzes FROM quizzes`
    );

    const [attemptCount] = await pool.query(
      `SELECT COUNT(*) AS total_attempts FROM quiz_attempts`
    );

    const [avgScore] = await pool.query(
      `SELECT AVG(score) AS average_score FROM quiz_attempts`
    );

    return res.json({
      total_quizzes: quizCount[0].total_quizzes || 0,
      total_attempts: attemptCount[0].total_attempts || 0,
      average_score: avgScore[0].average_score || 0
    });

  } catch (err) {
    console.error("QUIZ STATS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};