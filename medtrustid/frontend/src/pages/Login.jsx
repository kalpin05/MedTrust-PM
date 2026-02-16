import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

export default function Login() {
  const nav = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient"
  });

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const res = await api.post(endpoint, form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const dashboard = res.data.user?.role === "staff" ? "/staff" : "/patient";
      nav(dashboard);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Side */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLogo}>
            <div className={styles.heroLogoMark}>M</div>
            <span className={styles.heroLogoText}>MedTrustID</span>
          </div>

          <h1 className={styles.heroTitle}>
            Your Health Data,{" "}
            <span className={styles.heroTitleAccent}>Your Control.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            A secure identity platform that puts patients in command of their
            healthcare data — with real-time consent, zero-trust access, and
            full transparency.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔐</div>
              <div className={styles.featureText}>
                <h4>End-to-End Encrypted</h4>
                <p>Every piece of patient data is encrypted at rest and in transit with military-grade cryptography.</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <div className={styles.featureText}>
                <h4>Real-Time Consent Tracking</h4>
                <p>Grant or revoke data access instantly. See who accessed your records and when.</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🛡️</div>
              <div className={styles.featureText}>
                <h4>Cyber-Resilient Infrastructure</h4>
                <p>Built-in anomaly detection, brute-force protection, and DDoS mitigation in real-time.</p>
              </div>
            </div>
          </div>

          <div className={styles.trustStrip}>
            <div className={styles.trustLabel}>Trusted by healthcare providers</div>
            <div className={styles.trustItems}>
              <div className={styles.trustItem}>
                <span className={styles.trustDot} />
                HIPAA Compliant
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustDot} />
                SOC 2 Type II
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustDot} />
                Zero-Trust Architecture
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className={styles.formSide}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className={styles.formSubtitle}>
            {isRegister
              ? "Join MedTrustID to manage your healthcare identity"
              : "Sign in to access your healthcare dashboard"}
          </p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          {isRegister && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Full Name</label>
              <input
                name="name"
                type="text"
                required
                className={styles.input}
                placeholder="Enter your full name"
                value={form.name}
                onChange={change}
              />
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email</label>
            <input
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="you@hospital.com"
              value={form.email}
              onChange={change}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Password</label>
            <input
              name="password"
              type="password"
              required
              className={styles.input}
              placeholder="Enter your password"
              value={form.password}
              onChange={change}
            />
          </div>

          {isRegister && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={change}
                className={`${styles.input} ${styles.select}`}
              >
                <option value="patient">Patient</option>
                <option value="staff">Hospital Staff</option>
              </select>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <span>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>

          <div className={styles.switchLink}>
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className={styles.switchBtn}
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Need an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
