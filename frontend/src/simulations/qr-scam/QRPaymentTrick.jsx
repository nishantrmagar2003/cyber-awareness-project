import { useState, useEffect, useRef } from "react";

const T = {
  en: {
    moduleTag: "MODULE 5 · SIMULATION 2",
    title: "QR Payment Trick",
    subtitle: "The QR says 'Scan to receive money.' What happens?",

    // Intro
    introTitle: "💸 Scan to Receive Money?",
    introDesc: "A stranger says scanning their QR code will send you money. But in real payment apps, scanning a QR code means YOU pay — not receive.",
    startBtn: "Try the Simulation →",

    // Step 1 — the setup
    step1Tag: "Step 1 of 3",
    step1Title: "You receive a message...",
    msgFrom: "Unknown Number",
    msgTime: "Just now",
    msgLines: [
      "Hi! I need to send you Rs. 5,000.",
      "Just scan this QR code and the money will be in your account instantly! 🤑",
    ],
    qrLabel: "Scan to RECEIVE Rs. 5,000",
    scanBtn: "📷 Scan the QR Code",
    dontScanBtn: "🚫 Wait — Something's Off",

    // Step 2 — app opens
    step2Tag: "Step 2 of 3",
    step2Title: "Your payment app opens...",
    appName: "EasyPay",
    appSub: "Confirm Payment",
    payTo: "Pay To",
    payToName: "Unknown Merchant",
    amount: "Amount",
    amountVal: "Rs. 5,000",
    note: "Note",
    noteVal: "Transfer",
    warningText: "⚠️ This is a PAYMENT — not a receive!",
    confirmBtn: "✅ Confirm Payment",
    cancelBtn: "❌ Cancel — This is Wrong!",

    // Caught
    caughtTitle: "💸 Money Deducted!",
    caughtSub: "Rs. 5,000 was sent — not received.",
    caughtSteps: [
      { icon: "📩", title: "Fake Promise",       desc: "Scammer claimed scanning would receive money." },
      { icon: "📷", title: "You Scanned",         desc: "Scanning opened a payment — not a receive request." },
      { icon: "✅", title: "You Confirmed",        desc: "You tapped Confirm without reading the details." },
      { icon: "💸", title: "Rs. 5,000 Gone!",     desc: "Money left your account instantly. No refund." },
    ],
    lessonBad: {
      title: "⚠️ What you learned:",
      points: [
        "Scanning a QR code always initiates a PAYMENT from you",
        "You can NEVER receive money by scanning someone else's QR",
        "Always read the payment screen before confirming",
        "Verify who sent the QR before you scan anything",
      ],
    },

    // Escaped
    escapedTitle: "🛡️ You Stayed Safe!",
    escapedSub: "You noticed it was a payment — not a receive.",
    escapedSteps: [
      { icon: "📩", title: "Fake Promise",        desc: "Scammer claimed scanning would receive money." },
      { icon: "🔍", title: "You Checked",         desc: "You noticed the app showed PAYMENT, not receive." },
      { icon: "❌", title: "You Cancelled",       desc: "You cancelled before confirming anything." },
      { icon: "🛡️", title: "Money Safe!",         desc: "Not a single rupee left your account." },
    ],
    lessonGood: {
      title: "✅ What you learned:",
      points: [
        "Scanning a QR always means YOU pay — never receive",
        "You read the screen carefully before confirming",
        "Strangers asking you to scan are almost always scams",
        "Always verify the sender before scanning any QR",
      ],
    },

    // Warned (chose not to scan)
    warnedTitle: "🛡️ Smart — You Didn't Scan!",
    warnedDesc: "In real payment apps, scanning a QR always initiates a payment FROM you. No app sends money TO you when you scan.",
    warnedTip: "💡 To receive money, YOU share YOUR QR code — the sender scans it.",
    tryBtn: "Try Scanning Anyway →",

    retryBtn: "Try Again →",
    finishBtn: "✅ Finish",

    keyFacts: [
      { icon: "📤", text: "Scanning = YOU send money" },
      { icon: "📥", text: "To receive = share YOUR QR" },
      { icon: "🚫", text: "Strangers + QR = always suspicious" },
    ],
  },

  np: {
    moduleTag: "मड्युल ५ · सिमुलेसन २",
    title: "QR भुक्तानी चाल",
    subtitle: "QR मा लेखिएको छ 'स्क्यान गरेर पैसा पाउनुहोस्।' के हुन्छ?",

    introTitle: "💸 स्क्यान गरेर पैसा पाउने?",
    introDesc: "एक अपरिचित व्यक्ति भन्छ QR स्क्यान गर्दा तपाईंलाई पैसा आउँछ। तर वास्तवमा QR स्क्यान गर्दा तपाईंले पैसा पठाउनुहुन्छ — पाउनुहुन्न।",
    startBtn: "सिमुलेसन सुरु →",

    step1Tag: "चरण १ / ३",
    step1Title: "तपाईंलाई सन्देश आयो...",
    msgFrom: "अज्ञात नम्बर",
    msgTime: "अहिले",
    msgLines: [
      "नमस्ते! म तपाईंलाई रु. ५,००० पठाउन चाहन्छु।",
      "यो QR कोड स्क्यान गर्नुहोस्, पैसा तुरुन्तै तपाईंको खातामा आउँछ! 🤑",
    ],
    qrLabel: "रु. ५,००० पाउन स्क्यान गर्नुहोस्",
    scanBtn: "📷 QR कोड स्क्यान गर्नुहोस्",
    dontScanBtn: "🚫 रोक्नुहोस् — केही गडबड छ",

    step2Tag: "चरण २ / ३",
    step2Title: "तपाईंको भुक्तानी एप खुल्यो...",
    appName: "EasyPay",
    appSub: "भुक्तानी पुष्टि गर्नुहोस्",
    payTo: "भुक्तानी गर्ने",
    payToName: "अज्ञात व्यापारी",
    amount: "रकम",
    amountVal: "रु. ५,०००",
    note: "नोट",
    noteVal: "ट्रान्सफर",
    warningText: "⚠️ यो भुक्तानी हो — प्राप्ति होइन!",
    confirmBtn: "✅ भुक्तानी पुष्टि गर्नुहोस्",
    cancelBtn: "❌ रद्द गर्नुहोस् — यो गलत छ!",

    caughtTitle: "💸 पैसा काटियो!",
    caughtSub: "रु. ५,००० पठाइयो — आएन।",
    caughtSteps: [
      { icon: "📩", title: "नक्कली वाचा",         desc: "ठगले भन्यो स्क्यान गर्दा पैसा आउँछ।" },
      { icon: "📷", title: "तपाईंले स्क्यान गर्नुभयो", desc: "स्क्यानले प्राप्ति होइन — भुक्तानी खोल्यो।" },
      { icon: "✅", title: "तपाईंले पुष्टि गर्नुभयो",  desc: "विवरण नपढी कन्फर्म थिच्नुभयो।" },
      { icon: "💸", title: "रु. ५,००० गयो!",      desc: "पैसा तुरुन्तै खाताबाट गयो। फिर्ता हुँदैन।" },
    ],
    lessonBad: {
      title: "⚠️ तपाईंले के सिक्नुभयो:",
      points: [
        "QR स्क्यान गर्दा सधैं तपाईंले पैसा पठाउनुहुन्छ",
        "अरूको QR स्क्यान गरेर पैसा कहिल्यै आउँदैन",
        "पुष्टि गर्नु अघि भुक्तानी स्क्रिन ध्यानले पढ्नुहोस्",
        "कुनै पनि QR स्क्यान गर्नु अघि पठाउनेको पहिचान जाँच्नुहोस्",
      ],
    },

    escapedTitle: "🛡️ तपाईं सुरक्षित रहनुभयो!",
    escapedSub: "तपाईंले बुझ्नुभयो — यो भुक्तानी हो, प्राप्ति होइन।",
    escapedSteps: [
      { icon: "📩", title: "नक्कली वाचा",          desc: "ठगले भन्यो स्क्यान गर्दा पैसा आउँछ।" },
      { icon: "🔍", title: "तपाईंले जाँच्नुभयो",   desc: "एपले भुक्तानी देखाएको थाहा पाउनुभयो।" },
      { icon: "❌", title: "तपाईंले रद्द गर्नुभयो", desc: "पुष्टि नगरी रद्द गर्नुभयो।" },
      { icon: "🛡️", title: "पैसा सुरक्षित!",        desc: "एक रुपैयाँ पनि खाताबाट गएन।" },
    ],
    lessonGood: {
      title: "✅ तपाईंले के सिक्नुभयो:",
      points: [
        "QR स्क्यान = तपाईंले पठाउनुहुन्छ — पाउनुहुन्न",
        "स्क्रिन ध्यानले पढेर मात्र पुष्टि गर्नुभयो",
        "अपरिचितले QR स्क्यान गराउन खोज्नु = जालसाजी",
        "स्क्यान गर्नु अघि पठाउनेको पहिचान जाँच्नुहोस्",
      ],
    },

    warnedTitle: "🛡️ राम्रो — स्क्यान गर्नुभएन!",
    warnedDesc: "वास्तविक भुक्तानी एपमा QR स्क्यान गर्दा तपाईंले पैसा पठाउनुहुन्छ। कुनै एपले स्क्यान गर्दा तपाईंलाई पैसा पठाउँदैन।",
    warnedTip: "💡 पैसा पाउन — आफ्नो QR शेयर गर्नुहोस्। पठाउनेले स्क्यान गर्छ।",
    tryBtn: "फेरि पनि स्क्यान गरेर हेर्नुहोस् →",

    retryBtn: "फेरि प्रयास →",
    finishBtn: "✅ समाप्त",

    keyFacts: [
      { icon: "📤", text: "स्क्यान = तपाईंले पठाउनुहुन्छ" },
      { icon: "📥", text: "पाउन = आफ्नो QR शेयर गर्नुहोस्" },
      { icon: "🚫", text: "अपरिचित + QR = सधैं संदिग्ध" },
    ],
  },
};

/* ── QR SVG ───────────────────────────────────────── */
function QRCodeSVG({ danger }) {
  const cells = [
    [1,1,1,0,0,1,1,1,1],
    [1,0,1,1,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1],
    [1,1,1,0,0,0,1,1,1],
    [0,1,0,1,1,0,0,1,0],
    [1,0,1,0,1,1,1,0,0],
    [1,1,1,1,0,0,1,1,1],
    [0,0,0,1,1,0,0,1,0],
    [1,1,0,0,1,1,0,0,1],
  ];
  const size = 9, cell = 14, pad = 10, total = size * cell + pad * 2;
  const fill = danger ? "#b91c1c" : "#1e2a38";
  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} style={{ display:"block" }}>
      <rect width={total} height={total} rx="10" fill="#fff" stroke={danger?"#fca5a5":"#e2e8f0"} strokeWidth="2"/>
      {cells.map((row,r) => row.map((on,c) => on
        ? <rect key={`${r}-${c}`} x={pad+c*cell} y={pad+r*cell} width={cell-1} height={cell-1} rx="2" fill={fill}/>
        : null
      ))}
      {[[0,0],[0,6],[6,0]].map(([cr,cc],i)=>(
        <g key={i}>
          <rect x={pad+cc*cell-1} y={pad+cr*cell-1} width={cell*3+2} height={cell*3+2} rx="3" fill={fill}/>
          <rect x={pad+cc*cell+1} y={pad+cr*cell+1} width={cell*3-2} height={cell*3-2} rx="2" fill="#fff"/>
          <rect x={pad+cc*cell+3} y={pad+cr*cell+3} width={cell*3-6} height={cell*3-6} rx="1" fill={fill}/>
        </g>
      ))}
      <text x={total/2} y={total/2+6} textAnchor="middle" fontSize="20">{danger?"💸":"📱"}</text>
    </svg>
  );
}

/* ── Money Drain Animation ────────────────────────── */
function MoneyDrain() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => s < 4 ? s + 1 : s), 400);
    return () => clearInterval(id);
  }, []);
  const amounts = ["Rs. 5,000", "Rs. 5,000", "Rs. 5,000", "Rs. 5,000"];
  return (
    <div className="qp-drain-wrap">
      {amounts.map((a, i) => (
        <div key={i} className={`qp-drain-coin ${i < step ? "drain-fly" : ""}`}>💸 {a}</div>
      ))}
    </div>
  );
}

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
    <div className="qp-timeline">
      {steps.map((s, i) => (
        <div key={i} className={`qp-tl-item ${i < visible ? "qp-tl-visible" : ""} ${i === steps.length-1 ? (isBad?"qp-tl-final-bad":"qp-tl-final-good") : ""}`}>
          <div className="qp-tl-icon">{s.icon}</div>
          <div className="qp-tl-body">
            <div className="qp-tl-title">{s.title}</div>
            <div className="qp-tl-desc">{s.desc}</div>
          </div>
          {i < steps.length - 1 && <div className="qp-tl-connector"/>}
        </div>
      ))}
    </div>
  );
}

/* ── Lesson Box ───────────────────────────────────── */
function LessonBox({ lesson, isBad }) {
  return (
    <div className={`qp-lesson ${isBad?"qp-lesson-bad":"qp-lesson-good"}`}>
      <div className="qp-lesson-title">{lesson.title}</div>
      {lesson.points.map((pt, i) => (
        <div key={i} className="qp-lesson-row">
          <span>{isBad?"❌":"✅"}</span><span>{pt}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Finish Screen ────────────────────────────────── */
function FinishScreen({ t, onRetry }) {
  return (
    <div className="qp-finish-overlay qp-fade-in">
      <div className="qp-finish-box">
        <div className="qp-finish-icon">🎓</div>
        <div className="qp-finish-title">{t.moduleTag.includes("मड्युल") ? "सिमुलेसन सम्पन्न!" : "Simulation Complete!"}</div>
        <div className="qp-finish-desc">{t.moduleTag.includes("मड्युल") ? "तपाईंले QR भुक्तानी चालबारे जान्नुभयो।" : "You've learned how the QR payment trick works."}</div>
        <div className="qp-finish-facts">
          {t.keyFacts.map((f,i) => (
            <div key={i} className="qp-finish-fact">{f.icon} {f.text}</div>
          ))}
        </div>
        <button className="qp-btn qp-btn-outline" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function QRPaymentTrick({ attemptId, onComplete }) {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [showDrain, setShowDrain] = useState(false);
  const [finished, setFinished] = useState(false);
  const [done, setDone]         = useState(false);
  const startTime               = useRef(Date.now());
  const t = T[lang];

  function handleFinish() {
    if (done) return;
    setDone(true);
    const correctCount = scores.filter(Boolean).length;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    if (onComplete) onComplete({
      answers: { correctCount, total: scores.length, scores },
      score: Math.round((scores.filter(Boolean).length / Math.max(scores.length,1)) * 100),
      timeTaken,
    });
  }
  function reset(newLang) {
    setPhase("intro");
    setShowDrain(false);
    setFinished(false); setDone(false); startTime.current = Date.now();
    if (newLang) setLang(newLang);
  }

  function handleScan() { setPhase("payment"); }
  function handleDontScan() { setPhase("warned"); }
  function handleTryAnyway() { setPhase("payment"); }

  function handleConfirm() {
    setShowDrain(true);
    setTimeout(() => setPhase("caught"), 1800);
  }

  function handleCancel() { setPhase("escaped"); }

  return (
    <div className="qp-app">
      <style>{CSS}</style>

      {/* Lang bar */}
      <div className="qp-lang-bar">
        <div className="qp-lang-toggle">
          <button className={`qp-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`qp-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="qp-card" style={{ position:"relative" }}>

        {/* Header */}
        <div className="qp-header">
          <div className="qp-module-tag">{t.moduleTag}</div>
          <h1 className="qp-title">{t.title}</h1>
          <p className="qp-subtitle">{t.subtitle}</p>
        </div>
        <div className="qp-divider"/>

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div className="qp-fade-in">
            <div className="qp-intro-box">
              <div className="qp-intro-icon">💸</div>
              <div className="qp-intro-title">{t.introTitle}</div>
              <div className="qp-intro-desc">{t.introDesc}</div>
            </div>
            <div className="qp-key-facts">
              {t.keyFacts.map((f,i) => (
                <div key={i} className="qp-fact-row">
                  <span className="qp-fact-icon">{f.icon}</span>
                  <span className="qp-fact-text">{f.text}</span>
                </div>
              ))}
            </div>
            <button className="qp-btn qp-btn-primary" onClick={()=>setPhase("step1")}>{t.startBtn}</button>
          </div>
        )}

        {/* ── STEP 1: Message ── */}
        {phase === "step1" && (
          <div className="qp-fade-in">
            <div className="qp-step-tag">{t.step1Tag}</div>
            <div className="qp-phase-title">{t.step1Title}</div>

            {/* Chat bubble mockup */}
            <div className="qp-chat-wrap">
              <div className="qp-chat-header">
                <div className="qp-chat-avatar">👤</div>
                <div>
                  <div className="qp-chat-name">{t.msgFrom}</div>
                  <div className="qp-chat-time">{t.msgTime}</div>
                </div>
              </div>
              <div className="qp-chat-bubbles">
                {t.msgLines.map((line,i)=>(
                  <div key={i} className="qp-bubble">{line}</div>
                ))}
                {/* QR code in chat */}
                <div className="qp-bubble qp-bubble-qr">
                  <QRCodeSVG danger={false}/>
                  <div className="qp-qr-label">{t.qrLabel}</div>
                </div>
              </div>
            </div>

            <div className="qp-choice-row">
              <button className="qp-btn qp-btn-danger" onClick={handleScan}>{t.scanBtn}</button>
              <button className="qp-btn qp-btn-safe"   onClick={handleDontScan}>{t.dontScanBtn}</button>
            </div>
          </div>
        )}

        {/* ── WARNED ── */}
        {phase === "warned" && (
          <div className="qp-fade-in">
            <div className="qp-step-tag">{t.step1Tag}</div>
            <div className="qp-safe-banner">
              <span className="qp-safe-icon">🛡️</span>
              <div>
                <div className="qp-safe-title">{t.warnedTitle}</div>
                <div className="qp-safe-desc">{t.warnedDesc}</div>
              </div>
            </div>
            <div className="qp-tip-box">{t.warnedTip}</div>
            <div className="qp-btn-group">
              <button className="qp-btn qp-btn-outline" onClick={handleTryAnyway}>{t.tryBtn}</button>
              <button className="qp-btn qp-btn-primary" onClick={() => handleFinish()}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} onRetry={()=>reset()}/>}
          </div>
        )}

        {/* ── PAYMENT SCREEN ── */}
        {phase === "payment" && (
          <div className="qp-fade-in">
            <div className="qp-step-tag">{t.step2Tag}</div>
            <div className="qp-phase-title">{t.step2Title}</div>

            {/* Fake payment app */}
            <div className="qp-app-mock">
              <div className="qp-app-header">
                <span className="qp-app-logo">💳</span>
                <div>
                  <div className="qp-app-name">{t.appName}</div>
                  <div className="qp-app-sub">{t.appSub}</div>
                </div>
              </div>

              <div className="qp-pay-warning">{t.warningText}</div>

              <div className="qp-pay-qr-row">
                <QRCodeSVG danger={true}/>
                <div className="qp-pay-details">
                  <div className="qp-pay-row">
                    <span className="qp-pay-label">{t.payTo}</span>
                    <span className="qp-pay-val">{t.payToName}</span>
                  </div>
                  <div className="qp-pay-row">
                    <span className="qp-pay-label">{t.amount}</span>
                    <span className="qp-pay-amount">{t.amountVal}</span>
                  </div>
                  <div className="qp-pay-row">
                    <span className="qp-pay-label">{t.note}</span>
                    <span className="qp-pay-val">{t.noteVal}</span>
                  </div>
                </div>
              </div>

              {showDrain && <MoneyDrain/>}

              <div className="qp-pay-btn-row">
                <button className="qp-pay-confirm-btn" onClick={handleConfirm} disabled={showDrain}>
                  {t.confirmBtn}
                </button>
                <button className="qp-pay-cancel-btn" onClick={handleCancel} disabled={showDrain}>
                  {t.cancelBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CAUGHT ── */}
        {phase === "caught" && (
          <div className="qp-fade-in">
            <div className="qp-result-banner qp-result-bad">
              <div className="qp-result-emoji">💸</div>
              <div>
                <div className="qp-result-title">{t.caughtTitle}</div>
                <div className="qp-result-sub">{t.caughtSub}</div>
              </div>
            </div>
            <Timeline steps={t.caughtSteps} isBad={true}/>
            <LessonBox lesson={t.lessonBad} isBad={true}/>
            <div className="qp-btn-group">
              <button className="qp-btn qp-btn-outline" onClick={()=>reset()}>{t.retryBtn}</button>
              <button className="qp-btn qp-btn-primary" onClick={() => handleFinish()}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} onRetry={()=>reset()}/>}
          </div>
        )}

        {/* ── ESCAPED ── */}
        {phase === "escaped" && (
          <div className="qp-fade-in">
            <div className="qp-result-banner qp-result-good">
              <div className="qp-result-emoji">🛡️</div>
              <div>
                <div className="qp-result-title">{t.escapedTitle}</div>
                <div className="qp-result-sub">{t.escapedSub}</div>
              </div>
            </div>
            <Timeline steps={t.escapedSteps} isBad={false}/>
            <LessonBox lesson={t.lessonGood} isBad={false}/>
            <div className="qp-btn-group">
              <button className="qp-btn qp-btn-outline" onClick={()=>reset()}>{t.retryBtn}</button>
              <button className="qp-btn qp-btn-primary" onClick={() => handleFinish()}>{t.finishBtn}</button>
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

.qp-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

/* lang */
.qp-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.qp-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.qp-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.qp-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

/* card */
.qp-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}

/* header */
.qp-header{text-align:center;margin-bottom:20px}
.qp-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.qp-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.qp-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.qp-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}

/* intro */
.qp-intro-box{text-align:center;margin-bottom:20px}
.qp-intro-icon{font-size:48px;margin-bottom:10px}
.qp-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.qp-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}

.qp-key-facts{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.qp-fact-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.qp-fact-icon{font-size:20px;flex-shrink:0}
.qp-fact-text{font-size:14px;font-weight:700;color:var(--text)}

/* step tag */
.qp-step-tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:1.5px;color:#c2410c;background:#fff7ed;border:1.5px solid #fed7aa;border-radius:50px;padding:3px 12px;margin-bottom:12px;text-transform:uppercase}
.qp-phase-title{font-size:16px;font-weight:800;color:var(--text);margin-bottom:16px}

/* chat */
.qp-chat-wrap{background:#f0f4ff;border:2px solid #bfdbfe;border-radius:14px;overflow:hidden;margin-bottom:18px}
.qp-chat-header{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#fff;border-bottom:1.5px solid #bfdbfe}
.qp-chat-avatar{font-size:24px;width:38px;height:38px;background:#e2e8f0;border-radius:50%;display:flex;align-items:center;justify-content:center}
.qp-chat-name{font-size:13px;font-weight:800;color:var(--text)}
.qp-chat-time{font-size:11px;color:var(--muted)}
.qp-chat-bubbles{padding:14px 16px;display:flex;flex-direction:column;gap:8px}
.qp-bubble{background:#fff;border:1.5px solid #bfdbfe;border-radius:12px;border-bottom-left-radius:4px;padding:10px 14px;font-size:13px;color:var(--sub);line-height:1.5;max-width:90%}
.qp-bubble-qr{background:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px}
.qp-qr-label{font-size:12px;font-weight:800;color:var(--green);text-align:center}

/* choice */
.qp-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.qp-btn{padding:13px 16px;font-family:inherit;font-size:14px;font-weight:800;border-radius:10px;border:none;cursor:pointer;transition:var(--tr);width:100%;text-align:center;line-height:1.3}
.qp-btn:hover{transform:translateY(-2px)}
.qp-btn-primary{background:var(--blue);color:#fff;box-shadow:0 2px 10px rgba(59,130,246,.25)}
.qp-btn-primary:hover{background:#2563eb}
.qp-btn-danger{background:var(--red);color:#fff;box-shadow:0 2px 10px rgba(239,68,68,.25)}
.qp-btn-danger:hover{background:#dc2626}
.qp-btn-safe{background:var(--gl);color:#166534;border:2px solid var(--gb)}
.qp-btn-safe:hover{background:#dcfce7}
.qp-btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue)}
.qp-btn-outline:hover{background:#eff6ff}
.qp-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}

/* warned */
.qp-safe-banner{display:flex;align-items:flex-start;gap:14px;background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px;margin-bottom:14px}
.qp-safe-icon{font-size:30px;flex-shrink:0}
.qp-safe-title{font-size:15px;font-weight:800;color:#166534;margin-bottom:4px}
.qp-safe-desc{font-size:13px;color:#276749;line-height:1.5}
.qp-tip-box{font-size:13px;color:var(--sub);background:#f8fafc;border:1.5px solid var(--bdr);border-radius:8px;padding:10px 14px;margin-bottom:14px}

/* payment app mock */
.qp-app-mock{background:#f0f4ff;border:2px solid #bfdbfe;border-radius:14px;overflow:hidden;margin-bottom:4px}
.qp-app-header{display:flex;align-items:center;gap:12px;padding:14px 18px;background:#fff;border-bottom:1.5px solid #bfdbfe}
.qp-app-logo{font-size:26px}
.qp-app-name{font-size:15px;font-weight:800;color:var(--text)}
.qp-app-sub{font-size:12px;color:var(--muted)}
.qp-pay-warning{margin:14px 16px 0;padding:10px 14px;background:var(--rl);border:1.5px solid var(--rb);border-radius:8px;font-size:13px;font-weight:800;color:#b91c1c;text-align:center}
.qp-pay-qr-row{display:flex;gap:16px;padding:16px 18px;align-items:flex-start}
.qp-pay-details{flex:1;display:flex;flex-direction:column;gap:10px}
.qp-pay-row{display:flex;flex-direction:column;gap:2px}
.qp-pay-label{font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
.qp-pay-val{font-size:13px;font-weight:700;color:var(--text)}
.qp-pay-amount{font-size:22px;font-weight:800;color:var(--red)}
.qp-pay-btn-row{display:flex;flex-direction:column;gap:8px;padding:4px 16px 16px}
.qp-pay-confirm-btn{width:100%;padding:13px;font-family:inherit;font-size:14px;font-weight:800;background:var(--red);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.qp-pay-confirm-btn:hover:not(:disabled){background:#dc2626;transform:translateY(-1px)}
.qp-pay-confirm-btn:disabled{opacity:.5;cursor:not-allowed}
.qp-pay-cancel-btn{width:100%;padding:13px;font-family:inherit;font-size:14px;font-weight:800;background:var(--gl);color:#166534;border:2px solid var(--gb);border-radius:10px;cursor:pointer;transition:var(--tr)}
.qp-pay-cancel-btn:hover:not(:disabled){background:#dcfce7}
.qp-pay-cancel-btn:disabled{opacity:.5;cursor:not-allowed}

/* money drain */
.qp-drain-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 0 6px;overflow:hidden}
.qp-drain-coin{font-size:15px;font-weight:800;color:var(--red);opacity:0;transform:translateY(0);transition:all .4s ease}
.qp-drain-coin.drain-fly{opacity:1;animation:drainAnim .6s ease forwards}
@keyframes drainAnim{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(30px)}}

/* result banner */
.qp-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:14px;padding:18px 20px;border-width:2px;border-style:solid;margin-bottom:20px}
.qp-result-bad{background:var(--rl);border-color:var(--rb)}
.qp-result-good{background:var(--gl);border-color:var(--gb)}
.qp-result-emoji{font-size:36px;line-height:1;flex-shrink:0}
.qp-result-title{font-size:17px;font-weight:800;margin-bottom:4px}
.qp-result-bad  .qp-result-title{color:#b91c1c}
.qp-result-good .qp-result-title{color:#166534}
.qp-result-sub{font-size:13px}
.qp-result-bad  .qp-result-sub{color:#c53030}
.qp-result-good .qp-result-sub{color:#276749}

/* timeline */
.qp-timeline{display:flex;flex-direction:column;margin-bottom:20px}
.qp-tl-item{display:flex;align-items:flex-start;gap:14px;opacity:0;transform:translateX(-14px);transition:opacity .4s ease,transform .4s ease;position:relative}
.qp-tl-item.qp-tl-visible{opacity:1;transform:translateX(0)}
.qp-tl-icon{width:40px;height:40px;border-radius:50%;background:#f1f5f9;border:2px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;z-index:1}
.qp-tl-final-bad  .qp-tl-icon{background:var(--rl);border-color:var(--rb)}
.qp-tl-final-good .qp-tl-icon{background:var(--gl);border-color:var(--gb)}
.qp-tl-body{flex:1;padding:8px 0 16px}
.qp-tl-title{font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px}
.qp-tl-desc{font-size:12px;color:var(--sub);line-height:1.5}
.qp-tl-connector{position:absolute;left:19px;top:42px;width:2px;height:calc(100% - 20px);background:var(--bdr)}

/* lesson */
.qp-lesson{border-radius:14px;padding:18px 20px;margin-bottom:4px;border-width:2px;border-style:solid}
.qp-lesson-bad{background:var(--rl);border-color:var(--rb)}
.qp-lesson-good{background:var(--gl);border-color:var(--gb)}
.qp-lesson-title{font-size:14px;font-weight:800;margin-bottom:12px}
.qp-lesson-bad  .qp-lesson-title{color:#b91c1c}
.qp-lesson-good .qp-lesson-title{color:#166534}
.qp-lesson-row{display:flex;align-items:flex-start;gap:10px;font-size:13px;padding:5px 0;border-top:1px solid rgba(0,0,0,.06);line-height:1.45}
.qp-lesson-row:first-of-type{border-top:none}
.qp-lesson-bad  .qp-lesson-row{color:#7f1d1d}
.qp-lesson-good .qp-lesson-row{color:#14532d}

/* finish overlay */
.qp-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.qp-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.qp-finish-icon{font-size:50px;margin-bottom:12px}
.qp-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.qp-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.qp-finish-facts{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.qp-finish-fact{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}

/* animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.qp-fade-in{animation:fadeUp .35s ease}

@media(max-width:520px){
  .qp-card{padding:24px 18px}
  .qp-divider{margin:0 -18px 20px}
  .qp-choice-row,.qp-btn-group{grid-template-columns:1fr}
  .qp-result-banner{flex-direction:column;align-items:center;text-align:center}
  .qp-pay-qr-row{flex-direction:column;align-items:center}
}
`;
