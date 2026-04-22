import { useState, useEffect, useRef } from "react";

/* ── MODULE 9 · SIMULATION 1: Employee Phishing Test ── */
const T_PHISH = {
  en: {
    moduleTag: "MODULE 9 · SIMULATION 1",
    title: "Employee Phishing Test",
    subtitle: "A suspicious internal email lands in your inbox. What do you do?",
    introTitle: "🏢 Workplace Phishing Is #1 Threat",
    introDesc: "90% of data breaches start with a phishing email. Attackers impersonate internal staff to trick employees into handing over credentials or making payments.",
    startBtn: "Start →",
    finishBtn: "✅ Finish",
    retryBtn: "Try Again →",

    emailFrom: "hr-payroll@company-hr-update.net",
    emailFromName: "HR Department",
    emailSubject: "🔴 URGENT: Update Your Payroll Details Immediately",
    emailDate: "Today, 9:03 AM",
    emailBody: [
      "Dear Employee,",
      "Due to a system migration, all employees must update their payroll bank details by 5:00 PM TODAY.",
      "Failure to update will result in your salary being withheld next month.",
      "Click below to update your details now:",
    ],
    emailLink: "[ UPDATE PAYROLL NOW → ]",
    emailSig: "HR Team — Company Payroll Department",

    instruction: "What do you do?",
    options: [
      { id:"click",   icon:"👆", label:"Click the link and update details",      isSafe:false },
      { id:"verify",  icon:"📞", label:"Call HR directly to verify",             isSafe:true  },
      { id:"report",  icon:"🚨", label:"Report to IT security team",             isSafe:true  },
      { id:"ignore",  icon:"😶", label:"Ignore it — looks fake",                 isSafe:false },
    ],

    outcomes: {
      click:  { icon:"💸", color:"bad",  title:"Credentials Stolen!",    detail:"You entered your banking details on a fake page. Attacker now has full access to your payroll account." },
      verify: { icon:"✅", color:"good", title:"Threat Neutralised!",     detail:"You called HR directly. They confirmed no such email was sent. IT was alerted and the phishing campaign was blocked." },
      report: { icon:"✅", color:"good", title:"Company Protected!",      detail:"IT security investigated immediately, blocked the domain, and sent a company-wide warning." },
      ignore: { icon:"⚠️", color:"neutral", title:"Partial — But Risky", detail:"Ignoring is better than clicking, but reporting to IT is always better. Others may still fall for the same email." },
    },

    redFlags: [
      { icon:"🌐", flag:"External domain",   note:"company-hr-update.net — not your company's real email domain." },
      { icon:"⚡", flag:"Extreme urgency",    note:"'By 5PM TODAY' and 'salary withheld' — classic pressure tactics." },
      { icon:"💰", flag:"Financial request",  note:"Real HR never asks for bank details by email." },
      { icon:"🔗", flag:"Suspicious link",    note:"Legitimate payroll systems are accessed through your company intranet." },
    ],

    lessonTitle: "🏢 Workplace Email Rules:",
    lessonPoints: [
      "Always verify unusual requests by calling the sender directly",
      "Real HR never changes payroll via email link",
      "Report suspicious emails to IT — never just ignore",
      "Check the sender's email domain carefully",
    ],

    tipsTitle: "🔍 Spot Workplace Phishing",
    tips: [
      { icon:"📞", tip:"Call to verify any unusual financial request" },
      { icon:"🌐", tip:"Check the sender's domain — is it your company?" },
      { icon:"🚨", tip:"Report to IT even if unsure — always safe" },
      { icon:"🏦", tip:"Real payroll changes happen through official systems" },
    ],
  },
  np: {
    moduleTag: "मड्युल ९ · सिमुलेसन १",
    title: "कर्मचारी फिसिङ परीक्षण",
    subtitle: "तपाईंको इनबक्समा संदिग्ध आन्तरिक इमेल आयो। के गर्नुहुन्छ?",
    introTitle: "🏢 कार्यस्थल फिसिङ नम्बर १ खतरा हो",
    introDesc: "९०% डेटा उल्लङ्घन फिसिङ इमेलबाट सुरु हुन्छ। आक्रमणकारीहरू कर्मचारीलाई धोका दिन आन्तरिक कर्मचारीको रूप धारण गर्छन्।",
    startBtn: "सुरु →",
    finishBtn: "✅ समाप्त",
    retryBtn: "फेरि प्रयास →",

    emailFrom: "hr-payroll@company-hr-update.net",
    emailFromName: "HR विभाग",
    emailSubject: "🔴 जरुरी: तुरुन्तै तलब विवरण अपडेट गर्नुहोस्",
    emailDate: "आज, ९:०३",
    emailBody: [
      "प्रिय कर्मचारी,",
      "प्रणाली माइग्रेसनका कारण सबै कर्मचारीले आज साँझ ५:०० बजेसम्म तलब बैंक विवरण अपडेट गर्नुपर्छ।",
      "अपडेट नगरे अर्को महिना तपाईंको तलब रोकिनेछ।",
      "तुरुन्तै विवरण अपडेट गर्न तल क्लिक गर्नुहोस्:",
    ],
    emailLink: "[ अहिलै तलब विवरण अपडेट गर्नुहोस् → ]",
    emailSig: "HR टोली — कम्पनी तलब विभाग",

    instruction: "के गर्नुहुन्छ?",
    options: [
      { id:"click",   icon:"👆", label:"लिंक क्लिक गरेर विवरण अपडेट गर्नुहोस्",  isSafe:false },
      { id:"verify",  icon:"📞", label:"HR लाई सिधै फोन गरेर प्रमाणित गर्नुहोस्", isSafe:true  },
      { id:"report",  icon:"🚨", label:"IT सुरक्षा टोलीलाई रिपोर्ट गर्नुहोस्",    isSafe:true  },
      { id:"ignore",  icon:"😶", label:"बेवास्ता गर्नुहोस् — नक्कली देखिन्छ",      isSafe:false },
    ],

    outcomes: {
      click:  { icon:"💸", color:"bad",     title:"प्रमाणपत्र चोरियो!",     detail:"तपाईंले नक्कली पेजमा बैंक विवरण हाल्नुभयो। आक्रमणकारीले तलब खाताको पूर्ण पहुँच पायो।" },
      verify: { icon:"✅", color:"good",    title:"खतरा निष्क्रिय!",        detail:"तपाईंले HR लाई सिधै फोन गर्नुभयो। उनीहरूले त्यस्तो इमेल नपठाएको पुष्टि गरे। फिसिङ अभियान रोकियो।" },
      report: { icon:"✅", color:"good",    title:"कम्पनी सुरक्षित!",        detail:"IT सुरक्षाले तुरुन्तै अनुसन्धान गर्यो, डोमेन ब्लक गर्यो र कम्पनी-व्यापी चेतावनी पठायो।" },
      ignore: { icon:"⚠️", color:"neutral", title:"आंशिक — तर जोखिमपूर्ण", detail:"बेवास्ता गर्नु क्लिक गर्नुभन्दा राम्रो हो, तर IT लाई रिपोर्ट गर्नु सधैं राम्रो। अरूहरू अझै पर्न सक्छन्।" },
    },

    redFlags: [
      { icon:"🌐", flag:"बाह्य डोमेन",       note:"company-hr-update.net — तपाईंको कम्पनीको वास्तविक इमेल डोमेन होइन।" },
      { icon:"⚡", flag:"अत्यधिक जरुरी",      note:"'आज साँझसम्म' र 'तलब रोकिन्छ' — क्लासिक दबाब चाल।" },
      { icon:"💰", flag:"आर्थिक अनुरोध",       note:"वास्तविक HR ले इमेलमा बैंक विवरण माग्दैन।" },
      { icon:"🔗", flag:"संदिग्ध लिंक",        note:"वैध तलब प्रणाली कम्पनी इन्ट्रानेटमार्फत पहुँच गरिन्छ।" },
    ],

    lessonTitle: "🏢 कार्यस्थल इमेल नियमहरू:",
    lessonPoints: [
      "असामान्य अनुरोधहरू पठाउनेलाई सिधै फोन गरेर प्रमाणित गर्नुहोस्",
      "वास्तविक HR ले इमेल लिंकमार्फत तलब परिवर्तन गर्दैन",
      "संदिग्ध इमेलहरू IT लाई रिपोर्ट गर्नुहोस् — बेवास्ता नगर्नुहोस्",
      "प्रेषकको इमेल डोमेन ध्यानले जाँच्नुहोस्",
    ],

    tipsTitle: "🔍 कार्यस्थल फिसिङ पहिचान",
    tips: [
      { icon:"📞", tip:"कुनै पनि असामान्य आर्थिक अनुरोध फोन गरेर प्रमाणित गर्नुहोस्" },
      { icon:"🌐", tip:"प्रेषकको डोमेन जाँच्नुहोस् — के यो तपाईंको कम्पनी हो?" },
      { icon:"🚨", tip:"अनिश्चित भए पनि IT लाई रिपोर्ट गर्नुहोस् — सधैं सुरक्षित" },
      { icon:"🏦", tip:"वास्तविक तलब परिवर्तन आधिकारिक प्रणालीमार्फत हुन्छ" },
    ],
  },
};

function FinishScreen({ t, prefix, onRetry }) {
  const isNp = t.moduleTag.includes("मड्युल");
  const p = prefix;
  return (
    <div className={`${p}-finish-overlay ${p}-fade-in`}>
      <div className={`${p}-finish-box`}>
        <div style={{fontSize:50,marginBottom:12}}>🎓</div>
        <div className={`${p}-finish-title`}>{isNp?"सिमुलेसन सम्पन्न!":"Simulation Complete!"}</div>
        <div className={`${p}-finish-desc`}>{isNp?"तपाईंले कार्यस्थल फिसिङ पहिचान गर्न सिक्नुभयो।":"You've learned to spot workplace phishing."}</div>
        <div className={`${p}-finish-tips`}>
          {t.tips.map((tip,i) => <div key={i} className={`${p}-finish-tip`}>{tip.icon} {tip.tip}</div>)}
        </div>
        <button className={`${p}-btn ${p}-btn-outline`} onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

export function EmployeePhishingTest({ attemptId, onComplete }) {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [chosen, setChosen]     = useState(null);
  const [finished, setFinished] = useState(false);
  const [done, setDone]         = useState(false);
  const startTime               = useRef(Date.now());
  const t = T_PHISH[lang];
  const p = "ep";

  function handleFinish() {
    if (done) return;
    setDone(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const correct = chosen !== null && t.scenario.options[chosen]?.correct === true;
    if (onComplete) onComplete({
      answers: { chosen, correct },
      score: correct ? 100 : 0,
      timeTaken,
    });
  }
  function reset(nl) { setPhase("intro"); setChosen(null); setFinished(false); setDone(false); startTime.current = Date.now(); if(nl) setLang(nl); }

  const outcome = chosen ? t.outcomes[chosen] : null;
  const isSafe = chosen ? t.options.find(o=>o.id===chosen)?.isSafe : false;

  return (
    <div className={`${p}-app`}>
      <style>{CSS_PHISH}</style>
      <div className={`${p}-lang-bar`}>
        <div className={`${p}-lang-toggle`}>
          <button className={`${p}-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`${p}-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>
      <div className={`${p}-card`} style={{position:"relative"}}>
        <div className={`${p}-header`}>
          <div className={`${p}-module-tag`}>{t.moduleTag}</div>
          <h1 className={`${p}-title`}>{t.title}</h1>
          <p className={`${p}-subtitle`}>{t.subtitle}</p>
        </div>
        <div className={`${p}-divider`}/>

        {phase==="intro" && (
          <div className={`${p}-fade-in`}>
            <div className={`${p}-intro-box`}>
              <div style={{fontSize:48,marginBottom:10}}>🏢</div>
              <div className={`${p}-intro-title`}>{t.introTitle}</div>
              <div className={`${p}-intro-desc`}>{t.introDesc}</div>
            </div>
            <div className={`${p}-tips-list`}>
              {t.tips.map((tip,i)=>(
                <div key={i} className={`${p}-tip-row`}><span className={`${p}-tip-icon`}>{tip.icon}</span><span className={`${p}-tip-text`}>{tip.tip}</span></div>
              ))}
            </div>
            <button className={`${p}-btn ${p}-btn-primary`} onClick={()=>setPhase("email")}>{t.startBtn}</button>
          </div>
        )}

        {phase==="email" && (
          <div className={`${p}-fade-in`}>
            {/* Email mockup */}
            <div className={`${p}-email-mock`}>
              <div className={`${p}-email-header`}>
                <div className={`${p}-email-avatar`}>HR</div>
                <div className={`${p}-email-meta`}>
                  <div className={`${p}-email-from`}>
                    <span className={`${p}-email-name`}>{t.emailFromName}</span>
                    <span className={`${p}-email-addr`}>&lt;{t.emailFrom}&gt;</span>
                  </div>
                  <div className={`${p}-email-subject`}>{t.emailSubject}</div>
                  <div className={`${p}-email-date`}>{t.emailDate}</div>
                </div>
              </div>
              <div className={`${p}-email-body`}>
                {t.emailBody.map((line,i) => <p key={i}>{line}</p>)}
                <div className={`${p}-email-link`}>{t.emailLink}</div>
                <p style={{marginTop:8,fontSize:12,color:"#64748b"}}>{t.emailSig}</p>
              </div>
            </div>

            <div className={`${p}-instruction`}>{t.instruction}</div>
            <div className={`${p}-options-list`}>
              {t.options.map(opt => (
                <button key={opt.id} className={`${p}-option-btn`} onClick={()=>{setChosen(opt.id);setPhase("result");}}>
                  <span className={`${p}-opt-icon`}>{opt.icon}</span>
                  <span className={`${p}-opt-label`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase==="result" && outcome && (
          <div className={`${p}-fade-in`}>
            <div className={`${p}-result-banner ${outcome.color==="good"?`${p}-result-good`:outcome.color==="bad"?`${p}-result-bad`:`${p}-result-neutral`}`}>
              <div className={`${p}-result-emoji`}>{outcome.icon}</div>
              <div>
                <div className={`${p}-result-title`}>{outcome.title}</div>
                <div className={`${p}-result-detail`}>{outcome.detail}</div>
              </div>
            </div>

            {/* Red flags */}
            <div className={`${p}-flags-section`}>
              <div className={`${p}-flags-title`}>🚩 {lang==="np"?"इमेलमा खतराका संकेत:":"Red flags in this email:"}</div>
              {t.redFlags.map((f,i) => (
                <div key={i} className={`${p}-flag-row`}>
                  <span>{f.icon}</span>
                  <div><span className={`${p}-flag-name`}>{f.flag}: </span><span className={`${p}-flag-note`}>{f.note}</span></div>
                </div>
              ))}
            </div>

            {/* Lesson */}
            <div className={`${p}-lesson-box`}>
              <div className={`${p}-lesson-title`}>{t.lessonTitle}</div>
              {t.lessonPoints.map((pt,i) => (
                <div key={i} className={`${p}-lesson-row`}><span>{isSafe?"✅":"❌"}</span><span>{pt}</span></div>
              ))}
            </div>

            <div className={`${p}-btn-group`}>
              <button className={`${p}-btn ${p}-btn-outline`} onClick={()=>reset()}>{t.retryBtn}</button>
              <button className={`${p}-btn ${p}-btn-primary`} onClick={() => handleFinish()}>{t.finishBtn}</button>
            </div>
            {finished && <FinishScreen t={t} prefix={p} onRetry={()=>reset()}/>}
          </div>
        )}
      </div>
    </div>
  );
}

const CSS_PHISH = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
:root{--bg:#eef2f7;--card:#fff;--bdr:#dde3ec;--text:#1e2a38;--sub:#64748b;--muted:#a0aec0;--blue:#3b82f6;--red:#ef4444;--rl:#fff5f5;--rb:#fca5a5;--green:#22c55e;--gl:#f0fdf4;--gb:#86efac;--r:16px;--sh:0 6px 32px rgba(30,42,56,0.10);--tr:all 0.25s ease}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
.ep-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.ep-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.ep-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.ep-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.ep-lang-btn.active{background:var(--blue);color:#fff}
.ep-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.ep-header{text-align:center;margin-bottom:20px}
.ep-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.ep-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px}
.ep-subtitle{font-size:14px;color:var(--sub)}
.ep-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}
.ep-intro-box{text-align:center;margin-bottom:20px}
.ep-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.ep-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.ep-tips-list{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.ep-tip-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.ep-tip-icon{font-size:18px;flex-shrink:0}
.ep-tip-text{font-size:13px;font-weight:700;color:var(--text)}
.ep-btn{padding:13px;font-family:inherit;font-size:14px;font-weight:800;border-radius:10px;border:none;cursor:pointer;transition:var(--tr);width:100%}
.ep-btn-primary{background:var(--blue);color:#fff}.ep-btn-primary:hover{background:#2563eb;transform:translateY(-1px)}
.ep-btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue)}.ep-btn-outline:hover{background:#eff6ff}
.ep-email-mock{background:#f8fafc;border:2px solid var(--bdr);border-radius:14px;overflow:hidden;margin-bottom:18px}
.ep-email-header{display:flex;align-items:flex-start;gap:12px;padding:14px 18px 12px;background:#fff;border-bottom:1.5px solid var(--bdr)}
.ep-email-avatar{width:38px;height:38px;border-radius:50%;background:#6366f1;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ep-email-meta{flex:1;min-width:0}
.ep-email-from{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-bottom:3px}
.ep-email-name{font-size:13px;font-weight:800;color:var(--text)}
.ep-email-addr{font-size:11px;color:#b91c1c;font-family:monospace;background:var(--rl);border:1px solid var(--rb);padding:1px 5px;border-radius:3px}
.ep-email-subject{font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px}
.ep-email-date{font-size:11px;color:var(--muted)}
.ep-email-body{padding:14px 18px;display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--sub);line-height:1.5}
.ep-email-link{font-size:13px;font-weight:800;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:8px 14px;cursor:default;margin-top:4px;text-align:center}
.ep-instruction{font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px}
.ep-options-list{display:flex;flex-direction:column;gap:8px}
.ep-option-btn{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#fff;border:2px solid var(--bdr);border-radius:12px;cursor:pointer;transition:var(--tr);width:100%;font-family:inherit}
.ep-option-btn:hover{border-color:var(--blue);background:#f0f7ff;transform:translateY(-1px)}
.ep-opt-icon{font-size:22px;flex-shrink:0}
.ep-opt-label{font-size:14px;font-weight:700;color:var(--text);text-align:left}
.ep-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:14px;padding:18px 20px;border-width:2px;border-style:solid;margin-bottom:18px}
.ep-result-good{background:var(--gl);border-color:var(--gb)}
.ep-result-bad{background:var(--rl);border-color:var(--rb)}
.ep-result-neutral{background:#fff7ed;border-color:#fed7aa}
.ep-result-emoji{font-size:34px;flex-shrink:0}
.ep-result-title{font-size:16px;font-weight:800;margin-bottom:4px;color:var(--text)}
.ep-result-detail{font-size:13px;color:var(--sub);line-height:1.5}
.ep-flags-section{background:var(--rl);border:2px solid var(--rb);border-radius:12px;padding:16px 18px;margin-bottom:16px}
.ep-flags-title{font-size:12px;font-weight:800;color:#b91c1c;margin-bottom:10px}
.ep-flag-row{display:flex;align-items:flex-start;gap:10px;font-size:12px;line-height:1.4;margin-bottom:7px}
.ep-flag-name{font-weight:800;color:#b91c1c}
.ep-flag-note{color:var(--sub)}
.ep-lesson-box{background:var(--gl);border:2px solid var(--gb);border-radius:12px;padding:16px 18px;margin-bottom:4px}
.ep-lesson-title{font-size:13px;font-weight:800;color:#166534;margin-bottom:10px}
.ep-lesson-row{display:flex;gap:8px;font-size:13px;color:#14532d;padding:4px 0;border-top:1px solid #bbf7d0;line-height:1.4}
.ep-lesson-row:first-of-type{border-top:none}
.ep-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.ep-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.ep-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.ep-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.ep-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.ep-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.ep-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ep-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){.ep-card{padding:24px 18px}.ep-divider{margin:0 -18px 20px}.ep-btn-group{grid-template-columns:1fr}.ep-result-banner{flex-direction:column}}
`;

export default EmployeePhishingTest;
