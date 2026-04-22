import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginPage.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const content = {
  en: {
    heading: "Welcome Back",
    tagline: "Sign in to your account",
    emailPh: "Email address",
    passPh: "Password",
    loginBtn: "Sign In",
    regLink: (
      <>
        Don't have an account? <strong>Create one</strong>
      </>
    ),
    errEmail: "Please enter a valid email address.",
    errPass: "Password must be at least 6 characters.",
  },
  np: {
    heading: "फिर्ता स्वागत छ",
    tagline: "आफ्नो खातामा साइन इन गर्नुहोस्",
    emailPh: "इमेल ठेगाना",
    passPh: "पासवर्ड",
    loginBtn: "साइन इन गर्नुहोस्",
    regLink: (
      <>
        खाता छैन? <strong>खाता बनाउनुहोस्</strong>
      </>
    ),
    errEmail: "कृपया मान्य इमेल ठेगाना लेख्नुहोस्।",
    errPass: "पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।",
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [lang, setLang] = useState("en");
  const t = content[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      e.email = t.errEmail;
    }

    if (!password || password.length < 6) {
      e.pass = t.errPass;
    }

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid server response");
      }

      // 🔐 Save auth
      login(token, user);

      // ✅ DIRECT ROLE (FINAL FIX)
      const role = user.role;

      if (role === "general_user" || role === "org_student") {
        navigate("/student/dashboard", { replace: true });
      } else if (role === "org_admin") {
        navigate("/organization/dashboard", { replace: true });
      } else if (role === "superadmin") {
        navigate("/superadmin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Login failed. Please try again.";

      setErrors({ pass: message });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const clear = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="lang-toggle">
          <button
            type="button"
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>

          <button
            type="button"
            className={`lang-btn ${lang === "np" ? "active" : ""}`}
            onClick={() => setLang("np")}
          >
            नेपाली
          </button>
        </div>

        <h2>{t.heading}</h2>
        <p className="login-tagline">{t.tagline}</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          <div className="field-wrap">
            <input
              type="email"
              placeholder={t.emailPh}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clear("email");
              }}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="field-wrap">
            <input
              type="password"
              placeholder={t.passPh}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clear("pass");
              }}
              className={errors.pass ? "input-error" : ""}
            />
            {errors.pass && <span className="error-msg">{errors.pass}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "..." : t.loginBtn}
          </button>
        </form>

        <div className="register-link" onClick={() => navigate("/register")}>
          {t.regLink}
        </div>

      </div>
    </div>
  );
}