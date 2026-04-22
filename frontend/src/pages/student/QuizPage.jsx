import LanguageToggle from "../../components/common/LanguageToggle";
import api from "../../services/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import preAssessmentData from "../../data/preAssessment.json";
import { useLanguage } from "../../context/LanguageContext";
import "../../styles/quiz.css";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    type: "error",
  });

  const isPreAssessment =
    quiz?.quiz_type === "pre_assessment" || String(id || "").startsWith("pre-");

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, language]);

  useEffect(() => {
    localStorage.removeItem(`quiz_${id}_answers`);
    setAnswers({});
    setResult(null);
    closePopup();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem(`quiz_${id}_answers`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch {
        setAnswers({});
      }
    }
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`quiz_${id}_answers`, JSON.stringify(answers));
  }, [answers, id]);

  function showPopup(message, type = "error") {
    setPopup({
      open: true,
      message,
      type,
    });
  }

  function closePopup() {
    setPopup({
      open: false,
      message: "",
      type: "error",
    });
  }

  async function loadQuiz() {
    try {
      setLoading(true);
      setSubmitting(false);
      setResult(null);
      closePopup();

      if (String(id).startsWith("pre-")) {
        const moduleId = Number(String(id).split("-")[1]);

        if ([1, 2, 3].includes(moduleId)) {
          const moduleQuestions = preAssessmentData.filter(
            (q) => Number(q.module) === moduleId
          );

          if (moduleQuestions.length === 0) {
            setQuiz(null);
            setStartTime(Date.now());
            return;
          }

          const formattedQuiz = {
            id: `pre-${moduleId}`,
            module_id: moduleId,
            quiz_type: "pre_assessment",
            title: `Module ${moduleId} Pre-Assessment`,
            questions: moduleQuestions.map((q) => ({
              id: q.id,
              question_en: q.question_en,
              question_np: q.question_np,
              question_text: language === "en" ? q.question_en : q.question_np,
              options_en: q.options_en.map((opt, index) => ({
                key: String.fromCharCode(65 + index),
                text: opt,
              })),
              options_np: q.options_np.map((opt, index) => ({
                key: String.fromCharCode(65 + index),
                text: opt,
              })),
            })),
          };

          setQuiz(formattedQuiz);
          setStartTime(Date.now());
          return;
        }

        const moduleIdForApi = Number(String(id).split("-")[1]);
        const res = await api.get(
          `/quizzes/module/${moduleIdForApi}/pre-assessment`
        );
        const quizData = res?.data?.data?.quiz || null;

        setQuiz(quizData);
        setStartTime(Date.now());
        return;
      }

      const res = await api.get(`/quizzes/topic/${id}`);
      const quizData = res?.data?.data?.quiz || null;

      setQuiz(quizData);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Quiz load error:", err);
      setQuiz(null);
      setAnswers({});
      setResult(null);
      showPopup("Failed to load quiz.", "error");
    } finally {
      setLoading(false);
    }
  }

  function selectOption(questionId, option) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));

    if (popup.open) {
      closePopup();
    }
  }

  async function handleSubmit() {
    if (submitting) return;

    if (!quiz?.questions?.length) {
      return;
    }

    if (Object.keys(answers).length < quiz.questions.length) {
      showPopup("Please answer all questions before submitting.", "error");
      return;
    }

    setSubmitting(true);

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    try {
      if (isPreAssessment && [1, 2, 3].includes(Number(quiz.module_id))) {
        const correctCount = quiz.questions.reduce((count, q) => {
          const selected = answers[q.id];
          const original = preAssessmentData.find((item) => item.id === q.id);

          if (!original) return count;

          const correctKey = String.fromCharCode(
            65 + Number(original.correct || 0)
          );

          return selected === correctKey ? count + 1 : count;
        }, 0);

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        await api.post(`/progress/pre-assessment/${quiz.module_id}`, {
          score,
        });

        localStorage.removeItem(`quiz_${id}_answers`);
        setAnswers({});
        setResult(null);
        setSubmitting(false);
        closePopup();

        navigate(`/student/module/${quiz.module_id}`, { replace: true });
        return;
      }

      const formattedAnswers = Object.keys(answers).map((qid) => ({
        question_id: Number(qid),
        selected_option: answers[qid],
      }));

      const res = await api.post(`/quizzes/${quiz.id}/submit`, {
        answers: formattedAnswers,
        time_taken_seconds: timeTaken,
      });

      const resultData = res?.data?.data || null;

      localStorage.removeItem(`quiz_${id}_answers`);

      if (isPreAssessment) {
        setAnswers({});
        setResult(null);
        setSubmitting(false);
        closePopup();

        navigate(`/student/module/${quiz.module_id}`, { replace: true });
        return;
      }

      setResult(resultData);
      setSubmitting(false);
    } catch (err) {
      console.error("Quiz submit error:", err);

      const message = err?.response?.data?.error || "Failed to submit quiz";

      if (
        err?.response?.status === 403 &&
        message.toLowerCase().includes("maximum attempts")
      ) {
        setSubmitting(false);
        showPopup(
          "Maximum attempts reached. Please review the video before trying again.",
          "error"
        );
        setTimeout(() => {
          navigate(`/student/topic/${id}`, { replace: true });
        }, 1200);
        return;
      }

      showPopup(message, "error");
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading quiz...</p>;
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <h2>No Quiz Available</h2>
        <p>This topic does not have a quiz yet.</p>

        {popup.open && (
          <div className="quiz-popup-overlay">
            <div className={`quiz-popup quiz-popup--${popup.type}`}>
              <div className="quiz-popup__icon">
                {popup.type === "error" ? "⚠️" : "✅"}
              </div>
              <h3 className="quiz-popup__title">
                {popup.type === "error" ? "Attention" : "Success"}
              </h3>
              <p className="quiz-popup__message">{popup.message}</p>
              <button
                type="button"
                className="quiz-popup__btn"
                onClick={closePopup}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (result && !isPreAssessment) {
    return (
      <div className="quiz-result">
        <div className="quiz-result-card">
          <div className="quiz-result-head">
            <p className="quiz-result-eyebrow">Quiz Completed</p>
            <h2>Quiz Result</h2>
            <p className="quiz-result-summary">
              Here is your performance summary and answer review.
            </p>
          </div>
  
          <div className="quiz-result-stats">
            <div className="quiz-stat-box">
              <span className="quiz-stat-label">Score</span>
              <strong>{result.score}%</strong>
            </div>
  
            <div className="quiz-stat-box">
              <span className="quiz-stat-label">Correct</span>
              <strong>
                {result.correct} / {result.total}
              </strong>
            </div>
  
            <div
              className={`quiz-stat-box ${
                result.passed ? "quiz-stat-box--success" : "quiz-stat-box--danger"
              }`}
            >
              <span className="quiz-stat-label">Status</span>
              <strong>{result.passed ? "Passed" : "Failed"}</strong>
            </div>
          </div>
  
          {result.review_required && (
            <div className="quiz-inline-note quiz-inline-note--danger">
              You reached the maximum attempts. Review the video before trying
              again.
            </div>
          )}
        </div>
  
        {Array.isArray(result.review) &&
          result.review.map((r, i) => (
            <div key={i} className="review-card">
              <p>
                <strong>Question {i + 1}</strong>
              </p>
              <p>Your Answer: {r.selected}</p>
              <p>Correct Answer: {r.correct}</p>
              <p className={r.isCorrect ? "correct" : "wrong"}>
                {r.isCorrect ? "Correct" : "Wrong"}
              </p>
              <p>
                {language === "np"
                  ? r.explanation_nepali || r.explanation_english
                  : r.explanation_english || r.explanation_nepali}
              </p>
            </div>
          ))}
  
        {result.passed ? (
          <button
            className="submit-btn"
            style={{ marginTop: "20px" }}
            onClick={() => navigate(`/student/topic/${id}`)}
          >
            Continue to Simulation
          </button>
        ) : result.review_required ? (
          <button
            className="submit-btn"
            style={{ marginTop: "20px" }}
            onClick={() => navigate(`/student/topic/${id}`, { replace: true })}
          >
            Back to Video
          </button>
        ) : (
          <button
            className="submit-btn"
            style={{ marginTop: "20px" }}
            onClick={() => {
              setResult(null);
              setAnswers({});
              setSubmitting(false);
              localStorage.removeItem(`quiz_${id}_answers`);
              loadQuiz();
            }}
          >
            Try Again
          </button>
        )}
  
        {popup.open && (
          <div className="quiz-popup-overlay">
            <div className={`quiz-popup quiz-popup--${popup.type}`}>
              <div className="quiz-popup__icon">
                {popup.type === "error" ? "⚠️" : "✅"}
              </div>
              <h3 className="quiz-popup__title">
                {popup.type === "error" ? "Attention" : "Success"}
              </h3>
              <p className="quiz-popup__message">{popup.message}</p>
              <button
                type="button"
                className="quiz-popup__btn"
                onClick={closePopup}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="quiz-container">
      {isPreAssessment && (
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              Module Entry Check
            </p>
            <h2
              style={{
                margin: "6px 0 0 0",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              Pre-Assessment
            </h2>
          </div>

          <LanguageToggle />
        </div>
      )}

      {!isPreAssessment && <h1>{quiz.title}</h1>}

      {isPreAssessment && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1e3a8a",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Complete this pre-assessment to unlock the topics in this module.
          Your score will not be shown.
        </div>
      )}

      {quiz?.questions?.map((q, index) => {
        const questionText =
          language === "en"
            ? q.question_en || q.question_text
            : q.question_np || q.question_text;

        const options =
          language === "en"
            ? q.options_en || q.options || []
            : q.options_np || q.options || [];

        return (
          <div key={q.id} className="question-card">
            <h3>
              {index + 1}. {questionText}
            </h3>

            {options.map((opt, i) => {
              const optionText = opt.text || opt;
              const optionKey = opt.key || String.fromCharCode(65 + i);

              return (
                <button
                  key={i}
                  className={`option-btn ${
                    answers[q.id] === optionKey ? "selected" : ""
                  }`}
                  onClick={() => selectOption(q.id, optionKey)}
                >
                  {optionKey}. {optionText}
                </button>
              );
            })}
          </div>
        );
      })}

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? "Submitting..."
          : isPreAssessment
          ? "Continue to Module"
          : "Submit Quiz"}
      </button>

      {popup.open && (
        <div className="quiz-popup-overlay">
          <div className={`quiz-popup quiz-popup--${popup.type}`}>
            <div className="quiz-popup__icon">
              {popup.type === "error" ? "⚠️" : "✅"}
            </div>

            <h3 className="quiz-popup__title">
              {popup.type === "error" ? "Attention" : "Success"}
            </h3>

            <p className="quiz-popup__message">{popup.message}</p>

            <button
              type="button"
              className="quiz-popup__btn"
              onClick={closePopup}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}