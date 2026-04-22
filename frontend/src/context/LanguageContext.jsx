import React, { createContext, useState, useContext } from "react";

/* =========================
   CONTEXT
========================= */
const LanguageContext = createContext(null);

/* =========================
   PROVIDER
========================= */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // 🔥 Persist language (optional upgrade)
    return localStorage.getItem("lang") || "en";
  });

  const updateLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: updateLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};