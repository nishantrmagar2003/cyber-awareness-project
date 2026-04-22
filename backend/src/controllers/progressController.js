const { pool } = require("../config/db");

/*
====================================================
GET MODULE PROGRESS (PRE-ASSESSMENT)
====================================================
*/
exports.getModuleProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const moduleId = req.params.moduleId;

    const [rows] = await pool.query(
      `
      SELECT pre_assessment_score
      FROM module_progress
      WHERE student_id = ? AND module_id = ?
      LIMIT 1
      `,
      [userId, moduleId]
    );

    const isCompleted =
      rows.length > 0 && Number(rows[0].pre_assessment_score || 0) > 0;

    return res.json({
      success: true,
      data: {
        pre_assessment_completed: isCompleted ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("Module progress error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

/*
====================================================
GET TOPIC PROGRESS
GET /api/progress/topic/:id
====================================================
*/
exports.getTopicProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const topicId = req.params.id;

    const [rows] = await pool.query(
      `
      SELECT
        video_completed,
        text_completed,
        best_quiz_score,
        best_simulation_score,
        simulations_completed,
        status
      FROM topic_progress
      WHERE student_id = ? AND topic_id = ?
      LIMIT 1
      `,
      [userId, topicId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          video_completed: 0,
          text_completed: 0,
          best_quiz_score: 0,
          best_simulation_score: 0,
          quiz_completed: 0,
          quiz_passed: 0,
          simulation1_completed: 0,
          simulation2_completed: 0,
          simulations_completed: 0,
          simulation_passed: 0,
          status: "not_started",
          completed: 0,
        },
      });
    }

    const row = rows[0];

    const videoCompleted = Number(row.video_completed || 0) === 1 ? 1 : 0;
    const textCompleted = Number(row.text_completed || 0) === 1 ? 1 : 0;
    const bestQuizScore = Number(row.best_quiz_score || 0);
    const bestSimulationScore = Number(row.best_simulation_score || 0);
    const simulationsCompleted = Number(row.simulations_completed || 0);
    const status = row.status || "not_started";

    const quizCompleted = bestQuizScore > 0 ? 1 : 0;
    const quizPassed = bestQuizScore >= 70 ? 1 : 0;

    const simulation1Completed = simulationsCompleted >= 1 ? 1 : 0;
    const simulation2Completed = simulationsCompleted >= 2 ? 1 : 0;
    const simulationPassed = bestSimulationScore >= 70 ? 1 : 0;

    const completed = status === "completed" ? 1 : 0;

    return res.json({
      success: true,
      data: {
        video_completed: videoCompleted,
        text_completed: textCompleted,
        best_quiz_score: bestQuizScore,
        best_simulation_score: bestSimulationScore,
        quiz_completed: quizCompleted,
        quiz_passed: quizPassed,
        simulation1_completed: simulation1Completed,
        simulation2_completed: simulation2Completed,
        simulations_completed: simulationsCompleted,
        simulation_passed: simulationPassed,
        status,
        completed,
      },
    });
  } catch (error) {
    console.error("Topic progress error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};