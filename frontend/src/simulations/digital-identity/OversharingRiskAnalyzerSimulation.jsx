import { useState, useEffect } from "react";

/* ── Translations ─────────────────────────────────── */
const T = {
  en: {
    moduleTag:  "MODULE 3 · SIMULATION 1",
    title:      "Oversharing Risk Analyzer",
    subtitle:   "Select what you post publicly on social media and see how attackers can use it against you.",

    selectTitle: "What do you share on social media?",
    selectDesc:  "Click each item to toggle it on/off",

    riskTitle:   "Your Risk Level",
    riskLabels:  ["Safe", "Low", "Medium", "High", "Critical"],
    riskColors:  ["#22c55e","#84cc16","#f59e0b","#f97316","#ef4444"],

    attackTitle: "🕵️ What an Attacker Can Do",
    attackEmpty: "Select items above to see how attackers use your information.",

    lessonTitle: "📚 What You Learned",
    lessonEmpty: "Share some items to see lessons appear here.",

    resetBtn:   "Clear All",
    selectAll:  "Select All",

    items: [
      {
        id: "birthday",
        icon: "🎂",
        label: "Birthday",
        desc: "Your full date of birth",
        risk: 2,
        attacks: [
          { icon: "🔑", text: "Security question answer: 'What is your birth date?' — cracked instantly." },
          { icon: "📧", text: "Attacker sends fake birthday discount emails to trick you (phishing)." },
        ],
        lesson: "Your birthday is used in most security questions and account recovery.",
      },
      {
        id: "phone",
        icon: "📱",
        label: "Phone Number",
        desc: "Your personal number",
        risk: 3,
        attacks: [
          { icon: "📲", text: "SIM swap attack: attacker calls your carrier pretending to be you." },
          { icon: "💬", text: "SMS phishing (smishing): fake bank alerts sent directly to you." },
        ],
        lesson: "Your phone number can be used to hijack your number and bypass 2FA.",
      },
      {
        id: "location",
        icon: "📍",
        label: "Home Location",
        desc: "Your city, area or address",
        risk: 2,
        attacks: [
          { icon: "🗺️", text: "Attacker narrows down your identity with your city + other details." },
          { icon: "🏠", text: "Paired with school/job info, attacker can find your exact address." },
        ],
        lesson: "Location data combined with other info builds a complete profile of you.",
      },
      {
        id: "school",
        icon: "🏫",
        label: "School / Workplace",
        desc: "Where you study or work",
        risk: 2,
        attacks: [
          { icon: "🎭", text: "Attacker impersonates a classmate or colleague to gain your trust." },
          { icon: "🔐", text: "Security question: 'Where did you go to school?' — answered from your profile." },
        ],
        lesson: "School/job info helps attackers impersonate people you trust.",
      },
      {
        id: "petname",
        icon: "🐶",
        label: "Pet Name",
        desc: "Your pet's name",
        risk: 2,
        attacks: [
          { icon: "🔑", text: "Security question: 'What is your pet's name?' — visible on your profile." },
          { icon: "🧩", text: "Common password component: 'Fluffy123' or 'Max@2005' easily guessed." },
        ],
        lesson: "Pet names are the #1 most used security question answer.",
      },
      {
        id: "email",
        icon: "📧",
        label: "Email Address",
        desc: "Your personal email",
        risk: 3,
        attacks: [
          { icon: "🎣", text: "Targeted phishing emails crafted specifically using your name and details." },
          { icon: "🔓", text: "Credential stuffing: attacker tries your email on hundreds of sites." },
        ],
        lesson: "Your email is the key to most of your accounts — guard it carefully.",
      },
      {
        id: "family",
        icon: "👨‍👩‍👧",
        label: "Family Members",
        desc: "Parents, siblings, spouse",
        risk: 2,
        attacks: [
          { icon: "📞", text: "Attacker calls pretending to be a relative in distress (vishing)." },
          { icon: "🔑", text: "Security questions like 'Mother's maiden name' answered from your posts." },
        ],
        lesson: "Family info enables emotional manipulation and security question bypass.",
      },
      {
        id: "vacation",
        icon: "✈️",
        label: "Vacation Plans",
        desc: "When & where you travel",
        risk: 1,
        attacks: [
          { icon: "📅", text: "Attacker knows exactly when your home is empty and unmonitored." },
          { icon: "🎭", text: "Fake travel emergency scam: 'Your friend is stuck abroad, send money!'" },
        ],
        lesson: "Posting vacation plans announces that your home is empty.",
      },
    ],

    combinedAttacks: {
      threshold3: {
        icon: "⚡",
        title: "Combined Data Attack!",
        text: "With multiple pieces of info, attackers can now build a full profile and reset your passwords.",
      },
      threshold5: {
        icon: "💥",
        title: "Identity Theft Risk!",
        text: "Enough data collected to impersonate you, answer all security questions, and take over your accounts.",
      },
    },

    riskMeter: {
      0: { label: "No Risk",  color: "#22c55e", desc: "You haven't shared anything yet." },
      1: { label: "Low",      color: "#84cc16", desc: "Minimal information shared. Stay cautious." },
      2: { label: "Medium",   color: "#f59e0b", desc: "An attacker is starting to build a picture of you." },
      3: { label: "High",     color: "#f97316", desc: "Significant personal info exposed. You are at risk." },
      4: { label: "Critical", color: "#ef4444", desc: "Danger! Enough information for identity theft." },
    },
  },

  np: {
    moduleTag:  "मड्युल ३ · सिमुलेसन १",
    title:      "अति-साझेदारी जोखिम विश्लेषक",
    subtitle:   "सामाजिक सञ्जालमा के-के पोस्ट गर्नुहुन्छ छान्नुहोस् र हेर्नुहोस् आक्रमणकारीले यसलाई कसरी प्रयोग गर्न सक्छ।",

    selectTitle: "तपाईं सामाजिक सञ्जालमा के साझा गर्नुहुन्छ?",
    selectDesc:  "चालु/बन्द गर्न प्रत्येक वस्तुमा क्लिक गर्नुहोस्",

    riskTitle:   "तपाईंको जोखिम स्तर",
    riskLabels:  ["सुरक्षित", "न्यून", "मध्यम", "उच्च", "गम्भीर"],
    riskColors:  ["#22c55e","#84cc16","#f59e0b","#f97316","#ef4444"],

    attackTitle: "🕵️ आक्रमणकारीले के गर्न सक्छ",
    attackEmpty: "आक्रमणकारीले तपाईंको जानकारी कसरी प्रयोग गर्छ भनी हेर्न माथि वस्तुहरू छान्नुहोस्।",

    lessonTitle: "📚 तपाईंले के सिक्नुभयो",
    lessonEmpty: "पाठहरू देख्न केही वस्तुहरू साझा गर्नुहोस्।",

    resetBtn:   "सबै हटाउनुहोस्",
    selectAll:  "सबै छान्नुहोस्",

    items: [
      {
        id: "birthday",
        icon: "🎂",
        label: "जन्मदिन",
        desc: "तपाईंको जन्म मिति",
        risk: 2,
        attacks: [
          { icon: "🔑", text: "सुरक्षा प्रश्न: 'तपाईंको जन्म मिति के हो?' — तुरुन्त उत्तर पाइन्छ।" },
          { icon: "📧", text: "नक्कली जन्मदिन छुट इमेल पठाएर ठग्ने (फिसिङ) प्रयास।" },
        ],
        lesson: "जन्मदिन अधिकांश सुरक्षा प्रश्न र खाता पुनःप्राप्तिमा प्रयोग हुन्छ।",
      },
      {
        id: "phone",
        icon: "📱",
        label: "फोन नम्बर",
        desc: "तपाईंको व्यक्तिगत नम्बर",
        risk: 3,
        attacks: [
          { icon: "📲", text: "SIM स्वाप: आक्रमणकारीले तपाईं बनेर सिम कम्पनीलाई फोन गर्छ।" },
          { icon: "💬", text: "SMS फिसिङ: नक्कली बैंक अलर्ट सिधै तपाईंको फोनमा पठाइन्छ।" },
        ],
        lesson: "तपाईंको फोन नम्बरले 2FA बाइपास गर्न सकिन्छ।",
      },
      {
        id: "location",
        icon: "📍",
        label: "घरको स्थान",
        desc: "तपाईंको सहर वा ठेगाना",
        risk: 2,
        attacks: [
          { icon: "🗺️", text: "आक्रमणकारी अन्य विवरणसँग मिलाएर तपाईंको सटीक ठेगाना पत्ता लगाउँछ।" },
          { icon: "🏠", text: "स्कुल/काम जानकारीसँग जोडेर पूर्ण प्रोफाइल बन्छ।" },
        ],
        lesson: "स्थान डेटाले अन्य जानकारीसँग मिलेर तपाईंको पूर्ण पहिचान बनाउँछ।",
      },
      {
        id: "school",
        icon: "🏫",
        label: "स्कुल / कार्यस्थल",
        desc: "तपाईं कहाँ पढ्नुहुन्छ वा काम गर्नुहुन्छ",
        risk: 2,
        attacks: [
          { icon: "🎭", text: "आक्रमणकारी सहपाठी वा सहकर्मी बनेर विश्वास जित्छ।" },
          { icon: "🔐", text: "सुरक्षा प्रश्न: 'तपाईं कुन स्कुलमा पढ्नुभयो?' — प्रोफाइलबाट उत्तर।" },
        ],
        lesson: "स्कुल/काम जानकारीले आक्रमणकारीलाई विश्वासपात्र व्यक्ति बन्न मद्दत गर्छ।",
      },
      {
        id: "petname",
        icon: "🐶",
        label: "पालतुको नाम",
        desc: "तपाईंको पालतु जनावरको नाम",
        risk: 2,
        attacks: [
          { icon: "🔑", text: "सुरक्षा प्रश्न: 'तपाईंको पालतुको नाम?' — प्रोफाइलमा देखिन्छ।" },
          { icon: "🧩", text: "सामान्य पासवर्ड: 'Fluffy123' वा 'Max@2005' सजिलै अनुमान गरिन्छ।" },
        ],
        lesson: "पालतुको नाम सबैभन्दा बढी प्रयोग हुने सुरक्षा प्रश्नको उत्तर हो।",
      },
      {
        id: "email",
        icon: "📧",
        label: "इमेल ठेगाना",
        desc: "तपाईंको व्यक्तिगत इमेल",
        risk: 3,
        attacks: [
          { icon: "🎣", text: "तपाईंको नाम र विवरण प्रयोग गरेर लक्षित फिसिङ इमेल।" },
          { icon: "🔓", text: "क्रेडेन्सियल स्टफिङ: तपाईंको इमेल सयौं साइटमा प्रयास गरिन्छ।" },
        ],
        lesson: "इमेल तपाईंका अधिकांश खाताको चाबी हो — सावधानीले राख्नुहोस्।",
      },
      {
        id: "family",
        icon: "👨‍👩‍👧",
        label: "परिवारका सदस्य",
        desc: "बुवाआमा, दाजुभाइ, श्रीमान/श्रीमती",
        risk: 2,
        attacks: [
          { icon: "📞", text: "आक्रमणकारी आफन्त बनेर संकटमा परेको नाटक गर्छ (भिसिङ)।" },
          { icon: "🔑", text: "'आमाको माइत थर' जस्ता सुरक्षा प्रश्नको उत्तर पोस्टबाट।" },
        ],
        lesson: "परिवारको जानकारीले भावनात्मक हेरफेर र सुरक्षा प्रश्न बाइपास सम्भव बनाउँछ।",
      },
      {
        id: "vacation",
        icon: "✈️",
        label: "बिदाको योजना",
        desc: "कहिले र कहाँ यात्रा गर्ने",
        risk: 1,
        attacks: [
          { icon: "📅", text: "आक्रमणकारीलाई थाहा हुन्छ तपाईंको घर कहिले खाली छ।" },
          { icon: "🎭", text: "नक्कली यात्रा आपतकाल: 'तपाईंको साथी विदेशमा अड्किए, पैसा पठाउनुस्!'" },
        ],
        lesson: "बिदाको योजना पोस्ट गर्नु भनेको घर खाली छ भनी सूचना दिनु हो।",
      },
    ],

    combinedAttacks: {
      threshold3: {
        icon: "⚡",
        title: "संयुक्त डेटा आक्रमण!",
        text: "धेरै जानकारीसँग, आक्रमणकारी पूर्ण प्रोफाइल बनाएर तपाईंको पासवर्ड रिसेट गर्न सक्छ।",
      },
      threshold5: {
        icon: "💥",
        title: "पहिचान चोरीको खतरा!",
        text: "तपाईंको रूप धारण गर्न, सबै सुरक्षा प्रश्नको उत्तर दिन र खाता लिन पर्याप्त डेटा।",
      },
    },

    riskMeter: {
      0: { label: "कुनै खतरा छैन", color: "#22c55e", desc: "तपाईंले अहिलेसम्म केही साझा गर्नुभएको छैन।" },
      1: { label: "न्यून",          color: "#84cc16", desc: "थोरै जानकारी साझा गरियो। सावधान रहनुहोस्।" },
      2: { label: "मध्यम",          color: "#f59e0b", desc: "आक्रमणकारी तपाईंको बारेमा चित्र बनाउन थालेको छ।" },
      3: { label: "उच्च",           color: "#f97316", desc: "महत्त्वपूर्ण व्यक्तिगत जानकारी खुल्यो। तपाईं खतरामा हुनुहुन्छ।" },
      4: { label: "गम्भीर",         color: "#ef4444", desc: "खतरा! पहिचान चोरीका लागि पर्याप्त जानकारी।" },
    },
  },
};

/* ── Risk calculator ──────────────────────────────── */
function calcRisk(selected, items) {
  if (selected.size === 0) return 0;
  const total = [...selected].reduce((sum, id) => {
    const item = items.find(i => i.id === id);
    return sum + (item?.risk || 0);
  }, 0);
  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 5) return 2;
  if (total <= 9) return 3;
  return 4;
}

/* ── Animated risk meter bar ──────────────────────── */
function RiskMeter({ level, t }) {
  const meter = t.riskMeter[level];
  const pct   = (level / 4) * 100;
  const segments = [
    { color: "#22c55e", label: t.riskLabels[0] },
    { color: "#84cc16", label: t.riskLabels[1] },
    { color: "#f59e0b", label: t.riskLabels[2] },
    { color: "#f97316", label: t.riskLabels[3] },
    { color: "#ef4444", label: t.riskLabels[4] },
  ];

  return (
    <div className="ora-meter-wrap">
      <div className="ora-meter-header">
        <span className="ora-meter-title">{t.riskTitle}</span>
        <span className="ora-meter-badge" style={{ background: meter.color + "22", color: meter.color, border: `1.5px solid ${meter.color}55` }}>
          {meter.label}
        </span>
      </div>

      {/* Segmented bar */}
      <div className="ora-bar-track">
        {segments.map((seg, i) => (
          <div key={i} className="ora-bar-seg" style={{ background: i < level ? seg.color : i === level && level > 0 ? seg.color : "#e2e8f0", opacity: i < level || (i === level && level > 0) ? 1 : 0.3, transition: "all 0.5s ease" }} />
        ))}
        {/* Indicator dot */}
        <div className="ora-bar-dot" style={{ left: `calc(${pct}% - 8px)`, background: meter.color, boxShadow: `0 0 12px ${meter.color}88`, transition: "left 0.5s ease, background 0.4s" }} />
      </div>

      {/* Segment labels */}
      <div className="ora-bar-labels">
        {segments.map((seg, i) => (
          <span key={i} className="ora-bar-label" style={{ color: i === level ? seg.color : "#a0aec0", fontWeight: i === level ? 800 : 500 }}>{seg.label}</span>
        ))}
      </div>

      <div className="ora-meter-desc" style={{ borderLeft: `3px solid ${meter.color}`, color: meter.color === "#22c55e" ? "#166534" : "#1e2a38" }}>
        {meter.desc}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────── */
export default function OversharingRiskAnalyzer() {
  const [lang, setLang]       = useState("en");
  const [selected, setSelected] = useState(new Set());
  const [revealed, setRevealed] = useState(new Set()); // for staggered attack reveal
  const t = T[lang];

  const riskLevel = calcRisk(selected, t.items);

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Stagger attack card reveals
  useEffect(() => {
    const ids = [...selected];
    ids.forEach((id, i) => {
      setTimeout(() => {
        setRevealed(prev => new Set([...prev, id]));
      }, i * 120);
    });
    // Remove deselected
    setRevealed(prev => {
      const next = new Set(prev);
      for (const id of next) {
        if (!selected.has(id)) next.delete(id);
      }
      return next;
    });
  }, [selected]);

  const selectedItems = t.items.filter(item => selected.has(item.id));
  const showCombined3 = selected.size >= 3;
  const showCombined5 = selected.size >= 5;

  return (
    <div className="ora-app">
      <style>{CSS}</style>

      {/* Lang bar */}
      <div className="ora-lang-bar">
        <div className="ora-lang-toggle">
          <button className={`ora-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>🇬🇧 English</button>
          <button className={`ora-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => setLang("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="ora-card">

        {/* Header */}
        <div className="ora-header">
          <div className="ora-module-tag">{t.moduleTag}</div>
          <h1 className="ora-title">{t.title}</h1>
          <p className="ora-subtitle">{t.subtitle}</p>
        </div>

        <div className="ora-divider" />

        {/* ── SELECTOR SECTION ── */}
        <div className="ora-section-title">{t.selectTitle}</div>
        <div className="ora-section-desc">{t.selectDesc}</div>

        {/* Quick action row */}
        <div className="ora-action-row">
          <button className="ora-quick-btn" onClick={() => setSelected(new Set(t.items.map(i => i.id)))}>{t.selectAll}</button>
          <button className="ora-quick-btn ora-reset-btn" onClick={() => setSelected(new Set())}>{t.resetBtn}</button>
        </div>

        {/* Item grid */}
        <div className="ora-items-grid">
          {t.items.map(item => (
            <button
              key={item.id}
              className={`ora-item-btn ${selected.has(item.id) ? "selected" : ""}`}
              onClick={() => toggle(item.id)}
            >
              <span className="ora-item-icon">{item.icon}</span>
              <span className="ora-item-label">{item.label}</span>
              <span className="ora-item-desc">{item.desc}</span>
              <span className="ora-item-check">{selected.has(item.id) ? "✓" : "+"}</span>
            </button>
          ))}
        </div>

        <div className="ora-divider" style={{ margin: "24px -32px" }} />

        {/* ── RISK METER ── */}
        <RiskMeter level={riskLevel} t={t} />

        <div className="ora-divider" style={{ margin: "24px -32px" }} />

        {/* ── ATTACKS SECTION ── */}
        <div className="ora-section-title">{t.attackTitle}</div>

        {selectedItems.length === 0 ? (
          <div className="ora-empty-state">
            <div className="ora-empty-icon">🔍</div>
            <div>{t.attackEmpty}</div>
          </div>
        ) : (
          <div className="ora-attacks-list">
            {selectedItems.map((item, idx) => (
              <div key={item.id} className={`ora-attack-card ${revealed.has(item.id) ? "show" : ""}`} style={{ transitionDelay: `${idx * 60}ms` }}>
                <div className="ora-attack-card-header">
                  <span className="ora-attack-item-icon">{item.icon}</span>
                  <span className="ora-attack-item-label">{item.label}</span>
                  <span className="ora-risk-pill" style={{ background: item.risk >= 3 ? "#fff5f5" : "#fff7ed", color: item.risk >= 3 ? "#b91c1c" : "#c2410c", border: `1px solid ${item.risk >= 3 ? "#fca5a5" : "#fed7aa"}` }}>
                    {"⚠️".repeat(item.risk >= 3 ? 3 : item.risk >= 2 ? 2 : 1)}
                  </span>
                </div>
                {item.attacks.map((a, i) => (
                  <div key={i} className="ora-attack-row">
                    <span className="ora-attack-icon">{a.icon}</span>
                    <span className="ora-attack-text">{a.text}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Combined attack warnings */}
            {showCombined3 && (
              <div className="ora-combined-card combined-warn ora-fade-in">
                <div className="ora-combined-icon">{t.combinedAttacks.threshold3.icon}</div>
                <div>
                  <div className="ora-combined-title">{t.combinedAttacks.threshold3.title}</div>
                  <div className="ora-combined-text">{t.combinedAttacks.threshold3.text}</div>
                </div>
              </div>
            )}
            {showCombined5 && (
              <div className="ora-combined-card combined-critical ora-fade-in">
                <div className="ora-combined-icon">{t.combinedAttacks.threshold5.icon}</div>
                <div>
                  <div className="ora-combined-title">{t.combinedAttacks.threshold5.title}</div>
                  <div className="ora-combined-text">{t.combinedAttacks.threshold5.text}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="ora-divider" style={{ margin: "24px -32px" }} />

        {/* ── LESSONS SECTION ── */}
        <div className="ora-section-title">{t.lessonTitle}</div>

        {selectedItems.length === 0 ? (
          <div className="ora-empty-state">
            <div className="ora-empty-icon">📖</div>
            <div>{t.lessonEmpty}</div>
          </div>
        ) : (
          <div className="ora-lessons-list">
            {selectedItems.map((item, idx) => (
              <div key={item.id} className={`ora-lesson-row ${revealed.has(item.id) ? "show" : ""}`} style={{ transitionDelay: `${idx * 80}ms` }}>
                <span className="ora-lesson-icon">{item.icon}</span>
                <span className="ora-lesson-text">{item.lesson}</span>
              </div>
            ))}
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
  --bg:#eef2f7;--card:#fff;--bdr:#dde3ec;
  --text:#1e2a38;--sub:#64748b;--muted:#a0aec0;
  --blue:#3b82f6;--r:16px;--sh:0 6px 32px rgba(30,42,56,.10);
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.ora-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

/* lang */
.ora-lang-bar{display:flex;justify-content:flex-end;max-width:680px;margin:0 auto 16px}
.ora-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.ora-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:all .25s}
.ora-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

/* card */
.ora-card{background:var(--card);border-radius:var(--r);max-width:680px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}

/* header */
.ora-header{text-align:center;margin-bottom:20px}
.ora-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.ora-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.ora-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.ora-divider{height:1px;background:var(--bdr);margin:16px -32px 24px}
.ora-section-title{font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px}
.ora-section-desc{font-size:13px;color:var(--muted);margin-bottom:14px}

/* action row */
.ora-action-row{display:flex;gap:8px;margin-bottom:16px}
.ora-quick-btn{padding:7px 16px;border:1.5px solid var(--bdr);border-radius:50px;font-family:inherit;font-size:12px;font-weight:700;background:#f8fafc;color:var(--sub);cursor:pointer;transition:all .2s}
.ora-quick-btn:hover{border-color:var(--blue);color:var(--blue);background:#eff6ff}
.ora-reset-btn:hover{border-color:#ef4444;color:#ef4444;background:#fff5f5}

/* items grid */
.ora-items-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:10px;margin-bottom:4px}
.ora-item-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:16px 10px 12px;border-radius:14px;border:2px solid var(--bdr);background:#f8fafc;cursor:pointer;transition:all .25s;position:relative;text-align:center}
.ora-item-btn:hover{border-color:#93c5fd;background:#eff6ff;transform:translateY(-2px)}
.ora-item-btn.selected{border-color:#3b82f6;background:#eff6ff;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
.ora-item-icon{font-size:30px;line-height:1;margin-bottom:2px}
.ora-item-label{font-size:13px;font-weight:800;color:var(--text)}
.ora-item-desc{font-size:11px;color:var(--muted);line-height:1.3}
.ora-item-check{position:absolute;top:8px;right:10px;width:20px;height:20px;border-radius:50%;background:#e2e8f0;color:#94a3b8;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;transition:all .25s}
.ora-item-btn.selected .ora-item-check{background:var(--blue);color:#fff}

/* risk meter */
.ora-meter-wrap{margin-bottom:4px}
.ora-meter-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.ora-meter-title{font-size:15px;font-weight:800;color:var(--text)}
.ora-meter-badge{font-size:13px;font-weight:800;padding:4px 14px;border-radius:50px}
.ora-bar-track{position:relative;display:flex;gap:4px;height:14px;margin-bottom:8px}
.ora-bar-seg{flex:1;border-radius:4px;transition:all .5s ease}
.ora-bar-dot{position:absolute;top:50%;transform:translateY(-50%);width:16px;height:16px;border-radius:50%;border:2px solid #fff}
.ora-bar-labels{display:flex;justify-content:space-between;margin-bottom:14px}
.ora-bar-label{font-size:10px;font-weight:600;transition:all .3s}
.ora-meter-desc{font-size:13px;font-weight:600;padding:10px 14px;background:#f8fafc;border-radius:8px;line-height:1.5;transition:all .4s}

/* attacks */
.ora-attacks-list{display:flex;flex-direction:column;gap:10px;margin-bottom:4px}
.ora-attack-card{background:#f8fafc;border:1.5px solid var(--bdr);border-radius:12px;padding:14px 16px;opacity:0;transform:translateY(10px);transition:opacity .4s ease,transform .4s ease}
.ora-attack-card.show{opacity:1;transform:translateY(0)}
.ora-attack-card-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.ora-attack-item-icon{font-size:20px;line-height:1}
.ora-attack-item-label{font-size:14px;font-weight:800;color:var(--text);flex:1}
.ora-risk-pill{font-size:11px;padding:3px 8px;border-radius:50px;font-weight:700}
.ora-attack-row{display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-top:1px solid var(--bdr)}
.ora-attack-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.ora-attack-text{font-size:13px;color:var(--sub);font-weight:600;line-height:1.5}

/* combined warning */
.ora-combined-card{display:flex;align-items:flex-start;gap:14px;padding:16px 18px;border-radius:12px;border:2px solid;margin-top:4px}
.combined-warn{background:#fff7ed;border-color:#fed7aa}
.combined-critical{background:#fff5f5;border-color:#fca5a5}
.ora-combined-icon{font-size:28px;flex-shrink:0;line-height:1}
.ora-combined-title{font-size:14px;font-weight:800;margin-bottom:4px}
.combined-warn .ora-combined-title{color:#c2410c}
.combined-critical .ora-combined-title{color:#b91c1c}
.ora-combined-text{font-size:13px;line-height:1.5}
.combined-warn .ora-combined-text{color:#9a3412}
.combined-critical .ora-combined-text{color:#7f1d1d}

/* lessons */
.ora-lessons-list{display:flex;flex-direction:column;gap:8px}
.ora-lesson-row{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;opacity:0;transform:translateX(-10px);transition:opacity .4s ease,transform .4s ease}
.ora-lesson-row.show{opacity:1;transform:translateX(0)}
.ora-lesson-icon{font-size:20px;flex-shrink:0;margin-top:1px}
.ora-lesson-text{font-size:13px;color:#166534;font-weight:600;line-height:1.5}

/* empty */
.ora-empty-state{text-align:center;padding:24px;color:var(--muted);font-size:14px;background:#f8fafc;border-radius:12px;border:1.5px dashed var(--bdr)}
.ora-empty-icon{font-size:32px;margin-bottom:8px}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ora-fade-in{animation:fadeUp .4s ease}

@media(max-width:500px){
  .ora-card{padding:24px 18px}
  .ora-divider{margin:16px -18px 20px}
  .ora-items-grid{grid-template-columns:repeat(2,1fr)}
  .ora-bar-label{font-size:8px}
}
`;