import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LandingPage.css";

const content = {
  en: {
    hero: {
      title: "Welcome to Cyber Aware Nepal",
      desc: (
        <>
          Learn, track, and improve your{" "}
          <span>cybersecurity awareness</span>. Protect
          yourself online and stay informed about digital threats.
        </>
      ),
      start:     "Get Started",
      learnMore: "Learn More",
    },
    about: {
      heading: "About Cybersecurity",
      sub: "A structured, beginner-friendly platform to build strong cybersecurity habits — step by step.",
      cards: [
        {
          icon:  "📚",
          title: "Structured Learning",
          desc:  "Follow organised modules to understand cybersecurity fundamentals and advanced concepts step by step.",
        },
        {
          icon:  "📊",
          title: "Track Your Progress",
          desc:  "Monitor your learning journey, view your scores, and discover which areas need improvement.",
        },
        {
          icon:  "🛡️",
          title: "Stay Safe Online",
          desc:  "Get practical tips to protect your devices, data, and digital identity from cyber threats.",
        },
      ],
    },
    footer: {
      brand: "Cyber Aware Nepal",
      copy:  "© 2025 All rights reserved.",
    },
  },

  np: {
    hero: {
      title: "साइबर अवेयर नेपालमा स्वागत छ",
      desc: (
        <>
          आफ्नो <span>साइबर सुरक्षा सचेतना</span> सिक्नुहोस्,
          ट्र्याक गर्नुहोस्, र सुधार गर्नुहोस्। अनलाइन सुरक्षित
          रहनुहोस् र डिजिटल खतराहरूको बारेमा सचेत रहनुहोस्।
        </>
      ),
      start:     "सुरु गर्नुहोस्",
      learnMore: "थप जान्नुहोस्",
    },
    about: {
      heading: "साइबर सुरक्षा बारे",
      sub: "साइबर सुरक्षा बानीहरू चरण-दर-चरण निर्माण गर्न संरचित, सुरुवातकर्ता-अनुकूल प्लेटफर्म।",
      cards: [
        {
          icon:  "📚",
          title: "संरचित सिकाइ",
          desc:  "साइबर सुरक्षा आधारभूत र उन्नत अवधारणाहरूलाई चरण-दर-चरण बुझ्न व्यवस्थित मोड्युलहरू अनुसरण गर्नुहोस्।",
        },
        {
          icon:  "📊",
          title: "प्रगति ट्र्याक गर्नुहोस्",
          desc:  "तपाईंको सिकाइ यात्रा अनुगमन गर्नुहोस्, आफ्नो स्कोर हेर्नुहोस्, र कुन क्षेत्रमा सुधार आवश्यक छ जान्नुहोस्।",
        },
        {
          icon:  "🛡️",
          title: "अनलाइन सुरक्षित रहनुहोस्",
          desc:  "आफ्ना उपकरण, डेटा, र डिजिटल पहिचानलाई साइबर खतराबाट जोगाउन व्यावहारिक सुझावहरू प्राप्त गर्नुहोस्।",
        },
      ],
    },
    footer: {
      brand: "साइबर अवेयर नेपाल",
      copy:  "© २०२५ सर्वाधिकार सुरक्षित।",
    },
  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = content[lang];

  return (
    <div>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-logo">Cyber Aware Nepal</div>
        <div className="lang-toggle">
          <button
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            className={`lang-btn ${lang === "np" ? "active" : ""}`}
            onClick={() => setLang("np")}
          >
            नेपाली
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <h1>{t.hero.title}</h1>
        <p>{t.hero.desc}</p>
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/login")}
          >
            {t.hero.start}
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate("/register")}
          >
            {t.hero.learnMore}
          </button>
        </div>
      </section>

      {/* ── About ── */}
      <section className="about">
        <h2>{t.about.heading}</h2>
        <p className="about-sub">{t.about.sub}</p>
        <div className="about-cards">
          {t.about.cards.map((card, i) => (
            <div className="card" key={i}>
              <span className="card-icon">{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <span>{t.footer.brand}</span>
        {" — "}
        {t.footer.copy}
      </footer>

    </div>
  );
}
