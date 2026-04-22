import { useState, useRef } from "react";

const T = {
  en: {
    moduleTag: "MODULE 8 · SIMULATION 1",
    title: "Responding to Online Harassment",
    subtitle: "You received a bullying message. How do you respond?",
    introTitle: "💬 How You Respond Matters",
    introDesc: "Your reaction to online bullying affects you and others. Learn which responses help and which make things worse.",
    startBtn: "Start →",
    finishBtn: "✅ Finish",
    retryBtn: "Try Again →",
    roundLabel: (i,t) => `Scenario ${i} of ${t}`,
    nextBtn: "Next →",
    resultsTitle: "Your Results",
    score: (c,t) => `${c} / ${t} best responses`,
    excellent: "🏆 Excellent emotional intelligence!",
    good: "👍 Good — you handled most well.",
    okay: "⚠️ Some responses could hurt more.",
    poor: "🔴 These responses escalate the situation.",
    tipsTitle: "💡 Key Takeaways",
    tips: [
      { icon: "🚫", tip: "Never reply in anger — it escalates" },
      { icon: "📸", tip: "Screenshot and save evidence first" },
      { icon: "🔇", tip: "Block cuts off the bully's power" },
      { icon: "🚨", tip: "Report to platform and a trusted adult" },
    ],
    scenarios: [
      {
        id: 1,
        platform: "Instagram",
        platformIcon: "📸",
        from: "@anon_user99",
        message: "You're so ugly lol 😂 everyone is laughing at you",
        options: [
          { id:"a", label:"Reply angrily 😡", text:"You're the ugly one!! Loser!!",    isBest:false },
          { id:"b", label:"Ignore 😶",        text:"(You don't reply)",                isBest:false },
          { id:"c", label:"Report 🚨",         text:"(You report the comment)",         isBest:true  },
          { id:"d", label:"Block 🔇",          text:"(You block @anon_user99)",         isBest:true  },
        ],
        outcomes: {
          a: { icon:"😤", title:"Escalated!",        color:"bad",    emotional:"You feel angrier. The bully got the reaction they wanted.", social:"The argument becomes public. Others start piling on." },
          b: { icon:"😔", title:"Temporary Relief",  color:"neutral", emotional:"Ignoring feels okay short-term but the message still hurts.", social:"The bully may continue since there's no consequence." },
          c: { icon:"✅", title:"Right Move!",        color:"good",   emotional:"Reporting feels empowering — you took action.", social:"Platform can remove the comment and warn or ban the bully." },
          d: { icon:"✅", title:"Smart!",             color:"good",   emotional:"Blocking immediately stops further messages.", social:"The bully loses access to you completely." },
        },
      },
      {
        id: 2,
        platform: "WhatsApp Group",
        platformIcon: "💬",
        from: "Class Group Chat",
        message: "Did anyone else see how bad Riya did on the test? 😂😂😂",
        options: [
          { id:"a", label:"Reply angrily 😡",    text:"Stop being so mean!! You're all bullies!", isBest:false },
          { id:"b", label:"Laugh along 😂",       text:"Haha yeah she was terrible 😂",            isBest:false },
          { id:"c", label:"Support the victim 🤝", text:"Hey that's not cool. Leave her alone.",   isBest:true  },
          { id:"d", label:"Report privately 🚨",   text:"(You screenshot and tell a teacher)",     isBest:true  },
        ],
        outcomes: {
          a: { icon:"😤", title:"Creates Drama",     color:"bad",    emotional:"You feel frustrated and isolated.", social:"Fight moves public. You become a target too." },
          b: { icon:"😔", title:"You Became Part of It", color:"bad", emotional:"Short-term laughs, long-term guilt.", social:"You contributed to bullying. Riya is more hurt." },
          c: { icon:"✅", title:"Bystander Hero!",   color:"good",   emotional:"You feel proud for standing up.", social:"Others in the group may follow your lead. Bully backs down." },
          d: { icon:"✅", title:"Smart Action!",     color:"good",   emotional:"You took responsible action safely.", social:"Adult intervention can stop the pattern completely." },
        },
      },
      {
        id: 3,
        platform: "Online Game Chat",
        platformIcon: "🎮",
        from: "xX_ProKiller_Xx",
        message: "You're so bad at this game. You should quit. You ruin everything.",
        options: [
          { id:"a", label:"Trash talk back 😡",  text:"You're trash at everything in life loser",  isBest:false },
          { id:"b", label:"Ignore 😶",            text:"(You keep playing, say nothing)",           isBest:false },
          { id:"c", label:"Mute player 🔇",       text:"(You mute xX_ProKiller_Xx in-game)",        isBest:true  },
          { id:"d", label:"Report + block 🚨",    text:"(You report for harassment and block)",     isBest:true  },
        ],
        outcomes: {
          a: { icon:"😤", title:"Toxic Spiral",     color:"bad",    emotional:"Your mood drops. You play worse.", social:"Both players get reported. You may face ban too." },
          b: { icon:"😐", title:"Okay Short-term",  color:"neutral", emotional:"Annoyance lingers but you can focus on game.", social:"Bully may continue unchecked." },
          c: { icon:"✅", title:"Clean Move!",       color:"good",   emotional:"Instant peace. You can focus again.", social:"Removes the toxic voice without escalating." },
          d: { icon:"✅", title:"Full Protection!",  color:"good",   emotional:"You feel in control.", social:"Platform records pattern, player may be banned." },
        },
      },
    ],
  },
  np: {
    moduleTag: "मड्युल ८ · सिमुलेसन १",
    title: "अनलाइन उत्पीडनको सामना",
    subtitle: "तपाईंलाई धम्कीको सन्देश आयो। कसरी प्रतिक्रिया दिनुहुन्छ?",
    introTitle: "💬 तपाईंको प्रतिक्रिया महत्त्वपूर्ण छ",
    introDesc: "अनलाइन धम्कीप्रति तपाईंको प्रतिक्रियाले तपाईं र अरूलाई असर गर्छ। कुन प्रतिक्रिया मद्दत गर्छ र कुनले अझ खराब बनाउँछ जान्नुहोस्।",
    startBtn: "सुरु →",
    finishBtn: "✅ समाप्त",
    retryBtn: "फेरि प्रयास →",
    roundLabel: (i,t) => `परिदृश्य ${i} / ${t}`,
    nextBtn: "अर्को →",
    resultsTitle: "नतिजा",
    score: (c,t) => `${c} / ${t} उत्तम प्रतिक्रिया`,
    excellent: "🏆 उत्कृष्ट भावनात्मक बुद्धिमत्ता!",
    good: "👍 राम्रो — धेरैलाई राम्रो सम्हाल्नुभयो।",
    okay: "⚠️ केही प्रतिक्रियाले अझ चोट पुर्‍याउन सक्छ।",
    poor: "🔴 यी प्रतिक्रियाले अवस्था बिगार्छन्।",
    tipsTitle: "💡 मुख्य सिकाइ",
    tips: [
      { icon: "🚫", tip: "क्रोधमा कहिल्यै जवाफ नदिनुहोस् — बढ्छ" },
      { icon: "📸", tip: "पहिले स्क्रिनसट र प्रमाण सुरक्षित गर्नुहोस्" },
      { icon: "🔇", tip: "ब्लक गर्दा धम्कीकर्ताको शक्ति खत्म हुन्छ" },
      { icon: "🚨", tip: "प्लेटफर्म र विश्वसनीय वयस्कलाई रिपोर्ट गर्नुहोस्" },
    ],
    scenarios: [
      {
        id: 1,
        platform: "Instagram",
        platformIcon: "📸",
        from: "@anon_user99",
        message: "तिमी कति कुरूप छौ लोल 😂 सबैजना तिमीलाई हाँस्दैछन्",
        options: [
          { id:"a", label:"रिसाएर जवाफ 😡",   text:"तिमी नै कुरूप छौ!! हारे हुने!!", isBest:false },
          { id:"b", label:"बेवास्ता 😶",        text:"(तपाईंले जवाफ नदिनुभयो)",        isBest:false },
          { id:"c", label:"रिपोर्ट 🚨",          text:"(तपाईंले कमेन्ट रिपोर्ट गर्नुभयो)", isBest:true },
          { id:"d", label:"ब्लक 🔇",             text:"(तपाईंले @anon_user99 ब्लक गर्नुभयो)", isBest:true },
        ],
        outcomes: {
          a: { icon:"😤", title:"अझ बिग्रियो!",      color:"bad",    emotional:"तपाईं अझ रिसाउनुभयो। धम्कीकर्ताले चाहेको प्रतिक्रिया पायो।", social:"झगडा सार्वजनिक भयो। अरूहरू पनि थपिए।" },
          b: { icon:"😔", title:"अस्थायी राहत",      color:"neutral", emotional:"बेवास्ता गर्दा अल्पकालीन ठीक लाग्छ तर सन्देशले चोट दिन्छ।", social:"परिणाम नभएकाले धम्कीकर्ता जारी राख्न सक्छ।" },
          c: { icon:"✅", title:"सही निर्णय!",        color:"good",   emotional:"रिपोर्ट गर्दा सशक्त महसुस हुन्छ।", social:"प्लेटफर्मले कमेन्ट हटाउन र धम्कीकर्तालाई चेतावनी दिन सक्छ।" },
          d: { icon:"✅", title:"बुद्धिमान!",          color:"good",   emotional:"ब्लकले थप सन्देश तुरुन्तै रोक्छ।", social:"धम्कीकर्ताले तपाईंमा पहुँच गुमाउँछ।" },
        },
      },
      {
        id: 2,
        platform: "WhatsApp ग्रुप",
        platformIcon: "💬",
        from: "कक्षा ग्रुप च्याट",
        message: "कसैले रियाले परीक्षामा कति खराब गर्यो देख्यो? 😂😂😂",
        options: [
          { id:"a", label:"रिसाएर जवाफ 😡",    text:"यति मतलबी नहुनुहोस्!! तिमीहरू सबै धम्कीकर्ता हौ!", isBest:false },
          { id:"b", label:"साथ हाँस्नुहोस् 😂", text:"हाहा हो यार उसले खराब गरी 😂",                     isBest:false },
          { id:"c", label:"पीडितलाई समर्थन 🤝", text:"हे यो ठीक होइन। उसलाई छाड्नुहोस्।",              isBest:true  },
          { id:"d", label:"गोप्य रिपोर्ट 🚨",    text:"(तपाईंले स्क्रिनसट लिएर शिक्षकलाई बताउनुभयो)",  isBest:true  },
        ],
        outcomes: {
          a: { icon:"😤", title:"नाटक सिर्जना",     color:"bad",    emotional:"तपाईं निराश र एक्लो महसुस गर्नुहुन्छ।", social:"झगडा सार्वजनिक भयो। तपाईं पनि लक्ष्य बन्नुभयो।" },
          b: { icon:"😔", title:"तपाईं पनि भागीदार", color:"bad",   emotional:"अल्पकालीन हाँसो, दीर्घकालीन पश्चात्ताप।", social:"तपाईंले धम्कीमा योगदान गर्नुभयो। रिया अझ आहत भई।" },
          c: { icon:"✅", title:"बाइस्ट्यान्डर नायक!", color:"good", emotional:"खड़ा भएकोमा गर्व महसुस हुन्छ।", social:"समूहमा अरूहरूले तपाईंको नेतृत्व गर्न सक्छन्। धम्कीकर्ता पछि हट्छ।" },
          d: { icon:"✅", title:"बुद्धिमान कदम!",    color:"good",   emotional:"तपाईंले जिम्मेवार कदम चाल्नुभयो।", social:"वयस्कको हस्तक्षेपले ढाँचा पूर्णतः रोक्न सक्छ।" },
        },
      },
      {
        id: 3,
        platform: "अनलाइन गेम च्याट",
        platformIcon: "🎮",
        from: "xX_ProKiller_Xx",
        message: "तिमी यो गेममा कति खराब छौ। छाड्नुपर्छ। सबै खराब बनाउँछौ।",
        options: [
          { id:"a", label:"ट्र्यास टक 😡",     text:"तिमी जीवनमा कचरा हौ हारे हुने",           isBest:false },
          { id:"b", label:"बेवास्ता 😶",         text:"(तपाईंले खेल जारी राख्नुभयो, केही नभन्नुभयो)", isBest:false },
          { id:"c", label:"म्युट 🔇",            text:"(तपाईंले xX_ProKiller_Xx म्युट गर्नुभयो)", isBest:true  },
          { id:"d", label:"रिपोर्ट + ब्लक 🚨",  text:"(उत्पीडनका लागि रिपोर्ट र ब्लक)",          isBest:true  },
        ],
        outcomes: {
          a: { icon:"😤", title:"विषाक्त सर्पिल",  color:"bad",    emotional:"मनोभाव खस्छ। खेल अझ खराब हुन्छ।", social:"दुवैलाई रिपोर्ट गरिन्छ। तपाईंलाई पनि प्रतिबन्ध लाग्न सक्छ।" },
          b: { icon:"😐", title:"अल्पकालीन ठीक",  color:"neutral", emotional:"झोझट बाँकी रहन्छ तर खेलमा ध्यान दिन सकिन्छ।", social:"धम्कीकर्ता बिना जाँचको जारी राख्न सक्छ।" },
          c: { icon:"✅", title:"सफा कदम!",         color:"good",   emotional:"तत्काल शान्ति। फेरि ध्यान केन्द्रित गर्न सक्नुहुन्छ।", social:"बढाउन नगरी विषाक्त आवाज हटाउँछ।" },
          d: { icon:"✅", title:"पूर्ण सुरक्षा!",   color:"good",   emotional:"तपाईं नियन्त्रणमा महसुस गर्नुहुन्छ।", social:"प्लेटफर्मले ढाँचा रेकर्ड गर्छ, खेलाडी प्रतिबन्धित हुन सक्छ।" },
        },
      },
    ],
  },
};

const COLOR_MAP = { good:"#166534", bad:"#b91c1c", neutral:"#c2410c" };
const BG_MAP    = { good:"#f0fdf4", bad:"#fff5f5", neutral:"#fff7ed" };
const BDR_MAP   = { good:"#86efac", bad:"#fca5a5", neutral:"#fed7aa" };

function ScoreCircle({ correct, total }) {
  const pct = correct/total*100;
  const color = pct>=80?"#22c55e":pct>=60?"#f59e0b":"#ef4444";
  const r=44, circ=2*Math.PI*r;
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
    <div className="cb1-finish-overlay cb1-fade-in">
      <div className="cb1-finish-box">
        <div style={{fontSize:50,marginBottom:12}}>🎓</div>
        <div className="cb1-finish-title">{isNp?"सिमुलेसन सम्पन्न!":"Simulation Complete!"}</div>
        <div className="cb1-finish-desc">{isNp?"तपाईंले अनलाइन उत्पीडनको सामना गर्न सिक्नुभयो।":"You've learned how to respond to online harassment."}</div>
        <div className="cb1-finish-tips">
          {t.tips.map((tip,i) => <div key={i} className="cb1-finish-tip">{tip.icon} {tip.tip}</div>)}
        </div>
        <button className="cb1-btn cb1-btn-outline" onClick={onRetry}>{t.retryBtn}</button>
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
    <div className="cb1-scenario-wrap cb1-fade-in">
      {/* Message mockup */}
      <div className="cb1-msg-card">
        <div className="cb1-msg-header">
          <span className="cb1-platform-icon">{scenario.platformIcon}</span>
          <div>
            <div className="cb1-platform-name">{scenario.platform}</div>
            <div className="cb1-msg-from">{scenario.from}</div>
          </div>
        </div>
        <div className="cb1-msg-bubble">{scenario.message}</div>
      </div>

      {/* Options */}
      {!done && (
        <div className="cb1-options-list">
          {scenario.options.map(opt => (
            <button key={opt.id} className="cb1-option-btn" onClick={()=>setChosen(opt.id)}>
              <span className="cb1-opt-label">{opt.label}</span>
              {opt.text && <span className="cb1-opt-text">"{opt.text}"</span>}
            </button>
          ))}
        </div>
      )}

      {/* Outcome */}
      {done && outcome && (
        <div className="cb1-outcome cb1-fade-in" style={{background:BG_MAP[outcome.color],borderColor:BDR_MAP[outcome.color]}}>
          <div className="cb1-outcome-header">
            <span className="cb1-outcome-icon">{outcome.icon}</span>
            <span className="cb1-outcome-title" style={{color:COLOR_MAP[outcome.color]}}>{outcome.title}</span>
            {isBest && <span className="cb1-best-badge">⭐ Best choice</span>}
          </div>
          <div className="cb1-outcome-row">
            <span className="cb1-outcome-label">😊 {lang==="np"?"भावनात्मक:":"Emotional:"}</span>
            <span className="cb1-outcome-detail">{outcome.emotional}</span>
          </div>
          <div className="cb1-outcome-row">
            <span className="cb1-outcome-label">👥 {lang==="np"?"सामाजिक:":"Social:"}</span>
            <span className="cb1-outcome-detail">{outcome.social}</span>
          </div>
        </div>
      )}

      {done && (
        <button className="cb1-next-btn cb1-fade-in" onClick={()=>onChoice(isBest)}>{t.nextBtn}</button>
      )}
    </div>
  );
}

export default function CyberbullyingResponse({ attemptId, onComplete }) {
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
    const next = [...scores, best];
    setScores(next);
    if (idx+1>=t.scenarios.length) setTimeout(()=>setPhase("results"),200);
    else setIdx(i=>i+1);
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

  const bestCount = scores.filter(Boolean).length;
  const pct = scores.length>0?bestCount/t.scenarios.length:0;
  const resultLabel = pct>=0.9?t.excellent:pct>=0.7?t.good:pct>=0.5?t.okay:t.poor;
  const resultColor = pct>=0.9?"#22c55e":pct>=0.7?"#84cc16":pct>=0.5?"#f59e0b":"#ef4444";

  return (
    <div className="cb1-app">
      <style>{CSS}</style>
      <div className="cb1-lang-bar">
        <div className="cb1-lang-toggle">
          <button className={`cb1-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`cb1-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>
      <div className="cb1-card" style={{position:"relative"}}>
        <div className="cb1-header">
          <div className="cb1-module-tag">{t.moduleTag}</div>
          <h1 className="cb1-title">{t.title}</h1>
          <p className="cb1-subtitle">{t.subtitle}</p>
        </div>
        <div className="cb1-divider"/>

        {phase==="intro" && (
          <div className="cb1-fade-in">
            <div className="cb1-intro-box">
              <div style={{fontSize:48,marginBottom:10}}>💬</div>
              <div className="cb1-intro-title">{t.introTitle}</div>
              <div className="cb1-intro-desc">{t.introDesc}</div>
            </div>
            <div className="cb1-tips-preview">
              {t.tips.map((tip,i)=>(
                <div key={i} className="cb1-tip-row"><span className="cb1-tip-icon">{tip.icon}</span><span className="cb1-tip-text">{tip.tip}</span></div>
              ))}
            </div>
            <button className="cb1-btn cb1-btn-primary" onClick={start}>{t.startBtn}</button>
          </div>
        )}

        {phase==="game" && (
          <div>
            <div className="cb1-progress-wrap">
              <div className="cb1-progress-label">
                {t.roundLabel(idx+1, t.scenarios.length)}
                <span className="cb1-score-live">{scores.filter(Boolean).length} ⭐</span>
              </div>
              <div className="cb1-progress-track"><div className="cb1-progress-fill" style={{width:`${idx/t.scenarios.length*100}%`}}/></div>
            </div>
            <ScenarioCard key={`${lang}-${idx}`} scenario={t.scenarios[idx]} t={t} lang={lang} onChoice={handleChoice}/>
          </div>
        )}

        {phase==="results" && (
          <div className="cb1-fade-in">
            <div className="cb1-results-title">{t.resultsTitle}</div>
            <div className="cb1-score-display">
              <ScoreCircle correct={bestCount} total={t.scenarios.length}/>
              <div className="cb1-score-right">
                <div className="cb1-score-label" style={{color:resultColor}}>{resultLabel}</div>
                <div className="cb1-score-sub">{t.score(bestCount,t.scenarios.length)}</div>
              </div>
            </div>
            <div className="cb1-tips-section">
              <div className="cb1-tips-title">{t.tipsTitle}</div>
              {t.tips.map((tip,i)=>(
                <div key={i} className="cb1-tip-row-green"><span className="cb1-tip-icon">{tip.icon}</span><span className="cb1-tip-text-green">{tip.tip}</span></div>
              ))}
            </div>
            <div className="cb1-btn-group">
              <button className="cb1-btn cb1-btn-outline" onClick={start}>{t.retryBtn}</button>
              <button className="cb1-btn cb1-btn-primary" onClick={handleFinish}>{t.finishBtn}</button>
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
.cb1-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.cb1-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.cb1-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.cb1-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.cb1-lang-btn.active{background:var(--blue);color:#fff}
.cb1-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.cb1-header{text-align:center;margin-bottom:20px}
.cb1-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.cb1-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px}
.cb1-subtitle{font-size:14px;color:var(--sub)}
.cb1-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}
.cb1-intro-box{text-align:center;margin-bottom:20px}
.cb1-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.cb1-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.cb1-tips-preview{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.cb1-tip-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.cb1-tip-icon{font-size:18px;flex-shrink:0}
.cb1-tip-text{font-size:13px;font-weight:700;color:var(--text)}
.cb1-btn{padding:13px;font-family:inherit;font-size:14px;font-weight:800;border-radius:10px;border:none;cursor:pointer;transition:var(--tr);width:100%}
.cb1-btn-primary{background:var(--blue);color:#fff}
.cb1-btn-primary:hover{background:#2563eb;transform:translateY(-1px)}
.cb1-btn-outline{background:transparent;color:var(--blue);border:2px solid var(--blue)}
.cb1-btn-outline:hover{background:#eff6ff}
.cb1-progress-wrap{margin-bottom:18px}
.cb1-progress-label{font-size:13px;font-weight:800;color:var(--text);margin-bottom:6px;display:flex;justify-content:space-between}
.cb1-score-live{font-size:12px;font-weight:700;color:#c2410c;background:#fff7ed;border:1px solid #fed7aa;padding:3px 10px;border-radius:50px}
.cb1-progress-track{height:8px;background:#e2e8f0;border-radius:8px;overflow:hidden}
.cb1-progress-fill{height:100%;background:var(--blue);border-radius:8px;transition:width .5s ease}
.cb1-scenario-wrap{display:flex;flex-direction:column;gap:14px}
.cb1-msg-card{background:#f0f4ff;border:2px solid #bfdbfe;border-radius:14px;overflow:hidden}
.cb1-msg-header{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#fff;border-bottom:1.5px solid #bfdbfe}
.cb1-platform-icon{font-size:22px}
.cb1-platform-name{font-size:13px;font-weight:800;color:var(--text)}
.cb1-msg-from{font-size:11px;color:var(--muted)}
.cb1-msg-bubble{padding:14px 18px;font-size:14px;color:var(--text);line-height:1.5;font-weight:600}
.cb1-options-list{display:flex;flex-direction:column;gap:8px}
.cb1-option-btn{display:flex;flex-direction:column;gap:3px;padding:14px 16px;background:#fff;border:2px solid var(--bdr);border-radius:12px;cursor:pointer;transition:var(--tr);text-align:left;width:100%;font-family:inherit}
.cb1-option-btn:hover{border-color:var(--blue);background:#f0f7ff;transform:translateY(-1px)}
.cb1-opt-label{font-size:14px;font-weight:800;color:var(--text)}
.cb1-opt-text{font-size:12px;color:var(--muted);font-style:italic}
.cb1-outcome{border-radius:12px;padding:16px 18px;border-width:2px;border-style:solid;display:flex;flex-direction:column;gap:8px}
.cb1-outcome-header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cb1-outcome-icon{font-size:24px}
.cb1-outcome-title{font-size:16px;font-weight:800}
.cb1-best-badge{font-size:11px;font-weight:800;background:#fef9c3;color:#854d0e;border:1px solid #fde047;padding:2px 8px;border-radius:50px;margin-left:auto}
.cb1-outcome-row{display:flex;flex-direction:column;gap:2px;font-size:12px;line-height:1.4;padding-top:6px;border-top:1px solid rgba(0,0,0,.06)}
.cb1-outcome-label{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
.cb1-outcome-detail{color:var(--sub)}
.cb1-next-btn{width:100%;padding:12px;font-family:inherit;font-size:14px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.cb1-next-btn:hover{background:#2563eb;transform:translateY(-1px)}
.cb1-results-title{font-size:19px;font-weight:800;color:var(--text);text-align:center;margin-bottom:18px}
.cb1-score-display{display:flex;align-items:center;gap:20px;padding:18px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:18px}
.cb1-score-right{flex:1}
.cb1-score-label{font-size:17px;font-weight:800;margin-bottom:4px}
.cb1-score-sub{font-size:13px;color:var(--sub)}
.cb1-tips-section{background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px 20px;margin-bottom:16px}
.cb1-tips-title{font-size:14px;font-weight:800;color:#166534;margin-bottom:12px}
.cb1-tip-row-green{display:flex;align-items:center;gap:12px;padding:7px 0;border-top:1px solid #bbf7d0}
.cb1-tip-row-green:first-of-type{border-top:none}
.cb1-tip-text-green{font-size:13px;font-weight:700;color:#166534}
.cb1-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cb1-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.cb1-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.cb1-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.cb1-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.cb1-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.cb1-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.cb1-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){.cb1-card{padding:24px 18px}.cb1-divider{margin:0 -18px 20px}.cb1-btn-group{grid-template-columns:1fr}.cb1-score-display{flex-direction:column;text-align:center}}
`;
