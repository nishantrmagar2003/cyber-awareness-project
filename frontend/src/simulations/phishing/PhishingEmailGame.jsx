import { useState } from "react";

const T = {
  en: {
    moduleTag: "MODULE 4 · SIMULATION 1",
    title: "Phishing Email Detector",
    subtitle: "Read each email. Is it real or a scam?",
    introTitle: "🎣 Spot the Phish!",
    introDesc: "Hackers send fake emails to steal your info. Spot the real ones.",
    startBtn: "Start →",
    emailLabel: (i, t) => `Email ${i} of ${t}`,
    legitBtn: "✅ Legit",
    phishingBtn: "🚨 Phishing!",
    correctTitle: "✅ Correct!",
    wrongTitle: "❌ Wrong!",
    nextBtn: "Next →",
    resultsTitle: "Your Results",
    score: (c, t) => `${c} / ${t} correct`,
    excellent: "🏆 Phishing expert!",
    good: "👍 Good — keep practising.",
    okay: "⚠️ Be more careful!",
    poor: "🔴 Need more practice.",
    retryBtn: "Try Again →",
    redFlagsTitle: "🚩 Key Red Flags",
    redFlags: [
      { icon: "🌐", title: "Fake Domain",    desc: "amazon-support@gmail.com ≠ Amazon." },
      { icon: "⚡", title: "Urgency",         desc: "'Act NOW!' = pressure tactic." },
      { icon: "✏️", title: "Grammar Errors", desc: "Typos = red flag." },
      { icon: "🔗", title: "Odd Links",       desc: "Hover first — URL may differ." },
      { icon: "🎁", title: "Too Good",        desc: "Free prizes are almost always scams." },
    ],
    emails: [
      {
        id: 1, isPhishing: true,
        from: "security@paypa1-alert.com", fromName: "PayPal Security",
        subject: "⚠️ URGENT: Account LIMITED!", date: "Today, 9:14 AM",
        body: ["Dear Customer,","Suspicious activity on you're account. Limited untill we hear from you.","CLICK HERE NOW or account closes in 24 hrs.","PayPal Team"],
        flags: [
          { type: "domain",  text: "paypa1-alert.com", note: "@paypal.com only. '1' ≠ 'l'." },
          { type: "urgency", text: "URGENT / 24 hrs",  note: "Fake deadline = pressure." },
          { type: "grammar", text: "you're / untill",  note: "Typos real companies don't make." },
        ],
        lesson: "PayPal never threatens closure in hours. Check the domain.",
      },
      {
        id: 2, isPhishing: false,
        from: "no-reply@github.com", fromName: "GitHub",
        subject: "Your pull request was merged", date: "Today, 11:30 AM",
        body: ["Hi,","PR #342 'Fix login bug' merged into myproject/webapp.","github.com/myproject/webapp/pull/342","— GitHub"],
        flags: [],
        lesson: "Legit. Real domain, calm tone, no pressure.",
      },
      {
        id: 3, isPhishing: true,
        from: "noreply@amazon-customer-services.net", fromName: "Amazon Support",
        subject: "Order CANCELLED — Action Required!", date: "Yesterday, 3:45 PM",
        body: ["Amazon Customer,","Order #AMZ-9912837 cancelled.","Verify payment or be charged $79.99 in 12 HRS.","[ VERIFY NOW ]"],
        flags: [
          { type: "domain",  text: "amazon-customer-services.net", note: "Amazon = @amazon.com only." },
          { type: "urgency", text: "$79.99 / 12 HRS",              note: "Financial threat = panic tactic." },
          { type: "link",    text: "[ VERIFY NOW ]",               note: "No URL shown — hides fake page." },
        ],
        lesson: "Amazon never threatens charges from other domains. Go direct.",
      },
      {
        id: 4, isPhishing: false,
        from: "security@google.com", fromName: "Google Account",
        subject: "New sign-in to your Google Account", date: "Monday, 8:02 AM",
        body: ["Hi Alex,","New sign-in to alex@gmail.com.","📱 iPhone 14 · Kathmandu · 8:01 AM","Not you? → myaccount.google.com"],
        flags: [],
        lesson: "Legit. Real domain, your name, device details, zero pressure.",
      },
      {
        id: 5, isPhishing: true,
        from: "winner@globallottery-prize.com", fromName: "Global Lottery",
        subject: "🎉 YOU WON $50,000!!!", date: "Sunday, 6:55 PM",
        body: ["YOU WON $50,000!!! 🎉","Pay $150 to claim your prize.","Send name, address & bank details now.","Expires in 48 HRS!!!"],
        flags: [
          { type: "toogood", text: "$50,000 prize",           note: "Can't win a lottery you never entered." },
          { type: "urgency", text: "48 HRS!!!",               note: "Fake deadline = stop thinking." },
          { type: "domain",  text: "globallottery-prize.com", note: "No real lottery uses this." },
          { type: "grammar", text: "Asks for bank details",   note: "Never send bank info by email." },
        ],
        lesson: "Advance-fee scam. You pay, prize never arrives.",
      },
    ],
  },
  np: {
    moduleTag: "मड्युल ४ · सिमुलेसन १",
    title: "फिसिङ इमेल पहिचान",
    subtitle: "इमेल पढ्नुहोस् — वास्तविक हो वा फिसिङ?",
    introTitle: "🎣 फिसिङ चिन्नुहोस्!",
    introDesc: "ह्याकरहरू नक्कली इमेल पठाउँछन्। कुन वास्तविक छ?",
    startBtn: "सुरु →",
    emailLabel: (i, t) => `इमेल ${i} / ${t}`,
    legitBtn: "✅ वास्तविक",
    phishingBtn: "🚨 फिसिङ!",
    correctTitle: "✅ सही!",
    wrongTitle: "❌ गलत!",
    nextBtn: "अर्को →",
    resultsTitle: "नतिजा",
    score: (c, t) => `${c} / ${t} सही`,
    excellent: "🏆 उत्कृष्ट!",
    good: "👍 राम्रो — अभ्यास जारी राख्नुहोस्।",
    okay: "⚠️ थप सावधान रहनुहोस्!",
    poor: "🔴 अझ अभ्यास गर्नुहोस्।",
    retryBtn: "फेरि प्रयास →",
    redFlagsTitle: "🚩 मुख्य खतराका संकेत",
    redFlags: [
      { icon: "🌐", title: "नक्कली डोमेन",  desc: "amazon-support@gmail.com ≠ Amazon।" },
      { icon: "⚡", title: "जरुरी भाषा",     desc: "'अहिलै!' = दबाब चाल।" },
      { icon: "✏️", title: "व्याकरण गल्ती", desc: "गल्तीहरू = खतराको संकेत।" },
      { icon: "🔗", title: "संदिग्ध लिंक",  desc: "क्लिक अघि URL जाँच्नुहोस्।" },
      { icon: "🎁", title: "अविश्वसनीय",     desc: "निःशुल्क पुरस्कार = प्रायः जालसाजी।" },
    ],
    emails: [
      {
        id: 1, isPhishing: true,
        from: "security@paypa1-alert.com", fromName: "PayPal सुरक्षा",
        subject: "⚠️ जरुरी: खाता सीमित!", date: "आज, ९:१४",
        body: ["प्रिय ग्राहक,","खातामा संदिग्ध गतिविधि। सीमित गरियो।","२४ घण्टाभित्र क्लिक नगरे खाता बन्द।","PayPal टोली"],
        flags: [
          { type: "domain",  text: "paypa1-alert.com", note: "@paypal.com मात्र। '1' ≠ 'l'।" },
          { type: "urgency", text: "जरुरी / २४ घण्टा", note: "नक्कली समयसीमा = दबाब।" },
          { type: "grammar", text: "व्याकरण गल्ती",   note: "वास्तविक कम्पनी यस्तो गर्दैन।" },
        ],
        lesson: "PayPal घण्टाभित्र खाता बन्द गर्ने धम्की दिँदैन।",
      },
      {
        id: 2, isPhishing: false,
        from: "no-reply@github.com", fromName: "GitHub",
        subject: "Pull request merge भयो", date: "आज, ११:३०",
        body: ["नमस्ते,","PR #342 merge भयो।","github.com/myproject/webapp/pull/342","— GitHub"],
        flags: [],
        lesson: "वैध। वास्तविक डोमेन, शान्त भाषा, दबाब छैन।",
      },
      {
        id: 3, isPhishing: true,
        from: "noreply@amazon-customer-services.net", fromName: "Amazon सपोर्ट",
        subject: "अर्डर रद्द — तत्काल कार्यवाही!", date: "हिजो, ३:४५",
        body: ["Amazon ग्राहक,","अर्डर #AMZ-9912837 रद्द।","१२ घण्टाभित्र नगरे रु.७,९९९ शुल्क।","[ अहिलै प्रमाणित ]"],
        flags: [
          { type: "domain",  text: "amazon-customer-services.net", note: "@amazon.com मात्र।" },
          { type: "urgency", text: "रु.७,९९९ / १२ घण्टा",         note: "आर्थिक धम्की = दबाब।" },
          { type: "link",    text: "[ अहिलै प्रमाणित ]",          note: "URL लुकाइएको।" },
        ],
        lesson: "Amazon अन्य डोमेनबाट शुल्क धम्की दिँदैन।",
      },
      {
        id: 4, isPhishing: false,
        from: "security@google.com", fromName: "Google खाता",
        subject: "नयाँ लगइन भयो", date: "सोमबार, ८:०२",
        body: ["नमस्ते Alex,","alex@gmail.com मा नयाँ लगइन।","📱 iPhone 14 · काठमाडौं · ८:०१","तपाईं होइन? → myaccount.google.com"],
        flags: [],
        lesson: "वैध। वास्तविक डोमेन, विशेष विवरण, दबाब छैन।",
      },
      {
        id: 5, isPhishing: true,
        from: "winner@globallottery-prize.com", fromName: "Global Lottery",
        subject: "🎉 $५०,००० जित्नुभयो!!!", date: "आइतबार, ६:५५",
        body: ["$५०,००० जित्नुभयो! 🎉","$१५० शुल्क पठाउनुहोस्।","नाम, ठेगाना, बैंक विवरण पठाउनुहोस्।","४८ घण्टामा समाप्त!!!"],
        flags: [
          { type: "toogood", text: "$५०,०००",              note: "नलगाएको लटरी जित्न सकिँदैन।" },
          { type: "urgency", text: "४८ घण्टा!!!",          note: "नक्कली समयसीमा।" },
          { type: "domain",  text: "globallottery-prize.com", note: "अज्ञात डोमेन।" },
          { type: "grammar", text: "बैंक विवरण माग्दै",   note: "इमेलमा बैंक विवरण नदिनुहोस्।" },
        ],
        lesson: "अग्रिम-शुल्क जालसाजी। शुल्क तिर्नुहोस्, पुरस्कार आउँदैन।",
      },
    ],
  },
};

const FLAG_COLORS = {
  domain:  { bg:"#fff5f5", border:"#fca5a5", text:"#b91c1c", icon:"🌐" },
  urgency: { bg:"#fff7ed", border:"#fed7aa", text:"#c2410c", icon:"⚡" },
  grammar: { bg:"#fefce8", border:"#fde047", text:"#854d0e", icon:"✏️" },
  link:    { bg:"#f5f3ff", border:"#c4b5fd", text:"#6d28d9", icon:"🔗" },
  toogood: { bg:"#f0fdf4", border:"#86efac", text:"#166534", icon:"🎁" },
};
const FLAG_LABELS = {
  en: { domain:"Fake Domain", urgency:"Urgency", grammar:"Grammar", link:"Odd Link", toogood:"Too Good" },
  np: { domain:"नक्कली डोमेन", urgency:"जरुरी", grammar:"गल्ती", link:"लिंक", toogood:"अविश्वसनीय" },
};

function FlagPill({ type, lang }) {
  const c = FLAG_COLORS[type];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:800, padding:"3px 9px", borderRadius:50, background:c.bg, color:c.text, border:`1.5px solid ${c.border}`, whiteSpace:"nowrap" }}>
      {c.icon} {FLAG_LABELS[lang][type]}
    </span>
  );
}

function EmailCard({ email, onChoice, t, lang }) {
  const [answered, setAnswered] = useState(null);
  const [showFlags, setShowFlags] = useState(false);

  function handle(guessPhishing) {
    const correct = guessPhishing === email.isPhishing;
    setAnswered(correct ? "correct" : "wrong");
    setTimeout(() => setShowFlags(true), 250);
  }

  const done = answered !== null;

  return (
    <div className="pe-email-wrap pe-fade-in">
      <div className={`pe-email-card ${done ? (email.isPhishing ? "email-phishing" : "email-legit") : ""}`}>
        <div className="pe-email-header">
          <div className="pe-email-avatar">{email.fromName[0]}</div>
          <div className="pe-email-meta">
            <div className="pe-email-from">
              <span className="pe-email-fromname">{email.fromName}</span>
              <span className="pe-email-fromaddr">&lt;{email.from}&gt;</span>
            </div>
            <div className="pe-email-subject">{email.subject}</div>
            <div className="pe-email-date">{email.date}</div>
          </div>
        </div>
        <div className="pe-email-body">
          {email.body.map((line, i) => <p key={i} className="pe-email-line">{line}</p>)}
        </div>
        {showFlags && email.isPhishing && email.flags.length > 0 && (
          <div className="pe-flags-section pe-fade-in">
            <div className="pe-flags-title">🚩 {lang==="np"?"खतराका संकेत:":"Red Flags:"}</div>
            {email.flags.map((f, i) => (
              <div key={i} className="pe-flag-row" style={{ background:FLAG_COLORS[f.type].bg, borderColor:FLAG_COLORS[f.type].border }}>
                <FlagPill type={f.type} lang={lang} />
                <div className="pe-flag-detail">
                  <span className="pe-flag-text" style={{ color:FLAG_COLORS[f.type].text }}>{f.text}</span>
                  <span className="pe-flag-note"> — {f.note}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!done && (
        <div className="pe-choice-row pe-fade-in">
          <button className="pe-choice-btn pe-legit-btn" onClick={() => handle(false)}>
            <span className="pe-choice-icon">✅</span>
            <span className="pe-choice-label">{t.legitBtn}</span>
          </button>
          <button className="pe-choice-btn pe-phish-btn" onClick={() => handle(true)}>
            <span className="pe-choice-icon">🚨</span>
            <span className="pe-choice-label">{t.phishingBtn}</span>
          </button>
        </div>
      )}

      {done && (
        <div className={`pe-result-banner pe-fade-in ${answered==="correct"?"banner-correct":"banner-wrong"}`}>
          <div className="pe-result-emoji">{answered==="correct"?"🎉":"😬"}</div>
          <div>
            <div className="pe-result-title">{answered==="correct"?t.correctTitle:t.wrongTitle}</div>
            <div className="pe-result-sub">{email.isPhishing?(lang==="np"?"फिसिङ थियो।":"This was phishing."):(lang==="np"?"वास्तविक थियो।":"This was legit.")}</div>
            <div className="pe-lesson-text">{email.lesson}</div>
          </div>
        </div>
      )}

      {done && showFlags && (
        <button className="pe-next-btn pe-fade-in" onClick={() => onChoice(answered==="correct")}>{t.nextBtn}</button>
      )}
    </div>
  );
}

function ScoreCircle({ correct, total }) {
  const pct = (correct / total) * 100;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{ transition:"stroke-dasharray 0.7s ease" }} />
      </svg>
      <div style={{ position:"absolute", fontSize:24, fontWeight:800, color }}>{correct}/{total}</div>
    </div>
  );
}

export default function PhishingEmailGame() {
  const [lang, setLang]     = useState("en");
  const [phase, setPhase]   = useState("intro");
  const [idx, setIdx]       = useState(0);
  const [scores, setScores] = useState([]);
  const t = T[lang];

  function start() { setIdx(0); setScores([]); setPhase("game"); }

  function handleChoice(correct) {
    const next = [...scores, correct];
    setScores(next);
    if (idx + 1 >= t.emails.length) setTimeout(() => setPhase("results"), 200);
    else setIdx(i => i + 1);
  }

  const correctCount = scores.filter(Boolean).length;
  const pct = scores.length > 0 ? correctCount / t.emails.length : 0;
  const resultLabel = pct>=0.9?t.excellent:pct>=0.7?t.good:pct>=0.5?t.okay:t.poor;
  const resultColor = pct>=0.9?"#22c55e":pct>=0.7?"#84cc16":pct>=0.5?"#f59e0b":"#ef4444";

  return (
    <div className="pe-app">
      <style>{CSS}</style>
      <div className="pe-lang-bar">
        <div className="pe-lang-toggle">
          <button className={`pe-lang-btn ${lang==="en"?"active":""}`} onClick={()=>{setLang("en");setPhase("intro");}}>🇬🇧 English</button>
          <button className={`pe-lang-btn ${lang==="np"?"active":""}`} onClick={()=>{setLang("np");setPhase("intro");}}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="pe-card">
        <div className="pe-header">
          <div className="pe-module-tag">{t.moduleTag}</div>
          <h1 className="pe-title">{t.title}</h1>
          <p className="pe-subtitle">{t.subtitle}</p>
        </div>
        <div className="pe-divider" />

        {phase==="intro" && (
          <div className="pe-fade-in">
            <div className="pe-intro-box">
              <div className="pe-intro-icon">🎣</div>
              <div className="pe-intro-title">{t.introTitle}</div>
              <div className="pe-intro-desc">{t.introDesc}</div>
            </div>
            <div className="pe-flags-preview">
              {t.redFlags.map((f,i) => (
                <div key={i} className="pe-preview-row">
                  <span className="pe-preview-icon">{f.icon}</span>
                  <div>
                    <div className="pe-preview-title">{f.title}</div>
                    <div className="pe-preview-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="pe-start-btn" onClick={start}>{t.startBtn}</button>
          </div>
        )}

        {phase==="game" && (
          <div>
            <div className="pe-progress-wrap">
              <div className="pe-progress-label">
                {t.emailLabel(idx+1, t.emails.length)}
                <span className="pe-score-live">{scores.filter(Boolean).length} ✅</span>
              </div>
              <div className="pe-progress-track">
                <div className="pe-progress-fill" style={{ width:`${(idx/t.emails.length)*100}%` }} />
              </div>
            </div>
            <EmailCard key={`${lang}-${idx}`} email={t.emails[idx]} onChoice={handleChoice} t={t} lang={lang} />
          </div>
        )}

        {phase==="results" && (
          <div className="pe-fade-in">
            <div className="pe-results-title">{t.resultsTitle}</div>
            <div className="pe-score-display">
              <ScoreCircle correct={correctCount} total={t.emails.length} />
              <div className="pe-score-right">
                <div className="pe-score-label" style={{ color:resultColor }}>{resultLabel}</div>
                <div className="pe-score-sub">{t.score(correctCount, t.emails.length)}</div>
              </div>
            </div>
            <div className="pe-recap-list">
              {t.emails.map((email,i) => (
                <div key={i} className={`pe-recap-row ${scores[i]?"recap-correct":"recap-wrong"}`}>
                  <span className="pe-recap-icon">{scores[i]?"✅":"❌"}</span>
                  <div className="pe-recap-info">
                    <div className="pe-recap-subject">{email.subject}</div>
                    <div className="pe-recap-answer">{email.isPhishing?(lang==="np"?"फिसिङ थियो":"Was phishing"):(lang==="np"?"वास्तविक थियो":"Was legit")}</div>
                  </div>
                  <span className={`pe-recap-badge ${email.isPhishing?"phishing-badge":"legit-badge"}`}>
                    {email.isPhishing?(lang==="np"?"फिसिङ":"Phishing"):(lang==="np"?"वास्तविक":"Legit")}
                  </span>
                </div>
              ))}
            </div>
            <div className="pe-lesson-section">
              <div className="pe-lesson-section-title">{t.redFlagsTitle}</div>
              {t.redFlags.map((f,i) => (
                <div key={i} className="pe-lesson-row">
                  <span className="pe-lesson-icon">{f.icon}</span>
                  <div>
                    <div className="pe-lesson-item-title">{f.title}</div>
                    <div className="pe-lesson-item-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="pe-start-btn" onClick={start}>{t.retryBtn}</button>
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
.pe-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.pe-lang-bar{display:flex;justify-content:flex-end;max-width:660px;margin:0 auto 16px}
.pe-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.pe-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.pe-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}
.pe-card{background:var(--card);border-radius:var(--r);max-width:660px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.pe-header{text-align:center;margin-bottom:20px}
.pe-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.pe-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.pe-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.pe-divider{height:1px;background:var(--bdr);margin:16px -32px 24px}
.pe-intro-box{text-align:center;margin-bottom:22px}
.pe-intro-icon{font-size:48px;margin-bottom:10px}
.pe-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.pe-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.pe-flags-preview{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.pe-preview-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.pe-preview-icon{font-size:20px;flex-shrink:0;margin-top:1px}
.pe-preview-title{font-size:13px;font-weight:800;color:var(--text);margin-bottom:1px}
.pe-preview-desc{font-size:12px;color:var(--sub)}
.pe-start-btn{width:100%;padding:13px;font-family:inherit;font-size:15px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.pe-start-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}
.pe-progress-wrap{margin-bottom:18px}
.pe-progress-label{font-size:13px;font-weight:800;color:var(--text);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.pe-score-live{font-size:12px;font-weight:700;color:var(--green);background:var(--gl);border:1px solid var(--gb);padding:3px 10px;border-radius:50px}
.pe-progress-track{height:8px;background:#e2e8f0;border-radius:8px;overflow:hidden}
.pe-progress-fill{height:100%;background:var(--blue);border-radius:8px;transition:width .5s ease}
.pe-email-wrap{display:flex;flex-direction:column;gap:14px}
.pe-email-card{background:#f8fafc;border:2px solid var(--bdr);border-radius:14px;overflow:hidden;transition:border-color .4s}
.pe-email-card.email-phishing{border-color:var(--rb);background:var(--rl)}
.pe-email-card.email-legit{border-color:var(--gb);background:var(--gl)}
.pe-email-header{display:flex;align-items:flex-start;gap:12px;padding:16px 18px 12px;border-bottom:1.5px solid var(--bdr);background:#fff}
.pe-email-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:17px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pe-email-meta{flex:1;min-width:0}
.pe-email-from{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-bottom:3px}
.pe-email-fromname{font-size:13px;font-weight:800;color:var(--text)}
.pe-email-fromaddr{font-size:11px;color:var(--muted);font-family:monospace;background:#f0f4f8;padding:2px 5px;border-radius:4px}
.pe-email-subject{font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;line-height:1.3}
.pe-email-date{font-size:11px;color:var(--muted)}
.pe-email-body{padding:14px 18px;display:flex;flex-direction:column;gap:6px}
.pe-email-line{font-size:13px;color:var(--sub);line-height:1.55}
.pe-flags-section{padding:14px 18px;border-top:1.5px solid var(--rb);background:#fff8f8}
.pe-flags-title{font-size:12px;font-weight:800;color:#b91c1c;margin-bottom:8px}
.pe-flag-row{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:8px;border:1.5px solid;margin-bottom:6px;flex-wrap:wrap}
.pe-flag-detail{font-size:12px;color:var(--sub);line-height:1.4;flex:1}
.pe-flag-text{font-weight:800}
.pe-flag-note{color:var(--muted)}
.pe-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pe-choice-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:16px 10px;border-radius:12px;border:2px solid;cursor:pointer;transition:var(--tr);background:#f8fafc}
.pe-choice-btn:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.10)}
.pe-legit-btn{border-color:var(--gb)}.pe-legit-btn:hover{background:var(--gl)}
.pe-phish-btn{border-color:var(--rb)}.pe-phish-btn:hover{background:var(--rl)}
.pe-choice-icon{font-size:28px;line-height:1}
.pe-choice-label{font-size:13px;font-weight:800;color:var(--text);text-align:center}
.pe-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:12px;padding:16px 18px;border-width:2px;border-style:solid}
.banner-correct{background:var(--gl);border-color:var(--gb)}
.banner-wrong{background:var(--rl);border-color:var(--rb)}
.pe-result-emoji{font-size:34px;line-height:1;flex-shrink:0}
.pe-result-title{font-size:16px;font-weight:800;margin-bottom:2px}
.banner-correct .pe-result-title{color:#166534}
.banner-wrong   .pe-result-title{color:#b91c1c}
.pe-result-sub{font-size:12px;margin-bottom:5px}
.banner-correct .pe-result-sub{color:#276749}
.banner-wrong   .pe-result-sub{color:#c53030}
.pe-lesson-text{font-size:12px;line-height:1.5;color:var(--sub);border-top:1px solid rgba(0,0,0,.07);padding-top:7px;margin-top:4px}
.pe-next-btn{width:100%;padding:12px;font-family:inherit;font-size:14px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.pe-next-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}
.pe-results-title{font-size:19px;font-weight:800;color:var(--text);text-align:center;margin-bottom:18px}
.pe-score-display{display:flex;align-items:center;gap:20px;padding:18px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:18px}
.pe-score-right{flex:1}
.pe-score-label{font-size:17px;font-weight:800;margin-bottom:4px;line-height:1.3}
.pe-score-sub{font-size:13px;color:var(--sub)}
.pe-recap-list{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
.pe-recap-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;border:1.5px solid}
.recap-correct{background:var(--gl);border-color:var(--gb)}
.recap-wrong{background:var(--rl);border-color:var(--rb)}
.pe-recap-icon{font-size:16px;flex-shrink:0}
.pe-recap-info{flex:1;min-width:0}
.pe-recap-subject{font-size:12px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-recap-answer{font-size:11px;color:var(--muted);margin-top:1px}
.pe-recap-badge{font-size:11px;font-weight:800;padding:3px 9px;border-radius:50px;flex-shrink:0}
.phishing-badge{background:var(--rl);color:#b91c1c;border:1px solid var(--rb)}
.legit-badge{background:var(--gl);color:#166534;border:1px solid var(--gb)}
.pe-lesson-section{background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px 20px;margin-bottom:18px}
.pe-lesson-section-title{font-size:14px;font-weight:800;color:#166534;margin-bottom:12px}
.pe-lesson-row{display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-top:1px solid #bbf7d0}
.pe-lesson-row:first-of-type{border-top:none}
.pe-lesson-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.pe-lesson-item-title{font-size:12px;font-weight:800;color:#166534;margin-bottom:1px}
.pe-lesson-item-desc{font-size:11px;color:#276749;line-height:1.4}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pe-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){
  .pe-card{padding:24px 18px}
  .pe-divider{margin:16px -18px 20px}
  .pe-choice-row{grid-template-columns:1fr}
  .pe-result-banner,.pe-score-display{flex-direction:column;align-items:center;text-align:center}
}
`;
