import { useState, useRef } from "react";

const T = {
  en: {
    moduleTag: "MODULE 7 · SIMULATION 1",
    title: "App Permission Control",
    subtitle: "A flashlight app is asking for permissions. Decide: Allow or Deny?",

    introTitle: "🔑 Why Permissions Matter",
    introDesc: "Apps ask for device access. Some are necessary — others are spyware. You decide what's acceptable.",
    startBtn: "Start →",
    finishBtn: "✅ Finish",
    retryBtn: "Try Again →",

    appName: "FlashLight Pro",
    appIcon: "🔦",
    appDev: "AppDevStudio2024",

    allowBtn: "✅ Allow",
    denyBtn:  "🚫 Deny",
    submitBtn: "See Consequences →",

    resultsTitle: "Here's What Happened",
    yourScore: (safe, total) => `You protected ${safe} of ${total} permissions correctly`,

    tipsTitle: "🔑 Permission Rules to Remember",
    tips: [
      { icon: "🔦", title: "Match the app purpose", desc: "A flashlight only needs the camera (flash). Nothing else." },
      { icon: "🚫", title: "Deny what doesn't fit",  desc: "Contacts, SMS, mic, location = no reason for a torch app." },
      { icon: "⚠️", title: "Too many = spyware",     desc: "Apps requesting unrelated permissions harvest your data." },
      { icon: "⚙️", title: "Review in settings",     desc: "Check and revoke app permissions in your phone settings." },
    ],

    permissions: [
      {
        id: "camera",
        icon: "📷",
        name: "Camera",
        desc: "Access your camera and flashlight",
        correctAction: "allow",
        allowConsequence: { safe: true,  title: "✅ Correct — Needed",         detail: "Flashlight apps use the camera LED as the torch. This permission is essential." },
        denyConsequence:  { safe: false, title: "❌ App won't work",            detail: "Without camera access the flashlight cannot turn on. This one is actually needed." },
      },
      {
        id: "contacts",
        icon: "📞",
        name: "Contacts",
        desc: "Read and modify your contact list",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 Your contacts were stolen!", detail: "The app uploaded your entire contact list to remote servers. A flashlight has zero reason to access contacts." },
        denyConsequence:  { safe: true,  title: "✅ Good call — Not needed",    detail: "A flashlight app has no legitimate reason to read your contacts." },
      },
      {
        id: "sms",
        icon: "💬",
        name: "SMS / Messages",
        desc: "Read and send your text messages",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 SMS intercepted!",          detail: "The app can now read your OTPs, bank messages, and personal texts. This is a major security breach." },
        denyConsequence:  { safe: true,  title: "✅ Correct — Dangerous!",      detail: "Granting SMS access to a flashlight app would expose all your messages including OTPs." },
      },
      {
        id: "location",
        icon: "📍",
        name: "Location",
        desc: "Track your precise GPS location",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 You're being tracked!",     detail: "The app now logs your location 24/7 and sells it to data brokers. A torch doesn't need to know where you are." },
        denyConsequence:  { safe: true,  title: "✅ Smart — Not needed",        detail: "Location tracking by a flashlight app serves no purpose and is a privacy violation." },
      },
      {
        id: "microphone",
        icon: "🎙️",
        name: "Microphone",
        desc: "Record audio through your microphone",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 Your mic is live!",         detail: "The app can now record your conversations in the background. This is spyware behaviour." },
        denyConsequence:  { safe: true,  title: "✅ Correct — Spyware alert",   detail: "A flashlight never needs microphone access. Granting it = the app can listen to you anytime." },
      },
    ],
  },

  np: {
    moduleTag: "मड्युल ७ · सिमुलेसन १",
    title: "एप अनुमति नियन्त्रण",
    subtitle: "एउटा टर्चलाइट एपले अनुमति माग्दैछ। निर्णय गर्नुहोस्: अनुमति दिने वा अस्वीकार?",

    introTitle: "🔑 अनुमतिहरू किन महत्त्वपूर्ण छन्",
    introDesc: "एपहरू उपकरण पहुँच माग्छन्। केही आवश्यक छन् — अरू स्पाइवेयर हुन्। तपाईं के स्वीकार्य छ निर्णय गर्नुहोस्।",
    startBtn: "सुरु →",
    finishBtn: "✅ समाप्त",
    retryBtn: "फेरि प्रयास →",

    appName: "FlashLight Pro",
    appIcon: "🔦",
    appDev: "AppDevStudio2024",

    allowBtn: "✅ अनुमति दिनुहोस्",
    denyBtn:  "🚫 अस्वीकार",
    submitBtn: "परिणाम हेर्नुहोस् →",

    resultsTitle: "के भयो हेर्नुहोस्",
    yourScore: (safe, total) => `तपाईंले ${total} मध्ये ${safe} अनुमति सही निर्णय गर्नुभयो`,

    tipsTitle: "🔑 अनुमति नियमहरू",
    tips: [
      { icon: "🔦", title: "एपको उद्देश्य मिलाउनुहोस्", desc: "टर्चलाइटलाई क्यामेरा (फ्ल्यास) मात्र चाहिन्छ। अरू केही होइन।" },
      { icon: "🚫", title: "नमिल्ने अस्वीकार गर्नुहोस्", desc: "सम्पर्क, SMS, माइक, स्थान = टर्च एपलाई कुनै कारण छैन।" },
      { icon: "⚠️", title: "धेरै = स्पाइवेयर",            desc: "असम्बन्धित अनुमति माग्ने एपहरूले डेटा संकलन गर्छन्।" },
      { icon: "⚙️", title: "सेटिङमा जाँच गर्नुहोस्",     desc: "फोन सेटिङमा एप अनुमतिहरू जाँच्नुहोस् र रद्द गर्नुहोस्।" },
    ],

    permissions: [
      {
        id: "camera",
        icon: "📷",
        name: "क्यामेरा",
        desc: "क्यामेरा र फ्ल्यासलाइट पहुँच",
        correctAction: "allow",
        allowConsequence: { safe: true,  title: "✅ सही — आवश्यक छ",           detail: "टर्चलाइट एपले क्यामेरा LED टर्च रूपमा प्रयोग गर्छ। यो अनुमति आवश्यक छ।" },
        denyConsequence:  { safe: false, title: "❌ एप काम गर्दैन",             detail: "क्यामेरा पहुँच बिना टर्चलाइट बाल्न सकिँदैन। यो वास्तवमा आवश्यक छ।" },
      },
      {
        id: "contacts",
        icon: "📞",
        name: "सम्पर्कहरू",
        desc: "सम्पर्क सूची पढ्न र परिमार्जन गर्न",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 सम्पर्कहरू चोरियो!",        detail: "एपले तपाईंको सम्पर्क सूची रिमोट सर्भरमा अपलोड गर्यो। टर्चलाइटलाई सम्पर्क चाहिँदैन।" },
        denyConsequence:  { safe: true,  title: "✅ राम्रो — आवश्यक छैन",        detail: "टर्चलाइट एपलाई सम्पर्क पढ्ने कुनै वैध कारण छैन।" },
      },
      {
        id: "sms",
        icon: "💬",
        name: "SMS / सन्देशहरू",
        desc: "पाठ सन्देशहरू पढ्न र पठाउन",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 SMS अवरोध गरियो!",          detail: "एपले अब OTP, बैंक सन्देश र व्यक्तिगत टेक्स्ट पढ्न सक्छ। यो ठूलो सुरक्षा उल्लङ्घन हो।" },
        denyConsequence:  { safe: true,  title: "✅ सही — खतरनाक!",             detail: "टर्चलाइट एपलाई SMS पहुँच दिनु = OTP सहित सबै सन्देश उजागर।" },
      },
      {
        id: "location",
        icon: "📍",
        name: "स्थान",
        desc: "सटीक GPS स्थान ट्र्याक गर्न",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 तपाईंलाई ट्र्याक गरिँदैछ!", detail: "एपले अब २४/७ स्थान लग गर्छ र डेटा ब्रोकरहरूलाई बेच्छ।" },
        denyConsequence:  { safe: true,  title: "✅ राम्रो — आवश्यक छैन",        detail: "टर्चलाइट एपले स्थान ट्र्याक गर्नु गोपनीयता उल्लङ्घन हो।" },
      },
      {
        id: "microphone",
        icon: "🎙️",
        name: "माइक्रोफोन",
        desc: "माइक्रोफोनबाट अडियो रेकर्ड गर्न",
        correctAction: "deny",
        allowConsequence: { safe: false, title: "🚨 माइक सक्रिय छ!",            detail: "एपले पृष्ठभूमिमा कुराकानी रेकर्ड गर्न सक्छ। यो स्पाइवेयर व्यवहार हो।" },
        denyConsequence:  { safe: true,  title: "✅ सही — स्पाइवेयर चेतावनी",   detail: "टर्चलाइटलाई माइक्रोफोन कहिल्यै चाहिँदैन। अनुमति दिनु = एप जुनसुकै बेला सुन्न सक्छ।" },
      },
    ],
  },
};

function ScoreCircle({ safe, total }) {
  const pct = safe / total * 100;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${pct/100*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{ transition:"stroke-dasharray .7s ease" }}/>
      </svg>
      <div style={{ position:"absolute", fontSize:20, fontWeight:800, color }}>{safe}/{total}</div>
    </div>
  );
}

function PermissionRow({ perm, t, action, onAction, revealed }) {
  const consequence = action === "allow" ? perm.allowConsequence : action === "deny" ? perm.denyConsequence : null;

  return (
    <div className={`pc-perm-row ${revealed && consequence ? (consequence.safe ? "perm-safe" : "perm-danger") : ""}`}>
      <div className="pc-perm-top">
        <div className="pc-perm-left">
          <span className="pc-perm-icon">{perm.icon}</span>
          <div>
            <div className="pc-perm-name">{perm.name}</div>
            <div className="pc-perm-desc">{perm.desc}</div>
          </div>
        </div>

        {!revealed && (
          <div className="pc-perm-btns">
            <button
              className={`pc-action-btn pc-allow-btn ${action === "allow" ? "pc-btn-selected-allow" : ""}`}
              onClick={() => onAction(perm.id, "allow")}
            >{t.allowBtn}</button>
            <button
              className={`pc-action-btn pc-deny-btn ${action === "deny" ? "pc-btn-selected-deny" : ""}`}
              onClick={() => onAction(perm.id, "deny")}
            >{t.denyBtn}</button>
          </div>
        )}

        {revealed && consequence && (
          <div className={`pc-perm-verdict ${consequence.safe ? "verdict-safe" : "verdict-danger"}`}>
            {consequence.safe ? "✅" : "🚨"}
          </div>
        )}
      </div>

      {revealed && consequence && (
        <div className={`pc-consequence pc-fade-in ${consequence.safe ? "cons-safe" : "cons-danger"}`}>
          <div className="pc-cons-title">{consequence.title}</div>
          <div className="pc-cons-detail">{consequence.detail}</div>
        </div>
      )}
    </div>
  );
}

function FinishScreen({ t, onRetry }) {
  const isNp = t.moduleTag.includes("मड्युल");
  return (
    <div className="pc-finish-overlay pc-fade-in">
      <div className="pc-finish-box">
        <div className="pc-finish-icon">🎓</div>
        <div className="pc-finish-title">{isNp ? "सिमुलेसन सम्पन्न!" : "Simulation Complete!"}</div>
        <div className="pc-finish-desc">{isNp ? "तपाईंले एप अनुमति नियन्त्रण सिक्नुभयो।" : "You've learned how to control app permissions."}</div>
        <div className="pc-finish-tips">
          {t.tips.slice(0,3).map((tip,i) => (
            <div key={i} className="pc-finish-tip">{tip.icon} {tip.title}</div>
          ))}
        </div>
        <button className="pc-start-btn pc-outline-btn" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

export default function AppPermissionControl({ attemptId, onComplete }) {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [actions, setActions]   = useState({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [done, setDone]         = useState(false);
  const startTime               = useRef(Date.now());
  const t = T[lang];

  function setAction(id, val) {
    setActions(prev => ({ ...prev, [id]: val }));
  }

  function submit() {
    setRevealed(true);
    setTimeout(() => setPhase("results"), 300);
  }

  function handleFinish() {
    if (done) return;
    setDone(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const correctCount = Object.values(actions).filter(Boolean).length;
    const total = Object.keys(actions).length;
    if (onComplete) onComplete({
      answers: { actions, correctCount, total },
      score: total > 0 ? Math.round((correctCount / total) * 100) : 0,
      timeTaken,
    });
  }
  function reset(newLang) {
    setPhase("intro"); setActions({}); setRevealed(false); setFinished(false); setDone(false); startTime.current = Date.now();
    if (newLang) setLang(newLang);
  }

  const allAnswered = t.permissions.every(p => actions[p.id]);

  const safeCount = revealed
    ? t.permissions.filter(p => {
        const a = actions[p.id];
        return a === "allow" ? p.allowConsequence.safe : a === "deny" ? p.denyConsequence.safe : false;
      }).length
    : 0;

  const pct = safeCount / t.permissions.length;
  const isNp = t.moduleTag.includes("मड्युल");
  const resultLabel = pct>=0.9?(isNp?"🏆 विशेषज्ञ!":"🏆 Expert!")
    : pct>=0.7?(isNp?"👍 राम्रो!":"👍 Good!")
    : pct>=0.5?(isNp?"⚠️ सावधान!":"⚠️ Be careful!")
    : (isNp?"🔴 अझ अभ्यास":"🔴 Needs work");
  const resultColor = pct>=0.9?"#22c55e":pct>=0.7?"#84cc16":pct>=0.5?"#f59e0b":"#ef4444";

  return (
    <div className="pc-app">
      <style>{CSS}</style>

      <div className="pc-lang-bar">
        <div className="pc-lang-toggle">
          <button className={`pc-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`pc-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="pc-card" style={{ position:"relative" }}>
        <div className="pc-header">
          <div className="pc-module-tag">{t.moduleTag}</div>
          <h1 className="pc-title">{t.title}</h1>
          <p className="pc-subtitle">{t.subtitle}</p>
        </div>
        <div className="pc-divider"/>

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div className="pc-fade-in">
            <div className="pc-intro-box">
              <div className="pc-intro-icon">🔑</div>
              <div className="pc-intro-title">{t.introTitle}</div>
              <div className="pc-intro-desc">{t.introDesc}</div>
            </div>
            <div className="pc-tips-list">
              {t.tips.map((tip,i) => (
                <div key={i} className="pc-tip-row">
                  <span className="pc-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="pc-tip-title">{tip.title}</div>
                    <div className="pc-tip-desc">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="pc-start-btn" onClick={()=>setPhase("game")}>{t.startBtn}</button>
          </div>
        )}

        {/* ── GAME ── */}
        {phase === "game" && (
          <div className="pc-fade-in">
            {/* App header */}
            <div className="pc-app-header">
              <span className="pc-app-icon">{t.appIcon}</span>
              <div>
                <div className="pc-app-name">{t.appName}</div>
                <div className="pc-app-dev">❓ {t.appDev}</div>
              </div>
              <span className="pc-app-badge">{isNp?"टर्चलाइट एप":"Flashlight App"}</span>
            </div>

            <div className="pc-perm-list">
              {t.permissions.map(perm => (
                <PermissionRow
                  key={perm.id}
                  perm={perm}
                  t={t}
                  action={actions[perm.id]}
                  onAction={setAction}
                  revealed={revealed}
                />
              ))}
            </div>

            {!revealed && (
              <button
                className={`pc-start-btn ${!allAnswered ? "pc-btn-disabled" : ""}`}
                onClick={allAnswered ? submit : undefined}
                style={{ marginTop:16, opacity: allAnswered ? 1 : 0.45, cursor: allAnswered ? "pointer" : "not-allowed" }}
              >
                {allAnswered ? t.submitBtn : (isNp ? "सबै अनुमतिको निर्णय गर्नुहोस्..." : "Decide all permissions first...")}
              </button>
            )}
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "results" && (
          <div className="pc-fade-in">
            <div className="pc-results-title">{t.resultsTitle}</div>

            <div className="pc-score-display">
              <ScoreCircle safe={safeCount} total={t.permissions.length}/>
              <div className="pc-score-right">
                <div className="pc-score-label" style={{ color:resultColor }}>{resultLabel}</div>
                <div className="pc-score-sub">{t.yourScore(safeCount, t.permissions.length)}</div>
              </div>
            </div>

            {/* Consequence summary */}
            <div className="pc-consequence-list">
              {t.permissions.map(perm => {
                const a = actions[perm.id];
                const cons = a === "allow" ? perm.allowConsequence : perm.denyConsequence;
                return (
                  <div key={perm.id} className={`pc-sum-row ${cons.safe ? "sum-safe" : "sum-danger"}`}>
                    <span className="pc-sum-icon">{perm.icon}</span>
                    <div className="pc-sum-body">
                      <div className="pc-sum-title">{cons.title}</div>
                      <div className="pc-sum-detail">{cons.detail}</div>
                    </div>
                    <span className="pc-sum-verdict">{cons.safe ? "✅" : "🚨"}</span>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="pc-tips-section">
              <div className="pc-tips-title">{t.tipsTitle}</div>
              {t.tips.map((tip,i) => (
                <div key={i} className="pc-tip-row-green">
                  <span className="pc-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="pc-tip-title-green">{tip.title}</div>
                    <div className="pc-tip-desc-green">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pc-btn-group">
              <button className="pc-start-btn pc-outline-btn" onClick={()=>reset()}>{t.retryBtn}</button>
              <button className="pc-start-btn" onClick={() => handleFinish()}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} onRetry={()=>reset()}/>}
          </div>
        )}

      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
:root{--bg:#eef2f7;--card:#fff;--bdr:#dde3ec;--text:#1e2a38;--sub:#64748b;--muted:#a0aec0;--blue:#3b82f6;--red:#ef4444;--rl:#fff5f5;--rb:#fca5a5;--green:#22c55e;--gl:#f0fdf4;--gb:#86efac;--r:16px;--sh:0 6px 32px rgba(30,42,56,0.10);--tr:all 0.25s ease}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
.pc-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.pc-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.pc-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.pc-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.pc-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}
.pc-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.pc-header{text-align:center;margin-bottom:20px}
.pc-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.pc-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.pc-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.pc-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}
.pc-intro-box{text-align:center;margin-bottom:22px}
.pc-intro-icon{font-size:48px;margin-bottom:10px}
.pc-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.pc-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.pc-tips-list{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.pc-tip-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.pc-tip-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.pc-tip-title{font-size:13px;font-weight:800;color:var(--text);margin-bottom:1px}
.pc-tip-desc{font-size:12px;color:var(--sub)}
.pc-start-btn{width:100%;padding:13px;font-family:inherit;font-size:15px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.pc-start-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}
.pc-outline-btn{background:transparent!important;color:var(--blue)!important;border:2px solid var(--blue)!important;box-shadow:none!important}
.pc-outline-btn:hover{background:#eff6ff!important;transform:translateY(-1px)!important}
/* app header */
.pc-app-header{display:flex;align-items:center;gap:14px;padding:14px 18px;background:#f0f4ff;border:2px solid #bfdbfe;border-radius:14px;margin-bottom:18px}
.pc-app-icon{font-size:36px}
.pc-app-name{font-size:16px;font-weight:800;color:var(--text)}
.pc-app-dev{font-size:12px;color:#b91c1c;margin-top:2px}
.pc-app-badge{margin-left:auto;font-size:11px;font-weight:800;background:#fff;border:1.5px solid #bfdbfe;color:var(--blue);padding:4px 10px;border-radius:50px}
/* permission rows */
.pc-perm-list{display:flex;flex-direction:column;gap:10px}
.pc-perm-row{border:2px solid var(--bdr);border-radius:12px;overflow:hidden;transition:border-color .3s}
.perm-safe{border-color:var(--gb)!important}
.perm-danger{border-color:var(--rb)!important}
.pc-perm-top{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#fff}
.pc-perm-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
.pc-perm-icon{font-size:24px;flex-shrink:0}
.pc-perm-name{font-size:14px;font-weight:800;color:var(--text);margin-bottom:1px}
.pc-perm-desc{font-size:11px;color:var(--muted)}
.pc-perm-btns{display:flex;gap:6px;flex-shrink:0}
.pc-action-btn{padding:7px 13px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;border:2px solid;transition:var(--tr)}
.pc-allow-btn{background:#fff;color:#166534;border-color:var(--gb)}
.pc-allow-btn:hover{background:var(--gl)}
.pc-deny-btn{background:#fff;color:#b91c1c;border-color:var(--rb)}
.pc-deny-btn:hover{background:var(--rl)}
.pc-btn-selected-allow{background:var(--gl)!important;border-color:#16a34a!important;box-shadow:0 0 0 2px rgba(34,197,94,.2)}
.pc-btn-selected-deny{background:var(--rl)!important;border-color:#dc2626!important;box-shadow:0 0 0 2px rgba(239,68,68,.2)}
.pc-perm-verdict{font-size:22px;flex-shrink:0}
.pc-consequence{padding:10px 14px;font-size:12px;line-height:1.5}
.cons-safe{background:var(--gl)}
.cons-danger{background:var(--rl)}
.pc-cons-title{font-weight:800;margin-bottom:3px}
.cons-safe  .pc-cons-title{color:#166534}
.cons-danger .pc-cons-title{color:#b91c1c}
.cons-safe  .pc-cons-detail{color:#276749}
.cons-danger .pc-cons-detail{color:#7f1d1d}
/* results */
.pc-results-title{font-size:19px;font-weight:800;color:var(--text);text-align:center;margin-bottom:18px}
.pc-score-display{display:flex;align-items:center;gap:20px;padding:18px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:18px}
.pc-score-right{flex:1}
.pc-score-label{font-size:17px;font-weight:800;margin-bottom:4px}
.pc-score-sub{font-size:13px;color:var(--sub)}
.pc-consequence-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.pc-sum-row{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:10px;border:1.5px solid}
.sum-safe{background:var(--gl);border-color:var(--gb)}
.sum-danger{background:var(--rl);border-color:var(--rb)}
.pc-sum-icon{font-size:20px;flex-shrink:0;margin-top:2px}
.pc-sum-body{flex:1}
.pc-sum-title{font-size:13px;font-weight:800;margin-bottom:2px}
.sum-safe  .pc-sum-title{color:#166534}
.sum-danger .pc-sum-title{color:#b91c1c}
.pc-sum-detail{font-size:12px;line-height:1.4}
.sum-safe  .pc-sum-detail{color:#276749}
.sum-danger .pc-sum-detail{color:#7f1d1d}
.pc-sum-verdict{font-size:20px;flex-shrink:0}
.pc-tips-section{background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px 20px;margin-bottom:16px}
.pc-tips-title{font-size:14px;font-weight:800;color:#166534;margin-bottom:12px}
.pc-tip-row-green{display:flex;align-items:flex-start;gap:12px;padding:7px 0;border-top:1px solid #bbf7d0}
.pc-tip-row-green:first-of-type{border-top:none}
.pc-tip-title-green{font-size:13px;font-weight:800;color:#166534;margin-bottom:1px}
.pc-tip-desc-green{font-size:12px;color:#276749}
.pc-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pc-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.pc-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.pc-finish-icon{font-size:50px;margin-bottom:12px}
.pc-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.pc-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.pc-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.pc-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pc-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){
  .pc-card{padding:24px 18px}
  .pc-divider{margin:0 -18px 20px}
  .pc-perm-top{flex-wrap:wrap;gap:10px}
  .pc-perm-btns{width:100%}
  .pc-action-btn{flex:1}
  .pc-btn-group{grid-template-columns:1fr}
  .pc-score-display{flex-direction:column;text-align:center}
  .pc-app-badge{display:none}
}
`;
