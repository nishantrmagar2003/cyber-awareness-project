import { useState, useEffect, useRef } from "react";

/* ── Translations ─────────────────────────────────── */
const T = {
  en: {
    moduleTag:   "MODULE 1 · SIMULATION 2",
    title:       "Password Reuse Attack",
    subtitle:    "See what happens when you use the same password on multiple websites.",
    stepLabel:   (current, total) => `Step ${current} of ${total}`,

    step1: {
      heading:    "Step 1: Login to SocialBook",
      icon:       "📘",
      siteName:   "SocialBook",
      siteDesc:   "Your favourite social media",
      userLabel:  "Username",
      userHolder: "Enter your username",
      passLabel:  "Password",
      passHolder: "Create a password",
      btn:        "Login to SocialBook",
    },
    step2: {
      heading:    "Step 2: Login to SafeBank",
      icon:       "🏦",
      siteName:   "SafeBank",
      siteDesc:   "Your online bank account",
      userLabel:  "Username",
      userHolder: "Enter your username",
      passLabel:  "Password",
      passHolder: "Enter your bank password",
      btn:        "Login to SafeBank",
      hint:       "💡 Tip: Try using a DIFFERENT password this time to see what happens!",
    },

    // BREACH outcome
    breachTitle:   "🚨 Data Breach Detected!",
    breachSub:     "SocialBook was hacked! Your password was stolen.",
    breachSteps: [
      { icon: "💀", title: "SocialBook Hacked",     desc: "Hackers broke into SocialBook and stole all usernames and passwords." },
      { icon: "🔍", title: "Your Password Found",   desc: "Your password was found in the stolen database." },
      { icon: "🏦", title: "Bank Account Attacked", desc: "Hackers tried the same password on SafeBank..." },
      { icon: "💸", title: "Bank Account Compromised!", desc: "It worked! Your bank account is now fully accessible to hackers." },
    ],
    breachLesson: {
      title: "⚠️ What you learned:",
      points: [
        "You used the SAME password on both sites",
        "When SocialBook was hacked, SafeBank was also at risk",
        "One leaked password = ALL your accounts are in danger",
        "Always use a DIFFERENT password for every website",
      ],
    },
    breachBtn: "Try Again with Different Passwords →",

    // SAFE outcome
    safeTitle:  "✅ You Are Safe!",
    safeSub:    "SocialBook was hacked — but your bank account is safe!",
    safeSteps: [
      { icon: "💀", title: "SocialBook Hacked",       desc: "Hackers broke into SocialBook and stole all usernames and passwords." },
      { icon: "🔍", title: "Your Password Found",      desc: "Your SocialBook password was found in the stolen database." },
      { icon: "🏦", title: "Bank Attack Failed",       desc: "Hackers tried the stolen password on SafeBank..." },
      { icon: "🛡️", title: "Bank Account Protected!", desc: "It did NOT work! Your bank uses a different password — you are safe!" },
    ],
    safeLesson: {
      title: "✅ What you learned:",
      points: [
        "You used DIFFERENT passwords on each site",
        "Even though SocialBook was hacked, your bank is safe",
        "Different passwords = each account stays protected",
        "This is the right way to protect yourself online!",
      ],
    },
    safeBtn: "Try Again →",

    resetBtn: "Start Over",
    samePasswordWarning: "⚠️ This is the same password as SocialBook!",
    diffPasswordGood:    "✅ Smart! This is a different password.",
  },

  np: {
    moduleTag:   "मड्युल १ · सिमुलेसन २",
    title:       "पासवर्ड पुनः प्रयोग आक्रमण",
    subtitle:    "एउटै पासवर्ड धेरै वेबसाइटमा प्रयोग गर्दा के हुन्छ भनेर हेर्नुहोस्।",
    stepLabel:   (current, total) => `चरण ${current} मध्ये ${total}`,

    step1: {
      heading:    "चरण १: सोसलबुकमा लगइन गर्नुहोस्",
      icon:       "📘",
      siteName:   "सोसलबुक",
      siteDesc:   "तपाईंको मनपर्ने सामाजिक सञ्जाल",
      userLabel:  "प्रयोगकर्ता नाम",
      userHolder: "आफ्नो नाम लेख्नुहोस्",
      passLabel:  "पासवर्ड",
      passHolder: "पासवर्ड बनाउनुहोस्",
      btn:        "सोसलबुकमा लगइन गर्नुहोस्",
    },
    step2: {
      heading:    "चरण २: सेफबैंकमा लगइन गर्नुहोस्",
      icon:       "🏦",
      siteName:   "सेफबैंक",
      siteDesc:   "तपाईंको अनलाइन बैंक खाता",
      userLabel:  "प्रयोगकर्ता नाम",
      userHolder: "आफ्नो नाम लेख्नुहोस्",
      passLabel:  "पासवर्ड",
      passHolder: "बैंक पासवर्ड लेख्नुहोस्",
      btn:        "सेफबैंकमा लगइन गर्नुहोस्",
      hint:       "💡 सुझाव: यस पटक फरक पासवर्ड प्रयोग गरेर हेर्नुहोस्!",
    },

    breachTitle:   "🚨 डेटा उल्लङ्घन भयो!",
    breachSub:     "सोसलबुक ह्याक भयो! तपाईंको पासवर्ड चोरी भयो।",
    breachSteps: [
      { icon: "💀", title: "सोसलबुक ह्याक भयो",      desc: "ह्याकरहरूले सोसलबुकमा घुसी सबै नाम र पासवर्ड चोरे।" },
      { icon: "🔍", title: "तपाईंको पासवर्ड भेटियो", desc: "चोरिएको डेटाबेसमा तपाईंको पासवर्ड फेला पर्‍यो।" },
      { icon: "🏦", title: "बैंक खातामा आक्रमण",    desc: "ह्याकरहरूले उही पासवर्ड सेफबैंकमा प्रयास गरे..." },
      { icon: "💸", title: "बैंक खाता ह्याक भयो!",   desc: "काम गर्‍यो! ह्याकरहरूले तपाईंको बैंक खातामा पहुँच पाए।" },
    ],
    breachLesson: {
      title: "⚠️ तपाईंले के सिक्नुभयो:",
      points: [
        "तपाईंले दुवै साइटमा उही पासवर्ड प्रयोग गर्नुभयो",
        "सोसलबुक ह्याक हुँदा, सेफबैंक पनि खतरामा पर्‍यो",
        "एउटा पासवर्ड चोरी = सबै खाता खतरामा",
        "हरेक वेबसाइटका लागि फरक पासवर्ड प्रयोग गर्नुहोस्",
      ],
    },
    breachBtn: "फरक पासवर्डले फेरि प्रयास गर्नुहोस् →",

    safeTitle:  "✅ तपाईं सुरक्षित हुनुहुन्छ!",
    safeSub:    "सोसलबुक ह्याक भयो — तर तपाईंको बैंक खाता सुरक्षित छ!",
    safeSteps: [
      { icon: "💀", title: "सोसलबुक ह्याक भयो",       desc: "ह्याकरहरूले सोसलबुकमा घुसी सबै नाम र पासवर्ड चोरे।" },
      { icon: "🔍", title: "तपाईंको पासवर्ड भेटियो",  desc: "तपाईंको सोसलबुक पासवर्ड चोरिएको डेटाबेसमा फेला पर्‍यो।" },
      { icon: "🏦", title: "बैंक आक्रमण असफल भयो",    desc: "ह्याकरहरूले चोरिएको पासवर्ड सेफबैंकमा प्रयास गरे..." },
      { icon: "🛡️", title: "बैंक खाता सुरक्षित छ!",  desc: "काम गरेन! तपाईंको बैंकमा फरक पासवर्ड छ — तपाईं सुरक्षित हुनुहुन्छ!" },
    ],
    safeLesson: {
      title: "✅ तपाईंले के सिक्नुभयो:",
      points: [
        "तपाईंले हरेक साइटमा फरक पासवर्ड प्रयोग गर्नुभयो",
        "सोसलबुक ह्याक भए पनि, तपाईंको बैंक सुरक्षित छ",
        "फरक पासवर्ड = हरेक खाता सुरक्षित",
        "अनलाइन सुरक्षाको यही सही तरिका हो!",
      ],
    },
    safeBtn: "फेरि प्रयास गर्नुहोस् →",

    resetBtn: "सुरुदेखि गर्नुहोस्",
    samePasswordWarning: "⚠️ यो सोसलबुककै पासवर्ड हो!",
    diffPasswordGood:    "✅ राम्रो! यो फरक पासवर्ड हो।",
  },
};

/* ── Step indicator ───────────────────────────────── */
function StepDots({ current, total }) {
  return (
    <div className="pr-step-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`pr-dot ${i < current ? "done" : i === current - 1 ? "active" : ""}`} />
      ))}
    </div>
  );
}

/* ── Login form card ──────────────────────────────── */
function LoginCard({ config, onSubmit, lang, step1Password }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);
  const t = T[lang];

  const isSame = step1Password && pass && pass === step1Password;
  const isDiff = step1Password && pass && pass !== step1Password;
  const isStep2 = !!step1Password;

  function handleSubmit() {
    if (!user.trim() || !pass.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    onSubmit(user, pass);
  }

  return (
    <div className={`pr-login-card ${shake ? "shake" : ""}`}>
      {/* Site header */}
      <div className="pr-site-header">
        <span className="pr-site-icon">{config.icon}</span>
        <div>
          <div className="pr-site-name">{config.siteName}</div>
          <div className="pr-site-desc">{config.siteDesc}</div>
        </div>
      </div>

      <div className="pr-form-divider" />

      {/* Username */}
      <label className="pr-field-label">{config.userLabel}</label>
      <input
        className="pr-input"
        type="text"
        placeholder={config.userHolder}
        value={user}
        onChange={e => setUser(e.target.value)}
        autoComplete="off"
      />

      {/* Password */}
      <label className="pr-field-label" style={{ marginTop: 14 }}>{config.passLabel}</label>
      <div className="pr-input-wrap">
        <input
          className={`pr-input ${isSame ? "input-danger" : isDiff ? "input-success" : ""}`}
          type={show ? "text" : "password"}
          placeholder={config.passHolder}
          value={pass}
          onChange={e => setPass(e.target.value)}
          autoComplete="off"
        />
        <button className="pr-eye" onClick={() => setShow(s => !s)}>{show ? "🙈" : "👁️"}</button>
      </div>

      {/* Live feedback for step 2 */}
      {isStep2 && pass && (
        <div className={`pr-pw-hint ${isSame ? "hint-danger" : "hint-success"}`}>
          {isSame ? t.samePasswordWarning : t.diffPasswordGood}
        </div>
      )}

      {/* Hint for step 2 */}
      {isStep2 && !pass && (
        <div className="pr-tip-box">{config.hint}</div>
      )}

      <button className="pr-login-btn" onClick={handleSubmit}>
        {config.btn}
      </button>
    </div>
  );
}

/* ── Animated breach/safe steps ──────────────────── */
function AttackTimeline({ steps, isBreach }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible < steps.length) {
      const t = setTimeout(() => setVisible(v => v + 1), 700);
      return () => clearTimeout(t);
    }
  }, [visible, steps.length]);

  return (
    <div className="pr-timeline">
      {steps.map((step, i) => (
        <div key={i} className={`pr-timeline-item ${i < visible ? "visible" : ""} ${i === steps.length - 1 ? (isBreach ? "final-bad" : "final-good") : ""}`}>
          <div className="pr-tl-icon">{step.icon}</div>
          <div className="pr-tl-content">
            <div className="pr-tl-title">{step.title}</div>
            <div className="pr-tl-desc">{step.desc}</div>
          </div>
          {i < steps.length - 1 && <div className="pr-tl-line" />}
        </div>
      ))}
    </div>
  );
}

/* ── Lesson box ───────────────────────────────────── */
function LessonBox({ lesson, isBreach }) {
  return (
    <div className={`pr-lesson-box ${isBreach ? "lesson-danger" : "lesson-success"}`}>
      <div className="pr-lesson-title">{lesson.title}</div>
      {lesson.points.map((pt, i) => (
        <div key={i} className="pr-lesson-point">
          <span className="pr-lesson-bullet">{isBreach ? "❌" : "✅"}</span>
          <span>{pt}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ───────────────────────────────── */
export default function PasswordReuseSimulation() {
  const [lang, setLang]           = useState("en");
  const [step, setStep]           = useState(1); // 1 = social, 2 = bank, 3 = result
  const [socialUser, setSocialUser] = useState("");
  const [socialPass, setSocialPass] = useState("");
  const [outcome, setOutcome]     = useState(null); // "breach" | "safe"
  const t = T[lang];

  function handleStep1(user, pass) {
    setSocialUser(user);
    setSocialPass(pass);
    setStep(2);
  }

  function handleStep2(user, pass) {
    setOutcome(pass === socialPass ? "breach" : "safe");
    setStep(3);
  }

  function reset() {
    setStep(1);
    setSocialUser("");
    setSocialPass("");
    setOutcome(null);
  }

  const isBreach = outcome === "breach";

  return (
    <div className="pr-app">
      {/* ── Inline styles ── */}
      <style>{CSS_STRING}</style>

      {/* ── Language bar ── */}
      <div className="pr-lang-bar">
        <div className="pr-lang-toggle">
          <button className={`pr-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>🇬🇧 English</button>
          <button className={`pr-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => setLang("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="pr-card">

        {/* ── Header ── */}
        <div className="pr-header">
          <div className="pr-module-tag">{t.moduleTag}</div>
          <h1 className="pr-title">{t.title}</h1>
          <p className="pr-subtitle">{t.subtitle}</p>
        </div>

        {/* ── Step indicator ── */}
        {step < 3 && (
          <div className="pr-step-info">
            <StepDots current={step} total={2} />
            <span className="pr-step-label">{t.stepLabel(step, 2)}</span>
          </div>
        )}

        <div className="pr-divider" />

        {/* ── STEP 1: Social media login ── */}
        {step === 1 && (
          <div className="pr-fade-in">
            <div className="pr-step-heading">{t.step1.heading}</div>
            <LoginCard config={t.step1} onSubmit={handleStep1} lang={lang} step1Password={null} />
          </div>
        )}

        {/* ── STEP 2: Bank login ── */}
        {step === 2 && (
          <div className="pr-fade-in">
            <div className="pr-step-heading">{t.step2.heading}</div>
            <LoginCard config={t.step2} onSubmit={handleStep2} lang={lang} step1Password={socialPass} />
            <button className="pr-back-btn" onClick={() => setStep(1)}>← Back</button>
          </div>
        )}

        {/* ── STEP 3: Result ── */}
        {step === 3 && (
          <div className="pr-fade-in">
            {/* Result banner */}
            <div className={`pr-result-banner ${isBreach ? "banner-breach" : "banner-safe"}`}>
              <div className="pr-result-emoji">{isBreach ? "💀" : "🛡️"}</div>
              <div>
                <div className="pr-result-title">{isBreach ? t.breachTitle : t.safeTitle}</div>
                <div className="pr-result-sub">{isBreach ? t.breachSub : t.safeSub}</div>
              </div>
            </div>

            {/* Timeline */}
            <AttackTimeline
              steps={isBreach ? t.breachSteps : t.safeSteps}
              isBreach={isBreach}
            />

            {/* Lesson */}
            <LessonBox
              lesson={isBreach ? t.breachLesson : t.safeLesson}
              isBreach={isBreach}
            />

            {/* Buttons */}
            <div className="pr-btn-row">
              <button className={`pr-action-btn ${isBreach ? "btn-breach" : "btn-safe"}`} onClick={reset}>
                {isBreach ? t.breachBtn : t.safeBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CSS ──────────────────────────────────────────── */
const CSS_STRING = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

:root {
  --bg: #f0f4f8;
  --card: #ffffff;
  --border: #dde3ec;
  --text: #1e2a38;
  --sub: #64748b;
  --muted: #a0aec0;
  --blue: #3b82f6;
  --red: #ef4444;
  --red-light: #fff5f5;
  --red-border: #fca5a5;
  --green: #22c55e;
  --green-light: #f0fdf4;
  --green-border: #86efac;
  --radius: 16px;
  --shadow: 0 6px 32px rgba(30,42,56,0.10);
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

.pr-app {
  font-family: 'Nunito','Noto Sans Devanagari',sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 28px 16px 60px;
}

/* Lang bar */
.pr-lang-bar { display:flex; justify-content:flex-end; max-width:600px; margin:0 auto 16px; }
.pr-lang-toggle { display:flex; background:var(--card); border:1.5px solid var(--border); border-radius:50px; padding:4px; gap:4px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.pr-lang-btn { padding:6px 16px; border:none; border-radius:50px; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; color:var(--sub); background:transparent; transition:all .25s; }
.pr-lang-btn.active { background:var(--blue); color:#fff; box-shadow:0 2px 8px rgba(59,130,246,.3); }

/* Card */
.pr-card { background:var(--card); border-radius:var(--radius); max-width:600px; margin:0 auto; padding:36px 32px; box-shadow:var(--shadow); border:1px solid var(--border); }

/* Header */
.pr-header { text-align:center; margin-bottom:20px; }
.pr-module-tag { display:inline-block; font-size:10px; font-weight:800; letter-spacing:2px; color:var(--blue); background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:50px; padding:4px 14px; margin-bottom:12px; text-transform:uppercase; }
.pr-title { font-size:24px; font-weight:800; color:var(--text); margin-bottom:8px; line-height:1.3; }
.pr-subtitle { font-size:14px; color:var(--sub); line-height:1.6; }

/* Step dots */
.pr-step-info { display:flex; flex-direction:column; align-items:center; gap:6px; margin-bottom:4px; }
.pr-step-dots { display:flex; gap:8px; }
.pr-dot { width:10px; height:10px; border-radius:50%; background:var(--border); transition:all .3s; }
.pr-dot.active { background:var(--blue); transform:scale(1.2); }
.pr-dot.done { background:var(--green); }
.pr-step-label { font-size:12px; font-weight:700; color:var(--muted); letter-spacing:.5px; }

.pr-divider { height:1px; background:var(--border); margin:16px -32px 24px; }

/* Step heading */
.pr-step-heading { font-size:16px; font-weight:800; color:var(--text); margin-bottom:18px; text-align:center; }

/* Login card */
.pr-login-card { background:#f8fafc; border:1.5px solid var(--border); border-radius:14px; padding:24px; }
.pr-site-header { display:flex; align-items:center; gap:14px; margin-bottom:6px; }
.pr-site-icon { font-size:36px; line-height:1; }
.pr-site-name { font-size:18px; font-weight:800; color:var(--text); }
.pr-site-desc { font-size:12px; color:var(--muted); }
.pr-form-divider { height:1px; background:var(--border); margin:14px 0; }
.pr-field-label { display:block; font-size:13px; font-weight:700; color:var(--text); margin-bottom:6px; }

.pr-input-wrap { position:relative; }
.pr-input {
  width:100%; padding:12px 16px; font-size:15px; font-family:inherit;
  border:2px solid var(--border); border-radius:10px; outline:none;
  background:#fff; color:var(--text); transition:border-color .2s, box-shadow .2s;
}
.pr-input:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(59,130,246,.1); }
.pr-input.input-danger { border-color:var(--red); background:#fff8f8; }
.pr-input.input-success { border-color:var(--green); background:#f0fff4; }
.pr-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; font-size:18px; cursor:pointer; color:var(--muted); }

.pr-pw-hint { font-size:13px; font-weight:700; margin-top:8px; padding:8px 12px; border-radius:8px; }
.hint-danger { background:var(--red-light); color:#b91c1c; border:1px solid var(--red-border); }
.hint-success { background:var(--green-light); color:#166534; border:1px solid var(--green-border); }

.pr-tip-box { margin-top:10px; padding:10px 14px; background:#fffbeb; border:1.5px solid #fde68a; border-radius:8px; font-size:13px; color:#92400e; font-weight:600; }

.pr-login-btn {
  width:100%; margin-top:18px; padding:13px; font-family:inherit;
  font-size:15px; font-weight:800; background:var(--blue); color:#fff;
  border:none; border-radius:10px; cursor:pointer; transition:all .2s;
}
.pr-login-btn:hover { background:#2563eb; transform:translateY(-1px); box-shadow:0 4px 16px rgba(59,130,246,.3); }

.pr-back-btn { margin-top:14px; background:none; border:none; color:var(--muted); font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; display:block; }
.pr-back-btn:hover { color:var(--text); }

/* Shake animation */
@keyframes shake {
  0%,100% { transform:translateX(0); }
  20%,60% { transform:translateX(-6px); }
  40%,80% { transform:translateX(6px); }
}
.shake { animation: shake 0.5s ease; }

/* Fade in */
@keyframes fadeUp {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}
.pr-fade-in { animation: fadeUp 0.4s ease; }

/* Result banner */
.pr-result-banner {
  display:flex; align-items:flex-start; gap:16px;
  border-radius:14px; padding:20px 22px; margin-bottom:22px;
  border-width:2px; border-style:solid;
}
.banner-breach { background:var(--red-light); border-color:var(--red-border); }
.banner-safe   { background:var(--green-light); border-color:var(--green-border); }
.pr-result-emoji { font-size:42px; line-height:1; flex-shrink:0; }
.pr-result-title { font-size:18px; font-weight:800; margin-bottom:4px; }
.banner-breach .pr-result-title { color:#b91c1c; }
.banner-safe   .pr-result-title { color:#166534; }
.pr-result-sub { font-size:13px; line-height:1.5; }
.banner-breach .pr-result-sub { color:#c53030; }
.banner-safe   .pr-result-sub { color:#276749; }

/* Timeline */
.pr-timeline { display:flex; flex-direction:column; gap:0; margin-bottom:22px; position:relative; }
.pr-timeline-item {
  display:flex; align-items:flex-start; gap:14px;
  padding:14px 16px; border-radius:12px;
  border:1.5px solid var(--border); background:#f8fafc;
  opacity:0; transform:translateX(-12px);
  transition:opacity .4s ease, transform .4s ease;
  position:relative; margin-bottom:6px;
}
.pr-timeline-item.visible { opacity:1; transform:translateX(0); }
.pr-timeline-item.final-bad  { background:var(--red-light);   border-color:var(--red-border); }
.pr-timeline-item.final-good { background:var(--green-light); border-color:var(--green-border); }
.pr-tl-icon { font-size:28px; flex-shrink:0; line-height:1; margin-top:2px; }
.pr-tl-title { font-size:14px; font-weight:800; color:var(--text); margin-bottom:3px; }
.pr-tl-desc  { font-size:13px; color:var(--sub); line-height:1.5; }

/* Lesson */
.pr-lesson-box { border-radius:14px; padding:20px 22px; margin-bottom:24px; border-width:2px; border-style:solid; }
.lesson-danger  { background:#fff5f5; border-color:var(--red-border); }
.lesson-success { background:var(--green-light); border-color:var(--green-border); }
.pr-lesson-title { font-size:14px; font-weight:800; margin-bottom:12px; }
.lesson-danger  .pr-lesson-title { color:#b91c1c; }
.lesson-success .pr-lesson-title { color:#166534; }
.pr-lesson-point { display:flex; gap:10px; align-items:flex-start; padding:4px 0; font-size:13px; line-height:1.5; }
.lesson-danger  .pr-lesson-point { color:#7f1d1d; }
.lesson-success .pr-lesson-point { color:#14532d; }
.pr-lesson-bullet { flex-shrink:0; }

/* Buttons */
.pr-btn-row { display:flex; gap:12px; flex-wrap:wrap; }
.pr-action-btn {
  flex:1; min-width:200px; padding:13px 20px; font-family:inherit;
  font-size:14px; font-weight:800; border:none; border-radius:10px;
  cursor:pointer; transition:all .2s;
}
.btn-breach { background:var(--red);   color:#fff; }
.btn-breach:hover { background:#dc2626; transform:translateY(-1px); box-shadow:0 4px 16px rgba(239,68,68,.3); }
.btn-safe   { background:var(--green); color:#fff; }
.btn-safe:hover { background:#16a34a; transform:translateY(-1px); box-shadow:0 4px 16px rgba(34,197,94,.3); }

@media(max-width:480px){
  .pr-card { padding:24px 18px; }
  .pr-divider { margin:16px -18px 20px; }
  .pr-result-banner { flex-direction:column; align-items:center; text-align:center; }
  .pr-btn-row { flex-direction:column; }
}
`;