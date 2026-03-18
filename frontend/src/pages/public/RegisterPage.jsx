import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // ✅ ADDED API IMPORT
import "./RegisterPage.css";

const content = {
  en: {
    heading:  "Create Account",
    tagline:  "Sign up to access your dashboard",
    ph: {
      name:            "Full Name",
      email:           "Email Address",
      phone:           "Phone Number",
      password:        "Create Password",
      confirmPassword: "Confirm Password",
    },
    createBtn: "Create Account",
    loginLink: <>Already have an account? <strong>Sign In</strong></>,
    errors: {
      name:            "Full name is required.",
      email:           "Please enter a valid email address.",
      phone:           "Please enter a valid phone number.",
      password:        "Password must be at least 6 characters.",
      confirmPassword: "Passwords do not match.",
    },
    strengthLabel: ["", "Weak", "Fair", "Good", "Strong"],
    strengthColor: ["", "#dc2626", "#d97706", "#2563eb", "#16a34a"],
    success: "Account created! Redirecting to login...",
  },
  np: {
    heading:  "खाता सिर्जना गर्नुहोस्",
    tagline:  "ड्यासबोर्ड पहुँचका लागि साइन अप गर्नुहोस्",
    ph: {
      name:            "तपाईंको पूरा नाम",
      email:           "इमेल ठेगाना",
      phone:           "फोन नम्बर",
      password:        "पासवर्ड बनाउनुहोस्",
      confirmPassword: "पासवर्ड फेरी लेख्नुहोस्",
    },
    createBtn: "खाता सिर्जना गर्नुहोस्",
    loginLink: <>पहिले नै खाता छ? <strong>साइन इन गर्नुहोस्</strong></>,
    errors: {
      name:            "पूरा नाम आवश्यक छ।",
      email:           "कृपया मान्य इमेल ठेगाना लेख्नुहोस्।",
      phone:           "कृपया मान्य फोन नम्बर लेख्नुहोस्।",
      password:        "पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।",
      confirmPassword: "पासवर्ड मिलेन।",
    },
    strengthLabel: ["", "कमजोर", "ठीकठाक", "राम्रो", "बलियो"],
    strengthColor: ["", "#dc2626", "#d97706", "#2563eb", "#16a34a"],
    success: "खाता सफलतापूर्वक सिर्जना भयो!",
  },
};

function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]|[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = content[lang];

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const strength = getStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) errs.name = t.errors.name;

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = t.errors.email;

    if (!form.phone || form.phone.trim().length < 7)
      errs.phone = t.errors.phone;

    if (!form.password || form.password.length < 6)
      errs.password = t.errors.password;

    if (form.password !== form.confirmPassword)
      errs.confirmPassword = t.errors.confirmPassword;

    return errs;
  };

  // ✅ UPDATED SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});

    try {

      const response = await api.post("/auth/register", {
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      });

      alert(response.data.message || t.success);

      navigate("/login");

    } catch (err) {

      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration failed";

      alert(message);

    }
  };

  const inputClass = (field) => {
    if (errors[field]) return "input-error";
    if (form[field]) return "input-valid";
    return "";
  };

  const firstError = Object.values(errors)[0];

  const fields = [
    { name: "name", type: "text", showStrength: false },
    { name: "email", type: "email", showStrength: false },
    { name: "phone", type: "tel", showStrength: false },
    { name: "password", type: "password", showStrength: true },
    { name: "confirmPassword", type: "password", showStrength: false },
  ];

  return (
    <div className="register-wrapper">
      <div className="create-wrapper">

        {/* Language Toggle */}
        <div className="language-toggle">
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            English
          </button>

          <button
            className={lang === "np" ? "active" : ""}
            onClick={() => setLang("np")}
          >
            नेपाली
          </button>
        </div>

        <h2 className="create-heading">{t.heading}</h2>
        <p className="create-tagline">{t.tagline}</p>

        {firstError && (
          <div className="error-banner">{firstError}</div>
        )}

        <form className="register-form" onSubmit={handleSubmit} noValidate>

          {fields.map(({ name, type, showStrength }) => (
            <div className="field-wrap" key={name}>
              <input
                name={name}
                type={type}
                placeholder={t.ph[name]}
                value={form[name]}
                onChange={handleChange}
                className={inputClass(name)}
              />

              {showStrength && form.password && (
                <>
                  <div className="strength-row">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-seg"
                        style={{
                          background:
                            i <= strength
                              ? t.strengthColor[strength]
                              : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>

                  <span
                    className="strength-label"
                    style={{ color: t.strengthColor[strength] }}
                  >
                    {t.strengthLabel[strength]}
                  </span>
                </>
              )}
            </div>
          ))}

          <button type="submit" className="create-btn">
            {t.createBtn}
          </button>

        </form>

        <div
          className="login-link"
          onClick={() => navigate("/login")}
        >
          {t.loginLink}
        </div>

      </div>
    </div>
  );
}