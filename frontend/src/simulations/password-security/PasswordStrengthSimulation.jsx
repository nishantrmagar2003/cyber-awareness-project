import { useState, useEffect, useRef } from "react";

// ─── Inline CSS (import this separately as PasswordSimulation.css in your project) ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

:root {
  --bg: #eef2f7;
  --card: #ffffff;
  --border: #dde3ec;
  --text-main: #1e2a38;
  --text-sub: #64748b;
  --text-muted: #a0aec0;
  --blue: #3b82f6;
  --blue-light: #eff6ff;
  --green: #22c55e;
  --green-light: #f0fdf4;
  --green-dark: #166534;
  --radius-lg: 18px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow: 0 6px 32px rgba(30,42,56,0.10);
  --transition: all 0.3s ease;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

.ps-app {
  font-family: 'Nunito', 'Noto Sans Devanagari', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 32px 16px 64px;
}

.ps-lang-bar {
  display: flex;
  justify-content: flex-end;
  max-width: 600px;
  margin: 0 auto 18px;
}

.ps-lang-toggle {
  display: flex;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 50px;
  padding: 4px;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.ps-lang-btn {
  padding: 6px 18px;
  border: none;
  border-radius: 50px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-sub);
  background: transparent;
}

.ps-lang-btn.active {
  background: var(--blue);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59,130,246,0.3);
}

.ps-card {
  background: var(--card);
  border-radius: var(--radius-lg);
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 36px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.ps-header { text-align: center; margin-bottom: 32px; }
.ps-header-icon { font-size: 52px; margin-bottom: 14px; display: block; }
.ps-title { font-size: 26px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; line-height:1.3; }
.ps-subtitle { font-size: 14px; color: var(--text-sub); line-height: 1.7; }

.ps-divider { height: 1px; background: var(--border); margin: 0 -36px 28px; }

.ps-field-label { display: block; font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }

.ps-input-wrapper { position: relative; margin-bottom: 8px; }

.ps-pw-input {
  width: 100%;
  padding: 14px 52px 14px 18px;
  font-size: 16px;
  font-family: inherit;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  outline: none;
  color: var(--text-main);
  background: #f8fafc;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.ps-pw-input:focus {
  border-color: var(--blue);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
}

.ps-pw-input::placeholder { color: var(--text-muted); font-size: 14px; }

.ps-eye-btn {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: var(--text-muted); padding: 4px; line-height:1; transition: color 0.2s;
}
.ps-eye-btn:hover { color: var(--blue); }

.ps-char-count { text-align: right; font-size: 12px; color: var(--text-muted); margin-bottom: 22px; }

.ps-strength-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.ps-strength-label { font-size: 13px; font-weight: 700; color: var(--text-sub); }
.ps-strength-badge { font-size: 12px; font-weight: 800; padding: 3px 14px; border-radius: 50px; }

.ps-bar-track { height: 10px; background: #e9eef4; border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
.ps-bar-fill { height: 100%; border-radius: 10px; transition: width 0.55s cubic-bezier(.4,0,.2,1), background 0.4s; }

.ps-result-banner {
  border-radius: var(--radius-md);
  padding: 18px 22px; margin-bottom: 20px;
  display: flex; align-items: flex-start; gap: 14px;
  border-width: 2px; border-style: solid; transition: var(--transition);
}
.ps-result-emoji { font-size: 40px; flex-shrink: 0; line-height: 1; margin-top: 2px; }
.ps-result-level { font-size: 17px; font-weight: 800; margin-bottom: 4px; }
.ps-result-desc { font-size: 13px; line-height: 1.65; opacity: 0.88; }

.ps-crack-box {
  background: #f8fafc; border: 2px solid var(--border);
  border-radius: var(--radius-md); padding: 18px 22px;
  margin-bottom: 28px; text-align: center;
}
.ps-crack-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; }
.ps-crack-value { font-size: 24px; font-weight: 800; margin-bottom: 5px; line-height: 1.2; }
.ps-crack-note { font-size: 12px; color: var(--text-muted); line-height: 1.5; }

.ps-section-title { font-size: 14px; font-weight: 800; color: var(--text-main); margin-bottom: 12px; }
.ps-checklist { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }

.ps-check-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 16px; border-radius: var(--radius-sm);
  border: 1.5px solid var(--border); background: #f8fafc;
  transition: var(--transition);
}
.ps-check-item.passed { background: var(--green-light); border-color: #86efac; }
.ps-check-circle {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid var(--border); background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: var(--text-muted);
  flex-shrink: 0; transition: var(--transition);
}
.ps-check-item.passed .ps-check-circle { background: var(--green); border-color: var(--green); color: #fff; }
.ps-check-text { font-size: 14px; font-weight: 600; color: var(--text-sub); transition: color 0.3s; line-height:1.4; }
.ps-check-item.passed .ps-check-text { color: var(--green-dark); }

.ps-tips-box { background: var(--blue-light); border: 1.5px solid #bfdbfe; border-radius: var(--radius-md); padding: 18px 22px; }
.ps-tips-title { font-size: 14px; font-weight: 800; color: #1d4ed8; margin-bottom: 10px; }
.ps-tip-item { font-size: 13px; color: #1e3a8a; padding: 3px 0 3px 18px; position: relative; line-height: 1.6; }
.ps-tip-item::before { content: '→'; position: absolute; left: 2px; color: #60a5fa; font-weight: 700; }

.ps-empty { text-align: center; padding: 24px 0 8px; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.ps-empty-icon { font-size: 36px; display: block; margin-bottom: 8px; }

@media (max-width: 520px) {
  .ps-card { padding: 28px 20px; }
  .ps-divider { margin: 0 -20px 24px; }
  .ps-title { font-size: 22px; }
  .ps-crack-value { font-size: 20px; }
  .ps-result-banner { flex-direction: column; align-items: center; text-align: center; }
}
`;

// ─── Translations ──────────────────────────────────────────────────────────
const T = {
  en: {
    icon:        "🔐",
    title:       "Password Strength Checker",
    subtitle:    "Type a password below to see how strong it is\nand how long it would take a hacker to crack it.",
    fieldLabel:  "Your Password",
    placeholder: "Type your password here...",
    charCount:   (n) => `${n} characters`,
    strengthLbl: "Strength",
    levels:      ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"],
    crackLabel:  "⏱ Time for a hacker to crack this",
    crackNote:   "Based on a modern computer making 1 billion guesses per second",
    checkTitle:  "✅ Password Requirements",
    tipsTitle:   "💡 How to improve your password",
    emptyTitle:  "Start typing to see your results",
    emptyNote:   "Your password is never stored or sent anywhere.",
    checks: [
      "At least 8 characters",
      "12 or more characters",
      "Has uppercase letters (A–Z)",
      "Has lowercase letters (a–z)",
      "Has numbers (0–9)",
      "Has special characters (! @ # $)",
      "Not a common password",
    ],
    descs: [
      "This password is very easy to guess. A hacker could crack it in seconds. Please make it stronger!",
      "This password is weak. It could be cracked quickly. Try adding more variety.",
      "Not bad! But you can still improve it by adding more characters or symbols.",
      "Good password! This would be hard for most people to guess.",
      "Excellent password! This is very secure and would take a very long time to crack.",
    ],
    tips: {
      length8:   "Make it at least 8 characters long",
      length12:  "Use 12+ characters for better protection",
      uppercase: "Add some uppercase letters (A, B, C...)",
      numbers:   "Include numbers (1, 2, 3...)",
      special:   "Add special characters like ! @ # $ %",
      noCommon:  "Avoid common words like 'password' or '123456'",
      perfect:   "Great job! Your password is very strong. Consider saving it in a password manager.",
    },
    crackTimes: (s) => {
      if (s < 1)        return "Less than a second ⚡";
      if (s < 60)       return `About ${Math.round(s)} seconds`;
      if (s < 3600)     return `About ${Math.round(s / 60)} minutes`;
      if (s < 86400)    return `About ${Math.round(s / 3600)} hours`;
      if (s < 2592000)  return `About ${Math.round(s / 86400)} days`;
      if (s < 31536000) return `About ${Math.round(s / 2592000)} months`;
      if (s < 1e9)      return `About ${Math.round(s / 31536000)} years`;
      return "Hundreds of years 🎉";
    },
  },

  np: {
    icon:        "🔐",
    title:       "पासवर्ड बल जाँचकर्ता",
    subtitle:    "तलको बाकसमा पासवर्ड टाइप गर्नुहोस् र हेर्नुहोस्\nयो कति बलियो छ र ह्याकरले यसलाई तोड्न कति समय लाग्छ।",
    fieldLabel:  "तपाईंको पासवर्ड",
    placeholder: "यहाँ पासवर्ड टाइप गर्नुहोस्...",
    charCount:   (n) => `${n} अक्षर`,
    strengthLbl: "बल",
    levels:      ["धेरै कमजोर", "कमजोर", "ठीक छ", "बलियो", "धेरै बलियो"],
    crackLabel:  "⏱ ह्याकरले तोड्न लाग्ने समय",
    crackNote:   "आधुनिक कम्प्युटरले प्रति सेकेन्ड १ अर्ब अनुमान गर्न सक्छ",
    checkTitle:  "✅ पासवर्डका आवश्यकताहरू",
    tipsTitle:   "💡 पासवर्ड कसरी सुधार्ने",
    emptyTitle:  "परिणाम हेर्न टाइप गर्न सुरु गर्नुहोस्",
    emptyNote:   "तपाईंको पासवर्ड कहीं पनि सुरक्षित गरिँदैन।",
    checks: [
      "कम्तीमा ८ अक्षर",
      "१२ वा बढी अक्षर",
      "ठूला अक्षरहरू छन् (A–Z)",
      "साना अक्षरहरू छन् (a–z)",
      "अंकहरू छन् (०–९)",
      "विशेष चिह्नहरू छन् (! @ # $)",
      "सामान्य पासवर्ड होइन",
    ],
    descs: [
      "यो पासवर्ड अत्यन्त सजिलै अनुमान गर्न सकिन्छ। ह्याकरले केही सेकेन्डमै तोड्न सक्छ। कृपया यसलाई बलियो बनाउनुहोस्!",
      "यो पासवर्ड कमजोर छ। यसलाई छिट्टै तोड्न सकिन्छ। थप विविधता थप्ने प्रयास गर्नुहोस्।",
      "ठीकै छ! तर थप अक्षर वा चिह्नहरू थपेर अझ बलियो बनाउन सकिन्छ।",
      "राम्रो पासवर्ड! अधिकांश मानिसले यसलाई अनुमान गर्न गाह्रो पाउनेछन्।",
      "उत्कृष्ट पासवर्ड! यो अत्यन्त सुरक्षित छ र यसलाई तोड्न धेरै समय लाग्नेछ।",
    ],
    tips: {
      length8:   "कम्तीमा ८ अक्षर लामो बनाउनुहोस्",
      length12:  "राम्रो सुरक्षाका लागि १२+ अक्षर प्रयोग गर्नुहोस्",
      uppercase: "केही ठूला अक्षरहरू थप्नुहोस् (A, B, C...)",
      numbers:   "अंकहरू समावेश गर्नुहोस् (१, २, ३...)",
      special:   "विशेष चिह्नहरू थप्नुहोस् जस्तै ! @ # $ %",
      noCommon:  "'password' वा '123456' जस्ता सामान्य शब्दहरू नराख्नुहोस्",
      perfect:   "साबास! तपाईंको पासवर्ड धेरै बलियो छ। यसलाई पासवर्ड म्यानेजरमा सुरक्षित राख्नुहोस्।",
    },
    crackTimes: (s) => {
      if (s < 1)        return "एक सेकेन्डभन्दा कम ⚡";
      if (s < 60)       return `लगभग ${Math.round(s)} सेकेन्ड`;
      if (s < 3600)     return `लगभग ${Math.round(s / 60)} मिनेट`;
      if (s < 86400)    return `लगभग ${Math.round(s / 3600)} घण्टा`;
      if (s < 2592000)  return `लगभग ${Math.round(s / 86400)} दिन`;
      if (s < 31536000) return `लगभग ${Math.round(s / 2592000)} महिना`;
      if (s < 1e9)      return `लगभग ${Math.round(s / 31536000)} वर्ष`;
      return "सयौं वर्ष 🎉";
    },
  },
};

// ─── Analysis engine ───────────────────────────────────────────────────────
function analyzePassword(pwd, lang) {
  if (!pwd) return null;
  const t = T[lang];

  const checks = {
    length8:   pwd.length >= 8,
    length12:  pwd.length >= 12,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    numbers:   /[0-9]/.test(pwd),
    special:   /[^A-Za-z0-9]/.test(pwd),
    noCommon:  !/^(password|123456|qwerty|abc123|letmein|welcome)/i.test(pwd),
  };

  let score = 0;
  if (checks.length8)   score += 15;
  if (checks.length12)  score += 20;
  if (checks.uppercase) score += 15;
  if (checks.lowercase) score += 10;
  if (checks.numbers)   score += 15;
  if (checks.special)   score += 20;
  if (checks.noCommon)  score += 5;
  score = Math.min(100, score);

  let charset = 0;
  if (checks.lowercase) charset += 26;
  if (checks.uppercase) charset += 26;
  if (checks.numbers)   charset += 10;
  if (checks.special)   charset += 32;
  charset = charset || 26;

  const secs = Math.pow(charset, pwd.length) / 2 / 1e9;
  const crackTime = t.crackTimes(secs);

  const idx = score < 30 ? 0 : score < 50 ? 1 : score < 70 ? 2 : score < 85 ? 3 : 4;

  const palette = [
    { bar: "#f87171", bg: "#fff5f5", border: "#fca5a5", text: "#b91c1c" },
    { bar: "#fb923c", bg: "#fff7ed", border: "#fdba74", text: "#c2410c" },
    { bar: "#facc15", bg: "#fefce8", border: "#fde047", text: "#854d0e" },
    { bar: "#4ade80", bg: "#f0fdf4", border: "#86efac", text: "#166534" },
    { bar: "#22c55e", bg: "#f0fdf4", border: "#86efac", text: "#14532d" },
  ][idx];

  const emojis = ["😟", "😐", "🙂", "😊", "🎉"];

  const tips = [];
  if (!checks.length8)   tips.push(t.tips.length8);
  if (!checks.length12)  tips.push(t.tips.length12);
  if (!checks.uppercase) tips.push(t.tips.uppercase);
  if (!checks.numbers)   tips.push(t.tips.numbers);
  if (!checks.special)   tips.push(t.tips.special);
  if (!checks.noCommon)  tips.push(t.tips.noCommon);
  if (tips.length === 0) tips.push(t.tips.perfect);

  return {
    score,
    level: t.levels[idx],
    desc:  t.descs[idx],
    crackTime,
    palette,
    emoji: emojis[idx],
    checks,
    tips,
  };
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function PasswordStrengthSimulation({ attemptId, onComplete }) {
  const [lang, setLang]     = useState("en");
  const [pwd, setPwd]       = useState("");
  const [show, setShow]     = useState(false);
  const [result, setResult] = useState(null);
  const [done, setDone]     = useState(false);
  const timer               = useRef(null);
  const startTime           = useRef(Date.now());
  const t                   = T[lang];

  useEffect(() => {
    clearTimeout(timer.current);
    if (!pwd) { setResult(null); return; }
    timer.current = setTimeout(() => setResult(analyzePassword(pwd, lang)), 280);
    return () => clearTimeout(timer.current);
  }, [pwd, lang]);

  useEffect(() => {
    if (pwd) setResult(analyzePassword(pwd, lang));
  }, [lang]);

  function handleFinish() {
    setDone(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    if (onComplete) {
      onComplete({
        answers: {
          finalPassword:   pwd,
          strengthScore:   result?.score ?? 0,
          strengthLevel:   result?.level ?? "Very Weak",
          checksCompleted: result?.checks ?? {},
        },
        score:     result?.score ?? 0,
        timeTaken,
      });
    }
  }

  const checkKeys = ["length8","length12","uppercase","lowercase","numbers","special","noCommon"];

  return (
    <div className="ps-app">
      <style>{css}</style>

      {/* Language toggle */}
      <div className="ps-lang-bar">
        <div className="ps-lang-toggle">
          <button className={`ps-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>
            🇬🇧 English
          </button>
          <button className={`ps-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => setLang("np")}>
            🇳🇵 नेपाली
          </button>
        </div>
      </div>

      <div className="ps-card">

        {/* Header */}
        <div className="ps-header">
          <span className="ps-header-icon">{t.icon}</span>
          <h1 className="ps-title">{t.title}</h1>
          <p className="ps-subtitle">
            {t.subtitle.split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>

        <div className="ps-divider" />

        {/* Input */}
        <label className="ps-field-label">{t.fieldLabel}</label>
        <div className="ps-input-wrapper">
          <input
            className="ps-pw-input"
            type={show ? "text" : "password"}
            placeholder={t.placeholder}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="ps-eye-btn" onClick={() => setShow((s) => !s)}>
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        <div className="ps-char-count">{t.charCount(pwd.length)}</div>

        {/* Strength bar */}
        <div className="ps-strength-header">
          <span className="ps-strength-label">{t.strengthLbl}</span>
          {result && (
            <span className="ps-strength-badge" style={{ background: result.palette.bg, color: result.palette.text }}>
              {result.level}
            </span>
          )}
        </div>
        <div className="ps-bar-track">
          <div
            className="ps-bar-fill"
            style={{ width: result ? `${result.score}%` : "0%", background: result?.palette.bar ?? "#e9eef4" }}
          />
        </div>

        {/* Results */}
        {result ? (
          <>
            <div className="ps-result-banner" style={{ background: result.palette.bg, borderColor: result.palette.border }}>
              <div className="ps-result-emoji">{result.emoji}</div>
              <div>
                <div className="ps-result-level" style={{ color: result.palette.text }}>{result.level}</div>
                <div className="ps-result-desc"  style={{ color: result.palette.text }}>{result.desc}</div>
              </div>
            </div>

            <div className="ps-crack-box">
              <div className="ps-crack-label">{t.crackLabel}</div>
              <div className="ps-crack-value" style={{ color: result.palette.text }}>{result.crackTime}</div>
              <div className="ps-crack-note">{t.crackNote}</div>
            </div>

            <div className="ps-section-title">{t.checkTitle}</div>
            <div className="ps-checklist">
              {checkKeys.map((key, i) => (
                <div key={key} className={`ps-check-item ${result.checks[key] ? "passed" : ""}`}>
                  <div className="ps-check-circle">{result.checks[key] ? "✓" : ""}</div>
                  <span className="ps-check-text">{t.checks[i]}</span>
                </div>
              ))}
            </div>

            <div className="ps-tips-box">
              <div className="ps-tips-title">{t.tipsTitle}</div>
              {result.tips.map((tip, i) => (
                <div key={i} className="ps-tip-item">{tip}</div>
              ))}
            </div>

            {/* ── Finish button ── */}
            {!done ? (
              <button
                className="ps-finish-btn"
                onClick={handleFinish}
                style={{
                  marginTop: 24, width: "100%", padding: "14px",
                  background: "#22c55e", color: "#fff", border: "none",
                  borderRadius: "var(--radius-md)", fontFamily: "inherit",
                  fontSize: 15, fontWeight: 800, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {lang === "np" ? "✅ सिमुलेसन सम्पन्न गर्नुहोस्" : "✅ Mark as Complete"}
              </button>
            ) : (
              <div style={{
                marginTop: 24, textAlign: "center", padding: "14px",
                background: "var(--green-light)", border: "1.5px solid #86efac",
                borderRadius: "var(--radius-md)", color: "#166534", fontWeight: 700,
              }}>
                {lang === "np" ? "🎉 सम्पन्न! प्रगति सुरक्षित गरिँदैछ…" : "🎉 Complete! Saving your progress…"}
              </div>
            )}
          </>
        ) : (
          <div className="ps-empty">
            <span className="ps-empty-icon">🔑</span>
            <strong>👆 {t.emptyTitle}</strong>
            <br />
            <span>{t.emptyNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}