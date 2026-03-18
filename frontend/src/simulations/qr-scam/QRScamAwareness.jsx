import { useState } from "react";

/* ── Translations ─────────────────────────────────── */
const T = {
  en: {
    moduleTag: "MODULE 5 · SIMULATION 1",
    title: "Scan or Not?",
    subtitle: "4 QR code scenarios. Decide: safe to scan or not?",

    introTitle: "📱 Not All QR Codes Are Safe",
    introDesc: "Criminals replace real QR codes with fake ones. One scan can steal your data or money.",
    startBtn: "Start →",

    scenarioLabel: (i, t) => `Scenario ${i} of ${t}`,
    safeBtn: "✅ Safe to Scan",
    unsafeBtn: "🚨 Don't Scan!",
    correctTitle: "✅ Correct!",
    wrongTitle: "❌ Wrong!",
    nextBtn: "Next →",
    finishBtn: "✅ Finish",

    resultsTitle: "Your Results",
    score: (c, t) => `${c} / ${t} correct`,
    excellent: "🏆 QR expert!",
    good: "👍 Good — keep practising.",
    okay: "⚠️ Be more careful!",
    poor: "🔴 Need more practice.",
    retryBtn: "Try Again →",

    tipsTitle: "🔍 How to Stay Safe",
    tips: [
      { icon: "👁️", title: "Preview the URL",     desc: "Before opening, check the link your phone shows." },
      { icon: "📍", title: "Check the sticker",   desc: "Fake codes are often stuck over real ones." },
      { icon: "🏢", title: "Trust context",        desc: "Is this QR in a logical, official location?" },
      { icon: "🔒", title: "Look for HTTPS",       desc: "Secure sites start with https:// — not http://." },
    ],

    scenarios: [
      {
        id: 1,
        isSafe: true,
        icon: "🍕",
        place: "Restaurant",
        situation: "QR code is printed on the table at a well-known restaurant to view the menu.",
        urlPreview: "https://pizzapalace.com/menu",
        safeLabel: "Official restaurant domain. HTTPS. Makes sense in context.",
        dangerLabel: "",
        explanation: "This is safe! The QR links to the restaurant's real website. It's printed on the table (not a sticker over something else), uses HTTPS, and the domain matches the restaurant name.",
      },
      {
        id: 2,
        isSafe: false,
        icon: "🅿️",
        place: "Parking Meter",
        situation: "A sticker with a QR code is stuck on a parking meter asking you to pay by scanning.",
        urlPreview: "http://park-pay-now.net/pay",
        safeLabel: "",
        dangerLabel: "Unofficial domain. HTTP (no HTTPS). Sticker could be fake.",
        explanation: "This is dangerous! Criminals stick fake QR codes on parking meters. The URL uses HTTP (not secure), the domain is suspicious, and legitimate parking apps never ask you to scan a random sticker.",
      },
      {
        id: 3,
        isSafe: false,
        icon: "🎁",
        place: "Prize Win",
        situation: "You receive a flyer: 'You won a prize! Scan to claim your $500 gift card.'",
        urlPreview: "http://prizewin99.xyz/claim",
        safeLabel: "",
        dangerLabel: "Prize you never entered. Shady .xyz domain. HTTP only.",
        explanation: "Classic scam! You can't win a prize you never entered. The .xyz domain and HTTP are red flags. Scanning leads to a fake page that steals your details or installs malware.",
      },
      {
        id: 4,
        isSafe: false,
        icon: "💸",
        place: "Refund Scam",
        situation: "An email says 'Scan the QR to receive your refund from the tax office.'",
        urlPreview: "http://taxrefund-claim.net/qr",
        safeLabel: "",
        dangerLabel: "Gov offices never use QR codes for refunds. Fake domain.",
        explanation: "Government tax offices never ask you to scan a QR code via email to get a refund. This leads to a phishing page to steal your banking details. Always go directly to the official website.",
      },
    ],
  },

  np: {
    moduleTag: "मड्युल ५ · सिमुलेसन १",
    title: "स्क्यान गर्ने वा नगर्ने?",
    subtitle: "४ QR कोड परिदृश्य। निर्णय गर्नुहोस्: सुरक्षित छ वा छैन?",

    introTitle: "📱 सबै QR कोड सुरक्षित हुँदैनन्",
    introDesc: "अपराधीहरू असली QR कोडमाथि नक्कली टाँस्छन्। एउटा स्क्यानले तपाईंको डेटा वा पैसा चोर्न सक्छ।",
    startBtn: "सुरु →",

    scenarioLabel: (i, t) => `परिदृश्य ${i} / ${t}`,
    safeBtn: "✅ स्क्यान गर्न सुरक्षित",
    unsafeBtn: "🚨 नस्क्यान गर्नुहोस्!",
    correctTitle: "✅ सही!",
    wrongTitle: "❌ गलत!",
    nextBtn: "अर्को →",
    finishBtn: "✅ समाप्त",

    resultsTitle: "नतिजा",
    score: (c, t) => `${c} / ${t} सही`,
    excellent: "🏆 QR विशेषज्ञ!",
    good: "👍 राम्रो — अभ्यास जारी राख्नुहोस्।",
    okay: "⚠️ थप सावधान रहनुहोस्!",
    poor: "🔴 अझ अभ्यास गर्नुहोस्।",
    retryBtn: "फेरि प्रयास →",

    tipsTitle: "🔍 सुरक्षित रहने उपाय",
    tips: [
      { icon: "👁️", title: "URL हेर्नुहोस्",      desc: "खोल्नु अघि फोनमा देखिने लिंक जाँच्नुहोस्।" },
      { icon: "📍", title: "स्टिकर जाँच्नुहोस्", desc: "नक्कली कोडहरू प्राय: असलीमाथि टाँसिएका हुन्छन्।" },
      { icon: "🏢", title: "सन्दर्भ विश्वास",    desc: "यो QR कोड तार्किक, आधिकारिक ठाउँमा छ?" },
      { icon: "🔒", title: "HTTPS खोज्नुहोस्",   desc: "सुरक्षित साइटहरू https:// बाट सुरु हुन्छन्।" },
    ],

    scenarios: [
      {
        id: 1,
        isSafe: true,
        icon: "🍕",
        place: "रेस्टुरेन्ट",
        situation: "प्रसिद्ध रेस्टुरेन्टको टेबलमा मेनु हेर्न QR कोड छापिएको छ।",
        urlPreview: "https://pizzapalace.com/menu",
        safeLabel: "आधिकारिक रेस्टुरेन्ट डोमेन। HTTPS। सन्दर्भमा मिल्छ।",
        dangerLabel: "",
        explanation: "यो सुरक्षित छ! QR ले रेस्टुरेन्टको वास्तविक वेबसाइटमा लैजान्छ। HTTPS छ, डोमेन रेस्टुरेन्टको नामसँग मिल्छ, र टेबलमा छापिएको छ।",
      },
      {
        id: 2,
        isSafe: false,
        icon: "🅿️",
        place: "पार्किङ मिटर",
        situation: "पार्किङ मिटरमा स्क्यान गरेर भुक्तानी गर्न एउटा स्टिकर टाँसिएको छ।",
        urlPreview: "http://park-pay-now.net/pay",
        safeLabel: "",
        dangerLabel: "अनाधिकारिक डोमेन। HTTP (सुरक्षित छैन)। स्टिकर नक्कली हुन सक्छ।",
        explanation: "खतरनाक! अपराधीहरू पार्किङ मिटरमा नक्कली QR स्टिकर टाँस्छन्। URL सुरक्षित छैन (HTTP), डोमेन संदिग्ध छ। वैध पार्किङ एपहरूले यसरी भुक्तानी माग्दैनन्।",
      },
      {
        id: 3,
        isSafe: false,
        icon: "🎁",
        place: "पुरस्कार जित",
        situation: "पर्चामा लेखिएको छ: 'तपाईंले पुरस्कार जित्नुभयो! $५०० गिफ्ट कार्ड पाउन स्क्यान गर्नुहोस्।'",
        urlPreview: "http://prizewin99.xyz/claim",
        safeLabel: "",
        dangerLabel: "नलगाएको लटरी। संदिग्ध .xyz डोमेन। HTTP मात्र।",
        explanation: "क्लासिक जालसाजी! नलगाएको प्रतियोगिता जित्न सकिँदैन। .xyz डोमेन र HTTP खतराका संकेत हुन्। स्क्यान गर्दा नक्कली पेजमा लगेर तपाईंको विवरण चोर्छ।",
      },
      {
        id: 4,
        isSafe: false,
        icon: "💸",
        place: "फिर्ता जालसाजी",
        situation: "इमेलमा लेखिएको छ: 'कर कार्यालयबाट फिर्ता पाउन QR स्क्यान गर्नुहोस्।'",
        urlPreview: "http://taxrefund-claim.net/qr",
        safeLabel: "",
        dangerLabel: "सरकारी कार्यालयले QR कोडबाट फिर्ता दिँदैन। नक्कली डोमेन।",
        explanation: "सरकारी कर कार्यालयले इमेलमा QR कोडबाट फिर्ता दिँदैन। यसले तपाईंलाई बैंक विवरण चोर्ने फिसिङ पेजमा लैजान्छ। सधैं आधिकारिक वेबसाइटमा सिधै जानुहोस्।",
      },
    ],
  },
};

/* ── QR Code SVG ──────────────────────────────────── */
function QRCodeSVG({ icon }) {
  // Deterministic "QR-like" pattern using the icon as seed
  const cells = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,1,1,0,1],
    [1,0,1,1,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,1],
    [0,1,0,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,1],
    [1,1,1,0,0,1,1,1,0],
    [0,0,1,1,0,0,0,1,1],
    [1,1,0,0,1,1,1,0,1],
  ];
  const size = 9, cell = 14, pad = 10;
  const total = size * cell + pad * 2;
  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} style={{ display:"block" }}>
      <rect width={total} height={total} rx="8" fill="#fff" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={pad + c * cell} y={pad + r * cell} width={cell - 1} height={cell - 1} rx="2" fill="#1e2a38" /> : null
        )
      )}
      {/* Corner squares */}
      {[[0,0],[0,6],[6,0]].map(([cr,cc],i) => (
        <g key={i}>
          <rect x={pad+cc*cell-1} y={pad+cr*cell-1} width={cell*3+2} height={cell*3+2} rx="3" fill="#1e2a38" />
          <rect x={pad+cc*cell+1} y={pad+cr*cell+1} width={cell*3-2} height={cell*3-2} rx="2" fill="#fff" />
          <rect x={pad+cc*cell+3} y={pad+cr*cell+3} width={cell*3-6} height={cell*3-6} rx="1" fill="#1e2a38" />
        </g>
      ))}
      {/* Centre icon */}
      <text x={total/2} y={total/2+6} textAnchor="middle" fontSize="18">{icon}</text>
    </svg>
  );
}

/* ── Score Circle ─────────────────────────────────── */
function ScoreCircle({ correct, total }) {
  const pct = correct / total * 100;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${pct/100*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{ transition:"stroke-dasharray .7s ease" }} />
      </svg>
      <div style={{ position:"absolute", fontSize:24, fontWeight:800, color }}>{correct}/{total}</div>
    </div>
  );
}

/* ── Scenario Card ────────────────────────────────── */
function ScenarioCard({ scenario, t, onChoice }) {
  const [answered, setAnswered] = useState(null);

  function handle(guessSafe) {
    const correct = guessSafe === scenario.isSafe;
    setAnswered(correct ? "correct" : "wrong");
  }

  const done = answered !== null;

  return (
    <div className="qr-scenario-wrap qr-fade-in">

      {/* Card */}
      <div className={`qr-scenario-card ${done ? (scenario.isSafe ? "card-safe" : "card-danger") : ""}`}>

        {/* Place header */}
        <div className="qr-place-header">
          <span className="qr-place-icon">{scenario.icon}</span>
          <span className="qr-place-name">{scenario.place}</span>
        </div>

        {/* QR + situation */}
        <div className="qr-content-row">
          <div className="qr-code-wrap">
            <QRCodeSVG icon={scenario.icon} />
          </div>
          <div className="qr-situation">{scenario.situation}</div>
        </div>

        {/* URL preview */}
        <div className="qr-url-preview">
          <span className="qr-url-label">🔗</span>
          <span className={`qr-url-text ${scenario.isSafe ? "url-safe" : "url-danger"}`}>{scenario.urlPreview}</span>
        </div>

        {/* Flags after answer */}
        {done && (
          <div className={`qr-flag-box qr-fade-in ${scenario.isSafe ? "flag-safe" : "flag-danger"}`}>
            <span className="qr-flag-icon">{scenario.isSafe ? "✅" : "⚠️"}</span>
            <span className="qr-flag-text">{scenario.isSafe ? scenario.safeLabel : scenario.dangerLabel}</span>
          </div>
        )}
      </div>

      {/* Choices */}
      {!done && (
        <div className="qr-choice-row qr-fade-in">
          <button className="qr-choice-btn qr-safe-btn" onClick={() => handle(true)}>
            <span className="qr-choice-icon">✅</span>
            <span className="qr-choice-label">{t.safeBtn}</span>
          </button>
          <button className="qr-choice-btn qr-danger-btn" onClick={() => handle(false)}>
            <span className="qr-choice-icon">🚨</span>
            <span className="qr-choice-label">{t.unsafeBtn}</span>
          </button>
        </div>
      )}

      {/* Result banner */}
      {done && (
        <div className={`qr-result-banner qr-fade-in ${answered === "correct" ? "banner-correct" : "banner-wrong"}`}>
          <div className="qr-result-emoji">{answered === "correct" ? "🎉" : "😬"}</div>
          <div>
            <div className="qr-result-title">{answered === "correct" ? t.correctTitle : t.wrongTitle}</div>
            <div className="qr-result-explanation">{scenario.explanation}</div>
          </div>
        </div>
      )}

      {/* Next button */}
      {done && (
        <button className="qr-next-btn qr-fade-in" onClick={() => onChoice(answered === "correct")}>
          {t.nextBtn}
        </button>
      )}
    </div>
  );
}

/* ── Finish Screen overlay ────────────────────────── */
function FinishScreen({ t, onRetry }) {
  return (
    <div className="qr-finish-overlay qr-fade-in">
      <div className="qr-finish-box">
        <div className="qr-finish-icon">🎓</div>
        <div className="qr-finish-title">{t.lang === "np" ? "सिमुलेसन सम्पन्न!" : "Simulation Complete!"}</div>
        <div className="qr-finish-desc">{t.lang === "np" ? "तपाईंले QR कोड सुरक्षाबारे जान्नुभयो।" : "You've learned how to spot QR code scams."}</div>
        <div className="qr-finish-tips">
          {t.tips.map((tip, i) => (
            <div key={i} className="qr-finish-tip">{tip.icon} {tip.title}</div>
          ))}
        </div>
        <button className="qr-start-btn" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function QRScamAwareness() {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");   // intro | game | results
  const [idx, setIdx]           = useState(0);
  const [scores, setScores]     = useState([]);
  const [finished, setFinished] = useState(false);
  const t = T[lang];

  function start() { setIdx(0); setScores([]); setFinished(false); setPhase("game"); }

  function handleChoice(correct) {
    const next = [...scores, correct];
    setScores(next);
    if (idx + 1 >= t.scenarios.length) setTimeout(() => setPhase("results"), 200);
    else setIdx(i => i + 1);
  }

  function resetAll(newLang) {
    setPhase("intro");
    setIdx(0);
    setScores([]);
    setFinished(false);
    if (newLang) setLang(newLang);
  }

  const correctCount = scores.filter(Boolean).length;
  const pct = scores.length > 0 ? correctCount / t.scenarios.length : 0;
  const resultLabel = pct >= 0.9 ? t.excellent : pct >= 0.7 ? t.good : pct >= 0.5 ? t.okay : t.poor;
  const resultColor = pct >= 0.9 ? "#22c55e" : pct >= 0.7 ? "#84cc16" : pct >= 0.5 ? "#f59e0b" : "#ef4444";

  return (
    <div className="qr-app">
      <style>{CSS}</style>

      {/* Lang bar */}
      <div className="qr-lang-bar">
        <div className="qr-lang-toggle">
          <button className={`qr-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => resetAll("en")}>🇬🇧 English</button>
          <button className={`qr-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => resetAll("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="qr-card" style={{ position:"relative" }}>

        {/* Header */}
        <div className="qr-header">
          <div className="qr-module-tag">{t.moduleTag}</div>
          <h1 className="qr-title">{t.title}</h1>
          <p className="qr-subtitle">{t.subtitle}</p>
        </div>
        <div className="qr-divider" />

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div className="qr-fade-in">
            <div className="qr-intro-box">
              <div className="qr-intro-icon">📱</div>
              <div className="qr-intro-title">{t.introTitle}</div>
              <div className="qr-intro-desc">{t.introDesc}</div>
            </div>

            <div className="qr-tips-list">
              {t.tips.map((tip, i) => (
                <div key={i} className="qr-tip-row">
                  <span className="qr-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="qr-tip-title">{tip.title}</div>
                    <div className="qr-tip-desc">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="qr-start-btn" onClick={start}>{t.startBtn}</button>
          </div>
        )}

        {/* ── GAME ── */}
        {phase === "game" && (
          <div>
            <div className="qr-progress-wrap">
              <div className="qr-progress-label">
                {t.scenarioLabel(idx + 1, t.scenarios.length)}
                <span className="qr-score-live">{scores.filter(Boolean).length} ✅</span>
              </div>
              <div className="qr-progress-track">
                <div className="qr-progress-fill" style={{ width:`${idx / t.scenarios.length * 100}%` }} />
              </div>
            </div>

            <ScenarioCard
              key={`${lang}-${idx}`}
              scenario={t.scenarios[idx]}
              t={t}
              onChoice={handleChoice}
            />
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "results" && (
          <div className="qr-fade-in">
            <div className="qr-results-title">{t.resultsTitle}</div>

            <div className="qr-score-display">
              <ScoreCircle correct={correctCount} total={t.scenarios.length} />
              <div className="qr-score-right">
                <div className="qr-score-label" style={{ color: resultColor }}>{resultLabel}</div>
                <div className="qr-score-sub">{t.score(correctCount, t.scenarios.length)}</div>
              </div>
            </div>

            {/* Recap */}
            <div className="qr-recap-list">
              {t.scenarios.map((s, i) => (
                <div key={i} className={`qr-recap-row ${scores[i] ? "recap-correct" : "recap-wrong"}`}>
                  <span className="qr-recap-icon">{scores[i] ? "✅" : "❌"}</span>
                  <div className="qr-recap-info">
                    <div className="qr-recap-place">{s.icon} {s.place}</div>
                    <div className="qr-recap-verdict">{s.isSafe ? (lang === "np" ? "सुरक्षित थियो" : "Was safe") : (lang === "np" ? "खतरनाक थियो" : "Was dangerous")}</div>
                  </div>
                  <span className={`qr-recap-badge ${s.isSafe ? "badge-safe" : "badge-danger"}`}>
                    {s.isSafe ? (lang === "np" ? "सुरक्षित" : "Safe") : (lang === "np" ? "खतरनाक" : "Danger")}
                  </span>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="qr-tips-section">
              <div className="qr-tips-title">{t.tipsTitle}</div>
              {t.tips.map((tip, i) => (
                <div key={i} className="qr-tip-row">
                  <span className="qr-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="qr-tip-title">{tip.title}</div>
                    <div className="qr-tip-desc">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="qr-btn-group">
              <button className="qr-start-btn qr-outline-btn" onClick={start}>{t.retryBtn}</button>
              <button className="qr-start-btn" onClick={() => setFinished(true)}>{t.finishBtn}</button>
            </div>

            {finished && <FinishScreen t={t} onRetry={() => resetAll()} />}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── CSS ──────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
:root{
  --bg:#eef2f7;--card:#fff;--bdr:#dde3ec;
  --text:#1e2a38;--sub:#64748b;--muted:#a0aec0;
  --blue:#3b82f6;--red:#ef4444;--rl:#fff5f5;--rb:#fca5a5;
  --green:#22c55e;--gl:#f0fdf4;--gb:#86efac;
  --r:16px;--sh:0 6px 32px rgba(30,42,56,0.10);--tr:all 0.25s ease;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.qr-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

/* lang */
.qr-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.qr-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.qr-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.qr-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

/* card */
.qr-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}

/* header */
.qr-header{text-align:center;margin-bottom:20px}
.qr-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.qr-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.qr-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.qr-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}

/* intro */
.qr-intro-box{text-align:center;margin-bottom:22px}
.qr-intro-icon{font-size:48px;margin-bottom:10px}
.qr-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.qr-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}

/* tips list */
.qr-tips-list{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.qr-tip-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.qr-tip-icon{font-size:20px;flex-shrink:0;margin-top:1px}
.qr-tip-title{font-size:13px;font-weight:800;color:var(--text);margin-bottom:1px}
.qr-tip-desc{font-size:12px;color:var(--sub)}

.qr-start-btn{width:100%;padding:13px;font-family:inherit;font-size:15px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.qr-start-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}
.qr-outline-btn{background:transparent;color:var(--blue);border:2px solid var(--blue)}
.qr-outline-btn:hover{background:#eff6ff;transform:translateY(-1px);box-shadow:none}

/* progress */
.qr-progress-wrap{margin-bottom:18px}
.qr-progress-label{font-size:13px;font-weight:800;color:var(--text);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.qr-score-live{font-size:12px;font-weight:700;color:var(--green);background:var(--gl);border:1px solid var(--gb);padding:3px 10px;border-radius:50px}
.qr-progress-track{height:8px;background:#e2e8f0;border-radius:8px;overflow:hidden}
.qr-progress-fill{height:100%;background:var(--blue);border-radius:8px;transition:width .5s ease}

/* scenario card */
.qr-scenario-wrap{display:flex;flex-direction:column;gap:14px}
.qr-scenario-card{background:#f8fafc;border:2px solid var(--bdr);border-radius:14px;overflow:hidden;transition:border-color .3s}
.qr-scenario-card.card-safe{border-color:var(--gb);background:var(--gl)}
.qr-scenario-card.card-danger{border-color:var(--rb);background:var(--rl)}

.qr-place-header{display:flex;align-items:center;gap:10px;padding:14px 18px 12px;border-bottom:1.5px solid var(--bdr);background:#fff}
.qr-place-icon{font-size:22px}
.qr-place-name{font-size:15px;font-weight:800;color:var(--text)}

.qr-content-row{display:flex;align-items:flex-start;gap:16px;padding:16px 18px 12px}
.qr-code-wrap{background:#fff;border:2px solid var(--bdr);border-radius:10px;padding:6px;flex-shrink:0}
.qr-situation{font-size:13px;color:var(--sub);line-height:1.6;flex:1;padding-top:4px}

.qr-url-preview{display:flex;align-items:center;gap:8px;padding:10px 18px 14px}
.qr-url-label{font-size:14px;flex-shrink:0}
.qr-url-text{font-size:12px;font-weight:700;font-family:monospace;padding:3px 10px;border-radius:6px}
.url-safe{color:#166534;background:var(--gl);border:1px solid var(--gb)}
.url-danger{color:#b91c1c;background:var(--rl);border:1px solid var(--rb)}

.qr-flag-box{display:flex;align-items:flex-start;gap:8px;padding:10px 16px;margin:0 16px 14px;border-radius:8px;border:1.5px solid;font-size:12px;font-weight:700;line-height:1.4}
.flag-safe{background:var(--gl);border-color:var(--gb);color:#166534}
.flag-danger{background:#fff7ed;border-color:#fed7aa;color:#c2410c}

/* choice buttons */
.qr-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.qr-choice-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:15px 10px;border-radius:12px;border:2px solid;cursor:pointer;transition:var(--tr);background:#f8fafc}
.qr-choice-btn:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.10)}
.qr-safe-btn{border-color:var(--gb)}.qr-safe-btn:hover{background:var(--gl)}
.qr-danger-btn{border-color:var(--rb)}.qr-danger-btn:hover{background:var(--rl)}
.qr-choice-icon{font-size:26px;line-height:1}
.qr-choice-label{font-size:13px;font-weight:800;color:var(--text);text-align:center;line-height:1.3}

/* result banner */
.qr-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:12px;padding:16px 18px;border-width:2px;border-style:solid}
.banner-correct{background:var(--gl);border-color:var(--gb)}
.banner-wrong{background:var(--rl);border-color:var(--rb)}
.qr-result-emoji{font-size:32px;line-height:1;flex-shrink:0}
.qr-result-title{font-size:15px;font-weight:800;margin-bottom:4px}
.banner-correct .qr-result-title{color:#166534}
.banner-wrong   .qr-result-title{color:#b91c1c}
.qr-result-explanation{font-size:12px;color:var(--sub);line-height:1.5}

/* next btn */
.qr-next-btn{width:100%;padding:12px;font-family:inherit;font-size:14px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.qr-next-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}

/* results */
.qr-results-title{font-size:19px;font-weight:800;color:var(--text);text-align:center;margin-bottom:18px}
.qr-score-display{display:flex;align-items:center;gap:20px;padding:18px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:18px}
.qr-score-right{flex:1}
.qr-score-label{font-size:17px;font-weight:800;margin-bottom:4px;line-height:1.3}
.qr-score-sub{font-size:13px;color:var(--sub)}

.qr-recap-list{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
.qr-recap-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;border:1.5px solid}
.recap-correct{background:var(--gl);border-color:var(--gb)}
.recap-wrong{background:var(--rl);border-color:var(--rb)}
.qr-recap-icon{font-size:16px;flex-shrink:0}
.qr-recap-info{flex:1;min-width:0}
.qr-recap-place{font-size:13px;font-weight:800;color:var(--text)}
.qr-recap-verdict{font-size:11px;color:var(--muted);margin-top:1px}
.qr-recap-badge{font-size:11px;font-weight:800;padding:3px 9px;border-radius:50px;flex-shrink:0}
.badge-safe{background:var(--gl);color:#166534;border:1px solid var(--gb)}
.badge-danger{background:var(--rl);color:#b91c1c;border:1px solid var(--rb)}

.qr-tips-section{background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px 20px;margin-bottom:16px}
.qr-tips-title{font-size:14px;font-weight:800;color:#166534;margin-bottom:12px}
.qr-tips-section .qr-tip-row{background:transparent;border-color:#bbf7d0;padding:8px 0}
.qr-tips-section .qr-tip-row:first-of-type{padding-top:0}
.qr-tips-section .qr-tip-title{color:#166534}
.qr-tips-section .qr-tip-desc{color:#276749}

.qr-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* finish overlay */
.qr-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.qr-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.qr-finish-icon{font-size:50px;margin-bottom:12px}
.qr-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.qr-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.qr-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.qr-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}

/* animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.qr-fade-in{animation:fadeUp .35s ease}

@media(max-width:520px){
  .qr-card{padding:24px 18px}
  .qr-divider{margin:0 -18px 20px}
  .qr-choice-row,.qr-btn-group{grid-template-columns:1fr}
  .qr-result-banner{flex-direction:column;align-items:center;text-align:center}
  .qr-score-display{flex-direction:column;text-align:center}
  .qr-content-row{flex-direction:column;align-items:center}
}
`;
