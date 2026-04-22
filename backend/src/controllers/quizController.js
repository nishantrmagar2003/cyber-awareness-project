const { pool } = require("../config/db");
const rewardService = require("../services/rewardService");
async function getModuleById(moduleId) {
  const [rows] = await pool.query(
    `
    SELECT id, title, is_public, audience_type
    FROM modules
    WHERE id = ?
    LIMIT 1
    `,
    [moduleId]
  );

  return rows[0] || null;
}

async function getTopicById(topicId) {
  const [rows] = await pool.query(
    `
    SELECT
      t.id,
      t.title,
      t.module_id,
      m.title AS module_title,
      m.is_public,
      m.audience_type
    FROM topics t
    JOIN modules m ON m.id = t.module_id
    WHERE t.id = ?
    LIMIT 1
    `,
    [topicId]
  );

  return rows[0] || null;
}
function getPreAssessmentQuestionLimit(moduleRow) {
  const isGeneral =
    Number(moduleRow?.is_public || 0) === 1 &&
    moduleRow?.audience_type === "general";

  return isGeneral ? 10 : 15;
}
function getTopicQuizQuestionLimit(topicRow) {
  const isGeneral =
    Number(topicRow?.is_public || 0) === 1 &&
    topicRow?.audience_type === "general";

  return isGeneral ? 5 : 20;
}


async function getAccessibleTopicForQuiz(user, topicId) {
  const [rows] = await pool.query(
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
        error: "Only org students can access premium quizzes",
      };
    }

    if (!user.organization_id) {
      return {
        ok: false,
        status: 403,
        error: "No organization assigned",
      };
    }

    const [accessRows] = await pool.query(
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
        error: "You do not have access to this premium quiz",
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

async function getAccessibleModuleForPreAssessment(user, moduleId) {
  const [rows] = await pool.query(
    `
    SELECT
      m.id,
      m.is_public,
      m.audience_type
    FROM modules m
    WHERE m.id = ?
    LIMIT 1
    `,
    [moduleId]
  );

  if (rows.length === 0) {
    return {
      ok: false,
      status: 404,
      error: "Module not found",
    };
  }

  const moduleRow = rows[0];

  if (Number(moduleRow.is_public) === 1 && moduleRow.audience_type === "general") {
    return {
      ok: true,
      module: moduleRow,
    };
  }

  if (
    Number(moduleRow.is_public) === 0 &&
    moduleRow.audience_type === "organization"
  ) {
    if (user.role !== "org_student") {
      return {
        ok: false,
        status: 403,
        error: "Only org students can access premium pre-assessment",
      };
    }

    if (!user.organization_id) {
      return {
        ok: false,
        status: 403,
        error: "No organization assigned",
      };
    }

    const [accessRows] = await pool.query(
      `
      SELECT om.id
      FROM organization_modules om
      WHERE om.organization_id = ?
        AND om.module_id = ?
      LIMIT 1
      `,
      [user.organization_id, moduleId]
    );

    if (accessRows.length === 0) {
      return {
        ok: false,
        status: 403,
        error: "You do not have access to this premium module pre-assessment",
      };
    }

    return {
      ok: true,
      module: moduleRow,
    };
  }

  return {
    ok: false,
    status: 403,
    error: "Access denied",
  };
}

/* =====================================================
   SUPERADMIN: CREATE QUIZ
===================================================== */
exports.createQuiz = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      topic_id = null,
      module_id = null,
      quiz_type = "topic_quiz",
      title,
      max_attempts = 3,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "title is required",
      });
    }

    const finalQuizType =
      quiz_type === "pre_assessment" ? "pre_assessment" : "topic_quiz";

    if (finalQuizType === "pre_assessment" && !module_id) {
      return res.status(400).json({
        error: "module_id is required for pre_assessment",
      });
    }

    if (finalQuizType === "topic_quiz" && !topic_id) {
      return res.status(400).json({
        error: "topic_id is required for topic_quiz",
      });
    }

    const maxAttemptsNum = Number(max_attempts);

    if (
      !Number.isInteger(maxAttemptsNum) ||
      maxAttemptsNum < 1 ||
      maxAttemptsNum > 10
    ) {
      return res.status(400).json({
        error: "max_attempts must be an integer between 1 and 10",
      });
    }

    if (finalQuizType === "pre_assessment") {
      const moduleRow = await getModuleById(module_id);

      if (!moduleRow) {
        return res.status(404).json({ error: "Module not found" });
      }
      
      if (
        Number(moduleRow.is_public) === 1 &&
        moduleRow.audience_type === "general"
      ) {
        return res.status(403).json({
          error: "General module pre-assessment is static and cannot be changed",
        });
      }

      const [existingRows] = await pool.query(
        `
        SELECT id
        FROM quizzes
        WHERE module_id = ?
          AND quiz_type = 'pre_assessment'
        LIMIT 1
        `,
        [module_id]
      );

      if (existingRows.length > 0) {
        return res.status(400).json({
          error: "Pre-assessment already exists for this module",
        });
      }

      const [result] = await pool.query(
        `
        INSERT INTO quizzes (topic_id, module_id, quiz_type, title, max_attempts)
        VALUES (NULL, ?, 'pre_assessment', ?, ?)
        `,
        [module_id, String(title).trim(), maxAttemptsNum]
      );

      return res.status(201).json({
        success: true,
        data: {
          message: "Pre-assessment created successfully",
          quiz_id: result.insertId,
        },
      });
    }

    const topicRow = await getTopicById(topic_id);

    if (!topicRow) {
      return res.status(404).json({ error: "Topic not found" });
    }
    
    if (
      Number(topicRow.is_public) === 1 &&
      topicRow.audience_type === "general"
    ) {
      return res.status(403).json({
        error: "General topic quiz is static and cannot be changed",
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM quizzes
      WHERE topic_id = ?
        AND quiz_type = 'topic_quiz'
      LIMIT 1
      `,
      [topic_id]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        error: "Topic quiz already exists for this topic",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO quizzes (topic_id, module_id, quiz_type, title, max_attempts)
      VALUES (?, ?, 'topic_quiz', ?, ?)
      `,
      [topic_id, topicRow.module_id, String(title).trim(), maxAttemptsNum]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Quiz created successfully",
        quiz_id: result.insertId,
      },
    });
  } catch (err) {
    console.error("CREATE QUIZ ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   SUPERADMIN: ADD QUESTION
===================================================== */
exports.addQuestion = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { quizId } = req.params;
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation_nepali = null,
      explanation_english = null,
    } = req.body;

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    if (
      !question_text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_option
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const correct = String(correct_option).toUpperCase().trim();
    const allowed = ["A", "B", "C", "D"];

    if (!allowed.includes(correct)) {
      return res.status(400).json({
        error: "correct_option must be A/B/C/D",
      });
    }

    const [quizRows] = await pool.query(
      `
      SELECT
        q.id,
        q.module_id,
        q.topic_id,
        q.quiz_type,
        m.is_public,
        m.audience_type
      FROM quizzes q
      LEFT JOIN modules m ON m.id = q.module_id
      WHERE q.id = ?
      LIMIT 1
      `,
      [quizId]
    );
    
    if (quizRows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    const quizRow = quizRows[0];
    
    if (
      Number(quizRow.is_public) === 1 &&
      quizRow.audience_type === "general"
    ) {
      return res.status(403).json({
        error: "General quiz questions are static and cannot be changed",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO questions
      (
        quiz_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation_nepali,
        explanation_english
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        quizId,
        String(question_text).trim(),
        String(option_a).trim(),
        String(option_b).trim(),
        String(option_c).trim(),
        String(option_d).trim(),
        correct,
        explanation_nepali ? String(explanation_nepali) : null,
        explanation_english ? String(explanation_english) : null,
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Question added successfully",
        question_id: result.insertId,
      },
    });
  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   GET PRE-ASSESSMENT BY MODULE ID
===================================================== */
exports.getPreAssessmentByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const user = req.user;

    if (!moduleId) {
      return res.status(400).json({ error: "moduleId is required" });
    }

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const access = await getAccessibleModuleForPreAssessment(user, moduleId);

    if (!access.ok) {
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const [quizRows] = await pool.query(
      `
      SELECT
        q.id,
        q.module_id,
        q.quiz_type,
        q.title,
        q.created_at,
        q.max_attempts
      FROM quizzes q
      WHERE q.module_id = ?
        AND q.quiz_type = 'pre_assessment'
      LIMIT 1
      `,
      [moduleId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({
        error: "Pre-assessment not found for this module",
      });
    }

    const quiz = quizRows[0];

    const [questions] = await pool.query(
      `
      SELECT id, question_text, option_a, option_b, option_c, option_d
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
      `,
      [quiz.id]
    );

    if (questions.length === 0) {
      return res.status(400).json({
        error: "Pre-assessment must have at least 1 question",
      });
    }

    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];
    }

    const questionLimit = getPreAssessmentQuestionLimit(access.module);
    const selectedQuestions = shuffledQuestions.slice(0, questionLimit);

    const finalQuestions = selectedQuestions.map((q) => {
      const options = [
        { key: "A", text: q.option_a },
        { key: "B", text: q.option_b },
        { key: "C", text: q.option_c },
        { key: "D", text: q.option_d },
      ];

      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: q.id,
        question_text: q.question_text,
        options,
      };
    });

    return res.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          module_id: quiz.module_id,
          quiz_type: quiz.quiz_type,
          title: quiz.title,
          created_at: quiz.created_at,
          max_attempts: quiz.max_attempts,
          questions: finalQuestions,
        },
      },
    });
  } catch (error) {
    console.error("GET PRE-ASSESSMENT ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   GET QUIZ BY QUIZ ID
===================================================== */
exports.getQuizById = async (req, res) => {
  try {
    const quizId = req.params.quizId || req.params.id;
    const user = req.user;

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [quizRows] = await pool.query(
      `
      SELECT
        q.id,
        q.topic_id,
        q.module_id,
        q.quiz_type,
        q.title,
        q.created_at,
        q.max_attempts
      FROM quizzes q
      WHERE q.id = ?
      LIMIT 1
      `,
      [quizId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quiz = quizRows[0];

    if (quiz.quiz_type === "pre_assessment") {
      const access = await getAccessibleModuleForPreAssessment(user, quiz.module_id);

      if (!access.ok) {
        return res.status(access.status).json({
          success: false,
          error: access.error,
        });
      }
    } else {
      const access = await getAccessibleTopicForQuiz(user, quiz.topic_id);

      if (!access.ok) {
        return res.status(access.status).json({
          success: false,
          error: access.error,
        });
      }
    }

    const [questions] = await pool.query(
      `
      SELECT id, question_text, option_a, option_b, option_c, option_d
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
      `,
      [quizId]
    );

    if (questions.length === 0) {
      return res.status(400).json({
        error: "Quiz must have at least 1 question",
      });
    }

    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];
    }

    let questionLimit = 5;

    if (quiz.quiz_type === "pre_assessment") {
      const moduleAccess = await getAccessibleModuleForPreAssessment(
        user,
        quiz.module_id
      );
    
      if (!moduleAccess.ok) {
        return res.status(moduleAccess.status).json({
          success: false,
          error: moduleAccess.error,
        });
      }
    
      questionLimit = getPreAssessmentQuestionLimit(moduleAccess.module);
    } else {
      const topicAccess = await getAccessibleTopicForQuiz(user, quiz.topic_id);
    
      if (!topicAccess.ok) {
        return res.status(topicAccess.status).json({
          success: false,
          error: topicAccess.error,
        });
      }
    
      questionLimit = getTopicQuizQuestionLimit(topicAccess.topic);
    }
    
    const selectedQuestions = shuffledQuestions.slice(0, questionLimit);
    const finalQuestions = selectedQuestions.map((q) => {
      const options = [
        { key: "A", text: q.option_a },
        { key: "B", text: q.option_b },
        { key: "C", text: q.option_c },
        { key: "D", text: q.option_d },
      ];

      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: q.id,
        question_text: q.question_text,
        options,
      };
    });

    return res.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          topic_id: quiz.topic_id,
          module_id: quiz.module_id,
          quiz_type: quiz.quiz_type,
          title: quiz.title,
          created_at: quiz.created_at,
          max_attempts: quiz.max_attempts,
          questions: finalQuestions,
        },
      },
    });
  } catch (error) {
    console.error("GET QUIZ ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   GET QUIZ BY TOPIC ID
===================================================== */
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

    const access = await getAccessibleTopicForQuiz(user, topicId);

    if (!access.ok) {
      return res.status(access.status).json({
        success: false,
        error: access.error,
      });
    }

    const [progressRows] = await pool.query(
      `
      SELECT video_completed, text_completed, status
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      LIMIT 1
      `,
      [user.id, topicId]
    );
    
    const progress = progressRows[0];
    const topicAlreadyCompleted = progress?.status === "completed";
    
    if (
      !topicAlreadyCompleted &&
      (!progress || !progress.video_completed || !progress.text_completed)
    ) {
      return res.status(403).json({
        error: "Complete video and text before starting quiz",
      });
    }

    const [quizRows] = await pool.query(
      `
      SELECT
        q.id,
        q.topic_id,
        q.module_id,
        q.quiz_type,
        q.title,
        q.created_at,
        q.max_attempts
      FROM quizzes q
      WHERE q.topic_id = ?
        AND q.quiz_type = 'topic_quiz'
      LIMIT 1
      `,
      [topicId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({
        error: "Quiz not found for this topic",
      });
    }

    const quiz = quizRows[0];

    const [questions] = await pool.query(
      `
      SELECT id, question_text, option_a, option_b, option_c, option_d
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
      `,
      [quiz.id]
    );

    if (questions.length === 0) {
      return res.status(400).json({
        error: "Quiz must have at least 1 question",
      });
    }

    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];
    }

    const questionLimit = getTopicQuizQuestionLimit(access.topic);
    const selectedQuestions = shuffledQuestions.slice(0, questionLimit);

    const finalQuestions = selectedQuestions.map((q) => {
      const options = [
        { key: "A", text: q.option_a },
        { key: "B", text: q.option_b },
        { key: "C", text: q.option_c },
        { key: "D", text: q.option_d },
      ];

      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: q.id,
        question_text: q.question_text,
        options,
      };
    });

    return res.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          topic_id: quiz.topic_id,
          module_id: quiz.module_id,
          quiz_type: quiz.quiz_type,
          title: quiz.title,
          created_at: quiz.created_at,
          max_attempts: quiz.max_attempts,
          questions: finalQuestions,
        },
      },
    });
  } catch (error) {
    console.error("GET QUIZ BY TOPIC ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   STUDENT: SUBMIT QUIZ
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
    if (
      !Number.isFinite(timeTakenNum) ||
      timeTakenNum < 0 ||
      timeTakenNum > 3600
    ) {
      return res.status(400).json({
        error: "time_taken_seconds must be 0..3600",
      });
    }

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }



    const [quizRows] = await connection.query(
      
      `
      SELECT
        q.id,
        q.topic_id,
        q.module_id,
        q.quiz_type,
        q.title,
        q.max_attempts
      FROM quizzes q
      WHERE q.id = ?
      LIMIT 1
      `,
      [quizId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quiz = quizRows[0];

    const isPreAssessment = quiz.quiz_type === "pre_assessment";
    let requiredQuestionCount = 5;
    let topicAlreadyCompleted = false;
let progress = null;
if (isPreAssessment) {
  const access = await getAccessibleModuleForPreAssessment(user, quiz.module_id);
  if (!access.ok) {
    return res.status(access.status).json({
      success: false,
      error: access.error,
    });
  }

  requiredQuestionCount = getPreAssessmentQuestionLimit(access.module);
} else {
  const access = await getAccessibleTopicForQuiz(user, quiz.topic_id);
  if (!access.ok) {
    return res.status(access.status).json({
      success: false,
      error: access.error,
    });
  }

  requiredQuestionCount = getTopicQuizQuestionLimit(access.topic);

  const [progressRows] = await connection.query(
    `
    SELECT video_completed, text_completed, status
    FROM topic_progress
    WHERE student_id = ? AND topic_id = ?
    LIMIT 1
    `,
    [student_id, quiz.topic_id]
  );
      
      progress = progressRows[0] || null;
      topicAlreadyCompleted = progress?.status === "completed";
      
      if (
        !topicAlreadyCompleted &&
        (!progress || !progress.video_completed || !progress.text_completed)
      ) {
        return res.status(403).json({
          error: "Invalid quiz submission flow",
        });
      }
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: "Answers are required",
      });
    }
    
    if (answers.length !== requiredQuestionCount) {
      return res.status(400).json({
        error: `You must answer exactly ${requiredQuestionCount} questions`,
      });
    }
    
    const [attemptCountRows] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM quiz_attempts
      WHERE student_id = ? AND quiz_id = ?
      `,
      [student_id, quizId]
    );
    
    const totalAttemptsSoFar = Number(attemptCountRows[0]?.total || 0);
    const isRevisionQuizAttempt = !isPreAssessment && topicAlreadyCompleted;
    
    if (!isRevisionQuizAttempt && totalAttemptsSoFar >= quiz.max_attempts) {
      if (!isPreAssessment) {
        await connection.query(
          `
          UPDATE topic_progress
          SET video_completed = 0,
              video_completed_at = NULL,
              text_completed = 0,
              requires_review = 1,
              requires_review_reason = 'Maximum quiz attempts reached - review video again',
              requires_review_set_at = NOW(),
              status = 'in_progress'
          WHERE student_id = ? AND topic_id = ?
            AND status <> 'completed'
          `,
          [student_id, quiz.topic_id]
        );
      }
    
      return res.status(403).json({
        error: `Maximum attempts (${quiz.max_attempts}) reached`,
      });
    }

    const [maxAttemptRows] = await connection.query(
      `
      SELECT COALESCE(MAX(attempt_number), 0) AS maxAttempt
      FROM quiz_attempts
      WHERE student_id = ? AND quiz_id = ?
      `,
      [student_id, quizId]
    );

    const attemptNumber = Number(maxAttemptRows[0].maxAttempt || 0) + 1;

    const questionIds = answers
      .map((a) => Number(a.question_id))
      .filter((id) => Number.isInteger(id));

    if (questionIds.length === 0) {
      return res.status(400).json({
        error: "No valid question IDs provided",
      });
    }

    const placeholders = questionIds.map(() => "?").join(",");

    const [questionRows] = await connection.query(
      `
      SELECT
        id,
        correct_option,
        explanation_nepali,
        explanation_english
      FROM questions
      WHERE quiz_id = ?
        AND id IN (${placeholders})
      `,
      [quizId, ...questionIds]
    );

    if (questionRows.length !== questionIds.length) {
      return res.status(400).json({
        error: "Some questions are invalid or missing",
      });
    }

    if (questionRows.length === 0) {
      return res.status(400).json({
        error: "Quiz is misconfigured",
      });
    }

    if (answers.length > questionRows.length) {
      return res.status(400).json({
        error: "Too many answers submitted",
      });
    }

    const correctMap = new Map();
    questionRows.forEach((q) => correctMap.set(Number(q.id), q));

    const allowedOptions = ["A", "B", "C", "D"];
    const seen = new Set();

    for (const a of answers) {
      if (!a || typeof a !== "object") {
        return res.status(400).json({ error: "Invalid answers format" });
      }

      if (a.question_id == null || a.selected_option == null) {
        return res.status(400).json({
          error: "Each answer must have question_id and selected_option",
        });
      }

      const qid = Number(a.question_id);
      if (!Number.isInteger(qid)) {
        return res.status(400).json({ error: "Invalid question_id" });
      }

      const opt = String(a.selected_option).toUpperCase().trim();
      if (!allowedOptions.includes(opt)) {
        return res.status(400).json({
          error: "selected_option must be A/B/C/D",
        });
      }

      if (seen.has(qid)) {
        return res.status(400).json({
          error: "Duplicate question_id in answers",
        });
      }

      seen.add(qid);

      if (!correctMap.has(qid)) {
        return res.status(400).json({
          error: "Invalid question in submission",
        });
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
        explanation_english: q.explanation_english,
      });
    }

    const totalQuestions = requiredQuestionCount;
    const score = Number(((correctCount / totalQuestions) * 100).toFixed(2));
    const passed = score >= 70;

    const avgTimePerQuestion = timeTakenNum / totalQuestions;

    let minAvgTime;
    if (attemptNumber === 1) minAvgTime = 12;
    else if (attemptNumber === 2) minAvgTime = 8;
    else minAvgTime = 6;

    let is_suspicious = 0;
    let suspicious_reason = null;

    if (avgTimePerQuestion < 6) {
      is_suspicious = 2;
      suspicious_reason = `Extremely fast (${avgTimePerQuestion.toFixed(
        2
      )}s per question)`;
    } else if (avgTimePerQuestion < minAvgTime) {
      is_suspicious = 1;
      suspicious_reason = `Faster than expected for attempt ${attemptNumber} (${avgTimePerQuestion.toFixed(
        2
      )}s per question)`;
    }

    await connection.beginTransaction();

    const [attemptResult] = await connection.query(
      `
      INSERT INTO quiz_attempts
      (
        student_id,
        quiz_id,
        attempt_number,
        time_taken_seconds,
        score,
        is_suspicious,
        suspicious_reason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        student_id,
        quizId,
        attemptNumber,
        timeTakenNum,
        score,
        is_suspicious,
        suspicious_reason,
      ]
    );

    const quiz_attempt_id = attemptResult.insertId;

    for (const a of review) {
      await connection.query(
        `
        INSERT INTO quiz_answers
        (quiz_attempt_id, question_id, selected_option, is_correct)
        VALUES (?, ?, ?, ?)
        `,
        [quiz_attempt_id, a.question_id, a.selected, a.isCorrect ? 1 : 0]
      );
    }

    if (isPreAssessment) {
      await connection.query(
        `
        INSERT INTO module_progress
        (student_id, module_id, pre_assessment_score)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        pre_assessment_score = GREATEST(COALESCE(pre_assessment_score, 0), VALUES(pre_assessment_score))
        `,
        [student_id, quiz.module_id, score]
      );
    } else {
      await connection.query(
        `
        INSERT INTO topic_progress
        (student_id, topic_id, status, best_quiz_score)
        VALUES (?, ?, 'in_progress', ?)
        ON DUPLICATE KEY UPDATE
        best_quiz_score = GREATEST(COALESCE(best_quiz_score, 0), VALUES(best_quiz_score)),
        status = IF(status = 'not_started', 'in_progress', status)
        `,
        [student_id, quiz.topic_id, score]
      );
    
      if (!topicAlreadyCompleted && !passed && attemptNumber >= quiz.max_attempts) {
        await connection.query(
          `
          UPDATE topic_progress
          SET video_completed = 0,
              video_completed_at = NULL,
              text_completed = 0,
              requires_review = 1,
              requires_review_reason = 'Maximum quiz attempts reached - review video again',
              requires_review_set_at = NOW(),
              status = 'in_progress'
          WHERE student_id = ? AND topic_id = ?
            AND status <> 'completed'
          `,
          [student_id, quiz.topic_id]
        );
      }
    }
    
 
    
    await connection.commit();

    if (!isPreAssessment && quiz.module_id && !topicAlreadyCompleted) {
      await rewardService.processRewards(student_id, quiz.topic_id, quiz.module_id);
    }
    
    return res.status(201).json({
      success: true,
      data: {
        message: "Quiz submitted successfully",
        attemptNumber,
        score,
        passed,
        quiz_type: isPreAssessment ? "pre_assessment" : "topic_quiz",
        revision_mode: isRevisionQuizAttempt,
        review_required:
          !isPreAssessment &&
          !topicAlreadyCompleted &&
          !passed &&
          attemptNumber >= quiz.max_attempts,
        remaining_attempts: isRevisionQuizAttempt
          ? null
          : Math.max(quiz.max_attempts - attemptNumber, 0),
        correct: correctCount,
        total: totalQuestions,
        average_time_per_question: avgTimePerQuestion.toFixed(2),
        is_suspicious,
        suspicious_reason,
        review,
      },
    });
  } catch (err) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("ROLLBACK ERROR:", rollbackError);
    }

    console.error("SUBMIT QUIZ ERROR FULL:", err);
    console.error("STACK:", err.stack);

    return res.status(500).json({
      error: "Internal server error",
    });
  } finally {
    connection.release();
  }
};

/* =====================================================
   ADMIN: SUSPICIOUS ATTEMPTS
===================================================== */
exports.getSuspiciousAttempts = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let orgCondition = "";
    const params = [];

    if (user.role === "org_admin") {
      if (!user.organization_id) {
        return res.status(403).json({
          error: "No organization assigned",
        });
      }

      orgCondition = "AND u.organization_id = ?";
      params.push(user.organization_id);
    } else if (user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        qa.id,
        qa.score,
        qa.time_taken_seconds,
        qa.suspicious_reason,
        qa.created_at,
        u.full_name AS student_name,
        q.title AS quiz_title,
        q.id AS quiz_id
      FROM quiz_attempts qa
      JOIN users u ON qa.student_id = u.id
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.is_suspicious > 0
      ${orgCondition}
      ORDER BY qa.created_at DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("SUSPICIOUS DASHBOARD ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   QUESTION ANALYTICS
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
        return res.status(403).json({
          error: "No organization assigned",
        });
      }

      orgCondition = "AND u.organization_id = ?";
      params.push(user.organization_id);
    } else if (user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        qa.question_id,
        COUNT(*) AS total_attempts,
        SUM(qa.is_correct) AS correct_count
      FROM quiz_answers qa
      JOIN quiz_attempts qatt ON qa.quiz_attempt_id = qatt.id
      JOIN quizzes q ON qatt.quiz_id = q.id
      JOIN users u ON qatt.student_id = u.id
      WHERE q.id = ?
      ${orgCondition}
      GROUP BY qa.question_id
      `,
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
        correct_rate: `${rateNum.toFixed(2)}%`,
        difficulty,
      };
    });

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    console.error("QUESTION ANALYTICS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   QUIZ STATS
===================================================== */
exports.getQuizStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        COUNT(*) AS totalAttempts,
        AVG(score) AS averageScore
      FROM quiz_attempts
      WHERE student_id = ?
      `,
      [userId]
    );

    return res.json({
      success: true,
      data: {
        totalAttempts: Number(rows[0]?.totalAttempts || 0),
        averageScore: Math.round(Number(rows[0]?.averageScore || 0)),
        totalQuizzes: 0,
        weakArea: null,
      },
    });
  } catch (err) {
    console.error("GET QUIZ STATS ERROR:", err);
    return res.status(500).json({
      error: "Failed to fetch quiz stats",
    });
  }
};
/* =====================================================
   SUPERADMIN: GET PRE-ASSESSMENT BY MODULE ID
===================================================== */
exports.getAdminPreAssessmentByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const user = req.user;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [quizRows] = await pool.query(
      `
      SELECT
        q.id,
        q.module_id,
        q.quiz_type,
        q.title,
        q.created_at,
        q.max_attempts
      FROM quizzes q
      WHERE q.module_id = ?
        AND q.quiz_type = 'pre_assessment'
      LIMIT 1
      `,
      [moduleId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({
        error: "Pre-assessment not found for this module",
      });
    }

    const quiz = quizRows[0];

    const [questions] = await pool.query(
      `
      SELECT
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation_nepali,
        explanation_english
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
      `,
      [quiz.id]
    );

    return res.json({
      success: true,
      data: {
        quiz: {
          ...quiz,
          questions,
        },
      },
    });
  } catch (error) {
    console.error("GET ADMIN PRE-ASSESSMENT ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   SUPERADMIN: GET QUIZ BY TOPIC ID
===================================================== */
exports.getAdminQuizByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;
    const user = req.user;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [quizRows] = await pool.query(
      `
      SELECT
        q.id,
        q.topic_id,
        q.module_id,
        q.quiz_type,
        q.title,
        q.created_at,
        q.max_attempts
      FROM quizzes q
      WHERE q.topic_id = ?
        AND q.quiz_type = 'topic_quiz'
      LIMIT 1
      `,
      [topicId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({
        error: "Quiz not found for this topic",
      });
    }

    const quiz = quizRows[0];

    const [questions] = await pool.query(
      `
      SELECT
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation_nepali,
        explanation_english
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
      `,
      [quiz.id]
    );

    return res.json({
      success: true,
      data: {
        quiz: {
          ...quiz,
          questions,
        },
      },
    });
  } catch (error) {
    console.error("GET ADMIN QUIZ BY TOPIC ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
/* =====================================================
   SUPERADMIN: UPDATE QUIZ
===================================================== */
exports.updateQuiz = async (req, res) => {
  try {
    const user = req.user;
    const { quizId } = req.params;
    const { title, max_attempts } = req.body;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    const maxAttemptsNum = Number(max_attempts);

    if (
      !Number.isInteger(maxAttemptsNum) ||
      maxAttemptsNum < 1 ||
      maxAttemptsNum > 10
    ) {
      return res.status(400).json({
        error: "max_attempts must be an integer between 1 and 10",
      });
    }

    const [quizRows] = await pool.query(
      `
      SELECT
        q.id,
        q.module_id,
        q.quiz_type,
        m.is_public,
        m.audience_type
      FROM quizzes q
      LEFT JOIN modules m ON m.id = q.module_id
      WHERE q.id = ?
      LIMIT 1
      `,
      [quizId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quizRow = quizRows[0];

    if (
      Number(quizRow.is_public) === 1 &&
      quizRow.audience_type === "general"
    ) {
      return res.status(403).json({
        error: "General quizzes are static and cannot be changed",
      });
    }

    await pool.query(
      `
      UPDATE quizzes
      SET title = ?, max_attempts = ?
      WHERE id = ?
      `,
      [String(title).trim(), maxAttemptsNum, quizId]
    );

    return res.json({
      success: true,
      data: {
        message: "Quiz updated successfully",
      },
    });
  } catch (err) {
    console.error("UPDATE QUIZ ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   SUPERADMIN: DELETE QUIZ
===================================================== */
exports.deleteQuiz = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const user = req.user;
    const { quizId } = req.params;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    const [quizRows] = await connection.query(
      `
      SELECT
        q.id,
        q.module_id,
        m.is_public,
        m.audience_type
      FROM quizzes q
      LEFT JOIN modules m ON m.id = q.module_id
      WHERE q.id = ?
      LIMIT 1
      `,
      [quizId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quizRow = quizRows[0];

    if (
      Number(quizRow.is_public) === 1 &&
      quizRow.audience_type === "general"
    ) {
      return res.status(403).json({
        error: "General quizzes are static and cannot be deleted",
      });
    }

    await connection.beginTransaction();

    const [questionRows] = await connection.query(
      `
      SELECT id
      FROM questions
      WHERE quiz_id = ?
      `,
      [quizId]
    );

    const questionIds = questionRows.map((row) => Number(row.id)).filter(Boolean);

    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => "?").join(",");

      await connection.query(
        `
        DELETE qa
        FROM quiz_answers qa
        JOIN quiz_attempts qat ON qa.quiz_attempt_id = qat.id
        WHERE qa.question_id IN (${placeholders})
        `,
        questionIds
      );
    }

    await connection.query(
      `
      DELETE FROM quiz_answers
      WHERE quiz_attempt_id IN (
        SELECT id FROM (
          SELECT id
          FROM quiz_attempts
          WHERE quiz_id = ?
        ) AS temp_attempts
      )
      `,
      [quizId]
    );

    await connection.query(
      `
      DELETE FROM quiz_attempts
      WHERE quiz_id = ?
      `,
      [quizId]
    );

    await connection.query(
      `
      DELETE FROM questions
      WHERE quiz_id = ?
      `,
      [quizId]
    );

    await connection.query(
      `
      DELETE FROM quizzes
      WHERE id = ?
      `,
      [quizId]
    );

    await connection.commit();

    return res.json({
      success: true,
      data: {
        message: "Quiz deleted successfully",
      },
    });
  } catch (err) {
    try {
      await connection.rollback();
    } catch {}

    console.error("DELETE QUIZ ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

/* =====================================================
   SUPERADMIN: UPDATE QUESTION
===================================================== */
exports.updateQuestion = async (req, res) => {
  try {
    const user = req.user;
    const { questionId } = req.params;
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation_nepali = null,
      explanation_english = null,
    } = req.body;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!questionId) {
      return res.status(400).json({ error: "questionId is required" });
    }

    if (
      !question_text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_option
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const correct = String(correct_option).toUpperCase().trim();
    const allowed = ["A", "B", "C", "D"];

    if (!allowed.includes(correct)) {
      return res.status(400).json({
        error: "correct_option must be A/B/C/D",
      });
    }

    const [questionRows] = await pool.query(
      `
      SELECT
        qs.id,
        q.id AS quiz_id,
        q.module_id,
        m.is_public,
        m.audience_type
      FROM questions qs
      JOIN quizzes q ON qs.quiz_id = q.id
      LEFT JOIN modules m ON m.id = q.module_id
      WHERE qs.id = ?
      LIMIT 1
      `,
      [questionId]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const questionRow = questionRows[0];

    if (
      Number(questionRow.is_public) === 1 &&
      questionRow.audience_type === "general"
    ) {
      return res.status(403).json({
        error: "General quiz questions are static and cannot be changed",
      });
    }

    await pool.query(
      `
      UPDATE questions
      SET
        question_text = ?,
        option_a = ?,
        option_b = ?,
        option_c = ?,
        option_d = ?,
        correct_option = ?,
        explanation_nepali = ?,
        explanation_english = ?
      WHERE id = ?
      `,
      [
        String(question_text).trim(),
        String(option_a).trim(),
        String(option_b).trim(),
        String(option_c).trim(),
        String(option_d).trim(),
        correct,
        explanation_nepali ? String(explanation_nepali) : null,
        explanation_english ? String(explanation_english) : null,
        questionId,
      ]
    );

    return res.json({
      success: true,
      data: {
        message: "Question updated successfully",
      },
    });
  } catch (err) {
    console.error("UPDATE QUESTION ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   SUPERADMIN: DELETE QUESTION
===================================================== */
exports.deleteQuestion = async (req, res) => {
  try {
    const user = req.user;
    const { questionId } = req.params;

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!questionId) {
      return res.status(400).json({ error: "questionId is required" });
    }

    const [questionRows] = await pool.query(
      `
      SELECT
        qs.id,
        q.module_id,
        m.is_public,
        m.audience_type
      FROM questions qs
      JOIN quizzes q ON qs.quiz_id = q.id
      LEFT JOIN modules m ON m.id = q.module_id
      WHERE qs.id = ?
      LIMIT 1
      `,
      [questionId]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const questionRow = questionRows[0];

    if (
      Number(questionRow.is_public) === 1 &&
      questionRow.audience_type === "general"
    ) {
      return res.status(403).json({
        error: "General quiz questions are static and cannot be deleted",
      });
    }

    await pool.query(
      `
      DELETE FROM quiz_answers
      WHERE question_id = ?
      `,
      [questionId]
    );

    await pool.query(
      `
      DELETE FROM questions
      WHERE id = ?
      `,
      [questionId]
    );

    return res.json({
      success: true,
      data: {
        message: "Question deleted successfully",
      },
    });
  } catch (err) {
    console.error("DELETE QUESTION ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};