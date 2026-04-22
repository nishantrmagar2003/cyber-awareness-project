import { useState, useEffect, useRef } from "react";

/* ── Translations ─────────────────────────────────── */
const T = {
  en: {
    moduleTag: "MODULE 4 · SIMULATION 2",
    title: "Fake Login Page Trap",
    subtitle: "You clicked a link. Will you fall for the trap?",

    // Step 1 — email lure
    step1Tag: "Step 1 of 3",
    step1Title: "You got an email...",
    emailFrom: "security@paypa1-alert.com",
    emailFromLabel: "From:",
    emailSubject: "⚠️ Your PayPal account is at risk!",
    emailBody: [
      "Dear Customer,",
      "We detected unusual activity on your account.",
      "Please verify your identity immediately to avoid suspension.",
    ],
    emailLinkText: "🔗 Verify Now → www.paypal-secure-login.com",
    clickBtn: "Click the Link",
    safeBtn: "🚫 Don't Click — Looks Suspicious",
    safeBravo: "🛡️ Smart move! You didn't click.",
    safeDesc: "You noticed something was off. Real PayPal emails always come from @paypal.com.",
    tryAnywayBtn: "Try Clicking Anyway →",

    // Step 2 — fake login
    step2Tag: "Step 2 of 3",
    step2Title: "The login page loaded...",
    urlBarLabel: "URL Bar",
    urlReal: "paypal.com",
    urlFake: "paypal-secure-login.com",
    urlWarning: "⚠️ This is NOT paypal.com!",
    fakePageTitle: "PayPal",
    fakePageSub: "Log in to your account",
    emailLabel: "Email",
    emailHolder: "Enter your email",
    passLabel: "Password",
    passHolder: "Enter your password",
    loginBtn: "Log In",
    skipBtn: "🚫 Close the Page — This Looks Fake",
    escapeNote: "Smart! You checked the URL first.",

    // Step 3a — caught (entered credentials)
    caughtTitle: "🚨 Credentials Stolen!",
    caughtSub: "You entered your details on a fake page.",
    stolenSteps: [
      { icon: "🎣", title: "Phishing Email Sent",    desc: "Hacker sent a fake PayPal email with a fake link." },
      { icon: "🌐", title: "Fake Page Loaded",        desc: "The URL looked similar but was NOT paypal.com." },
      { icon: "⌨️", title: "You Typed Your Details", desc: "Your email and password were sent directly to the hacker." },
      { icon: "💀", title: "Account Compromised!",    desc: "Hacker now has full access to your PayPal account." },
    ],
    lessonBad: {
      title: "⚠️ What you learned:",
      points: [
        "Always check the URL before typing your password",
        "Fake sites mimic real ones — look for small differences",
        "Urgent emails that push you to login fast = red flag",
        "Use 2FA so stolen passwords can't log in alone",
      ],
    },

    // Step 3b — escaped
    escapedTitle: "🛡️ You Stayed Safe!",
    escapedSub: "You closed the fake page before entering anything.",
    safeSteps: [
      { icon: "🎣", title: "Phishing Email Sent",  desc: "Hacker sent a fake PayPal email with a fake link." },
      { icon: "🌐", title: "Fake Page Loaded",      desc: "The URL was paypal-secure-login.com — NOT paypal.com." },
      { icon: "🔍", title: "You Checked the URL",  desc: "You noticed the URL was wrong and closed the page." },
      { icon: "🛡️", title: "Account Protected!",   desc: "No credentials stolen. Your account is safe!" },
    ],
    lessonGood: {
      title: "✅ What you learned:",
      points: [
        "You checked the URL before typing anything",
        "Real PayPal = paypal.com — nothing else",
        "Closing a suspicious page stops the attack cold",
        "Always type URLs directly instead of clicking links",
      ],
    },

    retryBtn: "Try Again →",
    finishBtn: "✅ Finish",
    urlTip: "💡 Tip: Always check the URL bar before logging in anywhere.",
  },

  np: {
    moduleTag: "मड्युल ४ · सिमुलेसन २",
    title: "नक्कली लगइन पेज फन्दा",
    subtitle: "तपाईंले लिंक क्लिक गर्नुभयो। के तपाईं फन्दामा पर्नुहुन्छ?",

    step1Tag: "चरण १ / ३",
    step1Title: "तपाईंलाई इमेल आयो...",
    emailFrom: "security@paypa1-alert.com",
    emailFromLabel: "बाट:",
    emailSubject: "⚠️ तपाईंको PayPal खाता जोखिममा छ!",
    emailBody: [
      "प्रिय ग्राहक,",
      "तपाईंको खातामा असामान्य गतिविधि देखियो।",
      "निलम्बनबाट बच्न तुरुन्तै पहिचान प्रमाणित गर्नुहोस्।",
    ],
    emailLinkText: "🔗 अहिलै प्रमाणित गर्नुहोस् → www.paypal-secure-login.com",
    clickBtn: "लिंक क्लिक गर्नुहोस्",
    safeBtn: "🚫 क्लिक नगर्नुहोस् — संदिग्ध देखिन्छ",
    safeBravo: "🛡️ सावधान! तपाईंले क्लिक गर्नुभएन।",
    safeDesc: "तपाईंले केही गलत भएको थाहा पाउनुभयो। वास्तविक PayPal इमेल सधैं @paypal.com बाट आउँछ।",
    tryAnywayBtn: "फेरि पनि क्लिक गरेर हेर्नुहोस् →",

    step2Tag: "चरण २ / ३",
    step2Title: "लगइन पेज खुल्यो...",
    urlBarLabel: "URL पट्टी",
    urlReal: "paypal.com",
    urlFake: "paypal-secure-login.com",
    urlWarning: "⚠️ यो paypal.com होइन!",
    fakePageTitle: "PayPal",
    fakePageSub: "आफ्नो खातामा लगइन गर्नुहोस्",
    emailLabel: "इमेल",
    emailHolder: "इमेल लेख्नुहोस्",
    passLabel: "पासवर्ड",
    passHolder: "पासवर्ड लेख्नुहोस्",
    loginBtn: "लगइन",
    skipBtn: "🚫 पेज बन्द गर्नुहोस् — नक्कली देखिन्छ",
    escapeNote: "राम्रो! तपाईंले पहिले URL जाँच्नुभयो।",

    caughtTitle: "🚨 प्रमाणपत्र चोरियो!",
    caughtSub: "तपाईंले नक्कली पेजमा विवरण प्रविष्ट गर्नुभयो।",
    stolenSteps: [
      { icon: "🎣", title: "फिसिङ इमेल पठाइयो",       desc: "ह्याकरले नक्कली PayPal इमेल र लिंक पठायो।" },
      { icon: "🌐", title: "नक्कली पेज खुल्यो",        desc: "URL मिल्दोजुल्दो थियो तर paypal.com थिएन।" },
      { icon: "⌨️", title: "तपाईंले विवरण टाइप गर्नुभयो", desc: "इमेल र पासवर्ड सिधै ह्याकरकहाँ गयो।" },
      { icon: "💀", title: "खाता कम्प्रमाइज भयो!",    desc: "ह्याकरले अब तपाईंको PayPal पूर्ण रूपमा नियन्त्रण गर्छ।" },
    ],
    lessonBad: {
      title: "⚠️ तपाईंले के सिक्नुभयो:",
      points: [
        "पासवर्ड टाइप गर्नु अघि URL जाँच्नुहोस्",
        "नक्कली साइटहरू वास्तविक जस्तै देखिन्छन् — सानो फरक खोज्नुहोस्",
        "जरुरी इमेलले छिटो लगइन गराउन खोज्छ = खतराको संकेत",
        "2FA प्रयोग गर्नुहोस् — चोरिएको पासवर्ड मात्रले काम गर्दैन",
      ],
    },

    escapedTitle: "🛡️ तपाईं सुरक्षित रहनुभयो!",
    escapedSub: "तपाईंले केही टाइप गर्नु अघि नै नक्कली पेज बन्द गर्नुभयो।",
    safeSteps: [
      { icon: "🎣", title: "फिसिङ इमेल पठाइयो",    desc: "ह्याकरले नक्कली PayPal इमेल र लिंक पठायो।" },
      { icon: "🌐", title: "नक्कली पेज खुल्यो",     desc: "URL paypal-secure-login.com थियो — paypal.com होइन।" },
      { icon: "🔍", title: "तपाईंले URL जाँच्नुभयो", desc: "URL गलत देखेर तपाईंले पेज बन्द गर्नुभयो।" },
      { icon: "🛡️", title: "खाता सुरक्षित!",        desc: "कुनै प्रमाणपत्र चोरिएन। खाता सुरक्षित छ!" },
    ],
    lessonGood: {
      title: "✅ तपाईंले के सिक्नुभयो:",
      points: [
        "केही टाइप गर्नु अघि URL जाँच्नुभयो",
        "वास्तविक PayPal = paypal.com मात्र",
        "संदिग्ध पेज बन्द गर्नाले आक्रमण रोकिन्छ",
        "लिंक क्लिक नगरी URL सिधै टाइप गर्नुहोस्",
      ],
    },

    retryBtn: "फेरि प्रयास →",
    finishBtn: "✅ समाप्त",
    urlTip: "💡 सुझाव: जहाँ पनि लगइन गर्नु अघि URL पट्टी जाँच्नुहोस्।",
  },
};

/* ── Timeline ─────────────────────────────────────── */
function Timeline({ steps, isBad }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible < steps.length) {
      const id = setTimeout(() => setVisible(v => v + 1), 750);
      return () => clearTimeout(id);
    }
  }, [visible, steps.length]);

  return (
    <div className="fl-timeline">
      {steps.map((s, i) => (
        <div key={i} className={`fl-tl-item ${i < visible ? "fl-tl-visible" : ""} ${i === steps.length - 1 ? (isBad ? "fl-tl-final-bad" : "fl-tl-final-good") : ""}`}>
          <div className="fl-tl-icon">{s.icon}</div>
          <div className="fl-tl-body">
            <div className="fl-tl-title">{s.title}</div>
            <div className="fl-tl-desc">{s.desc}</div>
          </div>
          {i < steps.length - 1 && <div className="fl-tl-connector" />}
        </div>
      ))}
    </div>
  );
}

/* ── Lesson Box ───────────────────────────────────── */
function LessonBox({ lesson, isBad }) {
  return (
    <div className={`fl-lesson ${isBad ? "fl-lesson-bad" : "fl-lesson-good"}`}>
      <div className="fl-lesson-title">{lesson.title}</div>
      {lesson.points.map((pt, i) => (
        <div key={i} className="fl-lesson-row">
          <span className="fl-lesson-bullet">{isBad ? "❌" : "✅"}</span>
          <span>{pt}</span>
        </div>
      ))}
    </div>
  );
}

/* ── URL Bar ──────────────────────────────────────── */
function URLBar({ t, shake }) {
  return (
    <div className={`fl-url-bar ${shake ? "fl-shake" : ""}`}>
      <span className="fl-url-icon">🔓</span>
      <span className="fl-url-text">{t.urlFake}</span>
      <span className="fl-url-warning">{t.urlWarning}</span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────── */
export default function FakeLoginTrap({ attemptId, onComplete }) {
  const [lang, setLang]     = useState("en");
  const [phase, setPhase]   = useState("email");    // email | warned | fakepage | caught | escaped
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [shakeUrl, setShakeUrl] = useState(false);
  const [finished, setFinished] = useState(false);
  const startTime               = useRef(Date.now());
  const t = T[lang];

  function resetAll(newLang) {
    setPhase("email");
    setEmail("");
    setPass("");
    setShowPass(false);
    setShakeUrl(false);
    setFinished(false);
    startTime.current = Date.now();
    if (newLang) setLang(newLang);
  }

  function handleFinish(outcome) {
    setFinished(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    if (onComplete) onComplete({
      answers: { outcome },
      score:     outcome === "escaped" ? 100 : outcome === "warned" ? 75 : 0,
      timeTaken,
    });
  }

  function handleClickLink() {
    setPhase("fakepage");
    setTimeout(() => setShakeUrl(true), 400);
    setTimeout(() => setShakeUrl(false), 1000);
  }

  function handleSafeChoice() { setPhase("warned"); }
  function handleTryAnyway()  { handleClickLink(); }
  function handleEscape()     { setPhase("escaped"); }

  function handleLogin() {
    if (!email.trim() || !pass.trim()) return;
    setPhase("caught");
  }

  return (
    <div className="fl-app">
      <style>{CSS}</style>

      {/* ── Lang bar ── */}
      <div className="fl-lang-bar">
        <div className="fl-lang-toggle">
          <button className={`fl-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => resetAll("en")}>🇬🇧 English</button>
          <button className={`fl-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => resetAll("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="fl-card">

        {/* ── Header ── */}
        <div className="fl-header">
          <div className="fl-module-tag">{t.moduleTag}</div>
          <h1 className="fl-title">{t.title}</h1>
          <p className="fl-subtitle">{t.subtitle}</p>
        </div>
        <div className="fl-divider" />

        {/* ══════════════════════════════════════════
            PHASE: EMAIL
        ══════════════════════════════════════════ */}
        {phase === "email" && (
          <div className="fl-fade-in">
            <div className="fl-step-tag">{t.step1Tag}</div>
            <div className="fl-phase-title">{t.step1Title}</div>

            {/* Fake email mockup */}
            <div className="fl-email-mock">
              <div className="fl-email-row">
                <span className="fl-email-field">{t.emailFromLabel}</span>
                <span className="fl-email-addr">{t.emailFrom}</span>
              </div>
              <div className="fl-email-subject">{t.emailSubject}</div>
              <div className="fl-email-body">
                {t.emailBody.map((line, i) => <p key={i}>{line}</p>)}
              </div>
              <div className="fl-email-link">{t.emailLinkText}</div>
            </div>

            <div className="fl-choice-row">
              <button className="fl-btn fl-btn-danger" onClick={handleClickLink}>{t.clickBtn}</button>
              <button className="fl-btn fl-btn-safe"   onClick={handleSafeChoice}>{t.safeBtn}</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            PHASE: WARNED (chose not to click)
        ══════════════════════════════════════════ */}
        {phase === "warned" && (
          <div className="fl-fade-in">
            <div className="fl-step-tag">{t.step1Tag}</div>
            <div className="fl-safe-banner">
              <span className="fl-safe-icon">🛡️</span>
              <div>
                <div className="fl-safe-title">{t.safeBravo}</div>
                <div className="fl-safe-desc">{t.safeDesc}</div>
              </div>
            </div>
            <div className="fl-url-tip">{t.urlTip}</div>
            <div className="fl-btn-group">
              <button className="fl-btn fl-btn-outline" onClick={handleTryAnyway}>{t.tryAnywayBtn}</button>
              <button className="fl-btn fl-btn-primary" onClick={() => handleFinish("warned")}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} onRetry={() => resetAll()} />}
          </div>
        )}

        {/* ══════════════════════════════════════════
            PHASE: FAKE PAGE
        ══════════════════════════════════════════ */}
        {phase === "fakepage" && (
          <div className="fl-fade-in">
            <div className="fl-step-tag">{t.step2Tag}</div>
            <div className="fl-phase-title">{t.step2Title}</div>

            {/* URL bar */}
            <div className="fl-url-label">{t.urlBarLabel}</div>
            <URLBar t={t} shake={shakeUrl} />

            {/* Fake login page mockup */}
            <div className="fl-fake-page">
              <div className="fl-fake-logo">
                <span className="fl-fake-logo-icon">🔵</span>
                <span className="fl-fake-logo-text">{t.fakePageTitle}</span>
              </div>
              <div className="fl-fake-sub">{t.fakePageSub}</div>

              <label className="fl-fake-label">{t.emailLabel}</label>
              <input
                className="fl-fake-input"
                type="email"
                placeholder={t.emailHolder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="off"
              />

              <label className="fl-fake-label">{t.passLabel}</label>
              <div className="fl-fake-input-wrap">
                <input
                  className="fl-fake-input"
                  type={showPass ? "text" : "password"}
                  placeholder={t.passHolder}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  autoComplete="off"
                />
                <button className="fl-eye-btn" onClick={() => setShowPass(s => !s)}>{showPass ? "🙈" : "👁️"}</button>
              </div>

              <button className="fl-fake-login-btn" onClick={handleLogin}>{t.loginBtn}</button>
            </div>

            <button className="fl-btn fl-btn-safe fl-mt" onClick={handleEscape}>{t.skipBtn}</button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            PHASE: CAUGHT
        ══════════════════════════════════════════ */}
        {phase === "caught" && (
          <div className="fl-fade-in">
            <div className="fl-result-banner fl-result-bad">
              <div className="fl-result-emoji">🚨</div>
              <div>
                <div className="fl-result-title">{t.caughtTitle}</div>
                <div className="fl-result-sub">{t.caughtSub}</div>
              </div>
            </div>

            <Timeline steps={t.stolenSteps} isBad={true} />
            <LessonBox lesson={t.lessonBad} isBad={true} />

            <div className="fl-btn-group">
              <button className="fl-btn fl-btn-outline" onClick={() => resetAll()}>{t.retryBtn}</button>
              <button className="fl-btn fl-btn-primary" onClick={() => handleFinish("caught")}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} onRetry={() => resetAll()} />}
          </div>
        )}

        {/* ══════════════════════════════════════════
            PHASE: ESCAPED
        ══════════════════════════════════════════ */}
        {phase === "escaped" && (
          <div className="fl-fade-in">
            <div className="fl-result-banner fl-result-good">
              <div className="fl-result-emoji">🛡️</div>
              <div>
                <div className="fl-result-title">{t.escapedTitle}</div>
                <div className="fl-result-sub">{t.escapedSub}</div>
              </div>
            </div>

            <Timeline steps={t.safeSteps} isBad={false} />
            <LessonBox lesson={t.lessonGood} isBad={false} />

            <div className="fl-btn-group">
              <button className="fl-btn fl-btn-outline" onClick={() => resetAll()}>{t.retryBtn}</button>
              <button className="fl-btn fl-btn-primary" onClick={() => handleFinish("escaped")}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} onRetry={() => resetAll()} />}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Finish Screen ────────────────────────────────── */
function FinishScreen({ t, onRetry }) {
  return (
    <div className="fl-finish-overlay fl-fade-in">
      <div className="fl-finish-box">
        <div className="fl-finish-icon">🎓</div>
        <div className="fl-finish-title">{t.lang === "np" ? "सिमुलेसन सम्पन्न!" : "Simulation Complete!"}</div>
        <div className="fl-finish-desc">
          {t.lang === "np"
            ? "तपाईंले नक्कली लगइन पेज ट्र्याप बारे जान्नुभयो।"
            : "You've learned how fake login page traps work."}
        </div>
        <div className="fl-finish-tips">
          {t.lang === "np" ? (
            <>
              <div className="fl-finish-tip">🌐 लगइन गर्नु अघि URL जाँच्नुहोस्</div>
              <div className="fl-finish-tip">🔒 लिंक क्लिक नगरी URL सिधै टाइप गर्नुहोस्</div>
              <div className="fl-finish-tip">📱 2FA सधैं सक्षम राख्नुहोस्</div>
            </>
          ) : (
            <>
              <div className="fl-finish-tip">🌐 Always check the URL before logging in</div>
              <div className="fl-finish-tip">🔒 Type URLs directly instead of clicking links</div>
              <div className="fl-finish-tip">📱 Always enable 2FA on your accounts</div>
            </>
          )}
        </div>
        <button className="fl-btn fl-btn-outline fl-finish-retry" onClick={onRetry}>
          {t.retryBtn}
        </button>
      </div>
    </div>
  );
}

/* ── CSS ──────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
:root {
  --bg:#eef2f7;--card:#fff;--bdr:#dde3ec;
  --text:#1e2a38;--sub:#64748b;--muted:#a0aec0;
  --blue:#3b82f6;--red:#ef4444;--rl:#fff5f5;--rb:#fca5a5;
  --green:#22c55e;--gl:#f0fdf4;--gb:#86efac;
  --orange:#f97316;--ol:#fff7ed;--ob:#fed7aa;
  --r:16px;--sh:0 6px 32px rgba(30,42,56,0.10);--tr:all 0.25s ease;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.fl-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

/* lang */
.fl-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.fl-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.fl-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.fl-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

/* card */
.fl-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr);position:relative}

/* header */
.fl-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.fl-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3;text-align:center}
.fl-subtitle{font-size:14px;color:var(--sub);line-height:1.6;text-align:center}
.fl-header{text-align:center;margin-bottom:20px}
.fl-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}

/* step tag */
.fl-step-tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:1.5px;color:var(--orange);background:var(--ol);border:1.5px solid var(--ob);border-radius:50px;padding:3px 12px;margin-bottom:12px;text-transform:uppercase}
.fl-phase-title{font-size:17px;font-weight:800;color:var(--text);margin-bottom:16px}

/* email mockup */
.fl-email-mock{background:#f8fafc;border:2px solid var(--bdr);border-radius:14px;padding:18px 20px;margin-bottom:20px}
.fl-email-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.fl-email-field{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
.fl-email-addr{font-size:12px;font-weight:700;color:var(--red);background:var(--rl);border:1px solid var(--rb);border-radius:4px;padding:2px 8px;font-family:monospace}
.fl-email-subject{font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--bdr)}
.fl-email-body{display:flex;flex-direction:column;gap:4px;margin-bottom:14px}
.fl-email-body p{font-size:13px;color:var(--sub);line-height:1.5}
.fl-email-link{display:inline-block;font-size:13px;font-weight:700;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:8px 14px;cursor:default;word-break:break-all}

/* choice buttons */
.fl-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px}
.fl-btn{padding:13px 16px;font-family:inherit;font-size:14px;font-weight:800;border-radius:10px;border:none;cursor:pointer;transition:var(--tr);text-align:center;line-height:1.3}
.fl-btn:hover{transform:translateY(-2px)}
.fl-btn-danger{background:var(--red);color:#fff;box-shadow:0 2px 10px rgba(239,68,68,.25)}
.fl-btn-danger:hover{background:#dc2626;box-shadow:0 4px 16px rgba(239,68,68,.35)}
.fl-btn-safe{background:var(--gl);color:#166534;border:2px solid var(--gb)}
.fl-btn-safe:hover{background:#dcfce7}
.fl-btn-primary{background:var(--blue);color:#fff;box-shadow:0 2px 10px rgba(59,130,246,.25)}
.fl-btn-primary:hover{background:#2563eb;box-shadow:0 4px 16px rgba(59,130,246,.35)}
.fl-btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue)}
.fl-btn-outline:hover{background:#eff6ff}
.fl-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.fl-mt{margin-top:14px;width:100%}

/* warned / safe banner */
.fl-safe-banner{display:flex;align-items:flex-start;gap:14px;background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px;margin-bottom:14px}
.fl-safe-icon{font-size:32px;flex-shrink:0}
.fl-safe-title{font-size:16px;font-weight:800;color:#166534;margin-bottom:4px}
.fl-safe-desc{font-size:13px;color:#276749;line-height:1.5}
.fl-url-tip{font-size:13px;color:var(--sub);background:#f8fafc;border:1.5px solid var(--bdr);border-radius:8px;padding:10px 14px;margin-bottom:14px}

/* URL bar */
.fl-url-label{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.fl-url-bar{display:flex;align-items:center;gap:8px;background:#fff;border:2px solid var(--rb);border-radius:10px;padding:10px 14px;margin-bottom:16px;flex-wrap:wrap}
.fl-url-icon{font-size:16px}
.fl-url-text{font-size:13px;font-weight:700;color:var(--red);font-family:monospace;flex:1}
.fl-url-warning{font-size:11px;font-weight:800;color:#fff;background:var(--red);border-radius:4px;padding:2px 8px;white-space:nowrap}

/* fake login page */
.fl-fake-page{background:#f0f4ff;border:2px solid #bfdbfe;border-radius:14px;padding:24px 22px;margin-bottom:4px}
.fl-fake-logo{display:flex;align-items:center;gap:8px;margin-bottom:4px;justify-content:center}
.fl-fake-logo-icon{font-size:28px}
.fl-fake-logo-text{font-size:22px;font-weight:800;color:#003087}
.fl-fake-sub{font-size:14px;color:var(--sub);text-align:center;margin-bottom:20px}
.fl-fake-label{display:block;font-size:12px;font-weight:800;color:var(--text);margin-bottom:5px;margin-top:12px}
.fl-fake-input{width:100%;padding:10px 12px;border:1.5px solid var(--bdr);border-radius:8px;font-family:inherit;font-size:14px;color:var(--text);background:#fff;transition:var(--tr)}
.fl-fake-input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
.fl-fake-input-wrap{position:relative}
.fl-fake-input-wrap .fl-fake-input{padding-right:42px}
.fl-eye-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;padding:0}
.fl-fake-login-btn{width:100%;margin-top:16px;padding:12px;font-family:inherit;font-size:15px;font-weight:800;background:#003087;color:#fff;border:none;border-radius:8px;cursor:pointer;transition:var(--tr)}
.fl-fake-login-btn:hover{background:#001f5e;transform:translateY(-1px)}

/* result banner */
.fl-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:14px;padding:18px 20px;border-width:2px;border-style:solid;margin-bottom:20px}
.fl-result-bad{background:var(--rl);border-color:var(--rb)}
.fl-result-good{background:var(--gl);border-color:var(--gb)}
.fl-result-emoji{font-size:36px;line-height:1;flex-shrink:0}
.fl-result-title{font-size:18px;font-weight:800;margin-bottom:4px}
.fl-result-bad  .fl-result-title{color:#b91c1c}
.fl-result-good .fl-result-title{color:#166534}
.fl-result-sub{font-size:13px}
.fl-result-bad  .fl-result-sub{color:#c53030}
.fl-result-good .fl-result-sub{color:#276749}

/* timeline */
.fl-timeline{display:flex;flex-direction:column;gap:0;margin-bottom:20px}
.fl-tl-item{display:flex;align-items:flex-start;gap:14px;opacity:0;transform:translateX(-16px);transition:opacity .4s ease,transform .4s ease;position:relative;padding-bottom:4px}
.fl-tl-item.fl-tl-visible{opacity:1;transform:translateX(0)}
.fl-tl-icon{width:40px;height:40px;border-radius:50%;background:#f1f5f9;border:2px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;z-index:1}
.fl-tl-final-bad  .fl-tl-icon{background:var(--rl);border-color:var(--rb)}
.fl-tl-final-good .fl-tl-icon{background:var(--gl);border-color:var(--gb)}
.fl-tl-body{flex:1;padding:8px 0 16px}
.fl-tl-title{font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px}
.fl-tl-desc{font-size:12px;color:var(--sub);line-height:1.5}
.fl-tl-connector{position:absolute;left:19px;top:42px;width:2px;height:calc(100% - 20px);background:var(--bdr)}

/* lesson */
.fl-lesson{border-radius:14px;padding:18px 20px;margin-bottom:4px;border-width:2px;border-style:solid}
.fl-lesson-bad{background:var(--rl);border-color:var(--rb)}
.fl-lesson-good{background:var(--gl);border-color:var(--gb)}
.fl-lesson-title{font-size:14px;font-weight:800;margin-bottom:12px}
.fl-lesson-bad  .fl-lesson-title{color:#b91c1c}
.fl-lesson-good .fl-lesson-title{color:#166534}
.fl-lesson-row{display:flex;align-items:flex-start;gap:10px;font-size:13px;padding:5px 0;border-top:1px solid rgba(0,0,0,.06);line-height:1.45}
.fl-lesson-row:first-of-type{border-top:none}
.fl-lesson-bad  .fl-lesson-row{color:#7f1d1d}
.fl-lesson-good .fl-lesson-row{color:#14532d}
.fl-lesson-bullet{flex-shrink:0;font-size:14px}

/* finish overlay */
.fl-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.95);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.fl-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:32px 28px;text-align:center;max-width:380px;width:100%;box-shadow:var(--sh)}
.fl-finish-icon{font-size:52px;margin-bottom:12px}
.fl-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:8px}
.fl-finish-desc{font-size:14px;color:var(--sub);margin-bottom:20px;line-height:1.5}
.fl-finish-tips{display:flex;flex-direction:column;gap:8px;margin-bottom:22px;text-align:left}
.fl-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
.fl-finish-retry{width:100%}

/* animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
.fl-fade-in{animation:fadeUp .35s ease}
.fl-shake{animation:shake .5s ease}

/* responsive */
@media(max-width:520px){
  .fl-card{padding:24px 18px}
  .fl-divider{margin:0 -18px 20px}
  .fl-choice-row,.fl-btn-group{grid-template-columns:1fr}
  .fl-result-banner{flex-direction:column;align-items:center;text-align:center}
}
`;
