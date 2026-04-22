import { useState, useRef } from "react";

const T = {
  en: {
    moduleTag: "MODULE 8 · SIMULATION 2",
    title: "Bystander Decision",
    subtitle: "You see someone being bullied online. What do you do?",
    introTitle: "👥 Bystanders Change Everything",
    introDesc: "When you witness online bullying, your choice has real impact. Sharing or laughing makes it worse. Standing up or reporting can stop it.",
    startBtn: "Start →",
    finishBtn: "✅ Finish",
    retryBtn: "Try Again →",
    roundLabel: (i,t) => `Scenario ${i} of ${t}`,
    nextBtn: "Next →",
    resultsTitle: "Your Results",
    score: (c,t) => `${c} / ${t} best choices`,
    excellent: "🏆 You're a true upstander!",
    good: "👍 Good — mostly positive choices.",
    okay: "⚠️ Some choices made things worse.",
    poor: "🔴 These choices hurt the victim more.",
    tipsTitle: "💡 How to Be an Upstander",
    tips: [
      { icon: "🤝", tip: "Support the victim privately first" },
      { icon: "🚨", tip: "Report to the platform — always" },
      { icon: "🚫", tip: "Never share or like bullying content" },
      { icon: "👨‍🏫", tip: "Tell a trusted adult if serious" },
    ],
    scenarios: [
      {
        id: 1, platformIcon: "📸", platform: "Instagram",
        context: "You see a classmate's photo with 30+ mean comments mocking their appearance. The victim hasn't responded.",
        options: [
          { id:"a", label:"😂 Laugh / Like the comments",       isBest:false },
          { id:"b", label:"📤 Share the post to your story",    isBest:false },
          { id:"c", label:"🚨 Report the comments",             isBest:true  },
          { id:"d", label:"🤝 DM the victim with support",      isBest:true  },
        ],
        outcomes: {
          a:{ icon:"😔", color:"bad",     title:"You made it worse",         emotional:"Short-term fun, long-term guilt.", social:"Engagement boosts the post — more people see it." },
          b:{ icon:"😤", color:"bad",     title:"You amplified the harm",    emotional:"You feel part of the crowd. Later you regret it.", social:"Sharing spreads cruelty to a wider audience. Victim is devastated." },
          c:{ icon:"✅", color:"good",    title:"Right call!",                emotional:"You feel like you did the right thing.", social:"Platform may remove content and warn bullies." },
          d:{ icon:"✅", color:"good",    title:"You made a difference!",    emotional:"Victim feels less alone — a huge relief.", social:"A kind message can change someone's day completely." },
        },
      },
      {
        id: 2, platformIcon: "💬", platform: "WhatsApp Group",
        context: "Someone creates a group chat specifically to mock a student and shares it with 20 people. You are added.",
        options: [
          { id:"a", label:"😂 Stay and read along",             isBest:false },
          { id:"b", label:"📤 Forward to others",               isBest:false },
          { id:"c", label:"🚪 Leave the group silently",        isBest:false },
          { id:"d", label:"🚨 Leave + screenshot + tell adult", isBest:true  },
        ],
        outcomes: {
          a:{ icon:"😔", color:"bad",    title:"You became part of it",     emotional:"Staying means you watched harm happen.", social:"Your presence in the group encourages the creator." },
          b:{ icon:"😤", color:"bad",    title:"You spread the cruelty",    emotional:"You feel like you belong — at someone else's cost.", social:"Forwarding multiplies the damage and the victim's pain." },
          c:{ icon:"😐", color:"neutral",title:"Partial credit",            emotional:"Leaving feels uncomfortable but okay.", social:"Stops your exposure but the group continues without consequences." },
          d:{ icon:"✅", color:"good",   title:"Full upstander!",           emotional:"You took responsibility and feel proud.", social:"Evidence reaches adults who can take real action." },
        },
      },
      {
        id: 3, platformIcon: "🎮", platform: "Online Game",
        context: "A new player is being harassed in team chat — called names and excluded from the team strategy.",
        options: [
          { id:"a", label:"😂 Join in the teasing",                    isBest:false },
          { id:"b", label:"😶 Stay quiet and keep playing",            isBest:false },
          { id:"c", label:"🤝 Defend them in chat",                    isBest:true  },
          { id:"d", label:"🚨 Report the bullies to the platform",     isBest:true  },
        ],
        outcomes: {
          a:{ icon:"😤", color:"bad",    title:"You joined the mob",        emotional:"Feels like bonding, but it's harmful.", social:"New player quits. Team loses a member. You may be reported too." },
          b:{ icon:"😐", color:"neutral",title:"Silent bystander",         emotional:"You avoid conflict but feel guilty later.", social:"Bullying continues unchallenged — silence signals approval." },
          c:{ icon:"✅", color:"good",   title:"Team hero!",                emotional:"You feel good for speaking up.", social:"Often one voice changes the whole group dynamic." },
          d:{ icon:"✅", color:"good",   title:"Platform action!",          emotional:"You took constructive action.", social:"Repeated reports lead to bans and safer gaming for everyone." },
        },
      },
    ],
  },
  np: {
    moduleTag: "मड्युल ८ · सिमुलेसन २",
    title: "दर्शक निर्णय",
    subtitle: "तपाईं कसैलाई अनलाइन धम्की दिइएको देख्नुहुन्छ। के गर्नुहुन्छ?",
    introTitle: "👥 दर्शकहरूले सबै कुरा बदल्छन्",
    introDesc: "अनलाइन धम्की देख्दा तपाईंको छनोटले वास्तविक प्रभाव पार्छ। साझा गर्दा वा हाँस्दा झन् खराब हुन्छ। उभिनु वा रिपोर्ट गर्नाले रोक्न सकिन्छ।",
    startBtn: "सुरु →",
    finishBtn: "✅ समाप्त",
    retryBtn: "फेरि प्रयास →",
    roundLabel: (i,t) => `परिदृश्य ${i} / ${t}`,
    nextBtn: "अर्को →",
    resultsTitle: "नतिजा",
    score: (c,t) => `${c} / ${t} उत्तम छनोट`,
    excellent: "🏆 तपाईं सच्चा अपस्ट्यान्डर हुनुहुन्छ!",
    good: "👍 राम्रो — धेरैजसो सकारात्मक छनोट।",
    okay: "⚠️ केही छनोटले अझ खराब बनायो।",
    poor: "🔴 यी छनोटले पीडितलाई अझ चोट पुर्‍यायो।",
    tipsTitle: "💡 अपस्ट्यान्डर कसरी बन्ने",
    tips: [
      { icon: "🤝", tip: "पहिले पीडितलाई निजी रूपमा समर्थन गर्नुहोस्" },
      { icon: "🚨", tip: "प्लेटफर्ममा सधैं रिपोर्ट गर्नुहोस्" },
      { icon: "🚫", tip: "धम्की सामग्री कहिल्यै साझा वा लाइक नगर्नुहोस्" },
      { icon: "👨‍🏫", tip: "गम्भीर भए विश्वसनीय वयस्कलाई बताउनुहोस्" },
    ],
    scenarios: [
      {
        id: 1, platformIcon: "📸", platform: "Instagram",
        context: "तपाईं एक सहपाठीको फोटोमा ३०+ मतलबी कमेन्ट देख्नुहुन्छ जसले उनको रूपको मजाक गर्छन्। पीडितले जवाफ दिएका छैनन्।",
        options: [
          { id:"a", label:"😂 हाँस्नुहोस् / कमेन्ट लाइक गर्नुहोस्",    isBest:false },
          { id:"b", label:"📤 आफ्नो स्टोरीमा पोस्ट साझा गर्नुहोस्",    isBest:false },
          { id:"c", label:"🚨 कमेन्ट रिपोर्ट गर्नुहोस्",               isBest:true  },
          { id:"d", label:"🤝 पीडितलाई DM मा समर्थन गर्नुहोस्",        isBest:true  },
        ],
        outcomes: {
          a:{ icon:"😔", color:"bad",   title:"झन् खराब बनायो",           emotional:"अल्पकालीन मनोरञ्जन, दीर्घकालीन पश्चात्ताप।", social:"एङ्गेजमेन्टले पोस्ट बढाउँछ — अझ बढी मानिसले देख्छन्।" },
          b:{ icon:"😤", color:"bad",   title:"क्षति बढायो",              emotional:"भीडको भाग जस्तो लाग्छ। पछि पश्चात्ताप हुन्छ।", social:"साझा गर्दा क्रूरता फैलिन्छ। पीडित तबाह हुन्छ।" },
          c:{ icon:"✅", color:"good",  title:"सही निर्णय!",              emotional:"सही काम गरेको महसुस हुन्छ।", social:"प्लेटफर्मले सामग्री हटाउन सक्छ।" },
          d:{ icon:"✅", color:"good",  title:"तपाईंले फरक पार्नुभयो!",  emotional:"पीडित कम एक्लो महसुस गर्छ।", social:"एउटा दयालु सन्देशले कसैको दिन पूर्ण बदल्न सक्छ।" },
        },
      },
      {
        id: 2, platformIcon: "💬", platform: "WhatsApp ग्रुप",
        context: "कसैले एउटा विद्यार्थीको मजाक गर्न विशेष रूपमा ग्रुप च्याट बनाएर २० जनालाई थपेको छ। तपाईंलाई पनि थपियो।",
        options: [
          { id:"a", label:"😂 बसेर पढ्नुहोस्",              isBest:false },
          { id:"b", label:"📤 अरूलाई फर्वार्ड गर्नुहोस्",  isBest:false },
          { id:"c", label:"🚪 चुपचाप ग्रुप छाड्नुहोस्",    isBest:false },
          { id:"d", label:"🚨 छाड्नुहोस् + स्क्रिनसट + वयस्कलाई बताउनुहोस्", isBest:true },
        ],
        outcomes: {
          a:{ icon:"😔", color:"bad",    title:"तपाईं पनि भागीदार भइनुभयो", emotional:"बस्नुको मतलब क्षति हुँदा हेरेर बस्नु।", social:"तपाईंको उपस्थितिले सिर्जनाकर्तालाई प्रोत्साहन दिन्छ।" },
          b:{ icon:"😤", color:"bad",    title:"क्रूरता फैलाउनुभयो",        emotional:"भन्ने लाग्छ — अर्कोको खर्चमा।", social:"फर्वार्ड गर्दा क्षति र पीडितको पीडा बहुगुणा हुन्छ।" },
          c:{ icon:"😐", color:"neutral",title:"आंशिक श्रेय",              emotional:"छाड्दा असहज लाग्छ तर ठीक हुन्छ।", social:"तपाईंको एक्सपोजर रोकिन्छ तर ग्रुप जारी रहन्छ।" },
          d:{ icon:"✅", color:"good",   title:"पूर्ण अपस्ट्यान्डर!",      emotional:"जिम्मेवारी लिनुभयो र गर्व महसुस हुन्छ।", social:"प्रमाण वयस्कसम्म पुग्छ जसले वास्तविक कदम चाल्न सक्छन्।" },
        },
      },
      {
        id: 3, platformIcon: "🎮", platform: "अनलाइन गेम",
        context: "टिम च्याटमा एक नयाँ खेलाडीलाई गाली गरिँदैछ र टिम रणनीतिबाट बाहिर राखिँदैछ।",
        options: [
          { id:"a", label:"😂 चिढाउनमा सामेल हुनुहोस्",         isBest:false },
          { id:"b", label:"😶 चुप बसेर खेल जारी राख्नुहोस्",   isBest:false },
          { id:"c", label:"🤝 च्याटमा बचाउनुहोस्",               isBest:true  },
          { id:"d", label:"🚨 धम्कीकर्ताहरूलाई रिपोर्ट गर्नुहोस्", isBest:true },
        ],
        outcomes: {
          a:{ icon:"😤", color:"bad",    title:"तपाईं भीडमा सामेल भइनुभयो", emotional:"बन्धन जस्तो लाग्छ तर हानिकारक छ।", social:"नयाँ खेलाडी छाड्छ। टिमले सदस्य गुमाउँछ।" },
          b:{ icon:"😐", color:"neutral",title:"मौन दर्शक",                 emotional:"द्वन्द्वबाट बच्नुहुन्छ तर पछि दोष महसुस हुन्छ।", social:"मौनताले अनुमोदनको संकेत दिन्छ।" },
          c:{ icon:"✅", color:"good",   title:"टिम नायक!",                 emotional:"बोल्दा राम्रो महसुस हुन्छ।", social:"प्राय: एउटा आवाजले पूरै समूहको गतिशीलता बदल्छ।" },
          d:{ icon:"✅", color:"good",   title:"प्लेटफर्म कदम!",            emotional:"रचनात्मक कदम चाल्नुभयो।", social:"बारम्बार रिपोर्टले प्रतिबन्ध र सबैका लागि सुरक्षित गेमिङ ल्याउँछ।" },
        },
      },
    ],
  },
};

const COLOR_MAP = { good:"#166534", bad:"#b91c1c", neutral:"#c2410c" };
const BG_MAP    = { good:"#f0fdf4", bad:"#fff5f5", neutral:"#fff7ed" };
const BDR_MAP   = { good:"#86efac", bad:"#fca5a5", neutral:"#fed7aa" };

function ScoreCircle({ correct, total }) {
  const pct=correct/total*100; const color=pct>=80?"#22c55e":pct>=60?"#f59e0b":"#ef4444";
  const r=44,circ=2*Math.PI*r;
  return (
    <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${pct/100*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{transition:"stroke-dasharray .7s ease"}}/>
      </svg>
      <div style={{position:"absolute",fontSize:24,fontWeight:800,color}}>{correct}/{total}</div>
    </div>
  );
}

function FinishScreen({ t, onRetry }) {
  const isNp = t.moduleTag.includes("मड्युल");
  return (
    <div className="cb2-finish-overlay cb2-fade-in">
      <div className="cb2-finish-box">
        <div style={{fontSize:50,marginBottom:12}}>🎓</div>
        <div className="cb2-finish-title">{isNp?"सिमुलेसन सम्पन्न!":"Simulation Complete!"}</div>
        <div className="cb2-finish-desc">{isNp?"तपाईंले अपस्ट्यान्डर बन्न सिक्नुभयो।":"You've learned how to be an upstander."}</div>
        <div className="cb2-finish-tips">
          {t.tips.map((tip,i) => <div key={i} className="cb2-finish-tip">{tip.icon} {tip.tip}</div>)}
        </div>
        <button className="cb2-btn cb2-btn-outline" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, t, lang, onChoice }) {
  const [chosen, setChosen] = useState(null);
  const done = chosen !== null;
  const outcome = done ? scenario.outcomes[chosen] : null;
  const isBest = done && scenario.options.find(o=>o.id===chosen)?.isBest;

  return (
    <div className="cb2-scenario-wrap cb2-fade-in">
      <div className="cb2-context-card">
        <div className="cb2-ctx-header">
          <span className="cb2-platform-icon">{scenario.platformIcon}</span>
          <span className="cb2-platform-name">{scenario.platform}</span>
        </div>
        <div className="cb2-ctx-body">{scenario.context}</div>
      </div>

      {!done && (
        <div className="cb2-options-list">
          {scenario.options.map(opt => (
            <button key={opt.id} className="cb2-option-btn" onClick={()=>setChosen(opt.id)}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {done && outcome && (
        <div className="cb2-outcome cb2-fade-in" style={{background:BG_MAP[outcome.color],borderColor:BDR_MAP[outcome.color]}}>
          <div className="cb2-outcome-header">
            <span className="cb2-outcome-icon">{outcome.icon}</span>
            <span className="cb2-outcome-title" style={{color:COLOR_MAP[outcome.color]}}>{outcome.title}</span>
            {isBest && <span className="cb2-best-badge">⭐ Best choice</span>}
          </div>
          <div className="cb2-outcome-row">
            <span className="cb2-outcome-label">😊 {lang==="np"?"पीडितमा:":"Impact on victim:"}</span>
            <span className="cb2-outcome-detail">{outcome.emotional}</span>
          </div>
          <div className="cb2-outcome-row">
            <span className="cb2-outcome-label">👥 {lang==="np"?"सामाजिक:":"Social impact:"}</span>
            <span className="cb2-outcome-detail">{outcome.social}</span>
          </div>
        </div>
      )}

      {done && <button className="cb2-next-btn cb2-fade-in" onClick={()=>onChoice(isBest)}>{t.nextBtn}</button>}
    </div>
  );
}

export default function BystanderDecision({ attemptId, onComplete }) {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [idx, setIdx]           = useState(0);
  const [scores, setScores]     = useState([]);
  const [finished, setFinished] = useState(false);
  const [done, setDone]         = useState(false);
  const startTime               = useRef(Date.now());
  const t = T[lang];

  function start() { setIdx(0); setScores([]); setFinished(false); setPhase("game"); }
  function handleChoice(best) {
    const next=[...scores,best]; setScores(next);
    if(idx+1>=t.scenarios.length) setTimeout(()=>setPhase("results"),200); else setIdx(i=>i+1);
  }
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
  function reset(nl) { setPhase("intro"); setIdx(0); setScores([]); setFinished(false); setDone(false); startTime.current = Date.now(); if(nl) setLang(nl); }

  const bestCount=scores.filter(Boolean).length;
  const pct=scores.length>0?bestCount/t.scenarios.length:0;
  const resultLabel=pct>=0.9?t.excellent:pct>=0.7?t.good:pct>=0.5?t.okay:t.poor;
  const resultColor=pct>=0.9?"#22c55e":pct>=0.7?"#84cc16":pct>=0.5?"#f59e0b":"#ef4444";

  return (
    <div className="cb2-app">
      <style>{CSS}</style>
      <div className="cb2-lang-bar">
        <div className="cb2-lang-toggle">
          <button className={`cb2-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`cb2-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>
      <div className="cb2-card" style={{position:"relative"}}>
        <div className="cb2-header">
          <div className="cb2-module-tag">{t.moduleTag}</div>
          <h1 className="cb2-title">{t.title}</h1>
          <p className="cb2-subtitle">{t.subtitle}</p>
        </div>
        <div className="cb2-divider"/>

        {phase==="intro" && (
          <div className="cb2-fade-in">
            <div className="cb2-intro-box">
              <div style={{fontSize:48,marginBottom:10}}>👥</div>
              <div className="cb2-intro-title">{t.introTitle}</div>
              <div className="cb2-intro-desc">{t.introDesc}</div>
            </div>
            <div className="cb2-tips-preview">
              {t.tips.map((tip,i)=>(
                <div key={i} className="cb2-tip-row"><span className="cb2-tip-icon">{tip.icon}</span><span className="cb2-tip-text">{tip.tip}</span></div>
              ))}
            </div>
            <button className="cb2-btn cb2-btn-primary" onClick={start}>{t.startBtn}</button>
          </div>
        )}

        {phase==="game" && (
          <div>
            <div className="cb2-progress-wrap">
              <div className="cb2-progress-label">
                {t.roundLabel(idx+1,t.scenarios.length)}
                <span className="cb2-score-live">{scores.filter(Boolean).length} ⭐</span>
              </div>
              <div className="cb2-progress-track"><div className="cb2-progress-fill" style={{width:`${idx/t.scenarios.length*100}%`}}/></div>
            </div>
            <ScenarioCard key={`${lang}-${idx}`} scenario={t.scenarios[idx]} t={t} lang={lang} onChoice={handleChoice}/>
          </div>
        )}

        {phase==="results" && (
          <div className="cb2-fade-in">
            <div className="cb2-results-title">{t.resultsTitle}</div>
            <div className="cb2-score-display">
              <ScoreCircle correct={bestCount} total={t.scenarios.length}/>
              <div className="cb2-score-right">
                <div className="cb2-score-label" style={{color:resultColor}}>{resultLabel}</div>
                <div className="cb2-score-sub">{t.score(bestCount,t.scenarios.length)}</div>
              </div>
            </div>
            <div className="cb2-tips-section">
              <div className="cb2-tips-title">{t.tipsTitle}</div>
              {t.tips.map((tip,i)=>(
                <div key={i} className="cb2-tip-row-green"><span className="cb2-tip-icon">{tip.icon}</span><span className="cb2-tip-text-green">{tip.tip}</span></div>
              ))}
            </div>
            <div className="cb2-btn-group">
              <button className="cb2-btn cb2-btn-outline" onClick={start}>{t.retryBtn}</button>
              <button className="cb2-btn cb2-btn-primary" onClick={handleFinish}>
                {t.finishBtn}
              </button>
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
.cb2-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.cb2-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.cb2-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.cb2-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.cb2-lang-btn.active{background:var(--blue);color:#fff}
.cb2-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.cb2-header{text-align:center;margin-bottom:20px}
.cb2-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.cb2-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px}
.cb2-subtitle{font-size:14px;color:var(--sub)}
.cb2-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}
.cb2-intro-box{text-align:center;margin-bottom:20px}
.cb2-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.cb2-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.cb2-tips-preview{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.cb2-tip-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.cb2-tip-icon{font-size:18px;flex-shrink:0}
.cb2-tip-text{font-size:13px;font-weight:700;color:var(--text)}
.cb2-btn{padding:13px;font-family:inherit;font-size:14px;font-weight:800;border-radius:10px;border:none;cursor:pointer;transition:var(--tr);width:100%}
.cb2-btn-primary{background:var(--blue);color:#fff}.cb2-btn-primary:hover{background:#2563eb;transform:translateY(-1px)}
.cb2-btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue)}.cb2-btn-outline:hover{background:#eff6ff}
.cb2-progress-wrap{margin-bottom:18px}
.cb2-progress-label{font-size:13px;font-weight:800;color:var(--text);margin-bottom:6px;display:flex;justify-content:space-between}
.cb2-score-live{font-size:12px;font-weight:700;color:#c2410c;background:#fff7ed;border:1px solid #fed7aa;padding:3px 10px;border-radius:50px}
.cb2-progress-track{height:8px;background:#e2e8f0;border-radius:8px;overflow:hidden}
.cb2-progress-fill{height:100%;background:var(--blue);border-radius:8px;transition:width .5s ease}
.cb2-scenario-wrap{display:flex;flex-direction:column;gap:14px}
.cb2-context-card{background:#f8fafc;border:2px solid var(--bdr);border-radius:14px;overflow:hidden}
.cb2-ctx-header{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#fff;border-bottom:1.5px solid var(--bdr)}
.cb2-platform-icon{font-size:22px}
.cb2-platform-name{font-size:14px;font-weight:800;color:var(--text)}
.cb2-ctx-body{padding:14px 18px;font-size:14px;color:var(--sub);line-height:1.6}
.cb2-options-list{display:flex;flex-direction:column;gap:8px}
.cb2-option-btn{padding:14px 18px;background:#fff;border:2px solid var(--bdr);border-radius:12px;cursor:pointer;transition:var(--tr);text-align:left;width:100%;font-family:inherit;font-size:14px;font-weight:800;color:var(--text)}
.cb2-option-btn:hover{border-color:var(--blue);background:#f0f7ff;transform:translateY(-1px)}
.cb2-outcome{border-radius:12px;padding:16px 18px;border-width:2px;border-style:solid;display:flex;flex-direction:column;gap:8px}
.cb2-outcome-header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cb2-outcome-icon{font-size:24px}
.cb2-outcome-title{font-size:16px;font-weight:800}
.cb2-best-badge{font-size:11px;font-weight:800;background:#fef9c3;color:#854d0e;border:1px solid #fde047;padding:2px 8px;border-radius:50px;margin-left:auto}
.cb2-outcome-row{display:flex;flex-direction:column;gap:2px;font-size:12px;line-height:1.4;padding-top:6px;border-top:1px solid rgba(0,0,0,.06)}
.cb2-outcome-label{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
.cb2-outcome-detail{color:var(--sub)}
.cb2-next-btn{width:100%;padding:12px;font-family:inherit;font-size:14px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.cb2-next-btn:hover{background:#2563eb;transform:translateY(-1px)}
.cb2-results-title{font-size:19px;font-weight:800;color:var(--text);text-align:center;margin-bottom:18px}
.cb2-score-display{display:flex;align-items:center;gap:20px;padding:18px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:18px}
.cb2-score-right{flex:1}
.cb2-score-label{font-size:17px;font-weight:800;margin-bottom:4px}
.cb2-score-sub{font-size:13px;color:var(--sub)}
.cb2-tips-section{background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px 20px;margin-bottom:16px}
.cb2-tips-title{font-size:14px;font-weight:800;color:#166534;margin-bottom:12px}
.cb2-tip-row-green{display:flex;align-items:center;gap:12px;padding:7px 0;border-top:1px solid #bbf7d0}
.cb2-tip-row-green:first-of-type{border-top:none}
.cb2-tip-text-green{font-size:13px;font-weight:700;color:#166534}
.cb2-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cb2-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.cb2-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.cb2-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.cb2-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.cb2-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.cb2-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.cb2-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){.cb2-card{padding:24px 18px}.cb2-divider{margin:0 -18px 20px}.cb2-btn-group{grid-template-columns:1fr}.cb2-score-display{flex-direction:column;text-align:center}}
`;
