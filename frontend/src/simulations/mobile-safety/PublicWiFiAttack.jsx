import { useState, useEffect } from "react";

const T = {
  en: {
    moduleTag: "MODULE 7 · SIMULATION 2",
    title: "Public WiFi Attack",
    subtitle: "You found free WiFi. What could go wrong?",
    introTitle: "📡 Free WiFi Is Not Always Safe",
    introDesc: "Hackers create fake hotspots or intercept data on public networks. One login on public WiFi can expose everything.",
    startBtn: "Start →",
    finishBtn: "✅ Finish",
    retryBtn: "Try Again →",

    step1Tag: "Step 1 of 3",
    step1Title: "You're at a café...",
    wifiList: "Available Networks",
    networks: [
      { name: "CafeWiFi_Free", bars: 4, secured: false, fake: true  },
      { name: "CafeNet_5G",    bars: 2, secured: true,  fake: false },
      { name: "Free_Public",   bars: 5, secured: false, fake: true  },
    ],
    connectPrompt: "Which network do you connect to?",
    connectedMsg: (n) => `Connected to ${n}`,
    step1Tip: "💡 Unsecured networks (no 🔒) can be monitored by anyone nearby.",

    step2Tag: "Step 2 of 3",
    step2Title: "You're online. What do you do?",
    activities: [
      { id: "bank",   icon: "🏦", label: "Log in to internet banking" },
      { id: "browse", icon: "🌐", label: "Browse news websites" },
      { id: "vpn",    icon: "🛡️", label: "Turn on VPN first, then browse" },
    ],

    // Intercepted outcome
    interceptedTitle: "🚨 Data Intercepted!",
    interceptedSub: "A hacker on the same network captured your login.",
    interceptedSteps: [
      { icon: "📡", title: "Fake Hotspot",         desc: "The WiFi network was set up by a hacker nearby — a 'Man-in-the-Middle' attack." },
      { icon: "👀", title: "Traffic Monitored",     desc: "All data you send over this network passes through the hacker's device first." },
      { icon: "🏦", title: "Login Captured",        desc: "Your bank username and password were recorded in plain text." },
      { icon: "💸", title: "Account Compromised!",  desc: "Hacker now has full access to your bank account." },
    ],
    lessonBad: {
      title: "⚠️ What you learned:",
      points: [
        "Never log in to banking or email on public WiFi",
        "Unsecured networks expose all your traffic",
        "Hackers create fake hotspots named 'Free_WiFi'",
        "Always use a VPN on public networks",
      ],
    },

    // Safe outcome
    safeTitle: "🛡️ You Stayed Safe!",
    safeSub: "You made a smart decision on public WiFi.",
    safeSteps: [
      { icon: "📡", title: "Public Network Risk",   desc: "This unsecured network could be monitored by anyone." },
      { icon: "🌐", title: "Safe Activity",          desc: "Browsing public websites doesn't expose sensitive credentials." },
      { icon: "🛡️", title: "VPN Protected",         desc: "A VPN encrypts all your traffic — even on a compromised network." },
      { icon: "✅", title: "Data Safe!",             desc: "No sensitive information was exposed." },
    ],
    lessonGood: {
      title: "✅ What you learned:",
      points: [
        "Public WiFi is risky — avoid sensitive logins",
        "Browsing public content is lower risk",
        "A VPN encrypts your data on any network",
        "Always prefer mobile data for banking",
      ],
    },

    tipsTitle: "📡 Public WiFi Safety Rules",
    tips: [
      { icon: "🚫", tip: "Never bank on public WiFi" },
      { icon: "🛡️", tip: "Use a trusted VPN always" },
      { icon: "🔒", tip: "Prefer secured (🔒) networks" },
      { icon: "📱", tip: "Use mobile data for sensitive tasks" },
    ],
  },
  np: {
    moduleTag: "मड्युल ७ · सिमुलेसन २",
    title: "सार्वजनिक WiFi आक्रमण",
    subtitle: "तपाईंले निःशुल्क WiFi भेट्टाउनुभयो। के गलत हुन सक्छ?",
    introTitle: "📡 निःशुल्क WiFi सधैं सुरक्षित हुँदैन",
    introDesc: "ह्याकरहरू नक्कली हटस्पट बनाउँछन् वा सार्वजनिक नेटवर्कमा डेटा अवरोध गर्छन्। एउटा लगइनले सबै कुरा उजागर गर्न सक्छ।",
    startBtn: "सुरु →",
    finishBtn: "✅ समाप्त",
    retryBtn: "फेरि प्रयास →",

    step1Tag: "चरण १ / ३",
    step1Title: "तपाईं क्याफेमा हुनुहुन्छ...",
    wifiList: "उपलब्ध नेटवर्कहरू",
    networks: [
      { name: "CafeWiFi_Free", bars: 4, secured: false, fake: true  },
      { name: "CafeNet_5G",    bars: 2, secured: true,  fake: false },
      { name: "Free_Public",   bars: 5, secured: false, fake: true  },
    ],
    connectPrompt: "तपाईं कुन नेटवर्कमा जडान गर्नुहुन्छ?",
    connectedMsg: (n) => `${n} मा जडान भयो`,
    step1Tip: "💡 असुरक्षित नेटवर्क (🔒 छैन) नजिकैको जो कोहीले निगरानी गर्न सक्छ।",

    step2Tag: "चरण २ / ३",
    step2Title: "तपाईं अनलाइन हुनुहुन्छ। के गर्नुहुन्छ?",
    activities: [
      { id: "bank",   icon: "🏦", label: "इन्टरनेट बैंकिङमा लगइन गर्नुहोस्" },
      { id: "browse", icon: "🌐", label: "समाचार वेबसाइट ब्राउज गर्नुहोस्" },
      { id: "vpn",    icon: "🛡️", label: "पहिले VPN चालु गर्नुहोस्, त्यसपछि ब्राउज" },
    ],

    interceptedTitle: "🚨 डेटा अवरोध गरियो!",
    interceptedSub: "एउटा ह्याकरले तपाईंको लगइन कैद गर्यो।",
    interceptedSteps: [
      { icon: "📡", title: "नक्कली हटस्पट",        desc: "नजिकैको ह्याकरले WiFi नेटवर्क बनाएको थियो — 'म्यान-इन-द-मिडल' आक्रमण।" },
      { icon: "👀", title: "ट्राफिक निगरानी",      desc: "तपाईंले पठाएको सबै डेटा पहिले ह्याकरको उपकरणबाट जान्छ।" },
      { icon: "🏦", title: "लगइन कैद भयो",         desc: "तपाईंको बैंक प्रयोगकर्ता नाम र पासवर्ड सादा पाठमा रेकर्ड भयो।" },
      { icon: "💸", title: "खाता कम्प्रमाइज!",     desc: "ह्याकरले अब तपाईंको बैंक खाता पूर्ण रूपमा नियन्त्रण गर्छ।" },
    ],
    lessonBad: {
      title: "⚠️ तपाईंले के सिक्नुभयो:",
      points: [
        "सार्वजनिक WiFi मा बैंकिङ वा इमेल कहिल्यै लगइन नगर्नुहोस्",
        "असुरक्षित नेटवर्कले सबै ट्राफिक उजागर गर्छ",
        "ह्याकरहरू 'Free_WiFi' नामक नक्कली हटस्पट बनाउँछन्",
        "सार्वजनिक नेटवर्कमा सधैं VPN प्रयोग गर्नुहोस्",
      ],
    },

    safeTitle: "🛡️ तपाईं सुरक्षित रहनुभयो!",
    safeSub: "तपाईंले सार्वजनिक WiFi मा सही निर्णय गर्नुभयो।",
    safeSteps: [
      { icon: "📡", title: "सार्वजनिक नेटवर्क जोखिम", desc: "यो असुरक्षित नेटवर्क जो कोहीले निगरानी गर्न सक्थ्यो।" },
      { icon: "🌐", title: "सुरक्षित गतिविधि",          desc: "सार्वजनिक वेबसाइट ब्राउज गर्दा संवेदनशील प्रमाणपत्र उजागर हुँदैन।" },
      { icon: "🛡️", title: "VPN सुरक्षित",              desc: "VPN ले सबै ट्राफिक एन्क्रिप्ट गर्छ — कम्प्रमाइज नेटवर्कमा पनि।" },
      { icon: "✅", title: "डेटा सुरक्षित!",             desc: "कुनै संवेदनशील जानकारी उजागर भएन।" },
    ],
    lessonGood: {
      title: "✅ तपाईंले के सिक्नुभयो:",
      points: [
        "सार्वजनिक WiFi जोखिमपूर्ण छ — संवेदनशील लगइन नगर्नुहोस्",
        "सार्वजनिक सामग्री ब्राउज गर्नु कम जोखिमपूर्ण छ",
        "VPN ले जुनसुकै नेटवर्कमा डेटा एन्क्रिप्ट गर्छ",
        "बैंकिङका लागि सधैं मोबाइल डेटा प्रयोग गर्नुहोस्",
      ],
    },

    tipsTitle: "📡 सार्वजनिक WiFi सुरक्षा नियमहरू",
    tips: [
      { icon: "🚫", tip: "सार्वजनिक WiFi मा बैंकिङ नगर्नुहोस्" },
      { icon: "🛡️", tip: "विश्वसनीय VPN सधैं प्रयोग गर्नुहोस्" },
      { icon: "🔒", tip: "सुरक्षित (🔒) नेटवर्क रोज्नुहोस्" },
      { icon: "📱", tip: "संवेदनशील कामका लागि मोबाइल डेटा प्रयोग गर्नुहोस्" },
    ],
  },
};

function SignalBars({ bars }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:16 }}>
      {[1,2,3,4,5].map(b => (
        <div key={b} style={{ width:4, height: b*3+1, borderRadius:2, background: b<=bars ? "#3b82f6" : "#e2e8f0" }}/>
      ))}
    </div>
  );
}

function Timeline({ steps, isBad }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible < steps.length) {
      const id = setTimeout(() => setVisible(v=>v+1), 750);
      return () => clearTimeout(id);
    }
  }, [visible, steps.length]);
  return (
    <div className="pw-timeline">
      {steps.map((s,i) => (
        <div key={i} className={`pw-tl-item ${i<visible?"pw-tl-vis":""} ${i===steps.length-1?(isBad?"pw-tl-bad":"pw-tl-good"):""}`}>
          <div className="pw-tl-icon">{s.icon}</div>
          <div className="pw-tl-body">
            <div className="pw-tl-title">{s.title}</div>
            <div className="pw-tl-desc">{s.desc}</div>
          </div>
          {i<steps.length-1 && <div className="pw-tl-line"/>}
        </div>
      ))}
    </div>
  );
}

function LessonBox({ lesson, isBad }) {
  return (
    <div className={`pw-lesson ${isBad?"pw-lesson-bad":"pw-lesson-good"}`}>
      <div className="pw-lesson-title">{lesson.title}</div>
      {lesson.points.map((p,i) => (
        <div key={i} className="pw-lesson-row"><span>{isBad?"❌":"✅"}</span><span>{p}</span></div>
      ))}
    </div>
  );
}

function FinishScreen({ t, onRetry }) {
  const isNp = t.moduleTag.includes("मड्युल");
  return (
    <div className="pw-finish-overlay pw-fade-in">
      <div className="pw-finish-box">
        <div style={{ fontSize:50, marginBottom:12 }}>🎓</div>
        <div className="pw-finish-title">{isNp?"सिमुलेसन सम्पन्न!":"Simulation Complete!"}</div>
        <div className="pw-finish-desc">{isNp?"तपाईंले सार्वजनिक WiFi जोखिम जान्नुभयो।":"You've learned about public WiFi dangers."}</div>
        <div className="pw-finish-tips">
          {t.tips.map((tip,i) => <div key={i} className="pw-finish-tip">{tip.icon} {tip.tip}</div>)}
        </div>
        <button className="pw-btn pw-btn-outline" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

export default function PublicWiFiAttack() {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [network, setNetwork]   = useState(null);
  const [activity, setActivity] = useState(null);
  const [outcome, setOutcome]   = useState(null);
  const [finished, setFinished] = useState(false);
  const t = T[lang];

  function reset(nl) { setPhase("intro"); setNetwork(null); setActivity(null); setOutcome(null); setFinished(false); if(nl) setLang(nl); }

  function handleNetwork(n) { setNetwork(n); setPhase("step2"); }

  function handleActivity(a) {
    setActivity(a);
    const isBad = a === "bank";
    const isGood = a === "browse" || a === "vpn";
    setOutcome(isBad ? "intercepted" : "safe");
    setPhase("result");
  }

  const isBad = outcome === "intercepted";

  return (
    <div className="pw-app">
      <style>{CSS}</style>
      <div className="pw-lang-bar">
        <div className="pw-lang-toggle">
          <button className={`pw-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`pw-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>
      <div className="pw-card" style={{position:"relative"}}>
        <div className="pw-header">
          <div className="pw-module-tag">{t.moduleTag}</div>
          <h1 className="pw-title">{t.title}</h1>
          <p className="pw-subtitle">{t.subtitle}</p>
        </div>
        <div className="pw-divider"/>

        {phase==="intro" && (
          <div className="pw-fade-in">
            <div className="pw-intro-box">
              <div style={{fontSize:48,marginBottom:10}}>📡</div>
              <div className="pw-intro-title">{t.introTitle}</div>
              <div className="pw-intro-desc">{t.introDesc}</div>
            </div>
            <div className="pw-tips-preview">
              {t.tips.map((tip,i) => (
                <div key={i} className="pw-tip-row"><span className="pw-tip-icon">{tip.icon}</span><span className="pw-tip-text">{tip.tip}</span></div>
              ))}
            </div>
            <button className="pw-btn pw-btn-primary" onClick={()=>setPhase("step1")}>{t.startBtn}</button>
          </div>
        )}

        {phase==="step1" && (
          <div className="pw-fade-in">
            <div className="pw-step-tag">{t.step1Tag}</div>
            <div className="pw-phase-title">{t.step1Title}</div>
            <div className="pw-wifi-panel">
              <div className="pw-wifi-header">📶 {t.wifiList}</div>
              {t.networks.map((n,i) => (
                <button key={i} className="pw-network-row" onClick={() => handleNetwork(n)}>
                  <SignalBars bars={n.bars}/>
                  <span className="pw-net-name">{n.name}</span>
                  <span className={`pw-net-lock ${n.secured?"lock-secure":"lock-open"}`}>{n.secured?"🔒":"🔓"}</span>
                </button>
              ))}
            </div>
            <div className="pw-wifi-tip">{t.step1Tip}</div>
          </div>
        )}

        {phase==="step2" && network && (
          <div className="pw-fade-in">
            <div className="pw-step-tag">{t.step2Tag}</div>
            <div className="pw-connected-badge">
              <span>📡</span>
              <span>{t.connectedMsg(network.name)}</span>
              <span className={network.secured?"":"badge-unsecured"}>{network.secured?"🔒 Secured":"🔓 Unsecured"}</span>
            </div>
            <div className="pw-phase-title">{t.step2Title}</div>
            <div className="pw-activity-list">
              {t.activities.map(a => (
                <button key={a.id} className="pw-activity-btn" onClick={() => handleActivity(a.id)}>
                  <span className="pw-act-icon">{a.icon}</span>
                  <span className="pw-act-label">{a.label}</span>
                  <span className="pw-act-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase==="result" && (
          <div className="pw-fade-in">
            <div className={`pw-result-banner ${isBad?"pw-result-bad":"pw-result-good"}`}>
              <div className="pw-result-emoji">{isBad?"🚨":"🛡️"}</div>
              <div>
                <div className="pw-result-title">{isBad?t.interceptedTitle:t.safeTitle}</div>
                <div className="pw-result-sub">{isBad?t.interceptedSub:t.safeSub}</div>
              </div>
            </div>
            <Timeline steps={isBad?t.interceptedSteps:t.safeSteps} isBad={isBad}/>
            <LessonBox lesson={isBad?t.lessonBad:t.lessonGood} isBad={isBad}/>
            <div className="pw-btn-group">
              <button className="pw-btn pw-btn-outline" onClick={()=>reset()}>{t.retryBtn}</button>
              <button className="pw-btn pw-btn-primary" onClick={()=>setFinished(true)}>{t.finishBtn}</button>
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
.pw-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.pw-lang-bar{display:flex;justify-content:flex-end;max-width:620px;margin:0 auto 16px}
.pw-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.pw-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.pw-lang-btn.active{background:var(--blue);color:#fff}
.pw-card{background:var(--card);border-radius:var(--r);max-width:620px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.pw-header{text-align:center;margin-bottom:20px}
.pw-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.pw-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px}
.pw-subtitle{font-size:14px;color:var(--sub)}
.pw-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}
.pw-intro-box{text-align:center;margin-bottom:20px}
.pw-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.pw-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.pw-tips-preview{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.pw-tip-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.pw-tip-icon{font-size:20px;flex-shrink:0}
.pw-tip-text{font-size:13px;font-weight:700;color:var(--text)}
.pw-step-tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:1.5px;color:#c2410c;background:#fff7ed;border:1.5px solid #fed7aa;border-radius:50px;padding:3px 12px;margin-bottom:12px;text-transform:uppercase}
.pw-phase-title{font-size:16px;font-weight:800;color:var(--text);margin-bottom:16px}
.pw-wifi-panel{background:#f0f4ff;border:2px solid #bfdbfe;border-radius:14px;overflow:hidden;margin-bottom:14px}
.pw-wifi-header{padding:12px 16px;font-size:12px;font-weight:800;color:var(--blue);background:#fff;border-bottom:1.5px solid #bfdbfe;text-transform:uppercase;letter-spacing:1px}
.pw-network-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#fff;border:none;border-bottom:1px solid #e8f0fe;cursor:pointer;width:100%;transition:var(--tr);font-family:inherit}
.pw-network-row:last-child{border-bottom:none}
.pw-network-row:hover{background:#f0f7ff}
.pw-net-name{flex:1;font-size:14px;font-weight:700;color:var(--text);text-align:left}
.pw-net-lock{font-size:16px}
.lock-secure{color:var(--green)}
.lock-open{color:var(--red)}
.pw-wifi-tip{font-size:12px;color:var(--sub);background:#f8fafc;border:1.5px solid var(--bdr);border-radius:8px;padding:10px 14px}
.pw-connected-badge{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f0f4ff;border:1.5px solid #bfdbfe;border-radius:10px;font-size:13px;font-weight:700;color:var(--text);margin-bottom:16px;flex-wrap:wrap}
.badge-unsecured{color:var(--red);font-size:12px}
.pw-activity-list{display:flex;flex-direction:column;gap:10px}
.pw-activity-btn{display:flex;align-items:center;gap:14px;padding:16px 18px;background:#f8fafc;border:2px solid var(--bdr);border-radius:12px;cursor:pointer;transition:var(--tr);font-family:inherit;width:100%}
.pw-activity-btn:hover{border-color:var(--blue);background:#f0f7ff;transform:translateY(-1px)}
.pw-act-icon{font-size:26px;flex-shrink:0}
.pw-act-label{flex:1;font-size:14px;font-weight:700;color:var(--text);text-align:left}
.pw-act-arrow{font-size:18px;color:var(--muted)}
.pw-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:14px;padding:18px 20px;border-width:2px;border-style:solid;margin-bottom:20px}
.pw-result-bad{background:var(--rl);border-color:var(--rb)}
.pw-result-good{background:var(--gl);border-color:var(--gb)}
.pw-result-emoji{font-size:36px;flex-shrink:0}
.pw-result-title{font-size:17px;font-weight:800;margin-bottom:4px}
.pw-result-bad  .pw-result-title{color:#b91c1c}
.pw-result-good .pw-result-title{color:#166534}
.pw-result-sub{font-size:13px}
.pw-result-bad  .pw-result-sub{color:#c53030}
.pw-result-good .pw-result-sub{color:#276749}
.pw-timeline{display:flex;flex-direction:column;margin-bottom:20px}
.pw-tl-item{display:flex;align-items:flex-start;gap:14px;opacity:0;transform:translateX(-14px);transition:opacity .4s,transform .4s;position:relative}
.pw-tl-item.pw-tl-vis{opacity:1;transform:translateX(0)}
.pw-tl-icon{width:40px;height:40px;border-radius:50%;background:#f1f5f9;border:2px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;z-index:1}
.pw-tl-bad  .pw-tl-icon{background:var(--rl);border-color:var(--rb)}
.pw-tl-good .pw-tl-icon{background:var(--gl);border-color:var(--gb)}
.pw-tl-body{flex:1;padding:8px 0 16px}
.pw-tl-title{font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px}
.pw-tl-desc{font-size:12px;color:var(--sub);line-height:1.5}
.pw-tl-line{position:absolute;left:19px;top:42px;width:2px;height:calc(100% - 20px);background:var(--bdr)}
.pw-lesson{border-radius:14px;padding:18px 20px;margin-bottom:4px;border-width:2px;border-style:solid}
.pw-lesson-bad{background:var(--rl);border-color:var(--rb)}
.pw-lesson-good{background:var(--gl);border-color:var(--gb)}
.pw-lesson-title{font-size:14px;font-weight:800;margin-bottom:12px}
.pw-lesson-bad  .pw-lesson-title{color:#b91c1c}
.pw-lesson-good .pw-lesson-title{color:#166534}
.pw-lesson-row{display:flex;gap:10px;font-size:13px;padding:5px 0;border-top:1px solid rgba(0,0,0,.06);line-height:1.45}
.pw-lesson-row:first-of-type{border-top:none}
.pw-lesson-bad  .pw-lesson-row{color:#7f1d1d}
.pw-lesson-good .pw-lesson-row{color:#14532d}
.pw-btn{padding:13px;font-family:inherit;font-size:14px;font-weight:800;border-radius:10px;border:none;cursor:pointer;transition:var(--tr);width:100%}
.pw-btn-primary{background:var(--blue);color:#fff}
.pw-btn-primary:hover{background:#2563eb;transform:translateY(-1px)}
.pw-btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue)}
.pw-btn-outline:hover{background:#eff6ff}
.pw-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.pw-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.pw-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.pw-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.pw-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.pw-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.pw-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pw-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){.pw-card{padding:24px 18px}.pw-divider{margin:0 -18px 20px}.pw-btn-group{grid-template-columns:1fr}.pw-result-banner{flex-direction:column}}
`;
