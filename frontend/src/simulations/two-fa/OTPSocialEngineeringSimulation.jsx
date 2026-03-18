import { useState, useEffect, useRef } from "react";

/* ── Translations ─────────────────────────────────── */
const T = {
  en: {
    moduleTag: "MODULE 2 · SIMULATION 2",
    title: "OTP Social Engineering",
    subtitle: "A scammer pretends to be from your bank. What will you do?",

    // PHASE: setup — user gets an OTP
    setupTitle:   "You Just Logged In to SafeBank",
    setupDesc:    "A one-time password (OTP) was sent to your phone to verify your login.",
    yourOTP:      "Your OTP Code (keep this private!):",
    otpWarning:   "🔒 Never share this with anyone — not even bank staff.",
    nextBtn:      "Continue →",

    // PHASE: chat — fake scammer messages
    chatTitle:    "📱 Incoming Message",
    chatSubtitle: "You received an SMS from an unknown number",
    senderName:   "SafeBank Support",
    senderNum:    "+1-800-SAFE-BANK",
    messages: [
      { from: "scammer", text: "Hello! This is SafeBank Security Team. We have detected suspicious activity on your account." },
      { from: "scammer", text: "To protect your account, we need to verify your identity immediately." },
      { from: "scammer", text: "Please share the OTP code sent to your phone. This is URGENT!" },
    ],
    choicePrompt: "What will you do?",
    shareBtn:     "Share my OTP 😰",
    refuseBtn:    "Refuse & Hang Up 💪",

    // PHASE: shared — account taken over
    takenTitle:   "💀 Account Taken Over!",
    takenSub:     "You shared your OTP — the scammer now has full access.",
    attackSteps: [
      { icon: "📲", text: "You shared your OTP with the fake 'bank agent'." },
      { icon: "🔓", text: "Scammer used your OTP to log into your account." },
      { icon: "💸", text: "₹50,000 transferred out of your account instantly." },
      { icon: "🔒", text: "Your account password was changed — you're locked out!" },
    ],
    takenLesson: {
      title: "⚠️ What went wrong:",
      points: [
        "Real banks NEVER ask for your OTP over phone or SMS",
        "OTP = One-Time Password — only FOR YOU, never to share",
        "Urgency & fear are tricks scammers use to confuse you",
        "Always hang up and call your bank's official number",
      ],
    },
    tryAgainBtn: "Try Again — Refuse This Time →",

    // PHASE: refused — safe
    safeTitle:   "🛡️ You Stayed Safe!",
    safeSub:     "You refused to share your OTP — the scammer failed!",
    safeConvoExtra: [
      { from: "scammer", text: "Please, it is very urgent! Your account will be blocked if you don't share the OTP now!" },
      { from: "user",    text: "No! I will never share my OTP with anyone. I'm going to call my bank directly." },
      { from: "scammer", text: "Wait— " },
    ],
    safeSteps: [
      { icon: "🙅", text: "You refused to share your OTP with the stranger." },
      { icon: "📵", text: "You hung up the phone on the scammer." },
      { icon: "📞", text: "You called your bank's official number to verify." },
      { icon: "🛡️", text: "Your account is completely safe — scammer failed!" },
    ],
    safeLesson: {
      title: "✅ What you did right:",
      points: [
        "You remembered: banks NEVER ask for OTP",
        "You didn't panic — stayed calm under pressure",
        "OTP is only for YOU — no one else ever needs it",
        "Always verify by calling your bank's official number",
      ],
    },
    resetBtn:    "Start Over →",

    typingText:  "SafeBank Support is typing...",
    youLabel:    "You",
    refuseReply: "I will NOT share my OTP. Banks never ask for this!",
  },

  np: {
    moduleTag: "मड्युल २ · सिमुलेसन २",
    title: "OTP सामाजिक इन्जिनियरिङ",
    subtitle: "एक ठग तपाईंको बैंकको कर्मचारी बनेर आउँछ। तपाईं के गर्नुहुन्छ?",

    setupTitle:   "तपाईं सेफबैंकमा लगइन गर्नुभयो",
    setupDesc:    "तपाईंको लगइन प्रमाणित गर्न फोनमा एक-पटक पासवर्ड (OTP) पठाइयो।",
    yourOTP:      "तपाईंको OTP कोड (निजी राख्नुहोस्!):",
    otpWarning:   "🔒 यो कसैलाई नभन्नुहोस् — बैंक कर्मचारीलाई पनि होइन।",
    nextBtn:      "अगाडि बढ्नुहोस् →",

    chatTitle:    "📱 सन्देश आयो",
    chatSubtitle: "अज्ञात नम्बरबाट SMS आयो",
    senderName:   "सेफबैंक सपोर्ट",
    senderNum:    "+977-SAFE-BANK",
    messages: [
      { from: "scammer", text: "नमस्ते! म सेफबैंक सुरक्षा टोलीबाट बोल्दैछु। तपाईंको खातामा संदिग्ध गतिविधि देखियो।" },
      { from: "scammer", text: "तपाईंको खाता सुरक्षित गर्न हामीले तुरुन्त तपाईंको पहिचान प्रमाणित गर्नुपर्छ।" },
      { from: "scammer", text: "कृपया फोनमा आएको OTP कोड बताउनुहोस्। यो अत्यन्त जरुरी छ!" },
    ],
    choicePrompt: "तपाईं के गर्नुहुन्छ?",
    shareBtn:     "OTP बताउँछु 😰",
    refuseBtn:    "अस्वीकार गर्छु 💪",

    takenTitle:   "💀 खाता乗 भयो!",
    takenSub:     "तपाईंले OTP बताउनुभयो — ठगलाई पूर्ण पहुँच मिल्यो।",
    attackSteps: [
      { icon: "📲", text: "तपाईंले नक्कली 'बैंक एजेन्ट'लाई OTP बताउनुभयो।" },
      { icon: "🔓", text: "ठगले तपाईंको OTP प्रयोग गरेर खातामा लगइन गर्‍यो।" },
      { icon: "💸", text: "तपाईंको खाताबाट ₹५०,००० तुरुन्त ट्रान्सफर भयो।" },
      { icon: "🔒", text: "तपाईंको पासवर्ड बदलियो — तपाईं आफ्नै खाताबाट बाहिरिनुभयो!" },
    ],
    takenLesson: {
      title: "⚠️ के गलत भयो:",
      points: [
        "वास्तविक बैंकले कहिल्यै फोन वा SMS मा OTP सोध्दैन",
        "OTP = एक-पटक पासवर्ड — केवल तपाईंका लागि, कसैलाई नभन्नुहोस्",
        "हतार र डर ठगहरूले प्रयोग गर्ने चाल हो",
        "फोन काट्नुहोस् र बैंकको आधिकारिक नम्बरमा फोन गर्नुहोस्",
      ],
    },
    tryAgainBtn: "फेरि प्रयास गर्नुहोस् — यस पटक अस्वीकार गर्नुहोस् →",

    safeTitle:   "🛡️ तपाईं सुरक्षित हुनुहुन्छ!",
    safeSub:     "तपाईंले OTP बताउन अस्वीकार गर्नुभयो — ठग असफल भयो!",
    safeConvoExtra: [
      { from: "scammer", text: "कृपया, यो धेरै जरुरी छ! OTP नबताए तपाईंको खाता बन्द हुन्छ!" },
      { from: "user",    text: "होइन! म कसैलाई पनि OTP बताउँदिन। म बैंकमा सिधै फोन गर्छु।" },
      { from: "scammer", text: "रुक्नुहोस्—" },
    ],
    safeSteps: [
      { icon: "🙅", text: "तपाईंले अपरिचित व्यक्तिलाई OTP बताउन अस्वीकार गर्नुभयो।" },
      { icon: "📵", text: "तपाईंले फोन काट्नुभयो।" },
      { icon: "📞", text: "तपाईंले बैंकको आधिकारिक नम्बरमा फोन गरेर जाँच गर्नुभयो।" },
      { icon: "🛡️", text: "तपाईंको खाता पूर्णतः सुरक्षित छ — ठग असफल भयो!" },
    ],
    safeLesson: {
      title: "✅ तपाईंले सही के गर्नुभयो:",
      points: [
        "तपाईंलाई याद थियो: बैंकले कहिल्यै OTP सोध्दैन",
        "तपाईं घबराउनुभएन — दबाबमा शान्त रहनुभयो",
        "OTP केवल तपाईंका लागि — अरू कसैलाई चाहिँदैन",
        "बैंकको आधिकारिक नम्बरमा सधैं जाँच गर्नुहोस्",
      ],
    },
    resetBtn:    "सुरुदेखि गर्नुहोस् →",

    typingText:  "सेफबैंक सपोर्ट टाइप गर्दैछ...",
    youLabel:    "तपाईं",
    refuseReply: "म OTP बताउँदिन। बैंकले कहिल्यै यो सोध्दैन!",
  },
};

function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ── Typing bubble ────────────────────────────────── */
function TypingBubble({ text }) {
  return (
    <div className="otp-msg otp-msg-scammer">
      <div className="otp-avatar scammer-avatar">🏦</div>
      <div className="otp-bubble scammer-bubble typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/* ── Chat message ─────────────────────────────────── */
function ChatMsg({ msg, label }) {
  const isUser = msg.from === "user";
  return (
    <div className={`otp-msg ${isUser ? "otp-msg-user" : "otp-msg-scammer"}`}>
      {!isUser && <div className="otp-avatar scammer-avatar">🏦</div>}
      <div className={`otp-bubble ${isUser ? "user-bubble" : "scammer-bubble"}`}>
        {msg.text}
      </div>
      {isUser && <div className="otp-avatar user-avatar">👤</div>}
    </div>
  );
}

/* ── Attack/safe timeline ─────────────────────────── */
function Timeline({ steps, onDone }) {
  const [visible, setVisible] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (visible < steps.length) {
      const t = setTimeout(() => setVisible(v => v + 1), 750);
      return () => clearTimeout(t);
    } else if (!done.current) {
      done.current = true;
      setTimeout(onDone, 400);
    }
  }, [visible, steps.length]);
  return (
    <div className="otp-timeline">
      {steps.map((s, i) => (
        <div key={i} className={`otp-tl-row ${i < visible ? "show" : ""}`}>
          <div className="otp-tl-icon">{s.icon}</div>
          <div className="otp-tl-text">{s.text}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function OTPSocialEngineering() {
  const [lang, setLang]   = useState("en");
  const [phase, setPhase] = useState("setup");
  // phases: setup → chat → choice → shared/refused → result
  const [otp]             = useState(genOTP);
  const [chatIdx, setChatIdx]     = useState(0);
  const [isTyping, setIsTyping]   = useState(false);
  const [choice, setChoice]       = useState(null); // "share" | "refuse"
  const [extraIdx, setExtraIdx]   = useState(0);
  const [timelineDone, setTimelineDone] = useState(false);
  const chatRef = useRef(null);
  const t = T[lang];

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatIdx, isTyping, extraIdx]);

  // Drive chat messages one by one
  useEffect(() => {
    if (phase !== "chat") return;
    if (chatIdx >= t.messages.length) return;
    setIsTyping(true);
    const delay = t.messages[chatIdx].text.length * 28 + 600;
    const t1 = setTimeout(() => {
      setIsTyping(false);
      setChatIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(t1);
  }, [phase, chatIdx, lang]);

  // Drive extra convo after "refuse" choice
  useEffect(() => {
    if (phase !== "extra-convo") return;
    if (extraIdx >= t.safeConvoExtra.length) {
      setTimeout(() => setPhase("result-safe"), 600);
      return;
    }
    const msg = t.safeConvoExtra[extraIdx];
    const delay = msg.from === "scammer" ? msg.text.length * 25 + 700 : 900;
    const tm = setTimeout(() => setExtraIdx(i => i + 1), delay);
    return () => clearTimeout(tm);
  }, [phase, extraIdx, lang]);

  function handleChoice(c) {
    setChoice(c);
    if (c === "share") {
      setPhase("result-taken");
    } else {
      setPhase("extra-convo");
    }
  }

  function reset() {
    setPhase("setup");
    setChatIdx(0);
    setIsTyping(false);
    setChoice(null);
    setExtraIdx(0);
    setTimelineDone(false);
  }

  // Re-drive chat on lang change
  useEffect(() => {
    if (phase === "chat") {
      setChatIdx(0);
      setIsTyping(false);
    }
  }, [lang]);

  const shownMessages = t.messages.slice(0, chatIdx);
  const allChatShown  = chatIdx >= t.messages.length && !isTyping;

  return (
    <div className="otp-app">
      <style>{CSS}</style>

      {/* Lang bar */}
      <div className="otp-lang-bar">
        <div className="otp-lang-toggle">
          <button className={`otp-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>🇬🇧 English</button>
          <button className={`otp-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => setLang("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="otp-card">

        {/* Header */}
        <div className="otp-header">
          <div className="otp-module-tag">{t.moduleTag}</div>
          <h1 className="otp-title">{t.title}</h1>
          <p className="otp-subtitle">{t.subtitle}</p>
        </div>

        <div className="otp-divider" />

        {/* ── SETUP PHASE ── */}
        {phase === "setup" && (
          <div className="otp-fade-in">
            <div className="otp-setup-box">
              <div className="otp-setup-icon">🏦</div>
              <div className="otp-setup-title">{t.setupTitle}</div>
              <div className="otp-setup-desc">{t.setupDesc}</div>
            </div>

            {/* Simulated phone showing OTP */}
            <div className="otp-phone-card">
              <div className="otp-phone-header">
                <span>📱</span>
                <span className="otp-phone-label">SMS MESSAGE</span>
              </div>
              <div className="otp-phone-from">SafeBank · Just now</div>
              <div className="otp-phone-body">{t.yourOTP}</div>
              <div className="otp-code-display">{otp}</div>
              <div className="otp-phone-warning">{t.otpWarning}</div>
            </div>

            <button className="otp-next-btn" onClick={() => setPhase("chat")}>{t.nextBtn}</button>
          </div>
        )}

        {/* ── CHAT PHASE ── */}
        {(phase === "chat" || phase === "extra-convo") && (
          <div className="otp-fade-in">
            {/* Chat header */}
            <div className="otp-chat-header">
              <div className="otp-chat-avatar">🏦</div>
              <div>
                <div className="otp-chat-name">{t.senderName}</div>
                <div className="otp-chat-num">{t.senderNum}</div>
              </div>
              <div className="otp-chat-warning-tag">⚠️ Unknown</div>
            </div>

            {/* Chat window */}
            <div className="otp-chat-window" ref={chatRef}>
              <div className="otp-chat-date">{t.chatTitle}</div>

              {/* Initial messages */}
              {shownMessages.map((msg, i) => (
                <ChatMsg key={i} msg={msg} label={t.youLabel} />
              ))}

              {/* Typing indicator for initial messages */}
              {phase === "chat" && isTyping && <TypingBubble text={t.typingText} />}

              {/* User's choice reply + extra convo */}
              {choice === "refuse" && (
                <ChatMsg msg={{ from: "user", text: t.refuseReply }} label={t.youLabel} />
              )}
              {phase === "extra-convo" && t.safeConvoExtra.slice(0, extraIdx).map((msg, i) => (
                <ChatMsg key={"extra-" + i} msg={msg} label={t.youLabel} />
              ))}
              {phase === "extra-convo" && extraIdx < t.safeConvoExtra.length && (
                <TypingBubble text={t.typingText} />
              )}
            </div>

            {/* Choice buttons */}
            {phase === "chat" && allChatShown && !choice && (
              <div className="otp-fade-in">
                <div className="otp-choice-prompt">{t.choicePrompt}</div>
                <div className="otp-choice-row">
                  <button className="otp-choice-btn btn-danger" onClick={() => handleChoice("share")}>
                    <span className="otp-choice-icon">😰</span>
                    <span className="otp-choice-label">{t.shareBtn}</span>
                    <span className="otp-choice-sub">Share the code: {otp}</span>
                  </button>
                  <button className="otp-choice-btn btn-safe" onClick={() => handleChoice("refuse")}>
                    <span className="otp-choice-icon">💪</span>
                    <span className="otp-choice-label">{t.refuseBtn}</span>
                    <span className="otp-choice-sub">Never share OTP!</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULT: TAKEN ── */}
        {phase === "result-taken" && (
          <div className="otp-fade-in">
            <div className="otp-result-banner banner-taken">
              <div className="otp-result-emoji">💀</div>
              <div>
                <div className="otp-result-title">{t.takenTitle}</div>
                <div className="otp-result-sub">{t.takenSub}</div>
              </div>
            </div>
            <Timeline steps={t.attackSteps} onDone={() => setTimelineDone(true)} />
            {timelineDone && (
              <div className="otp-fade-in">
                <div className="otp-lesson-box lesson-danger">
                  <div className="otp-lesson-title">{t.takenLesson.title}</div>
                  {t.takenLesson.points.map((p, i) => (
                    <div key={i} className="otp-lesson-row"><span>❌</span><span>{p}</span></div>
                  ))}
                </div>
                <button className="otp-action-btn btn-red" onClick={() => { reset(); setTimeout(() => setPhase("chat"), 50); }}>
                  {t.tryAgainBtn}
                </button>
                <button className="otp-back-btn" onClick={reset}>{t.resetBtn}</button>
              </div>
            )}
          </div>
        )}

        {/* ── RESULT: SAFE ── */}
        {phase === "result-safe" && (
          <div className="otp-fade-in">
            <div className="otp-result-banner banner-safe">
              <div className="otp-result-emoji">🛡️</div>
              <div>
                <div className="otp-result-title">{t.safeTitle}</div>
                <div className="otp-result-sub">{t.safeSub}</div>
              </div>
            </div>
            <Timeline steps={t.safeSteps} onDone={() => setTimelineDone(true)} />
            {timelineDone && (
              <div className="otp-fade-in">
                <div className="otp-lesson-box lesson-success">
                  <div className="otp-lesson-title">{t.safeLesson.title}</div>
                  {t.safeLesson.points.map((p, i) => (
                    <div key={i} className="otp-lesson-row"><span>✅</span><span>{p}</span></div>
                  ))}
                </div>
                <button className="otp-action-btn btn-green" onClick={reset}>{t.resetBtn}</button>
              </div>
            )}
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
  --bg: #eef2f7; --card: #fff; --bdr: #dde3ec;
  --text: #1e2a38; --sub: #64748b; --muted: #a0aec0;
  --blue: #3b82f6; --red: #ef4444; --rl: #fff5f5; --rb: #fca5a5;
  --green: #22c55e; --gl: #f0fdf4; --gb: #86efac;
  --r: 16px; --sh: 0 6px 32px rgba(30,42,56,.10);
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.otp-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

/* lang */
.otp-lang-bar{display:flex;justify-content:flex-end;max-width:620px;margin:0 auto 16px}
.otp-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.otp-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:all .25s}
.otp-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

/* card */
.otp-card{background:var(--card);border-radius:var(--r);max-width:620px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}

/* header */
.otp-header{text-align:center;margin-bottom:20px}
.otp-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.otp-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.otp-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.otp-divider{height:1px;background:var(--bdr);margin:16px -32px 24px}

/* setup */
.otp-setup-box{text-align:center;margin-bottom:22px}
.otp-setup-icon{font-size:48px;margin-bottom:12px}
.otp-setup-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.otp-setup-desc{font-size:14px;color:var(--sub);line-height:1.6}

/* phone card */
.otp-phone-card{background:linear-gradient(135deg,#1a2535,#253447);border-radius:18px;padding:22px;margin-bottom:22px;box-shadow:0 10px 32px rgba(0,0,0,.22)}
.otp-phone-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.otp-phone-label{font-size:10px;font-weight:800;color:#64748b;letter-spacing:2px;text-transform:uppercase}
.otp-phone-from{font-size:12px;color:#64748b;margin-bottom:12px}
.otp-phone-body{font-size:13px;color:#94a3b8;margin-bottom:10px;text-align:center}
.otp-code-display{font-size:48px;font-weight:800;color:#00e5ff;letter-spacing:10px;font-family:monospace;text-align:center;text-shadow:0 0 24px rgba(0,229,255,.55);margin-bottom:12px}
.otp-phone-warning{font-size:12px;color:#f59e0b;text-align:center;background:rgba(245,158,11,.10);border-radius:8px;padding:8px 12px;border:1px solid rgba(245,158,11,.25)}

.otp-next-btn{width:100%;padding:13px;font-family:inherit;font-size:15px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:all .2s}
.otp-next-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}

/* chat UI */
.otp-chat-header{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:12px;margin-bottom:12px}
.otp-chat-avatar{font-size:28px;line-height:1}
.otp-chat-name{font-size:15px;font-weight:800;color:var(--text)}
.otp-chat-num{font-size:12px;color:var(--muted)}
.otp-chat-warning-tag{margin-left:auto;background:#fff7ed;border:1.5px solid #fed7aa;color:#c2410c;font-size:11px;font-weight:800;padding:4px 10px;border-radius:50px}

.otp-chat-window{background:#f0f4f8;border-radius:14px;padding:16px;min-height:200px;max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;margin-bottom:16px;scroll-behavior:smooth}
.otp-chat-date{text-align:center;font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;background:#e2e8f0;border-radius:50px;padding:3px 12px;align-self:center}

/* messages */
.otp-msg{display:flex;align-items:flex-end;gap:8px}
.otp-msg-scammer{justify-content:flex-start}
.otp-msg-user{justify-content:flex-end}
.otp-avatar{font-size:22px;line-height:1;flex-shrink:0}
.otp-bubble{max-width:72%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;font-weight:600}
.scammer-bubble{background:#fff;border:1.5px solid var(--bdr);color:var(--text);border-bottom-left-radius:4px}
.user-bubble{background:var(--blue);color:#fff;border-bottom-right-radius:4px}

/* typing */
.typing-bubble{display:flex;align-items:center;gap:5px;padding:12px 16px}
.typing-dot{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:typingBounce 1.2s ease infinite}
.typing-dot:nth-child(2){animation-delay:.2s}
.typing-dot:nth-child(3){animation-delay:.4s}
@keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

/* choice */
.otp-choice-prompt{font-size:15px;font-weight:800;color:var(--text);text-align:center;margin-bottom:14px}
.otp-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.otp-choice-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 12px;border-radius:14px;border:2px solid;cursor:pointer;transition:all .25s;background:#f8fafc}
.otp-choice-btn:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.10)}
.btn-danger{border-color:var(--rb)}.btn-danger:hover{background:var(--rl)}
.btn-safe{border-color:var(--gb)}.btn-safe:hover{background:var(--gl)}
.otp-choice-icon{font-size:32px;line-height:1}
.otp-choice-label{font-size:14px;font-weight:800;color:var(--text);text-align:center}
.otp-choice-sub{font-size:11px;color:var(--muted);text-align:center}

/* result */
.otp-result-banner{display:flex;align-items:flex-start;gap:16px;border-radius:14px;padding:20px 22px;margin-bottom:20px;border-width:2px;border-style:solid}
.banner-taken{background:var(--rl);border-color:var(--rb)}
.banner-safe{background:var(--gl);border-color:var(--gb)}
.otp-result-emoji{font-size:40px;line-height:1;flex-shrink:0}
.otp-result-title{font-size:18px;font-weight:800;margin-bottom:4px}
.banner-taken .otp-result-title{color:#b91c1c}
.banner-safe  .otp-result-title{color:#166534}
.otp-result-sub{font-size:13px;line-height:1.5}
.banner-taken .otp-result-sub{color:#c53030}
.banner-safe  .otp-result-sub{color:#276749}

/* timeline */
.otp-timeline{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.otp-tl-row{display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;background:#f8fafc;border:1.5px solid var(--bdr);opacity:0;transform:translateX(-14px);transition:opacity .4s,transform .4s}
.otp-tl-row.show{opacity:1;transform:translateX(0)}
.otp-tl-icon{font-size:26px;flex-shrink:0}
.otp-tl-text{font-size:14px;color:var(--sub);font-weight:600;line-height:1.4}

/* lesson */
.otp-lesson-box{border-radius:14px;padding:20px 22px;margin-bottom:20px;border-width:2px;border-style:solid}
.lesson-danger{background:#fff5f5;border-color:var(--rb)}
.lesson-success{background:var(--gl);border-color:var(--gb)}
.otp-lesson-title{font-size:14px;font-weight:800;margin-bottom:12px}
.lesson-danger  .otp-lesson-title{color:#b91c1c}
.lesson-success .otp-lesson-title{color:#166534}
.otp-lesson-row{display:flex;gap:10px;align-items:flex-start;padding:4px 0;font-size:13px;line-height:1.5}
.lesson-danger  .otp-lesson-row{color:#7f1d1d}
.lesson-success .otp-lesson-row{color:#14532d}

/* buttons */
.otp-action-btn{width:100%;padding:13px 20px;font-family:inherit;font-size:14px;font-weight:800;border:none;border-radius:10px;cursor:pointer;transition:all .2s;margin-bottom:10px}
.btn-red{background:var(--red);color:#fff}.btn-red:hover{background:#dc2626;transform:translateY(-1px);box-shadow:0 4px 16px rgba(239,68,68,.3)}
.btn-green{background:var(--green);color:#fff}.btn-green:hover{background:#16a34a;transform:translateY(-1px);box-shadow:0 4px 16px rgba(34,197,94,.3)}
.otp-back-btn{background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:block;margin-top:4px;width:100%;text-align:center}
.otp-back-btn:hover{color:var(--text)}

/* animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.otp-fade-in{animation:fadeUp .4s ease}

@media(max-width:500px){
  .otp-card{padding:24px 18px}
  .otp-divider{margin:16px -18px 20px}
  .otp-choice-row{grid-template-columns:1fr}
  .otp-result-banner{flex-direction:column;align-items:center;text-align:center}
  .otp-code-display{font-size:36px;letter-spacing:6px}
}
`;