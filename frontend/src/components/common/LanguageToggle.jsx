import { useLanguage } from "../../context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="quiz-language-toggle">
      <button
        type="button"
        className={`quiz-language-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
      >
        English
      </button>

      <button
        type="button"
        className={`quiz-language-btn ${language === "np" ? "active" : ""}`}
        onClick={() => setLanguage("np")}
      >
        नेपाली
      </button>
    </div>
  );
}