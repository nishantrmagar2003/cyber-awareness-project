import { useState, useEffect } from "react";

const T = {
  en: {
    moduleTag: "MODULE 9 · SIMULATION 2",
    title: "USB Drop Attack",
    subtitle: "You find a USB drive on the office floor. What do you do?",
    introTitle: "💾 USB Drops Are a Real Attack",
    introDesc: "Attackers leave infected USB drives in offices and car parks. 45% of people who find them plug them in. One plug can infect an entire company network.",
    startBtn: "Start →",
    finishBtn: "✅ Finish",
    retryBtn: "Try Again →",

    sceneTitle: "You find this in the office hallway...",
    usbLabel: "USB Drive",
    usbNote: "No label. Brand unknown.",

    instruction: "What do you do?",
    options: [
      { id:"plug",   icon:"💻", label:"Plug into office PC to see what's on it",  isSafe:false },
      { id:"it",     icon:"🔒", label:"Hand it to the IT security team",            isSafe:true  },
      { id:"ignore", icon:"🚶", label:"Leave it on the floor — not my problem",     isSafe:false },
      { id:"pocket", icon:"🎒", label:"Keep it — might be useful",                 isSafe:false },
    ],

    outcomes: {
      plug: {
        icon:"💀", color:"bad", title:"Company Infected!",
        detail:"The USB contained malware. The moment it was inserted, it silently ran a script that spread through the company network.",
        steps: [
          { icon:"💾", title:"USB Inserted",           desc:"Autorun executed a hidden script within seconds." },
          { icon:"🦠", title:"Malware Deployed",        desc:"Ransomware spread to shared drives and 47 employee computers." },
          { icon:"🔒", title:"Files Encrypted",         desc:"All company files were locked. A ransom note appeared on every screen." },
          { icon:"💸", title:"$50,000 Ransom Demanded", desc:"Attackers demanded payment in cryptocurrency. Operations halted." },
        ],
      },
      it: {
        icon:"✅", color:"good", title:"Threat Contained!",
        detail:"IT security analysed the drive in a sandboxed environment. It contained a keylogger and ransomware. The attack was stopped before any damage.",
        steps: [
          { icon:"💾", title:"USB Submitted to IT",     desc:"You handed it to IT without plugging it in anywhere." },
          { icon:"🔬", title:"Analysed Safely",         desc:"IT used an isolated system to examine the contents." },
          { icon:"🦠", title:"Malware Detected",        desc:"Ransomware and a keylogger were found on the drive." },
          { icon:"🛡️", title:"Attack Blocked!",         desc:"Network was secured. Staff were warned. Attack failed." },
        ],
      },
      ignore: {
        icon:"⚠️", color:"neutral", title:"Risky — Someone Else May Plug It",
        detail:"You avoided personal risk but left a loaded weapon for a colleague. Another employee plugged it in 10 minutes later.",
      },
      pocket: {
        icon:"⚠️", color:"neutral", title:"Risky — What If You Plug It At Home?",
        detail:"Taking an unknown USB home is also dangerous. Home computers often connect to the same network as work. The malware can follow you.",
      },
    },

    lessonTitle: "💾 USB Security Rules:",
    lessonPoints: [
      "Never plug in a USB you didn't buy yourself",
      "Always hand unknown drives to IT security",
      "Even 'free' branded USBs at events can be weaponised",
      "Disable USB autorun on all work computers",
    ],

    tipsTitle: "💾 USB Safety Rules",
    tips: [
      { icon:"🚫", tip:"Never plug in unknown USB drives" },
      { icon:"🔒", tip:"Always hand to IT — let them check it safely" },
      { icon:"⚠️", tip:"Free USB drives at conferences = threat" },
      { icon:"🖥️", tip:"Disable autorun on all work computers" },
    ],
  },
  np: {
    moduleTag: "मड्युल ९ · सिमुलेसन २",
    title: "USB ड्रप आक्रमण",
    subtitle: "तपाईंले अफिस फ्लोरमा USB ड्राइभ भेट्टाउनुभयो। के गर्नुहुन्छ?",
    introTitle: "💾 USB ड्रप वास्तविक आक्रमण हो",
    introDesc: "आक्रमणकारीहरू अफिस र पार्किङमा संक्रमित USB छाड्छन्। भेट्टाएमध्ये ४५% मानिसले प्लग गर्छन्। एउटा प्लगले सम्पूर्ण कम्पनी नेटवर्क संक्रमित गर्न सक्छ।",
    startBtn: "सुरु →",
    finishBtn: "✅ समाप्त",
    retryBtn: "फेरि प्रयास →",

    sceneTitle: "तपाईंले अफिस हलवेमा यो भेट्टाउनुभयो...",
    usbLabel: "USB ड्राइभ",
    usbNote: "कुनै लेबल छैन। ब्रान्ड अज्ञात।",

    instruction: "के गर्नुहुन्छ?",
    options: [
      { id:"plug",   icon:"💻", label:"के छ हेर्न अफिस PC मा प्लग गर्नुहोस्",  isSafe:false },
      { id:"it",     icon:"🔒", label:"IT सुरक्षा टोलीलाई बुझाउनुहोस्",         isSafe:true  },
      { id:"ignore", icon:"🚶", label:"फ्लोरमै छाड्नुहोस् — मेरो काम होइन",    isSafe:false },
      { id:"pocket", icon:"🎒", label:"राख्नुहोस् — उपयोगी हुन सक्छ",           isSafe:false },
    ],

    outcomes: {
      plug: {
        icon:"💀", color:"bad", title:"कम्पनी संक्रमित!",
        detail:"USB मा मालवेयर थियो। घुसाएकै क्षण, एउटा स्क्रिप्टले चुपचाप कम्पनी नेटवर्कमा फैलियो।",
        steps: [
          { icon:"💾", title:"USB घुसाइयो",              desc:"ऑटोरनले सेकेन्डभित्रै लुकेको स्क्रिप्ट चलायो।" },
          { icon:"🦠", title:"मालवेयर फैलियो",            desc:"र्यान्समवेयर साझा ड्राइभ र ४७ कर्मचारीका कम्प्युटरमा फैलियो।" },
          { icon:"🔒", title:"फाइलहरू इन्क्रिप्ट भए",    desc:"सबै कम्पनी फाइलहरू लक भए। हरेक स्क्रिनमा फिरौती नोट देखियो।" },
          { icon:"💸", title:"$५०,००० फिरौती माग",        desc:"आक्रमणकारीले क्रिप्टोकरेन्सीमा भुक्तानी माग्यो। अपरेसन रोकियो।" },
        ],
      },
      it: {
        icon:"✅", color:"good", title:"खतरा नियन्त्रित!",
        detail:"IT सुरक्षाले स्यान्डबक्स वातावरणमा ड्राइभ विश्लेषण गर्यो। यसमा किलगर र र्यान्समवेयर थियो। कुनै क्षति हुनुअघि नै आक्रमण रोकियो।",
        steps: [
          { icon:"💾", title:"USB IT लाई बुझाइयो",        desc:"तपाईंले कहीँ प्लग नगरी IT लाई बुझाउनुभयो।" },
          { icon:"🔬", title:"सुरक्षित विश्लेषण",          desc:"IT ले अलग प्रणालीमा सामग्री जाँच गर्यो।" },
          { icon:"🦠", title:"मालवेयर पत्ता लाग्यो",       desc:"ड्राइभमा र्यान्समवेयर र किलगर फेला पर्यो।" },
          { icon:"🛡️", title:"आक्रमण अवरुद्ध!",           desc:"नेटवर्क सुरक्षित भयो। कर्मचारीहरूलाई चेतावनी दिइयो।" },
        ],
      },
      ignore: {
        icon:"⚠️", color:"neutral", title:"जोखिमपूर्ण — अर्को कसैले प्लग गर्न सक्छ",
        detail:"तपाईंले व्यक्तिगत जोखिमबाट बच्नुभयो तर सहकर्मीका लागि लोड गरिएको हतियार छाड्नुभयो। १० मिनेटपछि अर्को कर्मचारीले प्लग गर्यो।",
      },
      pocket: {
        icon:"⚠️", color:"neutral", title:"जोखिमपूर्ण — घर लगेर प्लग गर्नुभए?",
        detail:"अज्ञात USB घर लैजानु पनि खतरनाक छ। घरका कम्प्युटरहरू प्राय: कामसँग एउटै नेटवर्कमा हुन्छन्। मालवेयर तपाईंसँग जान सक्छ।",
      },
    },

    lessonTitle: "💾 USB सुरक्षा नियमहरू:",
    lessonPoints: [
      "आफैंले नकिनेको USB कहिल्यै प्लग नगर्नुहोस्",
      "अज्ञात ड्राइभहरू सधैं IT सुरक्षालाई बुझाउनुहोस्",
      "इभेन्टमा पाइने 'निःशुल्क' USB पनि हतियार हुन सक्छ",
      "सबै कार्य कम्प्युटरमा USB ऑटोरन अक्षम गर्नुहोस्",
    ],

    tipsTitle: "💾 USB सुरक्षा नियमहरू",
    tips: [
      { icon:"🚫", tip:"अज्ञात USB ड्राइभ कहिल्यै प्लग नगर्नुहोस्" },
      { icon:"🔒", tip:"सधैं IT लाई बुझाउनुहोस् — उनीहरूले सुरक्षित जाँच गर्छन्" },
      { icon:"⚠️", tip:"सम्मेलनमा निःशुल्क USB = खतरा" },
      { icon:"🖥️", tip:"सबै कार्य कम्प्युटरमा ऑटोरन अक्षम गर्नुहोस्" },
    ],
  },
};

function Timeline({ steps, isBad }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible < steps.length) {
      const id = setTimeout(() => setVisible(v=>v+1), 750);
      return () => clearTimeout(id);
    }
  }, [visible, steps.length]);
  return (
    <div className="usb-timeline">
      {steps.map((s,i) => (
        <div key={i} className={`usb-tl-item ${i<visible?"usb-tl-vis":""} ${i===steps.length-1?(isBad?"usb-tl-bad":"usb-tl-good"):""}`}>
          <div className="usb-tl-icon">{s.icon}</div>
          <div className="usb-tl-body">
            <div className="usb-tl-title">{s.title}</div>
            <div className="usb-tl-desc">{s.desc}</div>
          </div>
          {i<steps.length-1 && <div className="usb-tl-line"/>}
        </div>
      ))}
    </div>
  );
}

function FinishScreen({ t, onRetry }) {
  const isNp = t.moduleTag.includes("मड्युल");
  return (
    <div className="usb-finish-overlay usb-fade-in">
      <div className="usb-finish-box">
        <div style={{fontSize:50,marginBottom:12}}>🎓</div>
        <div className="usb-finish-title">{isNp?"सिमुलेसन सम्पन्न!":"Simulation Complete!"}</div>
        <div className="usb-finish-desc">{isNp?"तपाईंले USB ड्रप आक्रमणबारे जान्नुभयो।":"You've learned about USB drop attacks."}</div>
        <div className="usb-finish-tips">
          {t.tips.map((tip,i) => <div key={i} className="usb-finish-tip">{tip.icon} {tip.tip}</div>)}
        </div>
        <button className="usb-btn usb-btn-outline" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

export default function USBDropAttack() {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [chosen, setChosen]     = useState(null);
  const [finished, setFinished] = useState(false);
  const t = T[lang];

  function reset(nl) { setPhase("intro"); setChosen(null); setFinished(false); if(nl) setLang(nl); }

  const outcome = chosen ? t.outcomes[chosen] : null;
  const isSafe  = chosen ? t.options.find(o=>o.id===chosen)?.isSafe : false;
  const hasTimeline = chosen === "plug" || chosen === "it";

  return (
    <div className="usb-app">
      <style>{CSS}</style>
      <div className="usb-lang-bar">
        <div className="usb-lang-toggle">
          <button className={`usb-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`usb-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>
      <div className="usb-card" style={{position:"relative"}}>
        <div className="usb-header">
          <div className="usb-module-tag">{t.moduleTag}</div>
          <h1 className="usb-title">{t.title}</h1>
          <p className="usb-subtitle">{t.subtitle}</p>
        </div>
        <div className="usb-divider"/>

        {phase==="intro" && (
          <div className="usb-fade-in">
            <div className="usb-intro-box">
              <div style={{fontSize:48,marginBottom:10}}>💾</div>
              <div className="usb-intro-title">{t.introTitle}</div>
              <div className="usb-intro-desc">{t.introDesc}</div>
            </div>
            <div className="usb-tips-list">
              {t.tips.map((tip,i)=>(
                <div key={i} className="usb-tip-row"><span className="usb-tip-icon">{tip.icon}</span><span className="usb-tip-text">{tip.tip}</span></div>
              ))}
            </div>
            <button className="usb-btn usb-btn-primary" onClick={()=>setPhase("scene")}>{t.startBtn}</button>
          </div>
        )}

        {phase==="scene" && (
          <div className="usb-fade-in">
            <div className="usb-scene-title">{t.sceneTitle}</div>
            {/* USB visual */}
            <div className="usb-visual">
              <div className="usb-drive">
                <div className="usb-drive-body">
                  <div className="usb-drive-icon">💾</div>
                  <div className="usb-drive-label">{t.usbLabel}</div>
                </div>
                <div className="usb-drive-plug"/>
              </div>
              <div className="usb-drive-note">{t.usbNote}</div>
            </div>

            <div className="usb-instruction">{t.instruction}</div>
            <div className="usb-options-list">
              {t.options.map(opt => (
                <button key={opt.id} className="usb-option-btn" onClick={()=>{setChosen(opt.id);setPhase("result");}}>
                  <span className="usb-opt-icon">{opt.icon}</span>
                  <span className="usb-opt-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase==="result" && outcome && (
          <div className="usb-fade-in">
            <div className={`usb-result-banner ${outcome.color==="good"?"usb-result-good":outcome.color==="bad"?"usb-result-bad":"usb-result-neutral"}`}>
              <div className="usb-result-emoji">{outcome.icon}</div>
              <div>
                <div className="usb-result-title">{outcome.title}</div>
                <div className="usb-result-detail">{outcome.detail}</div>
              </div>
            </div>

            {hasTimeline && outcome.steps && (
              <Timeline steps={outcome.steps} isBad={!isSafe}/>
            )}

            {/* Lesson */}
            <div className="usb-lesson-box">
              <div className="usb-lesson-title">{t.lessonTitle}</div>
              {t.lessonPoints.map((pt,i) => (
                <div key={i} className="usb-lesson-row"><span>{isSafe?"✅":"❌"}</span><span>{pt}</span></div>
              ))}
            </div>

            <div className="usb-btn-group">
              <button className="usb-btn usb-btn-outline" onClick={()=>reset()}>{t.retryBtn}</button>
              <button className="usb-btn usb-btn-primary" onClick={()=>setFinished(true)}>{t.finishBtn}</button>
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
.usb-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.usb-lang-bar{display:flex;justify-content:flex-end;max-width:620px;margin:0 auto 16px}
.usb-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.usb-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.usb-lang-btn.active{background:var(--blue);color:#fff}
.usb-card{background:var(--card);border-radius:var(--r);max-width:620px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.usb-header{text-align:center;margin-bottom:20px}
.usb-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.usb-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px}
.usb-subtitle{font-size:14px;color:var(--sub)}
.usb-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}
.usb-intro-box{text-align:center;margin-bottom:20px}
.usb-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.usb-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.usb-tips-list{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.usb-tip-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.usb-tip-icon{font-size:18px;flex-shrink:0}
.usb-tip-text{font-size:13px;font-weight:700;color:var(--text)}
.usb-btn{padding:13px;font-family:inherit;font-size:14px;font-weight:800;border-radius:10px;border:none;cursor:pointer;transition:var(--tr);width:100%}
.usb-btn-primary{background:var(--blue);color:#fff}.usb-btn-primary:hover{background:#2563eb;transform:translateY(-1px)}
.usb-btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue)}.usb-btn-outline:hover{background:#eff6ff}
.usb-scene-title{font-size:16px;font-weight:800;color:var(--text);margin-bottom:18px}
.usb-visual{display:flex;flex-direction:column;align-items:center;gap:10px;padding:24px;background:#f0f4f8;border:2px solid var(--bdr);border-radius:14px;margin-bottom:20px}
.usb-drive{display:flex;align-items:center;gap:0}
.usb-drive-body{display:flex;flex-direction:column;align-items:center;gap:6px;background:#1e2a38;border-radius:10px 0 0 10px;padding:16px 24px;color:#fff}
.usb-drive-icon{font-size:36px}
.usb-drive-label{font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase}
.usb-drive-plug{width:28px;height:22px;background:#94a3b8;border-radius:0 4px 4px 0;margin-top:4px;align-self:center}
.usb-drive-note{font-size:12px;color:var(--muted);font-style:italic}
.usb-instruction{font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px}
.usb-options-list{display:flex;flex-direction:column;gap:8px}
.usb-option-btn{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#fff;border:2px solid var(--bdr);border-radius:12px;cursor:pointer;transition:var(--tr);width:100%;font-family:inherit}
.usb-option-btn:hover{border-color:var(--blue);background:#f0f7ff;transform:translateY(-1px)}
.usb-opt-icon{font-size:22px;flex-shrink:0}
.usb-opt-label{font-size:14px;font-weight:700;color:var(--text);text-align:left}
.usb-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:14px;padding:18px 20px;border-width:2px;border-style:solid;margin-bottom:18px}
.usb-result-good{background:var(--gl);border-color:var(--gb)}
.usb-result-bad{background:var(--rl);border-color:var(--rb)}
.usb-result-neutral{background:#fff7ed;border-color:#fed7aa}
.usb-result-emoji{font-size:34px;flex-shrink:0}
.usb-result-title{font-size:16px;font-weight:800;margin-bottom:4px;color:var(--text)}
.usb-result-detail{font-size:13px;color:var(--sub);line-height:1.5}
.usb-timeline{display:flex;flex-direction:column;margin-bottom:18px}
.usb-tl-item{display:flex;align-items:flex-start;gap:14px;opacity:0;transform:translateX(-14px);transition:opacity .4s,transform .4s;position:relative}
.usb-tl-item.usb-tl-vis{opacity:1;transform:translateX(0)}
.usb-tl-icon{width:40px;height:40px;border-radius:50%;background:#f1f5f9;border:2px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;z-index:1}
.usb-tl-bad  .usb-tl-icon{background:var(--rl);border-color:var(--rb)}
.usb-tl-good .usb-tl-icon{background:var(--gl);border-color:var(--gb)}
.usb-tl-body{flex:1;padding:8px 0 16px}
.usb-tl-title{font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px}
.usb-tl-desc{font-size:12px;color:var(--sub);line-height:1.5}
.usb-tl-line{position:absolute;left:19px;top:42px;width:2px;height:calc(100% - 20px);background:var(--bdr)}
.usb-lesson-box{background:var(--gl);border:2px solid var(--gb);border-radius:12px;padding:16px 18px;margin-bottom:4px}
.usb-lesson-title{font-size:13px;font-weight:800;color:#166534;margin-bottom:10px}
.usb-lesson-row{display:flex;gap:8px;font-size:13px;color:#14532d;padding:4px 0;border-top:1px solid #bbf7d0;line-height:1.4}
.usb-lesson-row:first-of-type{border-top:none}
.usb-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.usb-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.usb-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.usb-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.usb-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.usb-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.usb-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.usb-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){.usb-card{padding:24px 18px}.usb-divider{margin:0 -18px 20px}.usb-btn-group{grid-template-columns:1fr}.usb-result-banner{flex-direction:column}}
`;
