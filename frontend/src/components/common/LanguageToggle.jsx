import { useLanguage } from "../../context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ position: "fixed", top: 10, right: 10, zIndex: 1000 }}>
      <button
        onClick={() => setLanguage("en")}
        style={{
          marginRight: "5px",
          padding: "6px 10px",
          background: language === "en" ? "#333" : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: "5px"
        }}
      >
        EN
      </button>

      <button
        onClick={() => setLanguage("np")}
        style={{
          padding: "6px 10px",
          background: language === "np" ? "#333" : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: "5px"
        }}
      >
        NP
      </button>
    </div>
  );
}