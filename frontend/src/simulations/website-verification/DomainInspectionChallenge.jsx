import { useState } from "react";

const T = {
  en: {
    moduleTag: "MODULE 6 · SIMULATION 1",
    title: "Domain Inspection Challenge",
    subtitle: "Can you spot the real website from the fake?",

    introTitle: "🌐 Real or Fake Domain?",
    introDesc: "Scammers copy real websites with slightly different URLs. One wrong click and your credentials are stolen.",
    startBtn: "Start →",

    roundLabel: (i, t) => `Round ${i} of ${t}`,
    instruction: "Which URL is the REAL website?",
    correctTitle: "✅ Correct!",
    wrongTitle: "❌ Wrong!",
    nextBtn: "Next →",
    finishBtn: "✅ Finish",

    resultsTitle: "Your Results",
    score: (c, t) => `${c} / ${t} correct`,
    excellent: "🏆 Domain expert!",
    good: "👍 Good — keep practising.",
    okay: "⚠️ Be more careful!",
    poor: "🔴 Need more practice.",
    retryBtn: "Try Again →",

    tipsTitle: "🔍 How to Check a Domain",
    tips: [
      { icon: "🔒", title: "Check HTTPS",        desc: "Real sites use https:// — look for the padlock." },
      { icon: "🌐", title: "Read from the right", desc: "The real domain is just before the first /. Read it right-to-left." },
      { icon: "⚠️", title: "Odd extensions",      desc: ".xyz .net .info used instead of .com = red flag." },
      { icon: "➕", title: "Extra words",          desc: "'paypal-secure.com' ≠ 'paypal.com'. Extra words = fake." },
      { icon: "🔢", title: "Letter swaps",         desc: "paypa1.com uses '1' instead of 'l'. Look carefully." },
    ],

    rounds: [
      {
        id: 1,
        brand: "RealBank",
        brandIcon: "🏦",
        options: [
          { url: "https://realbank.com/login",              isSafe: true  },
          { url: "https://realbank-secure-login.xyz/login", isSafe: false },
        ],
        safeExplain:  "✅ realbank.com — official domain, HTTPS, no extra words.",
        dangerExplain: [
          { icon: "⚠️", flag: "Suspicious extension", note: ".xyz is not a trusted banking domain." },
          { icon: "➕", flag: "Extra words",           note: "'realbank-secure-login' — real banks don't add words like this." },
        ],
        lesson: "Real banks only use their exact brand domain. Extra hyphens or words = fake.",
      },
      {
        id: 2,
        brand: "PayPal",
        brandIcon: "💳",
        options: [
          { url: "https://paypa1.com/signin",   isSafe: false },
          { url: "https://paypal.com/signin",   isSafe: true  },
        ],
        safeExplain:  "✅ paypal.com — correct spelling, HTTPS, exact official domain.",
        dangerExplain: [
          { icon: "🔢", flag: "Letter swap",  note: "'paypa1' uses the number '1' instead of the letter 'l'." },
          { icon: "👁️", flag: "Easy to miss", note: "At a glance 'paypa1' and 'paypal' look identical." },
        ],
        lesson: "Always look character-by-character. Scammers swap l→1, o→0, rn→m.",
      },
      {
        id: 3,
        brand: "Google",
        brandIcon: "🔍",
        options: [
          { url: "https://google.com.account-verify.net/secure", isSafe: false },
          { url: "https://accounts.google.com/signin",           isSafe: true  },
        ],
        safeExplain:  "✅ accounts.google.com — a subdomain of google.com. Still safe.",
        dangerExplain: [
          { icon: "🌐", flag: "Domain mismatch", note: "The real domain is 'account-verify.net' — not google.com." },
          { icon: "⚠️", flag: "Trick placement", note: "'google.com' appears first to look legitimate, but the actual domain is after." },
        ],
        lesson: "Read the domain right-to-left from the first /. 'google.com.account-verify.net' belongs to account-verify.net!",
      },
      {
        id: 4,
        brand: "Amazon",
        brandIcon: "📦",
        options: [
          { url: "https://amazon.com/your-orders",          isSafe: true  },
          { url: "https://amazon-support-help.com/orders",  isSafe: false },
        ],
        safeExplain:  "✅ amazon.com — simple, clean, official Amazon domain.",
        dangerExplain: [
          { icon: "➕", flag: "Extra words",          note: "'amazon-support-help' — Amazon's real domain never has hyphens." },
          { icon: "🌐", flag: "Wrong TLD",            note: "amazon-support-help.com is a completely different domain." },
        ],
        lesson: "Amazon.com only. Any hyphenated variation like amazon-support.com is fake.",
      },
      {
        id: 5,
        brand: "Nepal SBI Bank",
        brandIcon: "🏛️",
        options: [
          { url: "https://nepalsbi.com.np/netbanking",      isSafe: true  },
          { url: "http://nepa1sbi-netbank.info/login",      isSafe: false },
        ],
        safeExplain:  "✅ nepalsbi.com.np — official .com.np domain, HTTPS, no extra words.",
        dangerExplain: [
          { icon: "🔓", flag: "No HTTPS",       note: "Uses http:// — no encryption, data is exposed." },
          { icon: "🔢", flag: "Letter swap",    note: "'nepa1sbi' uses '1' instead of 'l'." },
          { icon: "⚠️", flag: "Odd extension",  note: "'.info' is not used by Nepali banks." },
        ],
        lesson: "Nepali banks use .com.np domains with HTTPS. No .info, no letter swaps, no HTTP.",
      },
    ],
  },

  np: {
    moduleTag: "मड्युल ६ · सिमुलेसन १",
    title: "डोमेन निरीक्षण चुनौती",
    subtitle: "वास्तविक वेबसाइट नक्कलीबाट छुट्याउन सक्नुहुन्छ?",

    introTitle: "🌐 वास्तविक वा नक्कली डोमेन?",
    introDesc: "ठगहरू थोरै फरक URL राखेर वास्तविक वेबसाइटको नक्कल बनाउँछन्। एउटा गलत क्लिकले तपाईंको प्रमाणपत्र चोरिन सक्छ।",
    startBtn: "सुरु →",

    roundLabel: (i, t) => `राउन्ड ${i} / ${t}`,
    instruction: "कुन URL वास्तविक वेबसाइट हो?",
    correctTitle: "✅ सही!",
    wrongTitle: "❌ गलत!",
    nextBtn: "अर्को →",
    finishBtn: "✅ समाप्त",

    resultsTitle: "नतिजा",
    score: (c, t) => `${c} / ${t} सही`,
    excellent: "🏆 डोमेन विशेषज्ञ!",
    good: "👍 राम्रो — अभ्यास जारी राख्नुहोस्।",
    okay: "⚠️ थप सावधान रहनुहोस्!",
    poor: "🔴 अझ अभ्यास गर्नुहोस्।",
    retryBtn: "फेरि प्रयास →",

    tipsTitle: "🔍 डोमेन कसरी जाँच्ने",
    tips: [
      { icon: "🔒", title: "HTTPS जाँच्नुहोस्",      desc: "वास्तविक साइट https:// प्रयोग गर्छ — ताल्चाको चिन्ह खोज्नुहोस्।" },
      { icon: "🌐", title: "दायाँबाट पढ्नुहोस्",    desc: "पहिलो / भन्दा अघिको भाग मात्र वास्तविक डोमेन हो।" },
      { icon: "⚠️", title: "अजीब एक्सटेन्सन",       desc: ".xyz .info .net — बैंकिङमा यस्तो हुँदैन।" },
      { icon: "➕", title: "थप शब्दहरू",             desc: "'paypal-secure.com' ≠ 'paypal.com'। थप शब्द = नक्कली।" },
      { icon: "🔢", title: "अक्षर अदलबदल",           desc: "paypa1.com मा 'l' को ठाउँमा '1' छ। ध्यानले हेर्नुहोस्।" },
    ],

    rounds: [
      {
        id: 1,
        brand: "RealBank",
        brandIcon: "🏦",
        options: [
          { url: "https://realbank.com/login",              isSafe: true  },
          { url: "https://realbank-secure-login.xyz/login", isSafe: false },
        ],
        safeExplain:  "✅ realbank.com — आधिकारिक डोमेन, HTTPS, कुनै थप शब्द छैन।",
        dangerExplain: [
          { icon: "⚠️", flag: "संदिग्ध एक्सटेन्सन", note: ".xyz बैंकिङका लागि विश्वसनीय डोमेन होइन।" },
          { icon: "➕", flag: "थप शब्दहरू",          note: "'realbank-secure-login' — वास्तविक बैंकले यसरी गर्दैन।" },
        ],
        lesson: "वास्तविक बैंकहरू आफ्नो सटीक ब्रान्ड डोमेन मात्र प्रयोग गर्छन्। थप शब्द = नक्कली।",
      },
      {
        id: 2,
        brand: "PayPal",
        brandIcon: "💳",
        options: [
          { url: "https://paypa1.com/signin",   isSafe: false },
          { url: "https://paypal.com/signin",   isSafe: true  },
        ],
        safeExplain:  "✅ paypal.com — सही हिज्जे, HTTPS, सटीक आधिकारिक डोमेन।",
        dangerExplain: [
          { icon: "🔢", flag: "अक्षर अदलबदल",  note: "'paypa1' मा 'l' को ठाउँमा '1' प्रयोग गरिएको छ।" },
          { icon: "👁️", flag: "सजिलै छुट्छ",  note: "हेर्दा 'paypa1' र 'paypal' उस्तै देखिन्छन्।" },
        ],
        lesson: "अक्षर-अक्षर गरी पढ्नुहोस्। ठगहरू l→1, o→0 अदलबदल गर्छन्।",
      },
      {
        id: 3,
        brand: "Google",
        brandIcon: "🔍",
        options: [
          { url: "https://google.com.account-verify.net/secure", isSafe: false },
          { url: "https://accounts.google.com/signin",           isSafe: true  },
        ],
        safeExplain:  "✅ accounts.google.com — google.com को सबडोमेन। सुरक्षित छ।",
        dangerExplain: [
          { icon: "🌐", flag: "डोमेन बेमेल",   note: "वास्तविक डोमेन 'account-verify.net' हो — google.com होइन।" },
          { icon: "⚠️", flag: "चाल",           note: "'google.com' अगाडि राखिएको छ ताकि वैध देखियोस्।" },
        ],
        lesson: "पहिलो / भन्दा अघिको भाग दायाँबाट पढ्नुहोस्। 'google.com.account-verify.net' = account-verify.net को हो!",
      },
      {
        id: 4,
        brand: "Amazon",
        brandIcon: "📦",
        options: [
          { url: "https://amazon.com/your-orders",          isSafe: true  },
          { url: "https://amazon-support-help.com/orders",  isSafe: false },
        ],
        safeExplain:  "✅ amazon.com — सरल, सफा, आधिकारिक Amazon डोमेन।",
        dangerExplain: [
          { icon: "➕", flag: "थप शब्दहरू",   note: "'amazon-support-help' — Amazon को डोमेनमा कहिल्यै हाइफन हुँदैन।" },
          { icon: "🌐", flag: "गलत TLD",       note: "amazon-support-help.com पूर्णतः फरक डोमेन हो।" },
        ],
        lesson: "Amazon.com मात्र। amazon-support.com जस्तो कुनै पनि भिन्नता नक्कली हो।",
      },
      {
        id: 5,
        brand: "Nepal SBI Bank",
        brandIcon: "🏛️",
        options: [
          { url: "https://nepalsbi.com.np/netbanking",      isSafe: true  },
          { url: "http://nepa1sbi-netbank.info/login",      isSafe: false },
        ],
        safeExplain:  "✅ nepalsbi.com.np — आधिकारिक .com.np डोमेन, HTTPS, थप शब्द छैन।",
        dangerExplain: [
          { icon: "🔓", flag: "HTTPS छैन",      note: "http:// प्रयोग भएको छ — डेटा एन्क्रिप्टेड छैन।" },
          { icon: "🔢", flag: "अक्षर अदलबदल",  note: "'nepa1sbi' मा 'l' को ठाउँमा '1' छ।" },
          { icon: "⚠️", flag: "अजीब एक्सटेन्सन", note: "नेपाली बैंकहरूले .info प्रयोग गर्दैनन्।" },
        ],
        lesson: "नेपाली बैंकहरू .com.np डोमेन र HTTPS प्रयोग गर्छन्। .info, अक्षर अदलबदल वा HTTP भएमा नक्कली हो।",
      },
    ],
  },
};

/* ── URL Highlighter ──────────────────────────────── */
function URLDisplay({ url, isSafe, revealed }) {
  // Parse URL parts for color-coding
  const hasHttps = url.startsWith("https://");
  const proto = url.startsWith("https://") ? "https" : "http";
  const rest = url.replace(/^https?:\/\//, "");
  const slashIdx = rest.indexOf("/");
  const domain = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest;
  const path   = slashIdx >= 0 ? rest.slice(slashIdx) : "";

  // Detect suspicious TLD
  const suspiciousTLDs = [".xyz", ".info", ".net", ".io"];
  const hasSuspiciousTLD = suspiciousTLDs.some(t => domain.endsWith(t));
  const hasMismatch = domain.includes("account-verify") || domain.includes("secure-login") || domain.includes("support-help") || domain.includes("netbank");

  return (
    <div className={`di-url-display ${revealed ? (isSafe ? "url-revealed-safe" : "url-revealed-danger") : ""}`}>
      <span className={`di-proto ${hasHttps ? "proto-safe" : "proto-danger"}`}>{proto}://</span>
      <span className={`di-domain ${revealed && !isSafe ? "domain-danger" : revealed ? "domain-safe" : ""}`}>{domain}</span>
      <span className="di-path">{path}</span>
      {revealed && !isSafe && (
        <div className="di-badges">
          {!hasHttps && <span className="di-badge di-badge-red">🔓 No HTTPS</span>}
          {hasSuspiciousTLD && <span className="di-badge di-badge-orange">⚠️ Odd TLD</span>}
          {hasMismatch && <span className="di-badge di-badge-red">➕ Extra Words</span>}
        </div>
      )}
      {revealed && isSafe && (
        <div className="di-badges">
          {hasHttps && <span className="di-badge di-badge-green">🔒 HTTPS</span>}
          <span className="di-badge di-badge-green">✅ Official</span>
        </div>
      )}
    </div>
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
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${pct/100*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{ transition:"stroke-dasharray .7s ease" }}/>
      </svg>
      <div style={{ position:"absolute", fontSize:24, fontWeight:800, color }}>{correct}/{total}</div>
    </div>
  );
}

/* ── Round Card ───────────────────────────────────── */
function RoundCard({ round, t, onChoice }) {
  const [chosen, setChosen] = useState(null); // index
  const done = chosen !== null;
  const correct = done && round.options[chosen].isSafe;

  function handle(idx) {
    if (done) return;
    setChosen(idx);
  }

  return (
    <div className="di-round-wrap di-fade-in">

      {/* Brand header */}
      <div className="di-brand-header">
        <span className="di-brand-icon">{round.brandIcon}</span>
        <div>
          <div className="di-brand-name">{round.brand}</div>
          <div className="di-instruction">{t.instruction}</div>
        </div>
      </div>

      {/* URL options */}
      <div className="di-url-options">
        {round.options.map((opt, i) => (
          <button
            key={i}
            className={`di-url-btn ${done && i === chosen ? (correct ? "chosen-correct" : "chosen-wrong") : ""} ${done && opt.isSafe && i !== chosen ? "show-correct" : ""} ${!done ? "di-url-btn-hover" : ""}`}
            onClick={() => handle(i)}
            disabled={done}
          >
            <div className="di-url-letter">{String.fromCharCode(65 + i)}</div>
            <URLDisplay url={opt.url} isSafe={opt.isSafe} revealed={done}/>
          </button>
        ))}
      </div>

      {/* Result */}
      {done && (
        <div className={`di-result-banner di-fade-in ${correct ? "banner-correct" : "banner-wrong"}`}>
          <div className="di-result-emoji">{correct ? "🎉" : "😬"}</div>
          <div className="di-result-body">
            <div className="di-result-title">{correct ? t.correctTitle : t.wrongTitle}</div>

            {/* Safe explanation */}
            <div className="di-safe-note">{round.safeExplain}</div>

            {/* Danger flags */}
            {round.dangerExplain.map((d, i) => (
              <div key={i} className="di-danger-row">
                <span className="di-danger-icon">{d.icon}</span>
                <div>
                  <span className="di-danger-flag">{d.flag}: </span>
                  <span className="di-danger-note">{d.note}</span>
                </div>
              </div>
            ))}

            {/* Lesson */}
            <div className="di-lesson">{round.lesson}</div>
          </div>
        </div>
      )}

      {done && (
        <button className="di-next-btn di-fade-in" onClick={() => onChoice(correct)}>{t.nextBtn}</button>
      )}
    </div>
  );
}

/* ── Finish Screen ────────────────────────────────── */
function FinishScreen({ t, onRetry }) {
  const isNp = t.moduleTag.includes("मड्युल");
  return (
    <div className="di-finish-overlay di-fade-in">
      <div className="di-finish-box">
        <div className="di-finish-icon">🎓</div>
        <div className="di-finish-title">{isNp ? "सिमुलेसन सम्पन्न!" : "Simulation Complete!"}</div>
        <div className="di-finish-desc">{isNp ? "तपाईंले डोमेन जाँच गर्न सिक्नुभयो।" : "You've learned how to inspect domains."}</div>
        <div className="di-finish-tips">
          {t.tips.slice(0,3).map((tip,i) => (
            <div key={i} className="di-finish-tip">{tip.icon} {tip.title}</div>
          ))}
        </div>
        <button className="di-start-btn di-outline-btn" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function DomainInspectionChallenge() {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [idx, setIdx]           = useState(0);
  const [scores, setScores]     = useState([]);
  const [finished, setFinished] = useState(false);
  const t = T[lang];

  function start() { setIdx(0); setScores([]); setFinished(false); setPhase("game"); }

  function handleChoice(correct) {
    const next = [...scores, correct];
    setScores(next);
    if (idx + 1 >= t.rounds.length) setTimeout(() => setPhase("results"), 200);
    else setIdx(i => i + 1);
  }

  function reset(newLang) {
    setPhase("intro"); setIdx(0); setScores([]); setFinished(false);
    if (newLang) setLang(newLang);
  }

  const correctCount = scores.filter(Boolean).length;
  const pct = scores.length > 0 ? correctCount / t.rounds.length : 0;
  const resultLabel = pct>=0.9?t.excellent:pct>=0.7?t.good:pct>=0.5?t.okay:t.poor;
  const resultColor = pct>=0.9?"#22c55e":pct>=0.7?"#84cc16":pct>=0.5?"#f59e0b":"#ef4444";

  return (
    <div className="di-app">
      <style>{CSS}</style>

      <div className="di-lang-bar">
        <div className="di-lang-toggle">
          <button className={`di-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`di-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="di-card" style={{ position:"relative" }}>

        <div className="di-header">
          <div className="di-module-tag">{t.moduleTag}</div>
          <h1 className="di-title">{t.title}</h1>
          <p className="di-subtitle">{t.subtitle}</p>
        </div>
        <div className="di-divider"/>

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div className="di-fade-in">
            <div className="di-intro-box">
              <div className="di-intro-icon">🌐</div>
              <div className="di-intro-title">{t.introTitle}</div>
              <div className="di-intro-desc">{t.introDesc}</div>
            </div>
            <div className="di-tips-preview">
              {t.tips.map((tip,i) => (
                <div key={i} className="di-tip-row">
                  <span className="di-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="di-tip-title">{tip.title}</div>
                    <div className="di-tip-desc">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="di-start-btn" onClick={start}>{t.startBtn}</button>
          </div>
        )}

        {/* ── GAME ── */}
        {phase === "game" && (
          <div>
            <div className="di-progress-wrap">
              <div className="di-progress-label">
                {t.roundLabel(idx+1, t.rounds.length)}
                <span className="di-score-live">{scores.filter(Boolean).length} ✅</span>
              </div>
              <div className="di-progress-track">
                <div className="di-progress-fill" style={{ width:`${idx/t.rounds.length*100}%` }}/>
              </div>
            </div>
            <RoundCard key={`${lang}-${idx}`} round={t.rounds[idx]} t={t} onChoice={handleChoice}/>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "results" && (
          <div className="di-fade-in">
            <div className="di-results-title">{t.resultsTitle}</div>
            <div className="di-score-display">
              <ScoreCircle correct={correctCount} total={t.rounds.length}/>
              <div className="di-score-right">
                <div className="di-score-label" style={{ color:resultColor }}>{resultLabel}</div>
                <div className="di-score-sub">{t.score(correctCount, t.rounds.length)}</div>
              </div>
            </div>

            {/* Recap */}
            <div className="di-recap-list">
              {t.rounds.map((r,i) => (
                <div key={i} className={`di-recap-row ${scores[i]?"recap-correct":"recap-wrong"}`}>
                  <span className="di-recap-icon">{scores[i]?"✅":"❌"}</span>
                  <div className="di-recap-info">
                    <div className="di-recap-brand">{r.brandIcon} {r.brand}</div>
                    <div className="di-recap-safe">{r.options.find(o=>o.isSafe).url}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="di-tips-section">
              <div className="di-tips-title">{t.tipsTitle}</div>
              {t.tips.map((tip,i) => (
                <div key={i} className="di-tip-row di-tip-row-green">
                  <span className="di-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="di-tip-title di-tip-title-green">{tip.title}</div>
                    <div className="di-tip-desc di-tip-desc-green">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="di-btn-group">
              <button className="di-start-btn di-outline-btn" onClick={start}>{t.retryBtn}</button>
              <button className="di-start-btn" onClick={()=>setFinished(true)}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} onRetry={()=>reset()}/>}
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

.di-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

.di-lang-bar{display:flex;justify-content:flex-end;max-width:660px;margin:0 auto 16px}
.di-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.di-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.di-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

.di-card{background:var(--card);border-radius:var(--r);max-width:660px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}

.di-header{text-align:center;margin-bottom:20px}
.di-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.di-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.di-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.di-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}

.di-intro-box{text-align:center;margin-bottom:22px}
.di-intro-icon{font-size:48px;margin-bottom:10px}
.di-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.di-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}

.di-tips-preview{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.di-tip-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.di-tip-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.di-tip-title{font-size:13px;font-weight:800;color:var(--text);margin-bottom:1px}
.di-tip-desc{font-size:12px;color:var(--sub)}

.di-start-btn{width:100%;padding:13px;font-family:inherit;font-size:15px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.di-start-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}
.di-outline-btn{background:transparent;color:var(--blue);border:2px solid var(--blue)}
.di-outline-btn:hover{background:#eff6ff;transform:translateY(-1px);box-shadow:none}

.di-progress-wrap{margin-bottom:18px}
.di-progress-label{font-size:13px;font-weight:800;color:var(--text);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.di-score-live{font-size:12px;font-weight:700;color:var(--green);background:var(--gl);border:1px solid var(--gb);padding:3px 10px;border-radius:50px}
.di-progress-track{height:8px;background:#e2e8f0;border-radius:8px;overflow:hidden}
.di-progress-fill{height:100%;background:var(--blue);border-radius:8px;transition:width .5s ease}

/* round card */
.di-round-wrap{display:flex;flex-direction:column;gap:14px}
.di-brand-header{display:flex;align-items:center;gap:14px;padding:16px 18px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:12px}
.di-brand-icon{font-size:32px;flex-shrink:0}
.di-brand-name{font-size:16px;font-weight:800;color:var(--text);margin-bottom:2px}
.di-instruction{font-size:13px;color:var(--sub)}

/* URL option buttons */
.di-url-options{display:flex;flex-direction:column;gap:10px}
.di-url-btn{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;border:2px solid var(--bdr);background:#fff;cursor:pointer;transition:var(--tr);text-align:left;width:100%}
.di-url-btn-hover:hover{border-color:var(--blue);background:#f0f7ff;transform:translateY(-1px)}
.di-url-btn:disabled{cursor:default}
.chosen-correct{border-color:var(--gb)!important;background:var(--gl)!important}
.chosen-wrong{border-color:var(--rb)!important;background:var(--rl)!important}
.show-correct{border-color:var(--gb)!important;background:var(--gl)!important;opacity:.7}
.di-url-letter{width:28px;height:28px;border-radius:50%;background:var(--blue);color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}

/* URL display */
.di-url-display{flex:1;min-width:0}
.di-url-display{display:flex;flex-wrap:wrap;align-items:center;gap:2px;font-family:monospace;font-size:13px;word-break:break-all}
.di-proto{font-weight:800}
.proto-safe{color:var(--green)}
.proto-danger{color:var(--red)}
.di-domain{font-weight:800;color:var(--text)}
.domain-safe{color:#166534}
.domain-danger{color:#b91c1c}
.di-path{color:var(--muted);font-size:12px}
.di-badges{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;width:100%}
.di-badge{font-size:11px;font-weight:800;padding:2px 8px;border-radius:50px}
.di-badge-green{background:var(--gl);color:#166534;border:1px solid var(--gb)}
.di-badge-red{background:var(--rl);color:#b91c1c;border:1px solid var(--rb)}
.di-badge-orange{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}

/* result banner */
.di-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:12px;padding:16px 18px;border-width:2px;border-style:solid}
.banner-correct{background:var(--gl);border-color:var(--gb)}
.banner-wrong{background:var(--rl);border-color:var(--rb)}
.di-result-emoji{font-size:30px;line-height:1;flex-shrink:0;margin-top:2px}
.di-result-body{flex:1;display:flex;flex-direction:column;gap:8px}
.di-result-title{font-size:15px;font-weight:800}
.banner-correct .di-result-title{color:#166534}
.banner-wrong   .di-result-title{color:#b91c1c}
.di-safe-note{font-size:12px;font-weight:700;color:#166534;background:var(--gl);border:1px solid var(--gb);border-radius:6px;padding:6px 10px}
.di-danger-row{display:flex;align-items:flex-start;gap:8px;font-size:12px;line-height:1.4}
.di-danger-icon{flex-shrink:0;font-size:14px}
.di-danger-flag{font-weight:800;color:#b91c1c}
.di-danger-note{color:var(--sub)}
.di-lesson{font-size:12px;color:var(--sub);background:#f8fafc;border:1px solid var(--bdr);border-radius:6px;padding:8px 10px;line-height:1.5;border-left:3px solid var(--blue)}

.di-next-btn{width:100%;padding:12px;font-family:inherit;font-size:14px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.di-next-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}

/* results page */
.di-results-title{font-size:19px;font-weight:800;color:var(--text);text-align:center;margin-bottom:18px}
.di-score-display{display:flex;align-items:center;gap:20px;padding:18px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:18px}
.di-score-right{flex:1}
.di-score-label{font-size:17px;font-weight:800;margin-bottom:4px;line-height:1.3}
.di-score-sub{font-size:13px;color:var(--sub)}

.di-recap-list{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
.di-recap-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;border:1.5px solid}
.recap-correct{background:var(--gl);border-color:var(--gb)}
.recap-wrong{background:var(--rl);border-color:var(--rb)}
.di-recap-icon{font-size:16px;flex-shrink:0}
.di-recap-info{flex:1;min-width:0}
.di-recap-brand{font-size:13px;font-weight:800;color:var(--text)}
.di-recap-safe{font-size:11px;color:var(--muted);font-family:monospace;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.di-tips-section{background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px 20px;margin-bottom:16px}
.di-tips-title{font-size:14px;font-weight:800;color:#166534;margin-bottom:12px}
.di-tip-row-green{background:transparent!important;border-color:#bbf7d0!important;padding:8px 0!important}
.di-tip-row-green:first-of-type{padding-top:0!important}
.di-tip-title-green{color:#166534!important}
.di-tip-desc-green{color:#276749!important}

.di-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* finish overlay */
.di-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.di-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.di-finish-icon{font-size:50px;margin-bottom:12px}
.di-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.di-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.di-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.di-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.di-fade-in{animation:fadeUp .35s ease}

@media(max-width:520px){
  .di-card{padding:24px 18px}
  .di-divider{margin:0 -18px 20px}
  .di-btn-group{grid-template-columns:1fr}
  .di-score-display{flex-direction:column;text-align:center}
  .di-result-banner{flex-direction:column}
  .di-url-display{font-size:11px}
}
`;
