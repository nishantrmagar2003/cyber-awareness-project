import { useState, useEffect, useRef } from "react";

/* ── Translations ─────────────────────────────────── */
const T = {
  en: {
    moduleTag: "MODULE 3 · SIMULATION 2",
    title: "Privacy Settings Challenge",
    subtitle: "Configure your fake social media profile to be as private and safe as possible.",

    tabs: ["👤 Profile", "🔒 Privacy", "📢 Posts", "📊 Score"],

    profileName:  "Alex Johnson",
    profileHandle:"@alexj2005",
    profileBio:   "Student 🎓 | Love hiking 🏔️ | Kathmandu, Nepal 📍",
    profileBadge: (score) => score >= 80 ? "🛡️ Protected" : score >= 50 ? "⚠️ At Risk" : "🔴 Exposed",

    // TAB 1: Profile settings
    profileTab: {
      title:   "Profile Information",
      desc:    "Control what others can see on your profile page.",
      settings: [
        {
          id: "profile_public",
          label: "Profile Visibility",
          desc:  "Who can see your profile?",
          options: ["Everyone (Public)", "Friends Only", "Only Me"],
          safeIndex: 1,
          risk: "Public profile lets strangers see all your information.",
          fix:  "Set to Friends Only so only people you know can view your profile.",
        },
        {
          id: "phone_visible",
          label: "Phone Number",
          desc:  "Who can see your phone number?",
          options: ["Everyone", "Friends", "Only Me"],
          safeIndex: 2,
          risk: "Visible phone number enables SIM swap attacks and spam calls.",
          fix:  "Set to Only Me — your phone number should never be public.",
        },
        {
          id: "birthday_visible",
          label: "Birthday",
          desc:  "Who can see your date of birth?",
          options: ["Everyone", "Friends", "Only Me"],
          safeIndex: 2,
          risk: "Public birthday helps attackers answer your security questions.",
          fix:  "Hide your full birthday or limit it to Only Me.",
        },
        {
          id: "location_visible",
          label: "Home Location",
          desc:  "Who can see your location?",
          options: ["Everyone", "Friends", "Only Me"],
          safeIndex: 2,
          risk: "Sharing location helps strangers track your movements.",
          fix:  "Set to Only Me — never share your home address publicly.",
        },
      ],
    },

    // TAB 2: Privacy settings
    privacyTab: {
      title:   "Privacy Controls",
      desc:    "Manage who can contact and find you.",
      settings: [
        {
          id: "who_can_message",
          label: "Who Can Message You",
          desc:  "Who is allowed to send you direct messages?",
          options: ["Everyone", "Friends of Friends", "Friends Only"],
          safeIndex: 2,
          risk: "Anyone messaging you opens the door to scams and harassment.",
          fix:  "Restrict messages to Friends Only to avoid strangers contacting you.",
        },
        {
          id: "who_can_tag",
          label: "Who Can Tag You",
          desc:  "Who can tag you in posts or photos?",
          options: ["Everyone", "Friends", "No One"],
          safeIndex: 2,
          risk: "Random tagging can reveal your location and daily routine.",
          fix:  "Set to No One or Friends Only, and always review tags before they appear.",
        },
        {
          id: "search_visible",
          label: "Search Visibility",
          desc:  "Can strangers find you by searching your name?",
          options: ["Yes — visible to all", "Friends of Friends", "No — hidden"],
          safeIndex: 2,
          risk: "Being searchable by everyone makes stalking and targeting easier.",
          fix:  "Disable public search so only people you know can find you.",
        },
        {
          id: "two_factor",
          label: "Two-Factor Authentication",
          desc:  "Add an extra layer of login security.",
          options: ["Disabled", "SMS Code", "Authenticator App"],
          safeIndex: 2,
          risk: "Without 2FA, a stolen password means instant account takeover.",
          fix:  "Enable 2FA with an Authenticator App for the strongest protection.",
        },
      ],
    },

    // TAB 3: Posts settings
    postsTab: {
      title:   "Post & Content Settings",
      desc:    "Control who can see what you share.",
      settings: [
        {
          id: "default_audience",
          label: "Default Post Audience",
          desc:  "Who sees your posts by default?",
          options: ["Public", "Friends of Friends", "Friends Only"],
          safeIndex: 2,
          risk: "Public posts can be seen and saved by anyone, including strangers.",
          fix:  "Set default audience to Friends Only so your posts stay private.",
        },
        {
          id: "past_posts",
          label: "Past Posts Visibility",
          desc:  "Who can see your old posts?",
          options: ["Public", "Friends", "Only Me"],
          safeIndex: 1,
          risk: "Old public posts may contain sensitive information about you.",
          fix:  "Limit past posts to Friends to hide old personal information.",
        },
        {
          id: "story_audience",
          label: "Story Audience",
          desc:  "Who can view your stories?",
          options: ["Everyone", "Friends", "Close Friends"],
          safeIndex: 1,
          risk: "Public stories reveal your location, habits and daily routine to strangers.",
          fix:  "Restrict stories to Friends or Close Friends only.",
        },
        {
          id: "location_tags",
          label: "Location Tags in Posts",
          desc:  "Allow location to be attached to your posts?",
          options: ["Always On", "Ask Each Time", "Always Off"],
          safeIndex: 2,
          risk: "Location tags in posts build a map of where you live and spend time.",
          fix:  "Turn location tags off or always choose manually before posting.",
        },
      ],
    },

    scoreTab: {
      title:      "Your Privacy Score",
      perfect:    "🛡️ Perfect Privacy!",
      great:      "✅ Great Job!",
      okay:       "⚠️ Needs Work",
      poor:       "🔴 Very Exposed",
      fixAll:     "Fix All Settings →",
      remaining:  (n) => `${n} setting${n !== 1 ? "s" : ""} still need attention`,
      allSafe:    "All settings are configured safely! You are protected.",
      breakdown:  "Settings Breakdown",
      safe:       "Safe",
      unsafe:     "Needs Fix",
    },

    safeLabel:   "✓ Safe",
    unsafeLabel: "Fix This",
    riskLabel:   "⚠️ Risk:",
    fixLabel:    "✅ Fix:",
    scoreLabel:  "Privacy Score",
    nextTab:     "Next →",
    prevTab:     "← Back",
  },

  np: {
    moduleTag: "मड्युल ३ · सिमुलेसन २",
    title: "गोपनीयता सेटिङ चुनौती",
    subtitle: "आफ्नो नक्कली सामाजिक सञ्जाल प्रोफाइललाई यथासम्भव निजी र सुरक्षित बनाउनुहोस्।",

    tabs: ["👤 प्रोफाइल", "🔒 गोपनीयता", "📢 पोस्ट", "📊 अंक"],

    profileName:  "Alex Johnson",
    profileHandle:"@alexj2005",
    profileBio:   "विद्यार्थी 🎓 | हाइकिङ मन पर्छ 🏔️ | काठमाडौं, नेपाल 📍",
    profileBadge: (score) => score >= 80 ? "🛡️ सुरक्षित" : score >= 50 ? "⚠️ खतरामा" : "🔴 उजागर",

    profileTab: {
      title:   "प्रोफाइल जानकारी",
      desc:    "अरूले तपाईंको प्रोफाइलमा के देख्न सक्छन् नियन्त्रण गर्नुहोस्।",
      settings: [
        {
          id: "profile_public",
          label: "प्रोफाइल दृश्यता",
          desc:  "तपाईंको प्रोफाइल को हेर्न सक्छ?",
          options: ["सबैले (सार्वजनिक)", "साथीहरू मात्र", "केवल मैले"],
          safeIndex: 1,
          risk: "सार्वजनिक प्रोफाइलले अपरिचितहरूलाई तपाईंको सबै जानकारी देख्न दिन्छ।",
          fix:  "साथीहरू मात्र राख्नुहोस् ताकि चिनेका मान्छेहरू मात्र हेर्न सकून्।",
        },
        {
          id: "phone_visible",
          label: "फोन नम्बर",
          desc:  "तपाईंको फोन नम्बर को देख्न सक्छ?",
          options: ["सबैले", "साथीहरू", "केवल मैले"],
          safeIndex: 2,
          risk: "देखिने फोन नम्बरले SIM स्वाप आक्रमण र स्पाम कल सम्भव बनाउँछ।",
          fix:  "केवल मैले राख्नुहोस् — फोन नम्बर कहिल्यै सार्वजनिक नगर्नुहोस्।",
        },
        {
          id: "birthday_visible",
          label: "जन्मदिन",
          desc:  "तपाईंको जन्म मिति को देख्न सक्छ?",
          options: ["सबैले", "साथीहरू", "केवल मैले"],
          safeIndex: 2,
          risk: "सार्वजनिक जन्मदिनले आक्रमणकारीलाई सुरक्षा प्रश्नको उत्तर दिन मद्दत गर्छ।",
          fix:  "जन्मदिन लुकाउनुहोस् वा केवल मैले मा सीमित गर्नुहोस्।",
        },
        {
          id: "location_visible",
          label: "घरको स्थान",
          desc:  "तपाईंको स्थान को देख्न सक्छ?",
          options: ["सबैले", "साथीहरू", "केवल मैले"],
          safeIndex: 2,
          risk: "स्थान साझा गर्नाले अपरिचितहरूलाई तपाईंको गतिविधि थाहा हुन्छ।",
          fix:  "केवल मैले राख्नुहोस् — घरको ठेगाना कहिल्यै सार्वजनिक नगर्नुहोस्।",
        },
      ],
    },

    privacyTab: {
      title:   "गोपनीयता नियन्त्रण",
      desc:    "तपाईंलाई को सम्पर्क गर्न र खोज्न सक्छ व्यवस्थापन गर्नुहोस्।",
      settings: [
        {
          id: "who_can_message",
          label: "सन्देश पठाउन सक्ने",
          desc:  "तपाईंलाई कसले प्रत्यक्ष सन्देश पठाउन सक्छ?",
          options: ["सबैले", "साथीका साथी", "साथीहरू मात्र"],
          safeIndex: 2,
          risk: "जोसुकैले सन्देश पठाउन सक्नाले ठगी र उत्पीडनको ढोका खुल्छ।",
          fix:  "साथीहरू मात्र मा सीमित गर्नुहोस्।",
        },
        {
          id: "who_can_tag",
          label: "ट्याग गर्न सक्ने",
          desc:  "कसले तपाईंलाई पोस्ट वा फोटोमा ट्याग गर्न सक्छ?",
          options: ["सबैले", "साथीहरू", "कोही होइन"],
          safeIndex: 2,
          risk: "अनचाहिएको ट्यागले तपाईंको स्थान र दैनिक दिनचर्या उजागर गर्न सक्छ।",
          fix:  "कोही होइन वा साथीहरू मात्र राख्नुहोस् र ट्याग समीक्षा गर्नुहोस्।",
        },
        {
          id: "search_visible",
          label: "खोज दृश्यता",
          desc:  "अपरिचितहरूले नाम खोजेर तपाईंलाई भेट्टाउन सक्छन्?",
          options: ["हो — सबैलाई देखिन्छ", "साथीका साथी", "होइन — लुकेको"],
          safeIndex: 2,
          risk: "सबैले खोज्न सक्नाले पछ्याउने र लक्षित गर्न सजिलो हुन्छ।",
          fix:  "सार्वजनिक खोज बन्द गर्नुहोस्।",
        },
        {
          id: "two_factor",
          label: "दुई-चरण प्रमाणीकरण",
          desc:  "लगइन सुरक्षाको अतिरिक्त तह थप्नुहोस्।",
          options: ["असक्षम", "SMS कोड", "प्रमाणीकरण एप"],
          safeIndex: 2,
          risk: "2FA बिना, पासवर्ड चोरी भए खाता तुरुन्त हाक हुन्छ।",
          fix:  "सबैभन्दा बलियो सुरक्षाका लागि प्रमाणीकरण एपसँग 2FA सक्षम गर्नुहोस्।",
        },
      ],
    },

    postsTab: {
      title:   "पोस्ट र सामग्री सेटिङ",
      desc:    "तपाईंले साझा गर्ने कुरा को देख्न सक्छ नियन्त्रण गर्नुहोस्।",
      settings: [
        {
          id: "default_audience",
          label: "पूर्वनिर्धारित पोस्ट दर्शक",
          desc:  "तपाईंका पोस्टहरू पूर्वनिर्धारित रूपमा कसले देख्छ?",
          options: ["सार्वजनिक", "साथीका साथी", "साथीहरू मात्र"],
          safeIndex: 2,
          risk: "सार्वजनिक पोस्टहरू अपरिचितहरूले समेत हेर्न र सुरक्षित गर्न सक्छन्।",
          fix:  "पूर्वनिर्धारित दर्शक साथीहरू मात्र राख्नुहोस्।",
        },
        {
          id: "past_posts",
          label: "पुराना पोस्टको दृश्यता",
          desc:  "तपाईंका पुराना पोस्टहरू को देख्न सक्छ?",
          options: ["सार्वजनिक", "साथीहरू", "केवल मैले"],
          safeIndex: 1,
          risk: "पुराना सार्वजनिक पोस्टमा संवेदनशील जानकारी हुन सक्छ।",
          fix:  "पुराना पोस्टहरू साथीहरूमा सीमित गर्नुहोस्।",
        },
        {
          id: "story_audience",
          label: "स्टोरी दर्शक",
          desc:  "तपाईंका स्टोरीहरू को हेर्न सक्छ?",
          options: ["सबैले", "साथीहरू", "नजिकका साथी"],
          safeIndex: 1,
          risk: "सार्वजनिक स्टोरीहरूले अपरिचितहरूलाई तपाईंको स्थान र दिनचर्या देखाउँछ।",
          fix:  "स्टोरीहरू साथीहरू वा नजिकका साथीमा मात्र सीमित गर्नुहोस्।",
        },
        {
          id: "location_tags",
          label: "पोस्टमा स्थान ट्याग",
          desc:  "पोस्टमा स्थान जोड्न अनुमति दिने?",
          options: ["सधैं चालु", "प्रत्येक पटक सोध्ने", "सधैं बन्द"],
          safeIndex: 2,
          risk: "पोस्टमा स्थान ट्यागले तपाईं कहाँ बस्नुहुन्छ र समय बिताउनुहुन्छ देखाउँछ।",
          fix:  "स्थान ट्याग बन्द गर्नुहोस् वा पोस्ट गर्नु अघि म्यानुअल रूपमा छान्नुहोस्।",
        },
      ],
    },

    scoreTab: {
      title:      "तपाईंको गोपनीयता अंक",
      perfect:    "🛡️ उत्तम गोपनीयता!",
      great:      "✅ राम्रो काम!",
      okay:       "⚠️ सुधार चाहिन्छ",
      poor:       "🔴 धेरै उजागर",
      fixAll:     "सबै सेटिङ ठीक गर्नुहोस् →",
      remaining:  (n) => `${n} सेटिङमा अझै ध्यान चाहिन्छ`,
      allSafe:    "सबै सेटिङ सुरक्षित रूपमा कन्फिगर गरिएको छ! तपाईं सुरक्षित हुनुहुन्छ।",
      breakdown:  "सेटिङ विवरण",
      safe:       "सुरक्षित",
      unsafe:     "ठीक गर्नुहोस्",
    },

    safeLabel:   "✓ सुरक्षित",
    unsafeLabel: "ठीक गर्नुहोस्",
    riskLabel:   "⚠️ खतरा:",
    fixLabel:    "✅ समाधान:",
    scoreLabel:  "गोपनीयता अंक",
    nextTab:     "अर्को →",
    prevTab:     "← पछाडि",
  },
};

/* ── Fake profile avatar ──────────────────────────── */
function ProfileCard({ t, score, settings, allSettings }) {
  const badge = t.profileBadge(score);
  const badgeColor = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const profileSetting = allSettings["profile_public"];
  const isPublic = profileSetting === 0;

  return (
    <div className="psc-profile-preview">
      <div className="psc-profile-cover" style={{ background: score >= 80 ? "linear-gradient(135deg,#22c55e22,#3b82f622)" : score >= 50 ? "linear-gradient(135deg,#f59e0b22,#ef444422)" : "linear-gradient(135deg,#ef444422,#7f1d1d22)" }} />
      <div className="psc-profile-avatar">👤</div>
      <div className="psc-profile-info">
        <div className="psc-profile-name">{t.profileName}</div>
        <div className="psc-profile-handle">{t.profileHandle}</div>
        <div className="psc-profile-bio">{t.profileBio}</div>
        <div className="psc-profile-badge" style={{ background: badgeColor + "22", color: badgeColor, border: `1.5px solid ${badgeColor}55` }}>
          {badge}
        </div>
        {isPublic && <div className="psc-public-warn">🌐 Public Profile — anyone can see this!</div>}
      </div>
    </div>
  );
}

/* ── Single setting row ───────────────────────────── */
function SettingRow({ setting, value, onChange, t }) {
  const isSafe = value === setting.safeIndex;
  return (
    <div className={`psc-setting-row ${isSafe ? "is-safe" : "is-unsafe"}`}>
      <div className="psc-setting-top">
        <div className="psc-setting-info">
          <div className="psc-setting-label">{setting.label}</div>
          <div className="psc-setting-desc">{setting.desc}</div>
        </div>
        <span className={`psc-setting-badge ${isSafe ? "badge-safe" : "badge-unsafe"}`}>
          {isSafe ? t.safeLabel : t.unsafeLabel}
        </span>
      </div>

      {/* Option buttons */}
      <div className="psc-options-row">
        {setting.options.map((opt, i) => (
          <button
            key={i}
            className={`psc-option-btn ${value === i ? "selected" : ""} ${i === setting.safeIndex ? "is-best" : ""}`}
            onClick={() => onChange(i)}
          >
            {i === setting.safeIndex && <span className="psc-best-dot">●</span>}
            {opt}
          </button>
        ))}
      </div>

      {/* Risk / fix info */}
      {!isSafe && (
        <div className="psc-risk-box">
          <div className="psc-risk-line"><span className="psc-risk-label">{t.riskLabel}</span> {setting.risk}</div>
          <div className="psc-fix-line"><span className="psc-fix-label">{t.fixLabel}</span> {setting.fix}</div>
        </div>
      )}
    </div>
  );
}

/* ── Score circle ─────────────────────────────────── */
function ScoreCircle({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#84cc16" : score >= 40 ? "#f59e0b" : "#ef4444";
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="psc-score-circle-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 0.7s ease, stroke 0.4s" }} />
      </svg>
      <div className="psc-score-num" style={{ color }}>{score}</div>
      <div className="psc-score-sub">/ 100</div>
    </div>
  );
}

/* ── Main component ───────────────────────────────── */
export default function PrivacySettingsChallengeSimulation({ attemptId, onComplete }) {
  const [lang, setLang]   = useState("en");
  const [activeTab, setActiveTab] = useState(0);
  const [done, setDone]   = useState(false);
  const startTime         = useRef(Date.now());
  const t = T[lang];

  // Collect all settings from all tabs
  const allTabSettings = [t.profileTab, t.privacyTab, t.postsTab];
  const allSettings = allTabSettings.flatMap(tab => tab.settings);

  // State: each setting starts at 0 (worst/most public)
  const [values, setValues] = useState(() => {
    const init = {};
    allSettings.forEach(s => { init[s.id] = 0; });
    return init;
  });

  // Reset on lang change (re-sync ids)
  useEffect(() => {
    const init = {};
    allTabSettings.flatMap(tab => tab.settings).forEach(s => { init[s.id] = 0; });
    setValues(init);
  }, [lang]);

  function handleChange(id, val) {
    setValues(prev => ({ ...prev, [id]: val }));
  }

  // Score calculation
  const totalSettings  = allSettings.length;
  const safeCount      = allSettings.filter(s => values[s.id] === s.safeIndex).length;
  const score          = Math.round((safeCount / totalSettings) * 100);
  const unsafeSettings = allSettings.filter(s => values[s.id] !== s.safeIndex);

  function fixAll() {
    const fixed = {};
    allSettings.forEach(s => { fixed[s.id] = s.safeIndex; });
    setValues(fixed);
  }

  function handleFinish() {
    setDone(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    if (onComplete) {
      onComplete({
        answers: {
          score,
          settingsState:   values,
          safeCount,
          totalSettings,
          unsafeRemaining: unsafeSettings.length,
        },
        score,
        timeTaken,
      });
    }
  }

  const currentTabData = allTabSettings[activeTab];

  // Score label
  const scoreLabel = score >= 90 ? t.scoreTab.perfect : score >= 70 ? t.scoreTab.great : score >= 45 ? t.scoreTab.okay : t.scoreTab.poor;
  const scoreLabelColor = score >= 90 ? "#22c55e" : score >= 70 ? "#84cc16" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="psc-app">
      <style>{CSS}</style>

      {/* Lang bar */}
      <div className="psc-lang-bar">
        <div className="psc-lang-toggle">
          <button className={`psc-lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>🇬🇧 English</button>
          <button className={`psc-lang-btn ${lang === "np" ? "active" : ""}`} onClick={() => setLang("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="psc-card">

        {/* Header */}
        <div className="psc-header">
          <div className="psc-module-tag">{t.moduleTag}</div>
          <h1 className="psc-title">{t.title}</h1>
          <p className="psc-subtitle">{t.subtitle}</p>
        </div>

        {/* Live score pill in header */}
        <div className="psc-live-score">
          <span className="psc-live-score-label">{t.scoreLabel}</span>
          <span className="psc-live-score-value" style={{ color: scoreLabelColor, borderColor: scoreLabelColor + "55", background: scoreLabelColor + "11" }}>
            {score}/100
          </span>
        </div>

        {/* Profile preview */}
        <ProfileCard t={t} score={score} settings={values} allSettings={values} />

        <div className="psc-divider" />

        {/* Tabs */}
        <div className="psc-tabs">
          {t.tabs.map((tab, i) => {
            const tabData = i < 3 ? allTabSettings[i] : null;
            const tabUnsafe = tabData ? tabData.settings.filter(s => values[s.id] !== s.safeIndex).length : 0;
            return (
              <button key={i} className={`psc-tab ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                {tab}
                {tabUnsafe > 0 && i < 3 && <span className="psc-tab-badge">{tabUnsafe}</span>}
              </button>
            );
          })}
        </div>

        <div className="psc-tab-content">

          {/* ── SETTINGS TABS 0-2 ── */}
          {activeTab < 3 && (
            <div className="psc-fade-in">
              <div className="psc-tab-title">{currentTabData.title}</div>
              <div className="psc-tab-desc">{currentTabData.desc}</div>
              <div className="psc-settings-list">
                {currentTabData.settings.map(setting => (
                  <SettingRow
                    key={setting.id}
                    setting={setting}
                    value={values[setting.id]}
                    onChange={(v) => handleChange(setting.id, v)}
                    t={t}
                  />
                ))}
              </div>
              <div className="psc-nav-row">
                {activeTab > 0 && <button className="psc-nav-btn" onClick={() => setActiveTab(activeTab - 1)}>{t.prevTab}</button>}
                <button className="psc-nav-btn psc-nav-next" onClick={() => setActiveTab(activeTab + 1)}>{t.nextTab}</button>
              </div>
            </div>
          )}

          {/* ── SCORE TAB ── */}
          {activeTab === 3 && (
            <div className="psc-fade-in">
              <div className="psc-tab-title">{t.scoreTab.title}</div>

              {/* Big score display */}
              <div className="psc-score-display">
                <ScoreCircle score={score} />
                <div className="psc-score-right">
                  <div className="psc-score-grade" style={{ color: scoreLabelColor }}>{scoreLabel}</div>
                  <div className="psc-score-safe-count">
                    <span className="psc-sc-num" style={{ color: "#22c55e" }}>{safeCount}</span>
                    <span className="psc-sc-text"> / {totalSettings} {t.scoreTab.safe}</span>
                  </div>
                  {unsafeSettings.length > 0
                    ? <div className="psc-score-remain">{t.scoreTab.remaining(unsafeSettings.length)}</div>
                    : <div className="psc-score-allsafe">{t.scoreTab.allSafe}</div>
                  }
                </div>
              </div>

              {/* Breakdown by tab */}
              <div className="psc-breakdown-title">{t.scoreTab.breakdown}</div>
              <div className="psc-breakdown-grid">
                {allTabSettings.map((tab, ti) => {
                  const safeInTab   = tab.settings.filter(s => values[s.id] === s.safeIndex).length;
                  const totalInTab  = tab.settings.length;
                  const pct         = Math.round((safeInTab / totalInTab) * 100);
                  const col         = pct === 100 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={ti} className="psc-breakdown-card" onClick={() => setActiveTab(ti)} style={{ cursor: "pointer" }}>
                      <div className="psc-breakdown-label">{t.tabs[ti]}</div>
                      <div className="psc-breakdown-bar-track">
                        <div className="psc-breakdown-bar-fill" style={{ width: `${pct}%`, background: col, transition: "width 0.6s ease" }} />
                      </div>
                      <div className="psc-breakdown-pct" style={{ color: col }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Unsafe list */}
              {unsafeSettings.length > 0 && (
                <>
                  <div className="psc-unsafe-list">
                    {unsafeSettings.map((s, i) => (
                      <div key={i} className="psc-unsafe-item">
                        <span className="psc-unsafe-dot">⚠️</span>
                        <span className="psc-unsafe-name">{s.label}</span>
                        <span className="psc-unsafe-fix">{s.fix}</span>
                      </div>
                    ))}
                  </div>
                  <button className="psc-fix-all-btn" onClick={fixAll}>{t.scoreTab.fixAll}</button>
                </>
              )}

              {score === 100 && (
                <div className="psc-perfect-banner">
                  <div className="psc-perfect-icon">🎉</div>
                  <div className="psc-perfect-text">{t.scoreTab.allSafe}</div>
                </div>
              )}

              <div className="psc-nav-row" style={{ flexDirection: "column", gap: 10 }}>
                <button className="psc-nav-btn" onClick={() => setActiveTab(2)}>{t.prevTab}</button>
                {!done ? (
                  <button
                    className="psc-nav-btn psc-nav-next"
                    style={{ background: "#22c55e", color: "#fff", border: "none" }}
                    onClick={handleFinish}
                  >
                    {lang === "np" ? "✅ सिमुलेसन सम्पन्न गर्नुहोस्" : "✅ Finish Simulation"}
                  </button>
                ) : (
                  <div style={{
                    padding: "12px", textAlign: "center", background: "#f0fdf4",
                    border: "1.5px solid #86efac", borderRadius: 10,
                    color: "#166534", fontWeight: 700, fontSize: 14,
                  }}>
                    {lang === "np" ? "🎉 प्रगति सुरक्षित गरिँदैछ…" : "🎉 Saving your progress…"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
  --blue:#3b82f6;--green:#22c55e;--red:#ef4444;--amber:#f59e0b;
  --r:16px;--sh:0 6px 32px rgba(30,42,56,.10);
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.psc-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}

/* lang */
.psc-lang-bar{display:flex;justify-content:flex-end;max-width:700px;margin:0 auto 16px}
.psc-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.psc-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:all .25s}
.psc-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}

/* card */
.psc-card{background:var(--card);border-radius:var(--r);max-width:700px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}

/* header */
.psc-header{text-align:center;margin-bottom:12px}
.psc-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.psc-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.psc-subtitle{font-size:14px;color:var(--sub);line-height:1.6}

/* live score pill */
.psc-live-score{display:flex;align-items:center;justify-content:center;gap:10px;margin:14px 0}
.psc-live-score-label{font-size:13px;font-weight:700;color:var(--sub)}
.psc-live-score-value{font-size:15px;font-weight:800;padding:4px 16px;border-radius:50px;border-width:1.5px;border-style:solid;transition:all .4s}

/* profile preview */
.psc-profile-preview{border:1.5px solid var(--bdr);border-radius:14px;overflow:hidden;margin-bottom:4px;position:relative}
.psc-profile-cover{height:70px;transition:background .5s}
.psc-profile-avatar{width:52px;height:52px;border-radius:50%;background:#e2e8f0;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:26px;margin:-26px 0 0 20px;position:relative;z-index:1}
.psc-profile-info{padding:8px 20px 16px}
.psc-profile-name{font-size:16px;font-weight:800;color:var(--text)}
.psc-profile-handle{font-size:12px;color:var(--muted);margin-bottom:4px}
.psc-profile-bio{font-size:13px;color:var(--sub);margin-bottom:10px;line-height:1.4}
.psc-profile-badge{display:inline-block;font-size:12px;font-weight:800;padding:4px 12px;border-radius:50px}
.psc-public-warn{margin-top:8px;font-size:12px;font-weight:700;color:#c2410c;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:6px 10px}

.psc-divider{height:1px;background:var(--bdr);margin:20px -32px}

/* tabs */
.psc-tabs{display:flex;gap:4px;margin-bottom:20px;background:#f8fafc;border-radius:12px;padding:4px;border:1.5px solid var(--bdr)}
.psc-tab{flex:1;padding:9px 6px;border:none;border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:all .25s;position:relative;white-space:nowrap}
.psc-tab.active{background:var(--card);color:var(--blue);box-shadow:0 2px 8px rgba(0,0,0,.08)}
.psc-tab-badge{position:absolute;top:4px;right:4px;width:16px;height:16px;border-radius:50%;background:var(--red);color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center}

.psc-tab-content{min-height:300px}
.psc-tab-title{font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px}
.psc-tab-desc{font-size:13px;color:var(--muted);margin-bottom:16px}

/* setting rows */
.psc-settings-list{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}
.psc-setting-row{border-radius:12px;padding:16px;border:1.5px solid var(--bdr);background:#f8fafc;transition:all .3s}
.psc-setting-row.is-safe{border-color:#86efac;background:#f0fdf4}
.psc-setting-row.is-unsafe{border-color:#fca5a5;background:#fff8f8}
.psc-setting-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
.psc-setting-label{font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px}
.psc-setting-desc{font-size:12px;color:var(--muted)}
.psc-setting-badge{font-size:11px;font-weight:800;padding:3px 10px;border-radius:50px;flex-shrink:0;white-space:nowrap}
.badge-safe{background:#f0fdf4;color:#166534;border:1px solid #86efac}
.badge-unsafe{background:#fff5f5;color:#b91c1c;border:1px solid #fca5a5}

/* options */
.psc-options-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px}
.psc-option-btn{padding:7px 14px;border:1.5px solid var(--bdr);border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--sub);transition:all .2s;position:relative}
.psc-option-btn:hover{border-color:#93c5fd;color:var(--blue)}
.psc-option-btn.selected{border-color:var(--blue);background:#eff6ff;color:var(--blue)}
.psc-option-btn.selected.is-best{border-color:var(--green);background:#f0fdf4;color:#166534}
.psc-best-dot{font-size:8px;color:var(--green);margin-right:4px}

/* risk/fix */
.psc-risk-box{margin-top:10px;padding:10px 12px;background:#fff;border-radius:8px;border:1px solid #fca5a5}
.psc-risk-line,.psc-fix-line{font-size:12px;color:var(--sub);line-height:1.5;padding:2px 0}
.psc-risk-label{font-weight:800;color:#b91c1c}
.psc-fix-label{font-weight:800;color:#166534}

/* nav */
.psc-nav-row{display:flex;justify-content:space-between;margin-top:8px}
.psc-nav-btn{padding:10px 20px;border:1.5px solid var(--bdr);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;background:#f8fafc;color:var(--sub);cursor:pointer;transition:all .2s}
.psc-nav-btn:hover{border-color:var(--blue);color:var(--blue)}
.psc-nav-next{background:var(--blue);color:#fff;border-color:var(--blue)}
.psc-nav-next:hover{background:#2563eb;color:#fff}

/* score tab */
.psc-score-display{display:flex;align-items:center;gap:24px;padding:20px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:20px}
.psc-score-circle-wrap{position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.psc-score-num{position:absolute;font-size:26px;font-weight:800}
.psc-score-sub{position:absolute;bottom:18px;font-size:11px;color:var(--muted);font-weight:700}
.psc-score-grade{font-size:20px;font-weight:800;margin-bottom:6px}
.psc-score-safe-count{font-size:14px;color:var(--sub);margin-bottom:4px}
.psc-sc-num{font-size:22px;font-weight:800}
.psc-score-remain{font-size:13px;color:#c2410c;font-weight:700;background:#fff7ed;padding:6px 10px;border-radius:8px;border:1px solid #fed7aa;margin-top:4px}
.psc-score-allsafe{font-size:13px;color:#166534;font-weight:700;background:#f0fdf4;padding:6px 10px;border-radius:8px;border:1px solid #86efac;margin-top:4px}

/* breakdown */
.psc-breakdown-title{font-size:14px;font-weight:800;color:var(--text);margin-bottom:10px}
.psc-breakdown-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.psc-breakdown-card{background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px;padding:12px;transition:all .2s}
.psc-breakdown-card:hover{border-color:#93c5fd;background:#eff6ff}
.psc-breakdown-label{font-size:12px;font-weight:700;color:var(--sub);margin-bottom:8px}
.psc-breakdown-bar-track{height:6px;background:#e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:6px}
.psc-breakdown-bar-fill{height:100%;border-radius:6px}
.psc-breakdown-pct{font-size:13px;font-weight:800}

/* unsafe list */
.psc-unsafe-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.psc-unsafe-item{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:#fff5f5;border:1.5px solid #fca5a5;border-radius:10px}
.psc-unsafe-dot{font-size:14px;flex-shrink:0}
.psc-unsafe-name{font-size:13px;font-weight:800;color:#b91c1c;min-width:120px;flex-shrink:0}
.psc-unsafe-fix{font-size:12px;color:#7f1d1d;line-height:1.4}

.psc-fix-all-btn{width:100%;padding:13px;font-family:inherit;font-size:14px;font-weight:800;background:var(--green);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:all .2s;margin-bottom:16px}
.psc-fix-all-btn:hover{background:#16a34a;transform:translateY(-1px);box-shadow:0 4px 16px rgba(34,197,94,.3)}

.psc-perfect-banner{display:flex;align-items:center;gap:14px;padding:18px 22px;background:#f0fdf4;border:2px solid #86efac;border-radius:14px;margin-bottom:16px}
.psc-perfect-icon{font-size:36px}
.psc-perfect-text{font-size:14px;font-weight:700;color:#166534;line-height:1.5}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.psc-fade-in{animation:fadeUp .35s ease}

@media(max-width:520px){
  .psc-card{padding:24px 18px}
  .psc-divider{margin:16px -18px}
  .psc-tabs{gap:2px}
  .psc-tab{font-size:10px;padding:8px 4px}
  .psc-options-row{flex-direction:column}
  .psc-score-display{flex-direction:column;text-align:center}
  .psc-breakdown-grid{grid-template-columns:1fr}
}
`;