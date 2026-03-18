import { useState, useEffect, useRef } from "react";

/* ── Translations ─────────────────────────────────── */
const T = {
  en: {
    moduleTag: "MODULE 2 · SIMULATION 1",
    title: "Two-Factor Authentication",
    subtitle: "Learn why a password alone is NOT enough to protect your account.",

    // Mode selector
    modeTitle: "Choose a scenario to try:",
    mode1Label: "🔓 Without 2FA",
    mode1Desc:  "Login with only a password",
    mode2Label: "🔐 With 2FA Enabled",
    mode2Desc:  "Login with password + OTP code",

    // --- WITHOUT 2FA ---
    without: {
      heading:      "Login — No 2FA",
      siteIcon:     "🌐",
      siteName:     "MyAccount",
      siteDesc:     "Logged in as: you@email.com",
      passLabel:    "Password",
      passHolder:   "Enter your password",
      loginBtn:     "Login",
      needPassword: "Please enter a password first.",

      // Hacker attack animation steps
      hackerTitle: "🕵️ Hacker is Attacking...",
      attackSteps: [
        { icon: "🤖", text: "Hacker starts automated password guessing..." },
        { icon: "📋", text: "Trying common passwords: 123456, password, abc123..." },
        { icon: "🔑", text: "Password found in leaked database!" },
        { icon: "💀", text: "Hacker logs in — NO 2FA to stop them!" },
      ],
      hackedTitle: "💀 Account Hacked!",
      hackedSub:   "The hacker got in using just your password.",
      hackedPoints: [
        "Your password was guessed in seconds",
        "There was nothing else to stop the hacker",
        "All your data is now exposed",
        "Password alone is NOT enough protection",
      ],
      lessonTitle: "⚠️ What you learned:",
      tryWith2FA:  "Now try WITH 2FA enabled →",
    },

    // --- WITH 2FA ---
    with: {
      heading:      "Login — 2FA Enabled ✅",
      siteIcon:     "🌐",
      siteName:     "MyAccount",
      siteDesc:     "Logged in as: you@email.com",
      passLabel:    "Password",
      passHolder:   "Enter your password",
      loginBtn:     "Login",
      needPassword: "Please enter a password first.",

      // OTP step
      otpHeading:   "📱 Check Your Phone!",
      otpDesc:      "A 6-digit code was sent to your phone number ending in **••• 456**",
      otpLabel:     "Enter the OTP code",
      otpHolder:    "Enter 6-digit code",
      otpBtn:       "Verify & Login",
      otpResend:    "Resend code",
      otpExpires:   (s) => `Code expires in ${s}s`,
      otpWrong:     "❌ Wrong code! Try again. Hint: use the code shown above.",
      otpNeedCode:  "Please enter the 6-digit code.",

      // Hacker blocked
      hackerTitle:   "🕵️ Hacker is Attacking...",
      attackSteps: [
        { icon: "🤖", text: "Hacker starts automated password guessing..." },
        { icon: "🔑", text: "Password found! Hacker tries to log in..." },
        { icon: "📱", text: "System asks for OTP from your phone..." },
        { icon: "🚫", text: "Hacker has no access to your phone — BLOCKED!" },
      ],

      // Success
      successTitle:  "🛡️ You Are Protected!",
      successSub:    "The hacker got your password — but 2FA stopped them!",
      successPoints: [
        "The hacker found your password — but still couldn't get in",
        "2FA required a code only YOU have on your phone",
        "Without the OTP, the hacker is completely blocked",
        "Always enable 2FA on important accounts!",
      ],
      lessonTitle: "✅ What you learned:",
      tryAgain:    "Try Again →",
    },

    backBtn:    "← Back",
    resetBtn:   "Start Over",
    yourOTP:    "Your OTP Code:",
  },

  np: {
    moduleTag: "मड्युल २ · सिमुलेसन १",
    title: "दुई-चरण प्रमाणीकरण (2FA)",
    subtitle: "किन पासवर्ड मात्र पर्याप्त छैन भनेर सिक्नुहोस्।",

    modeTitle: "एउटा परिदृश्य छान्नुहोस्:",
    mode1Label: "🔓 2FA बिना",
    mode1Desc:  "केवल पासवर्डले लगइन",
    mode2Label: "🔐 2FA सक्षम गरेर",
    mode2Desc:  "पासवर्ड + OTP कोडसँग लगइन",

    without: {
      heading:      "लगइन — 2FA छैन",
      siteIcon:     "🌐",
      siteName:     "मेरो खाता",
      siteDesc:     "you@email.com को रूपमा",
      passLabel:    "पासवर्ड",
      passHolder:   "पासवर्ड लेख्नुहोस्",
      loginBtn:     "लगइन गर्नुहोस्",
      needPassword: "कृपया पहिले पासवर्ड लेख्नुहोस्।",

      hackerTitle: "🕵️ ह्याकर आक्रमण गर्दैछ...",
      attackSteps: [
        { icon: "🤖", text: "ह्याकरले स्वचालित पासवर्ड अनुमान सुरु गर्‍यो..." },
        { icon: "📋", text: "सामान्य पासवर्ड प्रयास: 123456, password, abc123..." },
        { icon: "🔑", text: "चोरिएको डेटाबेसमा पासवर्ड फेला पर्‍यो!" },
        { icon: "💀", text: "ह्याकर लगइन भयो — रोक्न 2FA छैन!" },
      ],
      hackedTitle: "💀 खाता ह्याक भयो!",
      hackedSub:   "ह्याकरले केवल पासवर्डले प्रवेश पायो।",
      hackedPoints: [
        "तपाईंको पासवर्ड सेकेन्डमै अनुमान गरियो",
        "ह्याकरलाई रोक्ने केही थिएन",
        "तपाईंको सबै डेटा अब खतरामा छ",
        "पासवर्ड मात्र पर्याप्त सुरक्षा होइन",
      ],
      lessonTitle: "⚠️ तपाईंले के सिक्नुभयो:",
      tryWith2FA:  "अब 2FA सक्षम गरेर प्रयास गर्नुहोस् →",
    },

    with: {
      heading:      "लगइन — 2FA सक्षम ✅",
      siteIcon:     "🌐",
      siteName:     "मेरो खाता",
      siteDesc:     "you@email.com को रूपमा",
      passLabel:    "पासवर्ड",
      passHolder:   "पासवर्ड लेख्नुहोस्",
      loginBtn:     "लगइन गर्नुहोस्",
      needPassword: "कृपया पहिले पासवर्ड लेख्नुहोस्।",

      otpHeading:   "📱 आफ्नो फोन हेर्नुहोस्!",
      otpDesc:      "तपाईंको **••• ४५६** नम्बरमा ६-अंकको कोड पठाइयो",
      otpLabel:     "OTP कोड लेख्नुहोस्",
      otpHolder:    "६-अंकको कोड लेख्नुहोस्",
      otpBtn:       "प्रमाणित गर्नुहोस्",
      otpResend:    "कोड पुनः पठाउनुहोस्",
      otpExpires:   (s) => `कोड ${s} सेकेन्डमा समाप्त हुन्छ`,
      otpWrong:     "❌ गलत कोड! फेरि प्रयास गर्नुहोस्। सुझाव: माथि देखाइएको कोड प्रयोग गर्नुहोस्।",
      otpNeedCode:  "कृपया ६-अंकको कोड लेख्नुहोस्।",

      hackerTitle:   "🕵️ ह्याकर आक्रमण गर्दैछ...",
      attackSteps: [
        { icon: "🤖", text: "ह्याकरले स्वचालित पासवर्ड अनुमान सुरु गर्‍यो..." },
        { icon: "🔑", text: "पासवर्ड फेला पर्‍यो! ह्याकरले लगइन प्रयास गर्दैछ..." },
        { icon: "📱", text: "प्रणालीले फोनबाट OTP माग्यो..." },
        { icon: "🚫", text: "ह्याकरसँग तपाईंको फोन छैन — अवरुद्ध!" },
      ],

      successTitle:  "🛡️ तपाईं सुरक्षित हुनुहुन्छ!",
      successSub:    "ह्याकरले पासवर्ड पायो — तर 2FA ले रोक्यो!",
      successPoints: [
        "ह्याकरले पासवर्ड फेला पार्‍यो — तर पनि भित्र आउन सकेन",
        "2FA ले तपाईंको फोनमा मात्र हुने कोड माग्यो",
        "OTP बिना ह्याकर पूर्णतः अवरुद्ध छ",
        "महत्त्वपूर्ण खातामा सधैं 2FA सक्षम गर्नुहोस्!",
      ],
      lessonTitle: "✅ तपाईंले के सिक्नुभयो:",
      tryAgain:    "फेरि प्रयास गर्नुहोस् →",
    },

    backBtn:    "← फिर्ता",
    resetBtn:   "सुरुदेखि",
    yourOTP:    "तपाईंको OTP कोड:",
  },
};

/* ── Generate random OTP ──────────────────────────── */
function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ── Animated timeline ────────────────────────────── */
function AttackTimeline({ steps, onDone }) {
  const [visible, setVisible] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (visible < steps.length) {
      const t = setTimeout(() => setVisible(v => v + 1), 800);
      return () => clearTimeout(t);
    } else if (!doneRef.current) {
      doneRef.current = true;
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
  }, [visible, steps.length]);

  return (
    <div className="tfa-timeline">
      {steps.map((s, i) => (
        <div key={i} className={`tfa-tl-row ${i < visible ? "show" : ""}`}>
          <div className="tfa-tl-icon">{s.icon}</div>
          <div className="tfa-tl-text">{s.text}</div>
        </div>
      ))}
    </div>
  );
}

/* ── OTP display card (simulated phone) ───────────── */
function PhoneOTP({ code, t }) {
  return (
    <div className="tfa-phone-card">
      <div className="tfa-phone-top">
        <span className="tfa-phone-icon">📱</span>
        <span className="tfa-phone-label">SMS Message</span>
      </div>
      <div className="tfa-phone-msg">
        Your verification code is:
      </div>
      <div className="tfa-otp-display">{code}</div>
      <div className="tfa-phone-note">{t.yourOTP} <strong>{code}</strong></div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────── */
export default function TwoFASimulation() {
  const [lang, setLang]     = useState("en");
  const [mode, setMode]     = useState(null);     // "without" | "with"
  const [phase, setPhase]   = useState("login");  // login | attacking | hacked | otp | blocked | success
  const [password, setPassword] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpCode]               = useState(genOTP);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer]       = useState(30);
  const [shake, setShake]       = useState(false);
  const [inputError, setInputError] = useState("");
  const timerRef = useRef(null);
  const t = T[lang];

  // OTP countdown
  useEffect(() => {
    if (phase === "otp") {
      setTimer(30);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function doShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleLogin() {
    if (!password.trim()) {
      setInputError(mode === "without" ? t.without.needPassword : t.with.needPassword);
      doShake(); return;
    }
    setInputError("");
    setPhase("attacking");
  }

  function afterAttack() {
    if (mode === "without") setPhase("hacked");
    else setPhase("otp");
  }

  function handleOTPSubmit() {
    if (!otpInput.trim()) { setOtpError(t.with.otpNeedCode); doShake(); return; }
    if (otpInput.trim() !== otpCode) { setOtpError(t.with.otpWrong); doShake(); return; }
    setOtpError("");
    setPhase("blocked");
    setTimeout(() => setPhase("success"), 1200);
  }

  function reset() {
    setMode(null); setPhase("login");
    setPassword(""); setOtpInput("");
    setOtpError(""); setInputError("");
  }

  const tw = mode === "without" ? t.without : t.with;

  return (
    <div className="tfa-app">
      <style>{CSS}</style>

      {/* Lang bar */}
      <div className="tfa-lang-bar">
        <div className="tfa-lang-toggle">
          <button className={`tfa-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>🇬🇧 English</button>
          <button className={`tfa-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => setLang("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="tfa-card">

        {/* Header */}
        <div className="tfa-header">
          <div className="tfa-module-tag">{t.moduleTag}</div>
          <h1 className="tfa-title">{t.title}</h1>
          <p className="tfa-subtitle">{t.subtitle}</p>
        </div>

        <div className="tfa-divider" />

        {/* ── MODE SELECTOR ── */}
        {!mode && (
          <div className="tfa-fade-in">
            <div className="tfa-mode-title">{t.modeTitle}</div>
            <div className="tfa-mode-grid">
              <button className="tfa-mode-btn mode-danger" onClick={() => { setMode("without"); setPhase("login"); }}>
                <span className="tfa-mode-icon">🔓</span>
                <span className="tfa-mode-label">{t.mode1Label}</span>
                <span className="tfa-mode-desc">{t.mode1Desc}</span>
              </button>
              <button className="tfa-mode-btn mode-safe" onClick={() => { setMode("with"); setPhase("login"); }}>
                <span className="tfa-mode-icon">🔐</span>
                <span className="tfa-mode-label">{t.mode2Label}</span>
                <span className="tfa-mode-desc">{t.mode2Desc}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── LOGIN PHASE ── */}
        {mode && phase === "login" && (
          <div className="tfa-fade-in">
            <div className="tfa-step-heading">{tw.heading}</div>

            {/* 2FA badge */}
            {mode === "with" && (
              <div className="tfa-badge-on">🔐 Two-Factor Authentication is ON</div>
            )}
            {mode === "without" && (
              <div className="tfa-badge-off">🔓 Two-Factor Authentication is OFF</div>
            )}

            {/* Login form */}
            <div className={`tfa-login-box ${shake ? "shake" : ""}`}>
              <div className="tfa-site-row">
                <span className="tfa-site-icon">{tw.siteIcon}</span>
                <div>
                  <div className="tfa-site-name">{tw.siteName}</div>
                  <div className="tfa-site-desc">{tw.siteDesc}</div>
                </div>
              </div>
              <div className="tfa-form-line" />
              <label className="tfa-label">{tw.passLabel}</label>
              <div className="tfa-input-row">
                <input
                  className="tfa-input"
                  type="password"
                  placeholder={tw.passHolder}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setInputError(""); }}
                  autoComplete="off"
                />
              </div>
              {inputError && <div className="tfa-input-err">{inputError}</div>}
              <button className="tfa-login-btn" onClick={handleLogin}>{tw.loginBtn}</button>
            </div>

            <button className="tfa-back" onClick={reset}>{t.backBtn}</button>
          </div>
        )}

        {/* ── ATTACK ANIMATION ── */}
        {mode && phase === "attacking" && (
          <div className="tfa-fade-in">
            <div className="tfa-attack-header">
              <div className="tfa-attack-emoji">🕵️</div>
              <div className="tfa-attack-title">{tw.hackerTitle}</div>
            </div>
            <AttackTimeline
              steps={tw.attackSteps}
              onDone={afterAttack}
            />
          </div>
        )}

        {/* ── HACKED (without 2FA) ── */}
        {mode === "without" && phase === "hacked" && (
          <div className="tfa-fade-in">
            <div className="tfa-result-banner banner-hacked">
              <div className="tfa-result-emoji">💀</div>
              <div>
                <div className="tfa-result-title">{tw.hackedTitle}</div>
                <div className="tfa-result-sub">{tw.hackedSub}</div>
              </div>
            </div>
            <div className="tfa-lesson-box lesson-danger">
              <div className="tfa-lesson-title">{tw.lessonTitle}</div>
              {tw.hackedPoints.map((p, i) => (
                <div key={i} className="tfa-lesson-row">
                  <span>❌</span><span>{p}</span>
                </div>
              ))}
            </div>
            <button className="tfa-action-btn btn-red" onClick={() => { setMode("with"); setPhase("login"); setPassword(""); }}>
              {tw.tryWith2FA}
            </button>
            <button className="tfa-back" onClick={reset}>{t.resetBtn}</button>
          </div>
        )}

        {/* ── OTP STEP (with 2FA) ── */}
        {mode === "with" && phase === "otp" && (
          <div className="tfa-fade-in">
            <div className="tfa-step-heading">{tw.otpHeading}</div>
            <div className="tfa-otp-desc">{tw.otpDesc}</div>

            {/* Simulated phone showing OTP */}
            <PhoneOTP code={otpCode} t={t} />

            {/* OTP input */}
            <div className={`tfa-otp-box ${shake ? "shake" : ""}`}>
              <label className="tfa-label">{tw.otpLabel}</label>
              <input
                className={`tfa-input tfa-otp-input ${otpError ? "input-err" : ""}`}
                type="text"
                placeholder={tw.otpHolder}
                maxLength={6}
                value={otpInput}
                onChange={e => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
              />
              {otpError && <div className="tfa-input-err">{otpError}</div>}
              <div className="tfa-otp-meta">
                <span className={`tfa-timer ${timer <= 10 ? "timer-low" : ""}`}>{tw.otpExpires(timer)}</span>
                <button className="tfa-resend" onClick={() => setTimer(30)}>{tw.otpResend}</button>
              </div>
              <button className="tfa-login-btn" onClick={handleOTPSubmit}>{tw.otpBtn}</button>
            </div>

            <button className="tfa-back" onClick={reset}>{t.backBtn}</button>
          </div>
        )}

        {/* ── BLOCKED TRANSITION ── */}
        {mode === "with" && phase === "blocked" && (
          <div className="tfa-fade-in tfa-blocked-screen">
            <div className="tfa-blocked-icon">🚫</div>
            <div className="tfa-blocked-text">Blocking the hacker...</div>
          </div>
        )}

        {/* ── SUCCESS (with 2FA) ── */}
        {mode === "with" && phase === "success" && (
          <div className="tfa-fade-in">
            {/* Show hacker was blocked */}
            <div className="tfa-attack-header" style={{ marginBottom: 16 }}>
              <div className="tfa-attack-emoji">🕵️</div>
              <div className="tfa-attack-title">{tw.hackerTitle}</div>
            </div>
            <AttackTimeline steps={tw.attackSteps} onDone={() => {}} />

            <div className="tfa-result-banner banner-safe" style={{ marginTop: 16 }}>
              <div className="tfa-result-emoji">🛡️</div>
              <div>
                <div className="tfa-result-title">{tw.successTitle}</div>
                <div className="tfa-result-sub">{tw.successSub}</div>
              </div>
            </div>
            <div className="tfa-lesson-box lesson-success">
              <div className="tfa-lesson-title">{tw.lessonTitle}</div>
              {tw.successPoints.map((p, i) => (
                <div key={i} className="tfa-lesson-row">
                  <span>✅</span><span>{p}</span>
                </div>
              ))}
            </div>
            <button className="tfa-action-btn btn-green" onClick={reset}>{tw.tryAgain}</button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── CSS ──────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

:root {
  --bg:    #eef2f7;
  --card:  #ffffff;
  --bdr:   #dde3ec;
  --text:  #1e2a38;
  --sub:   #64748b;
  --muted: #a0aec0;
  --blue:  #3b82f6;
  --red:   #ef4444;
  --rl:    #fff5f5;
  --rb:    #fca5a5;
  --green: #22c55e;
  --gl:    #f0fdf4;
  --gb:    #86efac;
  --r: 16px;
  --sh: 0 6px 32px rgba(30,42,56,.10);
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.tfa-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

/* lang */
.tfa-lang-bar{display:flex;justify-content:flex-end;max-width:620px;margin:0 auto 16px}
.tfa-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.tfa-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:all .25s}
.tfa-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

/* card */
.tfa-card{background:var(--card);border-radius:var(--r);max-width:620px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}

/* header */
.tfa-header{text-align:center;margin-bottom:20px}
.tfa-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.tfa-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.tfa-subtitle{font-size:14px;color:var(--sub);line-height:1.6}

.tfa-divider{height:1px;background:var(--bdr);margin:16px -32px 24px}

/* mode selector */
.tfa-mode-title{font-size:15px;font-weight:700;color:var(--text);margin-bottom:16px;text-align:center}
.tfa-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.tfa-mode-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:22px 16px;border-radius:14px;border:2px solid;cursor:pointer;transition:all .25s;background:#f8fafc}
.tfa-mode-btn:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.10)}
.mode-danger{border-color:var(--rb)}.mode-danger:hover{background:var(--rl)}
.mode-safe{border-color:var(--gb)}.mode-safe:hover{background:var(--gl)}
.tfa-mode-icon{font-size:36px;line-height:1}
.tfa-mode-label{font-size:15px;font-weight:800;color:var(--text)}
.tfa-mode-desc{font-size:12px;color:var(--muted);text-align:center}

/* step heading */
.tfa-step-heading{font-size:16px;font-weight:800;color:var(--text);margin-bottom:14px;text-align:center}

/* 2fa badges */
.tfa-badge-on{background:var(--gl);border:1.5px solid var(--gb);color:#166534;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;text-align:center;margin-bottom:14px}
.tfa-badge-off{background:var(--rl);border:1.5px solid var(--rb);color:#b91c1c;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;text-align:center;margin-bottom:14px}

/* login box */
.tfa-login-box{background:#f8fafc;border:1.5px solid var(--bdr);border-radius:14px;padding:22px}
.tfa-site-row{display:flex;align-items:center;gap:12px;margin-bottom:6px}
.tfa-site-icon{font-size:32px;line-height:1}
.tfa-site-name{font-size:17px;font-weight:800;color:var(--text)}
.tfa-site-desc{font-size:12px;color:var(--muted)}
.tfa-form-line{height:1px;background:var(--bdr);margin:12px 0}
.tfa-label{display:block;font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px}
.tfa-input-row{position:relative}
.tfa-input{width:100%;padding:12px 16px;font-size:15px;font-family:inherit;border:2px solid var(--bdr);border-radius:10px;outline:none;background:#fff;color:var(--text);transition:border-color .2s,box-shadow .2s}
.tfa-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,.10)}
.tfa-input.input-err{border-color:var(--red)}
.tfa-input-err{font-size:12px;color:var(--red);font-weight:700;margin-top:6px}
.tfa-login-btn{width:100%;margin-top:16px;padding:13px;font-family:inherit;font-size:15px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:all .2s}
.tfa-login-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.30)}

/* attack */
.tfa-attack-header{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.tfa-attack-emoji{font-size:36px;line-height:1}
.tfa-attack-title{font-size:16px;font-weight:800;color:var(--text)}
.tfa-timeline{display:flex;flex-direction:column;gap:8px;margin-bottom:4px}
.tfa-tl-row{display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;background:#f8fafc;border:1.5px solid var(--bdr);opacity:0;transform:translateX(-14px);transition:opacity .4s,transform .4s}
.tfa-tl-row.show{opacity:1;transform:translateX(0)}
.tfa-tl-icon{font-size:26px;flex-shrink:0}
.tfa-tl-text{font-size:14px;color:var(--sub);font-weight:600;line-height:1.4}

/* result banner */
.tfa-result-banner{display:flex;align-items:flex-start;gap:16px;border-radius:14px;padding:20px 22px;margin-bottom:20px;border-width:2px;border-style:solid}
.banner-hacked{background:var(--rl);border-color:var(--rb)}
.banner-safe{background:var(--gl);border-color:var(--gb)}
.tfa-result-emoji{font-size:40px;line-height:1;flex-shrink:0}
.tfa-result-title{font-size:18px;font-weight:800;margin-bottom:4px}
.banner-hacked .tfa-result-title{color:#b91c1c}
.banner-safe .tfa-result-title{color:#166534}
.tfa-result-sub{font-size:13px;line-height:1.5}
.banner-hacked .tfa-result-sub{color:#c53030}
.banner-safe .tfa-result-sub{color:#276749}

/* lesson */
.tfa-lesson-box{border-radius:14px;padding:20px 22px;margin-bottom:22px;border-width:2px;border-style:solid}
.lesson-danger{background:#fff5f5;border-color:var(--rb)}
.lesson-success{background:var(--gl);border-color:var(--gb)}
.tfa-lesson-title{font-size:14px;font-weight:800;margin-bottom:12px}
.lesson-danger .tfa-lesson-title{color:#b91c1c}
.lesson-success .tfa-lesson-title{color:#166534}
.tfa-lesson-row{display:flex;gap:10px;align-items:flex-start;padding:4px 0;font-size:13px;line-height:1.5}
.lesson-danger .tfa-lesson-row{color:#7f1d1d}
.lesson-success .tfa-lesson-row{color:#14532d}

/* OTP */
.tfa-otp-desc{font-size:14px;color:var(--sub);margin-bottom:16px;line-height:1.5;text-align:center}
.tfa-phone-card{background:linear-gradient(135deg,#1e2a38,#2d3f55);border-radius:16px;padding:20px;margin-bottom:20px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.20)}
.tfa-phone-top{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px}
.tfa-phone-icon{font-size:20px}
.tfa-phone-label{font-size:12px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase}
.tfa-phone-msg{font-size:13px;color:#94a3b8;margin-bottom:12px}
.tfa-otp-display{font-size:42px;font-weight:800;color:#00e5ff;letter-spacing:8px;font-family:monospace;text-shadow:0 0 20px rgba(0,229,255,.5);margin-bottom:8px}
.tfa-phone-note{font-size:12px;color:#64748b}
.tfa-otp-box{background:#f8fafc;border:1.5px solid var(--bdr);border-radius:14px;padding:22px;margin-bottom:4px}
.tfa-otp-input{font-size:24px;font-weight:800;letter-spacing:8px;text-align:center;font-family:monospace}
.tfa-otp-meta{display:flex;justify-content:space-between;align-items:center;margin-top:10px;margin-bottom:4px}
.tfa-timer{font-size:12px;font-weight:700;color:var(--muted)}
.tfa-timer.timer-low{color:var(--red)}
.tfa-resend{background:none;border:none;font-family:inherit;font-size:12px;font-weight:700;color:var(--blue);cursor:pointer}
.tfa-resend:hover{text-decoration:underline}

/* blocked screen */
.tfa-blocked-screen{text-align:center;padding:40px 0}
.tfa-blocked-icon{font-size:64px;margin-bottom:16px;animation:pulse 0.6s ease infinite}
.tfa-blocked-text{font-size:18px;font-weight:800;color:var(--red)}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}

/* buttons */
.tfa-action-btn{width:100%;padding:13px 20px;font-family:inherit;font-size:14px;font-weight:800;border:none;border-radius:10px;cursor:pointer;transition:all .2s;margin-bottom:10px}
.btn-red{background:var(--red);color:#fff}
.btn-red:hover{background:#dc2626;transform:translateY(-1px);box-shadow:0 4px 16px rgba(239,68,68,.30)}
.btn-green{background:var(--green);color:#fff}
.btn-green:hover{background:#16a34a;transform:translateY(-1px);box-shadow:0 4px 16px rgba(34,197,94,.30)}
.tfa-back{background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:block;margin-top:10px;transition:color .2s}
.tfa-back:hover{color:var(--text)}

/* animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.tfa-fade-in{animation:fadeUp .4s ease}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.shake{animation:shake .5s ease}

@media(max-width:500px){
  .tfa-card{padding:24px 18px}
  .tfa-divider{margin:16px -18px 20px}
  .tfa-mode-grid{grid-template-columns:1fr}
  .tfa-result-banner{flex-direction:column;align-items:center;text-align:center}
  .tfa-otp-display{font-size:32px;letter-spacing:6px}
}
`;