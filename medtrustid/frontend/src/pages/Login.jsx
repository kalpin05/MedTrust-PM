import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '3rem 1rem'
  },
  form: {
    maxWidth: '28rem',
    width: '100%',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transform: 'translateY(0)',
    transition: 'transform 0.3s ease'
  },
  logo: {
    width: '4rem',
    height: '4rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },
  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
  },
  button: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  error: {
    backgroundColor: '#fed7d7',
    border: '1px solid #fc8181',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'underline',
    transition: 'color 0.3s ease'
  }
};

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
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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
    <div style={styles.container}>
      <div style={styles.form}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={styles.logo}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>M</span>
          </div>
          <h2 style={styles.title}>
            {isRegister ? "Create your account" : "Sign in to MedTrustID"}
          </h2>
          <p style={styles.subtitle}>
            Secure healthcare identity management
          </p>
        </div>
        
        <form onSubmit={submit}>
          <div style={{ marginBottom: '1.5rem' }}>
            {isRegister && (
              <div style={{ marginBottom: '1rem' }}>
                <input
                  name="name"
                  type="text"
                  required
                  style={{
                    ...styles.input,
                    borderRadius: '0.5rem 0.5rem 0 0'
                  }}
                  placeholder="Full Name"
                  value={form.name}
                  onChange={change}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                name="email"
                type="email"
                required
                style={{
                  ...styles.input,
                  borderRadius: isRegister ? '0' : '0.5rem',
                  marginTop: isRegister ? '-1px' : '0'
                }}
                placeholder="Email address"
                value={form.email}
                onChange={change}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <input
                name="password"
                type="password"
                required
                style={{
                  ...styles.input,
                  borderRadius: isRegister ? '0' : '0.5rem',
                  marginTop: '-1px'
                }}
                placeholder="Password"
                value={form.password}
                onChange={change}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>

            {isRegister && (
              <div style={{ marginBottom: '1rem' }}>
                <select
                  name="role"
                  value={form.role}
                  onChange={change}
                  style={{
                    ...styles.input,
                    borderRadius: '0 0 0.5rem 0.5rem',
                    marginTop: '-1px',
                    appearance: 'none'
                  }}
                >
                  <option value="patient">Patient</option>
                  <option value="staff">Hospital Staff</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                pointerEvents: loading ? 'none' : 'auto'
              }}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.buttonHover)}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? "Processing..." : (isRegister ? "Register" : "Sign in")}
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              style={styles.link}
              onMouseEnter={(e) => e.target.style.color = '#764ba2'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
