import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuizByTopicId, submitQuiz } from "../../services/quiz.service";
import { useLanguage } from "../../context/LanguageContext";
import preQuestions from "../../data/preAssessment.json";
import "../../styles/quiz.css";

export default function QuizPage() {
  const { id } = useParams();
  const { language } = useLanguage();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuiz();
  }, [id]);

  async function loadQuiz() {
    try {

      // 🔥 NEW: MODULE-BASED PRE-ASSESSMENT
      if (id.startsWith("pre-")) {

        const moduleId = id.split("-")[1];

        const moduleQuestions = preQuestions.filter(
          q => q.module === moduleId
        );

        const formattedQuiz = {
          id: "pre",
          title: `Module ${moduleId} Pre Assessment`,
          questions: moduleQuestions.map((q, index) => ({
            id: index + 1,
            question_en: q.question_en,
            question_np: q.question_np,
            options_en: q.options_en,
            options_np: q.options_np
          }))
        };

        setQuiz(formattedQuiz);
      }

      // ✅ OLD PRE (KEPT — NOT REMOVED)
      else if (id === "pre") {

        const formattedQuiz = {
          id: "pre",
          title: "Pre Assessment",
          questions: preQuestions.map((q, index) => ({
            id: index + 1,
            question_en: q.question_en,
            question_np: q.question_np,
            options_en: q.options_en,
            options_np: q.options_np
          }))
        };

        setQuiz(formattedQuiz);

      } else {
        // ✅ NORMAL BACKEND QUIZ
        const res = await getQuizByTopicId(id);
        setQuiz(res.data.quiz);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function selectOption(questionId, option) {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  }

  async function handleSubmit() {

    // 🔥 UPDATED PRE-ASSESSMENT RESULT (MODULE BASED)
    if (quiz.id === "pre") {

      let correct = 0;

      // 🔥 NEW: HANDLE MODULE FILTER
      let moduleQuestions = preQuestions;

      if (id.startsWith("pre-")) {
        const moduleId = id.split("-")[1];

        moduleQuestions = preQuestions.filter(
          q => q.module === moduleId
        );
      }

      quiz.questions.forEach((q, index) => {
        if (answers[q.id] === moduleQuestions[index].correct) {
          correct++;
        }
      });

      const score = Math.round((correct / quiz.questions.length) * 100);

      setResult({
        score,
        correct,
        total: quiz.questions.length,
        review: []
      });

      return;
    }

    // ✅ NORMAL BACKEND FLOW (UNCHANGED)
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    const formattedAnswers = Object.keys(answers).map(qid => ({
      question_id: Number(qid),
      selected_option: answers[qid]
    }));

    try {

      const res = await submitQuiz(quiz.id, {
        answers: formattedAnswers,
        time_taken_seconds: timeTaken
      });

      setResult(res.data);

    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz");
    }
  }

  if (loading) return <p>Loading quiz...</p>;

  if (!quiz) {
    return (
      <div className="quiz-container">
        <h2>No Quiz Available</h2>
        <p>This topic does not have a quiz yet.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="quiz-result">

        <h2>Quiz Result</h2>

        <p>Score: {result.score}%</p>
        <p>Correct: {result.correct} / {result.total}</p>

        {/* Backend result */}
        {result.review && result.review.map((r,i) => (
          <div key={i} className="review-card">

            <p><strong>Question {i+1}</strong></p>

            <p>Your Answer: {r.selected}</p>
            <p>Correct Answer: {r.correct}</p>

            <p className={r.isCorrect ? "correct" : "wrong"}>
              {r.isCorrect ? "Correct" : "Wrong"}
            </p>

            <p>{r.explanation_english}</p>

          </div>
        ))}

      </div>
    )
  }

  return (
    <div className="quiz-container">

      <h1>{quiz.title}</h1>

      {quiz.questions.map((q,index) => {

        const questionText =
          language === "en"
            ? q.question_en || q.question_text
            : q.question_np || q.question_text;

        const options =
          language === "en"
            ? q.options_en || q.options
            : q.options_np || q.options;

        return (
          <div key={q.id} className="question-card">

            <h3>
              {index+1}. {questionText}
            </h3>

            {options.map((opt, i) => {

              const optionText = opt.text || opt;
              const optionKey = opt.key || i;

              return (
                <button
                  key={i}
                  className={`option-btn ${
                    answers[q.id] === optionKey ? "selected" : ""
                  }`}
                  onClick={() => selectOption(q.id, optionKey)}
                >
                  {String.fromCharCode(65 + i)}. {optionText}
                </button>
              );

            })}

          </div>
        );
      })}

      <button className="submit-btn" onClick={handleSubmit}>
        Submit Quiz
      </button>

    </div>
  );
}