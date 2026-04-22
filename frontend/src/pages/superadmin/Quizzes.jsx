import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import "../../styles/quizzes.css";

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`saq-summary-card saq-summary-card--${tone}`}>
      <p className="saq-summary-card__label">{label}</p>
      <h3 className="saq-summary-card__value">{value}</h3>
      <p className="saq-summary-card__note">{note}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BaseModal({ title, children, onClose, wide = false }) {
  return (
    <div className="saq-modal-overlay">
      <div className={`saq-modal ${wide ? "saq-modal--wide" : ""}`}>
        <div className="saq-modal__header">
          <h3 className="saq-modal__title">{title}</h3>

          <button
            onClick={onClose}
            className="saq-secondary-btn"
            type="button"
          >
            Close
          </button>
        </div>

        <div className="saq-modal__body">{children}</div>
      </div>
    </div>
  );
}

function QuizCard({
  item,
  onOpenAddQuestion,
  onOpenQuestions,
  onOpenEditQuiz,
  onDeleteQuiz,
}) {
  const isPreAssessment = item.quiz_type === "pre_assessment";

  return (
    <div className="saq-quiz-card">
      <div className="saq-quiz-card__top">
        <div className="saq-quiz-card__main">
          <div className="saq-quiz-card__header">
            <h4 className="saq-quiz-card__title">{item.title}</h4>
            <span className="saq-quiz-badge">
              {isPreAssessment ? "Pre-Assessment" : "Topic Quiz"}
            </span>
          </div>

          <p className="saq-quiz-card__topic">
            {isPreAssessment ? (
              <>
                Module: <strong>{item.module_title || "-"}</strong>
              </>
            ) : (
              <>
                Topic: <strong>{item.topic_title || "-"}</strong>
              </>
            )}
          </p>

          <div className="saq-quiz-card__meta">
            <span>Quiz ID: {item.id}</span>
            <span>Questions Added: {item.questions_count || 0}</span>
            <span>Created: {formatDate(item.created_at)}</span>
            <span>Max Attempts: {item.max_attempts || 3}</span>
          </div>

          <p className="saq-quiz-card__rule">
            Rule:{" "}
            <span>
              {isPreAssessment
                ? "Student solves 15 random questions"
                : "Student solves 20 random questions"}
            </span>
          </p>
        </div>

        <div className="saq-quiz-card__actions">
          <button
            onClick={() => onOpenQuestions(item)}
            className="saq-action-btn saq-action-btn--view"
            type="button"
          >
            View Questions
          </button>

          <button
            onClick={() => onOpenAddQuestion(item)}
            className="saq-action-btn saq-action-btn--view"
            type="button"
          >
            Add Question
          </button>

          <button
            onClick={() => onOpenEditQuiz(item)}
            className="saq-action-btn saq-action-btn--view"
            type="button"
          >
            Edit Quiz
          </button>

          <button
            onClick={() => onDeleteQuiz(item)}
            className="saq-action-btn saq-action-btn--delete"
            type="button"
          >
            Delete Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function TopicQuizRow({
  topic,
  existingQuiz,
  onCreateTopicQuiz,
  onOpenAddQuestion,
  onOpenQuestions,
  onOpenEditQuiz,
  onDeleteQuiz,
}) {
  return (
    <div className="saq-topic-row">
      <div className="saq-topic-row__top">
        <div>
          <h4 className="saq-topic-row__title">{topic.title}</h4>
          <p className="saq-topic-row__meta">Topic ID: {topic.id}</p>
        </div>

        <div className="saq-topic-row__actions">
          {existingQuiz ? (
            <>
              <span className="saq-status-pill saq-status-pill--success">
                Quiz Created
              </span>

              <button
                type="button"
                onClick={() => onOpenQuestions(existingQuiz)}
                className="saq-action-btn saq-action-btn--view"
              >
                View Questions
              </button>

              <button
                type="button"
                onClick={() => onOpenAddQuestion(existingQuiz)}
                className="saq-action-btn saq-action-btn--view"
              >
                Add Question
              </button>

              <button
                type="button"
                onClick={() => onOpenEditQuiz(existingQuiz)}
                className="saq-action-btn saq-action-btn--view"
              >
                Edit Quiz
              </button>

              <button
                type="button"
                onClick={() => onDeleteQuiz(existingQuiz)}
                className="saq-action-btn saq-action-btn--delete"
              >
                Delete Quiz
              </button>
            </>
          ) : (
            <>
              <span className="saq-status-pill saq-status-pill--warning">
                No Quiz Yet
              </span>

              <button
                type="button"
                onClick={() => onCreateTopicQuiz(topic)}
                className="saq-action-btn saq-action-btn--view"
              >
                Create Topic Quiz
              </button>
            </>
          )}
        </div>
      </div>

      {existingQuiz && (
        <div className="saq-topic-row__info">
          <span>Quiz ID: {existingQuiz.id}</span>
          <span>Questions Added: {existingQuiz.questions_count || 0}</span>
          <span>Rule: Student solves 20 random questions</span>
        </div>
      )}
    </div>
  );
}

function ModuleQuizBlock({
  module,
  preAssessment,
  moduleTopics,
  topicQuizzes,
  onCreatePreAssessment,
  onCreateTopicQuiz,
  onOpenAddQuestion,
  onOpenQuestions,
  onOpenEditQuiz,
  onDeleteQuiz,
}) {
  return (
    <div className="saq-module-block">
      <div className="saq-module-block__header">
        <div>
          <div className="saq-module-block__title-row">
            <h3 className="saq-module-block__title">{module.title}</h3>
            <span className="saq-module-badge">Premium Module</span>
          </div>

          <p className="saq-module-block__description">
            {module.description || "No module description"}
          </p>

          <div className="saq-module-block__meta">
            <span>Module ID: {module.id}</span>
            <span>Topics: {moduleTopics.length}</span>
            <span>
              Pre-Assessment: {preAssessment ? "Created" : "Not Created"}
            </span>
            <span>Topic Quizzes: {topicQuizzes.length}</span>
          </div>
        </div>
      </div>

      <div className="saq-block-list">
        <div className="saq-info-box">
          <p className="saq-info-box__title">Module Pre-Assessment</p>
          <p className="saq-info-box__text">
            Premium module pre-assessment should serve 15 random questions to the student.
          </p>
        </div>

        {preAssessment ? (
          <QuizCard
            item={preAssessment}
            onOpenAddQuestion={onOpenAddQuestion}
            onOpenQuestions={onOpenQuestions}
            onOpenEditQuiz={onOpenEditQuiz}
            onDeleteQuiz={onDeleteQuiz}
          />
        ) : (
          <div className="saq-empty-create-row">
            <div>
              <p className="saq-empty-create-row__title">
                No pre-assessment created yet
              </p>
              <p className="saq-empty-create-row__text">
                Create one pre-assessment for this premium module.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCreatePreAssessment(module)}
              className="saq-action-btn saq-action-btn--view"
            >
              Create Pre-Assessment
            </button>
          </div>
        )}

        <div className="saq-info-box">
          <p className="saq-info-box__title">Topic Quizzes</p>
          <p className="saq-info-box__text">
            Premium topic quizzes should serve 20 random questions to the student.
            You can store 30 questions for better shuffle coverage.
          </p>
        </div>

        {moduleTopics.length === 0 ? (
          <div className="saq-empty-box">
            <p className="saq-empty-box__title">No premium topics found</p>
            <p className="saq-empty-box__text">
              Add premium topics first before creating topic quizzes.
            </p>
          </div>
        ) : (
          moduleTopics.map((topic) => {
            const existingQuiz =
              topicQuizzes.find(
                (quiz) => String(quiz.topic_id) === String(topic.id)
              ) || null;

            return (
              <TopicQuizRow
                key={topic.id}
                topic={topic}
                existingQuiz={existingQuiz}
                onCreateTopicQuiz={onCreateTopicQuiz}
                onOpenAddQuestion={onOpenAddQuestion}
                onOpenQuestions={onOpenQuestions}
                onOpenEditQuiz={onOpenEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

const EMPTY_CREATE_FORM = {
  quiz_type: "pre_assessment",
  module_id: "",
  topic_id: "",
  title: "",
  max_attempts: 3,
};

const EMPTY_QUESTION_FORM = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
  explanation_nepali: "",
  explanation_english: "",
};

const EMPTY_EDIT_QUIZ_FORM = {
  id: "",
  title: "",
  max_attempts: 3,
};

export default function Quizzes() {
  const [premiumModules, setPremiumModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [quizItems, setQuizItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [submittingEditQuiz, setSubmittingEditQuiz] = useState(false);
  const [submittingEditQuestion, setSubmittingEditQuestion] = useState(false);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Premium Modules");

  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION_FORM);

  const [viewQuiz, setViewQuiz] = useState(null);

  const [editQuizForm, setEditQuizForm] = useState(EMPTY_EDIT_QUIZ_FORM);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestionForm, setEditQuestionForm] = useState(EMPTY_QUESTION_FORM);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTopicsForCreate = useMemo(() => {
    if (!createForm.module_id) return [];
    return topics.filter(
      (topic) => String(topic.module_id) === String(createForm.module_id)
    );
  }, [topics, createForm.module_id]);

  async function fetchData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const premiumRes = await api.get("/modules/premium");
      const premiumRows = Array.isArray(premiumRes?.data?.data)
        ? premiumRes.data.data
        : [];

      setPremiumModules(premiumRows);

      const topicResponses = await Promise.all(
        premiumRows.map(async (module) => {
          try {
            const res = await api.get(`/topics/module/${module.id}`);
            const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

            return rows.map((topic) => ({
              ...topic,
              module_id: module.id,
              module_title: module.title,
            }));
          } catch (err) {
            console.error(
              `Failed to load topics for module ${module.id}:`,
              err
            );
            return [];
          }
        })
      );

      const allTopics = topicResponses.flat();
      setTopics(allTopics);

      const collectedQuizzes = [];

      for (const module of premiumRows) {
        try {
          const preRes = await api.get(
            `/quizzes/admin/module/${module.id}/pre-assessment`
          );
          const preQuiz = preRes?.data?.data?.quiz;

          if (preQuiz) {
            collectedQuizzes.push({
              ...preQuiz,
              module_title: module.title,
              quiz_type: "pre_assessment",
              questions_count: Array.isArray(preQuiz.questions)
                ? preQuiz.questions.length
                : 0,
            });
          }
        } catch (err) {
          if (err?.response?.status !== 404) {
            console.error(
              `Failed to load pre-assessment for module ${module.id}:`,
              err
            );
          }
        }
      }

      for (const topic of allTopics) {
        try {
          const quizRes = await api.get(`/quizzes/admin/topic/${topic.id}`);
          const topicQuiz = quizRes?.data?.data?.quiz;

          if (topicQuiz) {
            collectedQuizzes.push({
              ...topicQuiz,
              topic_title: topic.title,
              module_id: topic.module_id,
              module_title: topic.module_title,
              topic_id: topic.id,
              quiz_type: "topic_quiz",
              questions_count: Array.isArray(topicQuiz.questions)
                ? topicQuiz.questions.length
                : 0,
            });
          }
        } catch (err) {
          if (err?.response?.status !== 404) {
            console.error(`Failed to load quiz for topic ${topic.id}:`, err);
          }
        }
      }

      setQuizItems(collectedQuizzes);
    } catch (error) {
      console.error("Load quizzes page error:", error);
      setPremiumModules([]);
      setTopics([]);
      setQuizItems([]);
      setErrorMessage(
        error?.response?.data?.error || "Failed to load premium quizzes"
      );
    } finally {
      setLoading(false);
    }
  }

  function clearCreateForm() {
    setCreateForm(EMPTY_CREATE_FORM);
  }

  function clearFilters() {
    setSearch("");
    setModuleFilter("All Premium Modules");
  }

  function closeQuestionModal() {
    setSelectedQuiz(null);
    setQuestionForm(EMPTY_QUESTION_FORM);
  }

  function closeViewQuestionsModal() {
    setViewQuiz(null);
  }

  function closeEditQuizModal() {
    setEditQuizForm(EMPTY_EDIT_QUIZ_FORM);
  }

  function closeEditQuestionModal() {
    setEditingQuestion(null);
    setEditQuestionForm(EMPTY_QUESTION_FORM);
  }

  function scrollToTopForm() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePrepareCreatePreAssessment(module) {
    setCreateForm({
      quiz_type: "pre_assessment",
      module_id: String(module.id),
      topic_id: "",
      title: `${module.title} Pre-Assessment`,
      max_attempts: 3,
    });
    setSuccessMessage("");
    setErrorMessage("");
    scrollToTopForm();
  }

  function handlePrepareCreateTopicQuiz(topic) {
    setCreateForm({
      quiz_type: "topic_quiz",
      module_id: String(topic.module_id),
      topic_id: String(topic.id),
      title: `${topic.title} Topic Quiz`,
      max_attempts: 3,
    });
    setSuccessMessage("");
    setErrorMessage("");
    scrollToTopForm();
  }

  function handleOpenEditQuiz(quiz) {
    setEditQuizForm({
      id: quiz.id,
      title: quiz.title || "",
      max_attempts: quiz.max_attempts || 3,
    });
  }

  function handleOpenEditQuestion(question) {
    setEditingQuestion(question);
    setEditQuestionForm({
      question_text: question.question_text || "",
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correct_option: question.correct_option || "A",
      explanation_nepali: question.explanation_nepali || "",
      explanation_english: question.explanation_english || "",
    });
  }

  async function handleCreateQuiz() {
    try {
      setSubmittingCreate(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!createForm.module_id) {
        setErrorMessage("Please select a premium module.");
        return;
      }

      if (createForm.quiz_type === "topic_quiz" && !createForm.topic_id) {
        setErrorMessage("Please select a premium topic.");
        return;
      }

      if (!createForm.title.trim()) {
        setErrorMessage("Quiz title is required.");
        return;
      }

      const payload = {
        quiz_type: createForm.quiz_type,
        title: createForm.title.trim(),
        max_attempts: Number(createForm.max_attempts) || 3,
      };

      if (createForm.quiz_type === "pre_assessment") {
        payload.module_id = Number(createForm.module_id);
      } else {
        payload.module_id = Number(createForm.module_id);
        payload.topic_id = Number(createForm.topic_id);
      }

      await api.post("/quizzes", payload);

      setSuccessMessage("Quiz created successfully.");
      clearCreateForm();
      await fetchData();
    } catch (error) {
      console.error("Create quiz error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to create quiz"
      );
    } finally {
      setSubmittingCreate(false);
    }
  }

  async function handleAddQuestion() {
    try {
      setSubmittingQuestion(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!selectedQuiz?.id) {
        setErrorMessage("No quiz selected.");
        return;
      }

      if (
        !questionForm.question_text.trim() ||
        !questionForm.option_a.trim() ||
        !questionForm.option_b.trim() ||
        !questionForm.option_c.trim() ||
        !questionForm.option_d.trim()
      ) {
        setErrorMessage("Please fill all question and option fields.");
        return;
      }

      await api.post(`/quizzes/${selectedQuiz.id}/questions`, {
        question_text: questionForm.question_text.trim(),
        option_a: questionForm.option_a.trim(),
        option_b: questionForm.option_b.trim(),
        option_c: questionForm.option_c.trim(),
        option_d: questionForm.option_d.trim(),
        correct_option: questionForm.correct_option,
        explanation_nepali: questionForm.explanation_nepali.trim(),
        explanation_english: questionForm.explanation_english.trim(),
      });

      setSuccessMessage("Question added successfully.");
      closeQuestionModal();
      await fetchData();
    } catch (error) {
      console.error("Add question error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to add question"
      );
    } finally {
      setSubmittingQuestion(false);
    }
  }

  async function handleUpdateQuiz() {
    try {
      setSubmittingEditQuiz(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!editQuizForm.id) {
        setErrorMessage("No quiz selected.");
        return;
      }

      if (!editQuizForm.title.trim()) {
        setErrorMessage("Quiz title is required.");
        return;
      }

      await api.put(`/quizzes/${editQuizForm.id}`, {
        title: editQuizForm.title.trim(),
        max_attempts: Number(editQuizForm.max_attempts) || 3,
      });

      setSuccessMessage("Quiz updated successfully.");
      closeEditQuizModal();
      await fetchData();
    } catch (error) {
      console.error("Update quiz error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to update quiz"
      );
    } finally {
      setSubmittingEditQuiz(false);
    }
  }

  async function handleDeleteQuiz(quiz) {
    const confirmed = window.confirm(
      `Delete quiz "${quiz.title}"? This will also delete its questions and attempts.`
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/quizzes/${quiz.id}`);

      if (viewQuiz?.id === quiz.id) {
        closeViewQuestionsModal();
      }

      setSuccessMessage("Quiz deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Delete quiz error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to delete quiz"
      );
    }
  }

  async function handleUpdateQuestion() {
    try {
      setSubmittingEditQuestion(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!editingQuestion?.id) {
        setErrorMessage("No question selected.");
        return;
      }

      if (
        !editQuestionForm.question_text.trim() ||
        !editQuestionForm.option_a.trim() ||
        !editQuestionForm.option_b.trim() ||
        !editQuestionForm.option_c.trim() ||
        !editQuestionForm.option_d.trim()
      ) {
        setErrorMessage("Please fill all question and option fields.");
        return;
      }

      await api.put(`/quizzes/questions/${editingQuestion.id}`, {
        question_text: editQuestionForm.question_text.trim(),
        option_a: editQuestionForm.option_a.trim(),
        option_b: editQuestionForm.option_b.trim(),
        option_c: editQuestionForm.option_c.trim(),
        option_d: editQuestionForm.option_d.trim(),
        correct_option: editQuestionForm.correct_option,
        explanation_nepali: editQuestionForm.explanation_nepali.trim(),
        explanation_english: editQuestionForm.explanation_english.trim(),
      });

      setSuccessMessage("Question updated successfully.");
      closeEditQuestionModal();
      await fetchData();
    } catch (error) {
      console.error("Update question error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to update question"
      );
    } finally {
      setSubmittingEditQuestion(false);
    }
  }

  async function handleDeleteQuestion(question, quiz) {
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/quizzes/questions/${question.id}`);

      setSuccessMessage("Question deleted successfully.");
      await fetchData();

      if (quiz?.id) {
        const refetchedPre =
          quiz.quiz_type === "pre_assessment"
            ? await api
                .get(`/quizzes/admin/module/${quiz.module_id}/pre-assessment`)
                .catch(() => null)
            : null;

        const refetchedTopic =
          quiz.quiz_type === "topic_quiz"
            ? await api.get(`/quizzes/admin/topic/${quiz.topic_id}`).catch(() => null)
            : null;

        const updatedQuiz =
          refetchedPre?.data?.data?.quiz ||
          refetchedTopic?.data?.data?.quiz ||
          null;

        if (updatedQuiz) {
          setViewQuiz({
            ...quiz,
            ...updatedQuiz,
            questions_count: Array.isArray(updatedQuiz.questions)
              ? updatedQuiz.questions.length
              : 0,
          });
        } else {
          closeViewQuestionsModal();
        }
      }
    } catch (error) {
      console.error("Delete question error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to delete question"
      );
    }
  }

  const filteredModules = useMemo(() => {
    const term = search.toLowerCase().trim();

    return premiumModules
      .filter((module) => {
        if (moduleFilter === "All Premium Modules") return true;
        return String(module.id) === String(moduleFilter);
      })
      .filter((module) => {
        if (!term) return true;

        const moduleMatches =
          module.title?.toLowerCase().includes(term) ||
          module.description?.toLowerCase().includes(term);

        const moduleTopics = topics.filter(
          (topic) => String(topic.module_id) === String(module.id)
        );

        const topicMatches = moduleTopics.some(
          (topic) =>
            topic.title?.toLowerCase().includes(term) ||
            topic.description?.toLowerCase().includes(term)
        );

        const quizMatches = quizItems.some((quiz) => {
          const belongsToModule = String(quiz.module_id) === String(module.id);

          if (!belongsToModule) return false;

          return (
            quiz.title?.toLowerCase().includes(term) ||
            quiz.topic_title?.toLowerCase().includes(term) ||
            quiz.module_title?.toLowerCase().includes(term)
          );
        });

        return moduleMatches || topicMatches || quizMatches;
      });
  }, [premiumModules, topics, quizItems, search, moduleFilter]);

  const totalPremiumModules = premiumModules.length;
  const totalTopicQuizzes = quizItems.filter(
    (quiz) => quiz.quiz_type === "topic_quiz"
  ).length;
  const totalPreAssessments = quizItems.filter(
    (quiz) => quiz.quiz_type === "pre_assessment"
  ).length;
  const totalQuestionsAdded = quizItems.reduce(
    (sum, quiz) => sum + Number(quiz.questions_count || 0),
    0
  );

  return (
    <div className="saq-page">
      <PageHeader
        title="Quizzes Management"
        subtitle="Manage premium module pre-assessments and premium topic post-quizzes."
      />

      {errorMessage && (
        <div className="saq-alert saq-alert--error">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="saq-alert saq-alert--success">{successMessage}</div>
      )}

      <div className="saq-summary-grid">
        <SummaryCard
          label="Premium Modules"
          value={loading ? "..." : totalPremiumModules}
          note="Premium modules available for quiz setup."
          tone="blue"
        />
        <SummaryCard
          label="Pre-Assessments"
          value={loading ? "..." : totalPreAssessments}
          note="Premium module unlock quizzes created."
          tone="indigo"
        />
        <SummaryCard
          label="Topic Quizzes"
          value={loading ? "..." : totalTopicQuizzes}
          note="Premium post-topic quizzes created."
          tone="green"
        />
        <SummaryCard
          label="Questions Added"
          value={loading ? "..." : totalQuestionsAdded}
          note="Total questions currently stored in premium quizzes."
          tone="amber"
        />
      </div>

      <div className="saq-create-card">
        <div className="saq-create-card__header">
          <div>
            <h3 className="saq-create-card__title">Create Premium Quiz</h3>
            <p className="saq-create-card__subtitle">
              Pre-assessment serves 15 questions. Topic quiz serves 20 questions.
              You can store more questions for shuffling.
            </p>
          </div>
        </div>

        <div className="saq-create-grid">
          <div>
            <label className="saq-field-label">Quiz Type</label>
            <select
              value={createForm.quiz_type}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  quiz_type: e.target.value,
                  topic_id: "",
                }))
              }
              className="saq-field-input"
            >
              <option value="pre_assessment">Pre-Assessment</option>
              <option value="topic_quiz">Topic Quiz</option>
            </select>
          </div>

          <div>
            <label className="saq-field-label">Premium Module</label>
            <select
              value={createForm.module_id}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  module_id: e.target.value,
                  topic_id: "",
                }))
              }
              className="saq-field-input"
            >
              <option value="">Select premium module</option>
              {premiumModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          {createForm.quiz_type === "topic_quiz" && (
            <div>
              <label className="saq-field-label">Premium Topic</label>
              <select
                value={createForm.topic_id}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    topic_id: e.target.value,
                  }))
                }
                className="saq-field-input"
                disabled={!createForm.module_id}
              >
                <option value="">Select premium topic</option>
                {filteredTopicsForCreate.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="saq-create-grid__full">
            <label className="saq-field-label">Quiz Title</label>
            <input
              type="text"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Enter quiz title"
              className="saq-field-input"
            />
          </div>

          <div>
            <label className="saq-field-label">Max Attempts</label>
            <input
              type="number"
              min="1"
              max="10"
              value={createForm.max_attempts}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  max_attempts: e.target.value,
                }))
              }
              className="saq-field-input"
            />
          </div>
        </div>

        <div className="saq-create-actions">
          <button
            type="button"
            onClick={handleCreateQuiz}
            disabled={submittingCreate}
            className={`saq-primary-btn ${
              submittingCreate ? "saq-primary-btn--disabled" : ""
            }`}
          >
            {submittingCreate ? "Creating..." : "Create Quiz"}
          </button>

          <button
            type="button"
            onClick={clearCreateForm}
            className="saq-secondary-btn"
            disabled={submittingCreate}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="saq-toolbar-card">
        <div className="saq-toolbar">
          <div className="saq-toolbar__search">
            <label className="saq-field-label">Search</label>
            <input
              type="text"
              placeholder="Search module, topic, or quiz..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saq-field-input"
            />
          </div>

          <div className="saq-toolbar__filter">
            <label className="saq-field-label">Premium Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="saq-field-input"
            >
              <option>All Premium Modules</option>
              {premiumModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="saq-toolbar__actions">
            <button
              type="button"
              onClick={clearFilters}
              className="saq-secondary-btn"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="saq-list-wrap">
        {loading ? (
          <div className="saq-section-card">
            <p className="saq-loading-text">Loading premium quizzes...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="saq-section-card">
            <p className="saq-empty-text">
              No premium modules or quizzes found.
            </p>
          </div>
        ) : (
          filteredModules.map((module) => {
            const moduleTopics = topics.filter(
              (topic) => String(topic.module_id) === String(module.id)
            );

            const modulePreAssessment =
              quizItems.find(
                (quiz) =>
                  quiz.quiz_type === "pre_assessment" &&
                  String(quiz.module_id) === String(module.id)
              ) || null;

            const moduleTopicQuizzes = quizItems.filter(
              (quiz) =>
                quiz.quiz_type === "topic_quiz" &&
                String(quiz.module_id) === String(module.id)
            );

            return (
              <ModuleQuizBlock
                key={module.id}
                module={module}
                moduleTopics={moduleTopics}
                preAssessment={modulePreAssessment}
                topicQuizzes={moduleTopicQuizzes}
                onCreatePreAssessment={handlePrepareCreatePreAssessment}
                onCreateTopicQuiz={handlePrepareCreateTopicQuiz}
                onOpenAddQuestion={setSelectedQuiz}
                onOpenQuestions={setViewQuiz}
                onOpenEditQuiz={handleOpenEditQuiz}
                onDeleteQuiz={handleDeleteQuiz}
              />
            );
          })
        )}
      </div>

      {selectedQuiz && (
        <BaseModal title="Add MCQ Question" onClose={closeQuestionModal}>
          <p className="saq-helper-text">
            Quiz: <strong>{selectedQuiz.title}</strong>
          </p>

          <div className="saq-form-stack">
            <div>
              <label className="saq-form-label">Question Text</label>
              <textarea
                rows="4"
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    question_text: e.target.value,
                  }))
                }
                className="saq-field-textarea"
              />
            </div>

            <div className="saq-form-grid">
              <div>
                <label className="saq-form-label">Option A</label>
                <input
                  type="text"
                  value={questionForm.option_a}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      option_a: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>

              <div>
                <label className="saq-form-label">Option B</label>
                <input
                  type="text"
                  value={questionForm.option_b}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      option_b: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>

              <div>
                <label className="saq-form-label">Option C</label>
                <input
                  type="text"
                  value={questionForm.option_c}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      option_c: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>

              <div>
                <label className="saq-form-label">Option D</label>
                <input
                  type="text"
                  value={questionForm.option_d}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      option_d: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>
            </div>

            <div>
              <label className="saq-form-label">Correct Option</label>
              <select
                value={questionForm.correct_option}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    correct_option: e.target.value,
                  }))
                }
                className="saq-field-input"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div>
              <label className="saq-form-label">Explanation (Nepali)</label>
              <textarea
                rows="3"
                value={questionForm.explanation_nepali}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    explanation_nepali: e.target.value,
                  }))
                }
                className="saq-field-textarea"
              />
            </div>

            <div>
              <label className="saq-form-label">Explanation (English)</label>
              <textarea
                rows="3"
                value={questionForm.explanation_english}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    explanation_english: e.target.value,
                  }))
                }
                className="saq-field-textarea"
              />
            </div>
          </div>

          <div className="saq-modal__actions">
            <button
              onClick={handleAddQuestion}
              disabled={submittingQuestion}
              className={`saq-primary-btn ${
                submittingQuestion ? "saq-primary-btn--disabled" : ""
              }`}
              type="button"
            >
              {submittingQuestion ? "Saving..." : "Add Question"}
            </button>

            <button
              onClick={closeQuestionModal}
              disabled={submittingQuestion}
              className="saq-secondary-btn"
              type="button"
            >
              Cancel
            </button>
          </div>
        </BaseModal>
      )}

      {viewQuiz && (
        <BaseModal
          title={`Questions - ${viewQuiz.title}`}
          onClose={closeViewQuestionsModal}
          wide
        >
          {!Array.isArray(viewQuiz.questions) || viewQuiz.questions.length === 0 ? (
            <p className="saq-empty-text">No questions added yet.</p>
          ) : (
            <div className="saq-question-list">
              {viewQuiz.questions.map((question, index) => (
                <div key={question.id} className="saq-question-card">
                  <div className="saq-question-card__top">
                    <div className="saq-question-card__main">
                      <p className="saq-question-card__title">
                        Q{index + 1}. {question.question_text}
                      </p>

                      <div className="saq-question-options">
                        <div>A. {question.option_a}</div>
                        <div>B. {question.option_b}</div>
                        <div>C. {question.option_c}</div>
                        <div>D. {question.option_d}</div>
                      </div>

                      <div className="saq-question-meta">
                        <span>
                          Correct: <strong>{question.correct_option || "-"}</strong>
                        </span>
                        <span>Question ID: {question.id}</span>
                      </div>

                      {(question.explanation_nepali ||
                        question.explanation_english) && (
                        <div className="saq-question-explanations">
                          {question.explanation_nepali && (
                            <div>
                              <strong>Nepali:</strong> {question.explanation_nepali}
                            </div>
                          )}
                          {question.explanation_english && (
                            <div>
                              <strong>English:</strong> {question.explanation_english}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="saq-question-card__actions">
                      <button
                        type="button"
                        onClick={() => handleOpenEditQuestion(question)}
                        className="saq-action-btn saq-action-btn--view"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(question, viewQuiz)}
                        className="saq-action-btn saq-action-btn--delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BaseModal>
      )}

      {editQuizForm.id && (
        <BaseModal title="Edit Quiz" onClose={closeEditQuizModal}>
          <div className="saq-form-stack">
            <div>
              <label className="saq-form-label">Quiz Title</label>
              <input
                type="text"
                value={editQuizForm.title}
                onChange={(e) =>
                  setEditQuizForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="saq-field-input"
              />
            </div>

            <div>
              <label className="saq-form-label">Max Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={editQuizForm.max_attempts}
                onChange={(e) =>
                  setEditQuizForm((prev) => ({
                    ...prev,
                    max_attempts: e.target.value,
                  }))
                }
                className="saq-field-input"
              />
            </div>
          </div>

          <div className="saq-modal__actions">
            <button
              onClick={handleUpdateQuiz}
              disabled={submittingEditQuiz}
              className={`saq-primary-btn ${
                submittingEditQuiz ? "saq-primary-btn--disabled" : ""
              }`}
              type="button"
            >
              {submittingEditQuiz ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={closeEditQuizModal}
              disabled={submittingEditQuiz}
              className="saq-secondary-btn"
              type="button"
            >
              Cancel
            </button>
          </div>
        </BaseModal>
      )}

      {editingQuestion && (
        <BaseModal title="Edit Question" onClose={closeEditQuestionModal}>
          <div className="saq-form-stack">
            <div>
              <label className="saq-form-label">Question Text</label>
              <textarea
                rows="4"
                value={editQuestionForm.question_text}
                onChange={(e) =>
                  setEditQuestionForm((prev) => ({
                    ...prev,
                    question_text: e.target.value,
                  }))
                }
                className="saq-field-textarea"
              />
            </div>

            <div className="saq-form-grid">
              <div>
                <label className="saq-form-label">Option A</label>
                <input
                  type="text"
                  value={editQuestionForm.option_a}
                  onChange={(e) =>
                    setEditQuestionForm((prev) => ({
                      ...prev,
                      option_a: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>

              <div>
                <label className="saq-form-label">Option B</label>
                <input
                  type="text"
                  value={editQuestionForm.option_b}
                  onChange={(e) =>
                    setEditQuestionForm((prev) => ({
                      ...prev,
                      option_b: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>

              <div>
                <label className="saq-form-label">Option C</label>
                <input
                  type="text"
                  value={editQuestionForm.option_c}
                  onChange={(e) =>
                    setEditQuestionForm((prev) => ({
                      ...prev,
                      option_c: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>

              <div>
                <label className="saq-form-label">Option D</label>
                <input
                  type="text"
                  value={editQuestionForm.option_d}
                  onChange={(e) =>
                    setEditQuestionForm((prev) => ({
                      ...prev,
                      option_d: e.target.value,
                    }))
                  }
                  className="saq-field-input"
                />
              </div>
            </div>

            <div>
              <label className="saq-form-label">Correct Option</label>
              <select
                value={editQuestionForm.correct_option}
                onChange={(e) =>
                  setEditQuestionForm((prev) => ({
                    ...prev,
                    correct_option: e.target.value,
                  }))
                }
                className="saq-field-input"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div>
              <label className="saq-form-label">Explanation (Nepali)</label>
              <textarea
                rows="3"
                value={editQuestionForm.explanation_nepali}
                onChange={(e) =>
                  setEditQuestionForm((prev) => ({
                    ...prev,
                    explanation_nepali: e.target.value,
                  }))
                }
                className="saq-field-textarea"
              />
            </div>

            <div>
              <label className="saq-form-label">Explanation (English)</label>
              <textarea
                rows="3"
                value={editQuestionForm.explanation_english}
                onChange={(e) =>
                  setEditQuestionForm((prev) => ({
                    ...prev,
                    explanation_english: e.target.value,
                  }))
                }
                className="saq-field-textarea"
              />
            </div>
          </div>

          <div className="saq-modal__actions">
            <button
              onClick={handleUpdateQuestion}
              disabled={submittingEditQuestion}
              className={`saq-primary-btn ${
                submittingEditQuestion ? "saq-primary-btn--disabled" : ""
              }`}
              type="button"
            >
              {submittingEditQuestion ? "Saving..." : "Save Question"}
            </button>

            <button
              onClick={closeEditQuestionModal}
              disabled={submittingEditQuestion}
              className="saq-secondary-btn"
              type="button"
            >
              Cancel
            </button>
          </div>
        </BaseModal>
      )}
    </div>
  );
}