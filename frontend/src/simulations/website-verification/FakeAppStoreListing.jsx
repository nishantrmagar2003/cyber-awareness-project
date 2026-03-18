import { useState } from "react";

const T = {
  en: {
    moduleTag: "MODULE 6 · SIMULATION 2",
    title: "Fake App Store Listing",
    subtitle: "Spot the red flags before you install.",

    introTitle: "📲 Not Every App is Safe",
    introDesc: "Fake apps steal data, show ads, or install malware. Learn to read the warning signs before tapping Install.",
    startBtn: "Start →",

    roundLabel: (i, t) => `App ${i} of ${t}`,
    instruction: "Would you install this app?",
    installBtn: "📲 Install",
    skipBtn: "🚫 Don't Install",
    correctTitle: "✅ Correct!",
    wrongTitle: "❌ Wrong!",
    nextBtn: "Next →",
    finishBtn: "✅ Finish",

    resultsTitle: "Your Results",
    score: (c, t) => `${c} / ${t} correct`,
    excellent: "🏆 App safety expert!",
    good: "👍 Good — keep practising.",
    okay: "⚠️ Be more careful!",
    poor: "🔴 Need more practice.",
    retryBtn: "Try Again →",

    tipsTitle: "🔍 Before You Install",
    tips: [
      { icon: "👤", title: "Check the developer",  desc: "Official apps come from verified, named publishers." },
      { icon: "⭐", title: "Read reviews",          desc: "Repeated 5-star reviews with no text = fake reviews." },
      { icon: "📥", title: "Download count",        desc: "Popular apps have millions of installs. Low count = suspicious." },
      { icon: "🔑", title: "Check permissions",     desc: "A flashlight app doesn't need your contacts or SMS." },
      { icon: "📅", title: "Last updated",          desc: "Apps not updated in years may be abandoned or malicious." },
    ],

    reviewsLabel: "Reviews",
    downloadsLabel: "Downloads",
    developerLabel: "Developer",
    versionLabel: "Version",
    updatedLabel: "Last Updated",
    permissionsLabel: "Permissions Requested",
    ratingsLabel: "ratings",
    ratingLabel: "Rating",
    sizeLabel: "Size",

    apps: [
      {
        id: 1,
        isSafe: false,
        name: "FlashLight Pro Ultra",
        icon: "🔦",
        category: "Tools",
        developer: "AppDevStudio2024",
        developerVerified: false,
        rating: 4.9,
        ratingCount: "42",
        downloads: "500+",
        version: "1.0",
        size: "2.3 MB",
        lastUpdated: "3 years ago",
        description: "Best flashlight app!! Turn on your flashlight easely. Many feature inside!!",
        permissions: ["📞 Contacts", "💬 SMS", "📷 Camera", "📍 Location", "🎙️ Microphone"],
        reviews: [
          { user: "user1234", stars: 5, text: "Best app ever!!!" },
          { user: "john_xx",  stars: 5, text: "Amazing!! 5 stars!!" },
          { user: "sarah99",  stars: 1, text: "Stole my contacts. DO NOT INSTALL." },
        ],
        flags: [
          { icon: "📥", flag: "Only 500 downloads",     note: "Legitimate flashlight apps have millions of installs." },
          { icon: "🔑", flag: "Excessive permissions",   note: "A flashlight needs the camera only. Contacts, SMS & mic are spyware signs." },
          { icon: "✏️", flag: "Grammar errors",          note: "'easely', '!!' — low-quality description signals a rushed fake." },
          { icon: "⭐", flag: "Suspicious reviews",      note: "Two generic 5-star reviews and one warning review." },
          { icon: "📅", flag: "3 years since update",   note: "Abandoned or malicious apps often stop receiving updates." },
          { icon: "👤", flag: "Unknown developer",       note: "'AppDevStudio2024' is not a verified publisher." },
        ],
        lesson: "A flashlight only needs camera permission. Anything else = data harvesting.",
      },
      {
        id: 2,
        isSafe: true,
        name: "Google Maps",
        icon: "🗺️",
        category: "Navigation",
        developer: "Google LLC",
        developerVerified: true,
        rating: 4.3,
        ratingCount: "14.2M",
        downloads: "10B+",
        version: "11.142.0",
        size: "95 MB",
        lastUpdated: "2 days ago",
        description: "Navigate your world faster and easier with Google Maps. Real-time GPS navigation, traffic, transit, and details about millions of places.",
        permissions: ["📍 Location", "🎙️ Microphone", "💾 Storage"],
        reviews: [
          { user: "Ramesh K.", stars: 5, text: "Works perfectly in Nepal, even offline." },
          { user: "Maya T.",   stars: 4, text: "Battery usage could be lower but great app." },
          { user: "Sita P.",   stars: 4, text: "Accurate and fast. Use it daily." },
        ],
        flags: [],
        lesson: "Verified developer, billions of installs, updated recently, permissions make sense for navigation.",
      },
      {
        id: 3,
        isSafe: false,
        name: "Free VPN Master - Unlimited",
        icon: "🛡️",
        category: "Security",
        developer: "SecureNet Apps",
        developerVerified: false,
        rating: 4.8,
        ratingCount: "210",
        downloads: "1,000+",
        version: "2.1",
        size: "4.1 MB",
        lastUpdated: "1 year ago",
        description: "100% FREE VPN! Unlimited data! No logs! Protect yourself now! Best VPN ever made!!",
        permissions: ["📡 Network access", "📞 Contacts", "💬 SMS", "📧 Email", "📷 Camera"],
        reviews: [
          { user: "vpnfan01",  stars: 5, text: "Great VPN works fast!!!" },
          { user: "netuser22", stars: 5, text: "Love it, free and fast!!!" },
          { user: "privacyguy", stars: 1, text: "Sells your data. Found ads for my recent searches." },
        ],
        flags: [
          { icon: "🆓", flag: "Truly free VPN = red flag",  note: "VPNs cost money to run. 'Free unlimited' means YOU are the product." },
          { icon: "📞", flag: "Contacts & SMS permission",  note: "A VPN only needs network access. Contacts and SMS = data theft." },
          { icon: "📥", flag: "Only 1,000 downloads",       note: "Tiny user base for an app claiming to be 'best ever'." },
          { icon: "⭐", flag: "Fake-looking reviews",        note: "Only 5-star reviews except one warning. Generic praise with '!!!'." },
          { icon: "👤", flag: "Unverified developer",       note: "'SecureNet Apps' has no track record or verification badge." },
        ],
        lesson: "Free VPNs with excessive permissions sell your data. Use trusted paid VPNs only.",
      },
      {
        id: 4,
        isSafe: true,
        name: "WhatsApp Messenger",
        icon: "💬",
        category: "Communication",
        developer: "WhatsApp LLC",
        developerVerified: true,
        rating: 4.0,
        ratingCount: "185M",
        downloads: "5B+",
        version: "2.24.10",
        size: "38 MB",
        lastUpdated: "5 days ago",
        description: "Simple, reliable, private messaging and calling for free. WhatsApp is used by over 2 billion people in more than 180 countries.",
        permissions: ["📞 Contacts", "🎙️ Microphone", "📷 Camera", "💾 Storage", "📍 Location"],
        reviews: [
          { user: "Bikash R.", stars: 5, text: "Best messaging app. Works everywhere." },
          { user: "Priya S.",  stars: 4, text: "Some features could be improved but reliable." },
          { user: "Arun M.",   stars: 3, text: "Takes up storage but does the job." },
        ],
        flags: [],
        lesson: "Verified publisher, 5 billion installs, mixed genuine reviews, permissions match a messaging app's features.",
      },
    ],
  },

  np: {
    moduleTag: "मड्युल ६ · सिमुलेसन २",
    title: "नक्कली एप स्टोर लिस्टिङ",
    subtitle: "इन्स्टल गर्नु अघि खतराका संकेत पहिचान गर्नुहोस्।",

    introTitle: "📲 हरेक एप सुरक्षित हुँदैन",
    introDesc: "नक्कली एपहरूले डेटा चोर्छन्, विज्ञापन देखाउँछन् वा मालवेयर इन्स्टल गर्छन्। Install थिच्नु अघि चेतावनी संकेतहरू पढ्न सिक्नुहोस्।",
    startBtn: "सुरु →",

    roundLabel: (i, t) => `एप ${i} / ${t}`,
    instruction: "के तपाईं यो एप इन्स्टल गर्नुहुन्छ?",
    installBtn: "📲 इन्स्टल",
    skipBtn: "🚫 इन्स्टल नगर्नुहोस्",
    correctTitle: "✅ सही!",
    wrongTitle: "❌ गलत!",
    nextBtn: "अर्को →",
    finishBtn: "✅ समाप्त",

    resultsTitle: "नतिजा",
    score: (c, t) => `${c} / ${t} सही`,
    excellent: "🏆 एप सुरक्षा विशेषज्ञ!",
    good: "👍 राम्रो — अभ्यास जारी राख्नुहोस्।",
    okay: "⚠️ थप सावधान रहनुहोस्!",
    poor: "🔴 अझ अभ्यास गर्नुहोस्।",
    retryBtn: "फेरि प्रयास →",

    tipsTitle: "🔍 इन्स्टल गर्नु अघि",
    tips: [
      { icon: "👤", title: "डेभलपर जाँच्नुहोस्", desc: "आधिकारिक एपहरू प्रमाणित नामधारी प्रकाशकबाट आउँछन्।" },
      { icon: "⭐", title: "समीक्षा पढ्नुहोस्",   desc: "पाठ नभएका दोहोरो ५-स्टार समीक्षा = नक्कली समीक्षा।" },
      { icon: "📥", title: "डाउनलोड संख्या",       desc: "लोकप्रिय एपहरूमा लाखौं इन्स्टल हुन्छन्। कम = संदिग्ध।" },
      { icon: "🔑", title: "अनुमतिहरू जाँच्नुहोस्", desc: "टर्चलाइट एपलाई तपाईंको सम्पर्क वा SMS चाहिँदैन।" },
      { icon: "📅", title: "अन्तिम अपडेट",          desc: "वर्षौंदेखि अपडेट नभएको एप = त्यागिएको वा खतरनाक।" },
    ],

    reviewsLabel: "समीक्षाहरू",
    downloadsLabel: "डाउनलोड",
    developerLabel: "डेभलपर",
    versionLabel: "संस्करण",
    updatedLabel: "अन्तिम अपडेट",
    permissionsLabel: "माग गरिएका अनुमतिहरू",
    ratingsLabel: "मूल्याङ्कनहरू",
    ratingLabel: "मूल्याङ्कन",
    sizeLabel: "साइज",

    apps: [
      {
        id: 1,
        isSafe: false,
        name: "FlashLight Pro Ultra",
        icon: "🔦",
        category: "टुल्स",
        developer: "AppDevStudio2024",
        developerVerified: false,
        rating: 4.9,
        ratingCount: "४२",
        downloads: "५००+",
        version: "1.0",
        size: "2.3 MB",
        lastUpdated: "३ वर्ष अघि",
        description: "सबैभन्दा राम्रो टर्चलाइट एप!! टर्चलाइट सजिलै चालु गर्नुहोस्। धेरै फिचर भित्र छन्!!",
        permissions: ["📞 सम्पर्कहरू", "💬 SMS", "📷 क्यामेरा", "📍 स्थान", "🎙️ माइक्रोफोन"],
        reviews: [
          { user: "user1234", stars: 5, text: "सबैभन्दा राम्रो एप!!!" },
          { user: "john_xx",  stars: 5, text: "अद्भुत!! ५ स्टार!!" },
          { user: "sarah99",  stars: 1, text: "मेरो सम्पर्क चोर्यो। इन्स्टल नगर्नुहोस्।" },
        ],
        flags: [
          { icon: "📥", flag: "५०० मात्र डाउनलोड",      note: "वैध टर्चलाइट एपहरूमा लाखौं इन्स्टल हुन्छन्।" },
          { icon: "🔑", flag: "अत्यधिक अनुमतिहरू",       note: "टर्चलाइटलाई क्यामेरा मात्र चाहिन्छ। सम्पर्क र SMS = स्पाइवेयर।" },
          { icon: "✏️", flag: "व्याकरण गल्तीहरू",        note: "कमजोर विवरण = जल्दबाजीमा बनाइएको नक्कली एप।" },
          { icon: "⭐", flag: "संदिग्ध समीक्षाहरू",       note: "दुई जेनेरिक ५-स्टार र एउटा चेतावनी समीक्षा।" },
          { icon: "📅", flag: "३ वर्षदेखि अपडेट छैन",    note: "त्यागिएका वा खतरनाक एपहरूले अपडेट पाउन छाड्छन्।" },
          { icon: "👤", flag: "अज्ञात डेभलपर",            note: "'AppDevStudio2024' प्रमाणित प्रकाशक होइन।" },
        ],
        lesson: "टर्चलाइटलाई क्यामेरा अनुमति मात्र चाहिन्छ। अरू = डेटा संकलन।",
      },
      {
        id: 2,
        isSafe: true,
        name: "Google Maps",
        icon: "🗺️",
        category: "नेभिगेसन",
        developer: "Google LLC",
        developerVerified: true,
        rating: 4.3,
        ratingCount: "१४.२M",
        downloads: "१०B+",
        version: "11.142.0",
        size: "95 MB",
        lastUpdated: "२ दिन अघि",
        description: "Google Maps सँग आफ्नो संसार छिटो र सजिलो नेभिगेट गर्नुहोस्। वास्तविक-समय GPS नेभिगेसन, ट्राफिक, ट्रान्जिट।",
        permissions: ["📍 स्थान", "🎙️ माइक्रोफोन", "💾 भण्डारण"],
        reviews: [
          { user: "रमेश क.", stars: 5, text: "नेपालमा पनि राम्रो काम गर्छ, अफलाइनमा पनि।" },
          { user: "माया त.", stars: 4, text: "ब्याट्री खपत कम गर्न सकिन्थ्यो तर राम्रो एप।" },
          { user: "सीता प.", stars: 4, text: "सही र छिटो। दैनिक प्रयोग गर्छु।" },
        ],
        flags: [],
        lesson: "प्रमाणित डेभलपर, अरबौं इन्स्टल, हालसालै अपडेट, नेभिगेसनका लागि उचित अनुमतिहरू।",
      },
      {
        id: 3,
        isSafe: false,
        name: "Free VPN Master - Unlimited",
        icon: "🛡️",
        category: "सुरक्षा",
        developer: "SecureNet Apps",
        developerVerified: false,
        rating: 4.8,
        ratingCount: "२१०",
        downloads: "१,०००+",
        version: "2.1",
        size: "4.1 MB",
        lastUpdated: "१ वर्ष अघि",
        description: "१००% निःशुल्क VPN! असीमित डेटा! कुनै लग छैन! अहिलै सुरक्षित गर्नुहोस्! सबैभन्दा राम्रो VPN!!",
        permissions: ["📡 नेटवर्क", "📞 सम्पर्कहरू", "💬 SMS", "📧 इमेल", "📷 क्यामेरा"],
        reviews: [
          { user: "vpnfan01",   stars: 5, text: "राम्रो VPN छिटो काम गर्छ!!!" },
          { user: "netuser22",  stars: 5, text: "मन पर्यो, निःशुल्क र छिटो!!!" },
          { user: "privacyguy", stars: 1, text: "डेटा बेच्छ। मेरो हालैका खोजका विज्ञापन देखाउँछ।" },
        ],
        flags: [
          { icon: "🆓", flag: "निःशुल्क VPN = खतराको संकेत", note: "VPN चलाउन पैसा लाग्छ। 'निःशुल्क असीमित' = तपाईं नै उत्पाद।" },
          { icon: "📞", flag: "सम्पर्क र SMS अनुमति",        note: "VPN लाई नेटवर्क मात्र चाहिन्छ। सम्पर्क र SMS = डेटा चोरी।" },
          { icon: "📥", flag: "१,००० मात्र डाउनलोड",         note: "'सबैभन्दा राम्रो' दाबी गर्ने एपमा थोरै प्रयोगकर्ता।" },
          { icon: "⭐", flag: "नक्कली-देखिने समीक्षाहरू",    note: "एउटा चेतावनी बाहेक सबै ५-स्टार। '!!!' भएका सामान्य प्रशंसा।" },
          { icon: "👤", flag: "अप्रमाणित डेभलपर",            note: "'SecureNet Apps' को कुनै ट्र्याक रेकर्ड छैन।" },
        ],
        lesson: "अत्यधिक अनुमति भएका निःशुल्क VPN ले डेटा बेच्छन्। विश्वसनीय तिर्ने VPN मात्र प्रयोग गर्नुहोस्।",
      },
      {
        id: 4,
        isSafe: true,
        name: "WhatsApp Messenger",
        icon: "💬",
        category: "सञ्चार",
        developer: "WhatsApp LLC",
        developerVerified: true,
        rating: 4.0,
        ratingCount: "१८५M",
        downloads: "५B+",
        version: "2.24.10",
        size: "38 MB",
        lastUpdated: "५ दिन अघि",
        description: "निःशुल्क, सरल, विश्वसनीय र निजी मेसेजिङ र कलिङ। WhatsApp १८० भन्दा बढी देशमा २ अरब भन्दा बढी मानिसले प्रयोग गर्छन्।",
        permissions: ["📞 सम्पर्कहरू", "🎙️ माइक्रोफोन", "📷 क्यामेरा", "💾 भण्डारण", "📍 स्थान"],
        reviews: [
          { user: "विकास र.", stars: 5, text: "सबैभन्दा राम्रो मेसेजिङ एप। सर्वत्र काम गर्छ।" },
          { user: "प्रिया स.", stars: 4, text: "केही सुधार गर्न सकिन्थ्यो तर भरपर्दो।" },
          { user: "अरुण म.", stars: 3, text: "स्टोरेज लिन्छ तर काम गर्छ।" },
        ],
        flags: [],
        lesson: "प्रमाणित प्रकाशक, ५ अरब इन्स्टल, मिश्रित वास्तविक समीक्षाहरू, मेसेजिङ एपका लागि उचित अनुमतिहरू।",
      },
    ],
  },
};

function StarRating({ rating }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize:14, color: s <= Math.round(rating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
      <span style={{ fontSize:13, fontWeight:800, color:"#1e2a38", marginLeft:4 }}>{rating}</span>
    </div>
  );
}

function ScoreCircle({ correct, total }) {
  const pct = correct / total * 100;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${pct/100*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{ transition:"stroke-dasharray .7s ease" }}/>
      </svg>
      <div style={{ position:"absolute", fontSize:24, fontWeight:800, color }}>{correct}/{total}</div>
    </div>
  );
}

function AppCard({ app, t, onChoice }) {
  const [chosen, setChosen] = useState(null);
  const done = chosen !== null;
  const correct = done && ((chosen === "install") === app.isSafe);

  function handle(action) { if (!done) setChosen(action); }

  return (
    <div className="fa-app-wrap fa-fade-in">

      {/* App store listing mockup */}
      <div className={`fa-listing ${done ? (app.isSafe ? "listing-safe" : "listing-danger") : ""}`}>

        {/* App header */}
        <div className="fa-app-header">
          <div className="fa-app-icon">{app.icon}</div>
          <div className="fa-app-info">
            <div className="fa-app-name">{app.name}</div>
            <div className="fa-app-dev">
              {app.developerVerified
                ? <span className="fa-dev-badge fa-dev-verified">✅ {app.developer}</span>
                : <span className="fa-dev-badge fa-dev-unknown">❓ {app.developer}</span>}
            </div>
            <div className="fa-app-cat">{app.category}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="fa-stats-row">
          <div className="fa-stat">
            <div className="fa-stat-val">{app.rating}</div>
            <div className="fa-stat-stars"><StarRating rating={app.rating}/></div>
            <div className="fa-stat-label">{app.ratingCount} {t.ratingsLabel}</div>
          </div>
          <div className="fa-stat-divider"/>
          <div className="fa-stat">
            <div className="fa-stat-val">{app.downloads}</div>
            <div className="fa-stat-label">{t.downloadsLabel}</div>
          </div>
          <div className="fa-stat-divider"/>
          <div className="fa-stat">
            <div className="fa-stat-val">{app.size}</div>
            <div className="fa-stat-label">{t.sizeLabel}</div>
          </div>
        </div>

        {/* Description */}
        <div className="fa-section">
          <div className="fa-desc">{app.description}</div>
        </div>

        {/* Permissions */}
        <div className="fa-section">
          <div className="fa-section-title">{t.permissionsLabel}</div>
          <div className="fa-perms-wrap">
            {app.permissions.map((p,i) => (
              <span key={i} className={`fa-perm ${app.isSafe ? "" : "fa-perm-warn"}`}>{p}</span>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="fa-section">
          <div className="fa-section-title">{t.reviewsLabel}</div>
          <div className="fa-reviews">
            {app.reviews.map((r,i) => (
              <div key={i} className="fa-review-row">
                <div className="fa-review-header">
                  <span className="fa-review-user">{r.user}</span>
                  <span className="fa-review-stars">{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</span>
                </div>
                <div className={`fa-review-text ${r.stars === 1 ? "review-warning" : ""}`}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="fa-meta-row">
          <span className="fa-meta">{t.versionLabel}: {app.version}</span>
          <span className="fa-meta">{t.updatedLabel}: {app.lastUpdated}</span>
        </div>
      </div>

      {/* Choice buttons */}
      {!done && (
        <div className="fa-choice-row fa-fade-in">
          <button className="fa-choice-btn fa-install-btn" onClick={() => handle("install")}>
            <span className="fa-choice-icon">📲</span>
            <span>{t.installBtn}</span>
          </button>
          <button className="fa-choice-btn fa-skip-btn" onClick={() => handle("skip")}>
            <span className="fa-choice-icon">🚫</span>
            <span>{t.skipBtn}</span>
          </button>
        </div>
      )}

      {/* Result */}
      {done && (
        <div className={`fa-result-banner fa-fade-in ${correct ? "banner-correct" : "banner-wrong"}`}>
          <div className="fa-result-emoji">{correct ? "🎉" : "😬"}</div>
          <div className="fa-result-body">
            <div className="fa-result-title">{correct ? t.correctTitle : t.wrongTitle}</div>

            {app.isSafe ? (
              <div className="fa-safe-note">✅ {app.lesson}</div>
            ) : (
              <>
                {app.flags.map((f,i) => (
                  <div key={i} className="fa-flag-row">
                    <span className="fa-flag-icon">{f.icon}</span>
                    <div>
                      <span className="fa-flag-name">{f.flag}: </span>
                      <span className="fa-flag-note">{f.note}</span>
                    </div>
                  </div>
                ))}
                <div className="fa-lesson">{app.lesson}</div>
              </>
            )}
          </div>
        </div>
      )}

      {done && (
        <button className="fa-next-btn fa-fade-in" onClick={() => onChoice(correct)}>{t.nextBtn}</button>
      )}
    </div>
  );
}

function FinishScreen({ t, onRetry }) {
  const isNp = t.moduleTag.includes("मड्युल");
  return (
    <div className="fa-finish-overlay fa-fade-in">
      <div className="fa-finish-box">
        <div className="fa-finish-icon">🎓</div>
        <div className="fa-finish-title">{isNp ? "सिमुलेसन सम्पन्न!" : "Simulation Complete!"}</div>
        <div className="fa-finish-desc">{isNp ? "तपाईंले नक्कली एप पहिचान गर्न सिक्नुभयो।" : "You've learned how to spot fake apps."}</div>
        <div className="fa-finish-tips">
          {t.tips.slice(0,3).map((tip,i) => (
            <div key={i} className="fa-finish-tip">{tip.icon} {tip.title}</div>
          ))}
        </div>
        <button className="fa-start-btn fa-outline-btn" onClick={onRetry}>{t.retryBtn}</button>
      </div>
    </div>
  );
}

export default function FakeAppStoreListing() {
  const [lang, setLang]         = useState("en");
  const [phase, setPhase]       = useState("intro");
  const [idx, setIdx]           = useState(0);
  const [scores, setScores]     = useState([]);
  const [finished, setFinished] = useState(false);
  const t = T[lang];

  function start() { setIdx(0); setScores([]); setFinished(false); setPhase("game"); }
  function handleChoice(correct) {
    const next = [...scores, correct];
    setScores(next);
    if (idx + 1 >= t.apps.length) setTimeout(() => setPhase("results"), 200);
    else setIdx(i => i + 1);
  }
  function reset(newLang) {
    setPhase("intro"); setIdx(0); setScores([]); setFinished(false);
    if (newLang) setLang(newLang);
  }

  const correctCount = scores.filter(Boolean).length;
  const pct = scores.length > 0 ? correctCount / t.apps.length : 0;
  const resultLabel = pct>=0.9?t.excellent:pct>=0.7?t.good:pct>=0.5?t.okay:t.poor;
  const resultColor = pct>=0.9?"#22c55e":pct>=0.7?"#84cc16":pct>=0.5?"#f59e0b":"#ef4444";

  return (
    <div className="fa-app">
      <style>{CSS}</style>

      <div className="fa-lang-bar">
        <div className="fa-lang-toggle">
          <button className={`fa-lang-btn ${lang==="en"?"active":""}`} onClick={()=>reset("en")}>🇬🇧 English</button>
          <button className={`fa-lang-btn ${lang==="np"?"active":""}`} onClick={()=>reset("np")}>🇳🇵 नेपाली</button>
        </div>
      </div>

      <div className="fa-card" style={{ position:"relative" }}>
        <div className="fa-header">
          <div className="fa-module-tag">{t.moduleTag}</div>
          <h1 className="fa-title">{t.title}</h1>
          <p className="fa-subtitle">{t.subtitle}</p>
        </div>
        <div className="fa-divider"/>

        {phase === "intro" && (
          <div className="fa-fade-in">
            <div className="fa-intro-box">
              <div className="fa-intro-icon">📲</div>
              <div className="fa-intro-title">{t.introTitle}</div>
              <div className="fa-intro-desc">{t.introDesc}</div>
            </div>
            <div className="fa-tips-list">
              {t.tips.map((tip,i) => (
                <div key={i} className="fa-tip-row">
                  <span className="fa-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="fa-tip-title">{tip.title}</div>
                    <div className="fa-tip-desc">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="fa-start-btn" onClick={start}>{t.startBtn}</button>
          </div>
        )}

        {phase === "game" && (
          <div>
            <div className="fa-progress-wrap">
              <div className="fa-progress-label">
                {t.roundLabel(idx+1, t.apps.length)}
                <span className="fa-score-live">{scores.filter(Boolean).length} ✅</span>
              </div>
              <div className="fa-progress-track">
                <div className="fa-progress-fill" style={{ width:`${idx/t.apps.length*100}%` }}/>
              </div>
            </div>
            <AppCard key={`${lang}-${idx}`} app={t.apps[idx]} t={t} onChoice={handleChoice}/>
          </div>
        )}

        {phase === "results" && (
          <div className="fa-fade-in">
            <div className="fa-results-title">{t.resultsTitle}</div>
            <div className="fa-score-display">
              <ScoreCircle correct={correctCount} total={t.apps.length}/>
              <div className="fa-score-right">
                <div className="fa-score-label" style={{ color:resultColor }}>{resultLabel}</div>
                <div className="fa-score-sub">{t.score(correctCount, t.apps.length)}</div>
              </div>
            </div>
            <div className="fa-recap-list">
              {t.apps.map((a,i) => (
                <div key={i} className={`fa-recap-row ${scores[i]?"recap-correct":"recap-wrong"}`}>
                  <span>{scores[i]?"✅":"❌"}</span>
                  <div className="fa-recap-info">
                    <div className="fa-recap-name">{a.icon} {a.name}</div>
                    <div className="fa-recap-verdict">{a.isSafe?(lang==="np"?"सुरक्षित थियो":"Was safe"):(lang==="np"?"खतरनाक थियो":"Was dangerous")}</div>
                  </div>
                  <span className={`fa-recap-badge ${a.isSafe?"badge-safe":"badge-danger"}`}>
                    {a.isSafe?(lang==="np"?"सुरक्षित":"Safe"):(lang==="np"?"खतरनाक":"Danger")}
                  </span>
                </div>
              ))}
            </div>
            <div className="fa-tips-section">
              <div className="fa-tips-title">{t.tipsTitle}</div>
              {t.tips.map((tip,i) => (
                <div key={i} className="fa-tip-row-green">
                  <span className="fa-tip-icon">{tip.icon}</span>
                  <div>
                    <div className="fa-tip-title-green">{tip.title}</div>
                    <div className="fa-tip-desc-green">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="fa-btn-group">
              <button className="fa-start-btn fa-outline-btn" onClick={start}>{t.retryBtn}</button>
              <button className="fa-start-btn" onClick={()=>setFinished(true)}>{t.finishBtn}</button>
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
.fa-app{font-family:'Nunito','Noto Sans Devanagari',sans-serif;background:var(--bg);min-height:100vh;padding:28px 16px 60px}
.fa-lang-bar{display:flex;justify-content:flex-end;max-width:640px;margin:0 auto 16px}
.fa-lang-toggle{display:flex;background:var(--card);border:1.5px solid var(--bdr);border-radius:50px;padding:4px;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.fa-lang-btn{padding:6px 16px;border:none;border-radius:50px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--sub);background:transparent;transition:var(--tr)}
.fa-lang-btn.active{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.3)}
.fa-card{background:var(--card);border-radius:var(--r);max-width:640px;margin:0 auto;padding:36px 32px;box-shadow:var(--sh);border:1px solid var(--bdr)}
.fa-header{text-align:center;margin-bottom:20px}
.fa-module-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--blue);background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:50px;padding:4px 14px;margin-bottom:12px;text-transform:uppercase}
.fa-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.3}
.fa-subtitle{font-size:14px;color:var(--sub);line-height:1.6}
.fa-divider{height:1px;background:var(--bdr);margin:0 -32px 24px}
.fa-intro-box{text-align:center;margin-bottom:22px}
.fa-intro-icon{font-size:48px;margin-bottom:10px}
.fa-intro-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px}
.fa-intro-desc{font-size:14px;color:var(--sub);line-height:1.5}
.fa-tips-list{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
.fa-tip-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:#f8fafc;border:1.5px solid var(--bdr);border-radius:10px}
.fa-tip-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.fa-tip-title{font-size:13px;font-weight:800;color:var(--text);margin-bottom:1px}
.fa-tip-desc{font-size:12px;color:var(--sub)}
.fa-start-btn{width:100%;padding:13px;font-family:inherit;font-size:15px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.fa-start-btn:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,130,246,.3)}
.fa-outline-btn{background:transparent!important;color:var(--blue)!important;border:2px solid var(--blue)!important;box-shadow:none!important}
.fa-outline-btn:hover{background:#eff6ff!important}
.fa-progress-wrap{margin-bottom:18px}
.fa-progress-label{font-size:13px;font-weight:800;color:var(--text);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.fa-score-live{font-size:12px;font-weight:700;color:var(--green);background:var(--gl);border:1px solid var(--gb);padding:3px 10px;border-radius:50px}
.fa-progress-track{height:8px;background:#e2e8f0;border-radius:8px;overflow:hidden}
.fa-progress-fill{height:100%;background:var(--blue);border-radius:8px;transition:width .5s ease}
/* listing */
.fa-app-wrap{display:flex;flex-direction:column;gap:14px}
.fa-listing{background:#fafbfc;border:2px solid var(--bdr);border-radius:14px;overflow:hidden;transition:border-color .3s}
.listing-safe{border-color:var(--gb)!important}
.listing-danger{border-color:var(--rb)!important}
.fa-app-header{display:flex;gap:14px;padding:16px 18px;background:#fff;border-bottom:1.5px solid var(--bdr);align-items:flex-start}
.fa-app-icon{font-size:44px;width:60px;height:60px;background:#f0f4ff;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fa-app-info{flex:1}
.fa-app-name{font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px}
.fa-dev-badge{font-size:12px;font-weight:700;padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:3px}
.fa-dev-verified{color:#166534;background:var(--gl);border:1px solid var(--gb)}
.fa-dev-unknown{color:#b91c1c;background:var(--rl);border:1px solid var(--rb)}
.fa-app-cat{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
.fa-stats-row{display:flex;align-items:center;padding:12px 18px;background:#fff;border-bottom:1.5px solid var(--bdr);gap:0}
.fa-stat{flex:1;text-align:center}
.fa-stat-val{font-size:18px;font-weight:800;color:var(--text)}
.fa-stat-stars{display:flex;justify-content:center;margin:2px 0}
.fa-stat-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
.fa-stat-divider{width:1px;height:36px;background:var(--bdr)}
.fa-section{padding:12px 18px;border-bottom:1px solid var(--bdr)}
.fa-section:last-child{border-bottom:none}
.fa-section-title{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.fa-desc{font-size:13px;color:var(--sub);line-height:1.5}
.fa-perms-wrap{display:flex;flex-wrap:wrap;gap:6px}
.fa-perm{font-size:12px;font-weight:700;padding:3px 10px;border-radius:50px;background:#f1f5f9;color:var(--sub);border:1px solid var(--bdr)}
.fa-perm-warn{background:var(--rl);color:#b91c1c;border-color:var(--rb)}
.fa-reviews{display:flex;flex-direction:column;gap:8px}
.fa-review-row{padding:8px 10px;background:#fff;border:1px solid var(--bdr);border-radius:8px}
.fa-review-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}
.fa-review-user{font-size:12px;font-weight:800;color:var(--text)}
.fa-review-stars{font-size:12px;color:#f59e0b;letter-spacing:1px}
.fa-review-text{font-size:12px;color:var(--sub);line-height:1.4}
.review-warning{color:#b91c1c;font-weight:700}
.fa-meta-row{display:flex;gap:16px;padding:10px 18px;background:#f8fafc;flex-wrap:wrap}
.fa-meta{font-size:11px;color:var(--muted)}
/* choices */
.fa-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fa-choice-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:12px;border:2px solid;cursor:pointer;font-family:inherit;font-size:14px;font-weight:800;transition:var(--tr)}
.fa-choice-btn:hover{transform:translateY(-2px)}
.fa-install-btn{background:var(--blue);color:#fff;border-color:var(--blue)}
.fa-install-btn:hover{background:#2563eb}
.fa-skip-btn{background:var(--gl);color:#166534;border-color:var(--gb)}
.fa-skip-btn:hover{background:#dcfce7}
/* result */
.fa-result-banner{display:flex;align-items:flex-start;gap:14px;border-radius:12px;padding:16px 18px;border-width:2px;border-style:solid}
.banner-correct{background:var(--gl);border-color:var(--gb)}
.banner-wrong{background:var(--rl);border-color:var(--rb)}
.fa-result-emoji{font-size:30px;line-height:1;flex-shrink:0;margin-top:2px}
.fa-result-body{flex:1;display:flex;flex-direction:column;gap:7px}
.fa-result-title{font-size:15px;font-weight:800}
.banner-correct .fa-result-title{color:#166534}
.banner-wrong   .fa-result-title{color:#b91c1c}
.fa-safe-note{font-size:12px;font-weight:700;color:#166534;background:var(--gl);border:1px solid var(--gb);border-radius:6px;padding:7px 10px}
.fa-flag-row{display:flex;align-items:flex-start;gap:8px;font-size:12px;line-height:1.4}
.fa-flag-icon{flex-shrink:0;font-size:14px}
.fa-flag-name{font-weight:800;color:#b91c1c}
.fa-flag-note{color:var(--sub)}
.fa-lesson{font-size:12px;color:var(--sub);background:#f8fafc;border:1px solid var(--bdr);border-left:3px solid var(--blue);border-radius:6px;padding:8px 10px;line-height:1.5}
.fa-next-btn{width:100%;padding:12px;font-family:inherit;font-size:14px;font-weight:800;background:var(--blue);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:var(--tr)}
.fa-next-btn:hover{background:#2563eb;transform:translateY(-1px)}
/* results */
.fa-results-title{font-size:19px;font-weight:800;color:var(--text);text-align:center;margin-bottom:18px}
.fa-score-display{display:flex;align-items:center;gap:20px;padding:18px;background:#f8fafc;border-radius:14px;border:1.5px solid var(--bdr);margin-bottom:18px}
.fa-score-right{flex:1}
.fa-score-label{font-size:17px;font-weight:800;margin-bottom:4px}
.fa-score-sub{font-size:13px;color:var(--sub)}
.fa-recap-list{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
.fa-recap-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;border:1.5px solid;font-size:16px}
.recap-correct{background:var(--gl);border-color:var(--gb)}
.recap-wrong{background:var(--rl);border-color:var(--rb)}
.fa-recap-info{flex:1;min-width:0}
.fa-recap-name{font-size:13px;font-weight:800;color:var(--text)}
.fa-recap-verdict{font-size:11px;color:var(--muted);margin-top:1px}
.fa-recap-badge{font-size:11px;font-weight:800;padding:3px 9px;border-radius:50px;flex-shrink:0}
.badge-safe{background:var(--gl);color:#166534;border:1px solid var(--gb)}
.badge-danger{background:var(--rl);color:#b91c1c;border:1px solid var(--rb)}
.fa-tips-section{background:var(--gl);border:2px solid var(--gb);border-radius:14px;padding:18px 20px;margin-bottom:16px}
.fa-tips-title{font-size:14px;font-weight:800;color:#166534;margin-bottom:12px}
.fa-tip-row-green{display:flex;align-items:flex-start;gap:12px;padding:7px 0;border-top:1px solid #bbf7d0}
.fa-tip-row-green:first-of-type{border-top:none}
.fa-tip-title-green{font-size:13px;font-weight:800;color:#166534;margin-bottom:1px}
.fa-tip-desc-green{font-size:12px;color:#276749}
.fa-btn-group{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fa-finish-overlay{position:absolute;inset:0;background:rgba(238,242,247,.96);border-radius:var(--r);display:flex;align-items:center;justify-content:center;z-index:10;padding:24px}
.fa-finish-box{background:var(--card);border:2px solid var(--gb);border-radius:16px;padding:30px 26px;text-align:center;max-width:360px;width:100%;box-shadow:var(--sh)}
.fa-finish-icon{font-size:50px;margin-bottom:12px}
.fa-finish-title{font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px}
.fa-finish-desc{font-size:13px;color:var(--sub);margin-bottom:18px;line-height:1.5}
.fa-finish-tips{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.fa-finish-tip{font-size:13px;font-weight:700;color:#166534;background:var(--gl);border:1.5px solid var(--gb);border-radius:8px;padding:8px 12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fa-fade-in{animation:fadeUp .35s ease}
@media(max-width:520px){
  .fa-card{padding:24px 18px}
  .fa-divider{margin:0 -18px 20px}
  .fa-choice-row,.fa-btn-group{grid-template-columns:1fr}
  .fa-result-banner{flex-direction:column}
  .fa-score-display{flex-direction:column;text-align:center}
  .fa-stats-row{gap:4px}
}
`;
