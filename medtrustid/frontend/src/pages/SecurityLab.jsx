import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Badge from "../components/Badge";
import styles from "./SecurityLab.module.css";

const SecurityLab = () => {
  // 1. Brute Force
  const [bfLogs, setBfLogs] = useState([]);
  const [bfRunning, setBfRunning] = useState(false);
  const bfAttemptsRef = useRef(0);
  const [bfLocked, setBfLocked] = useState(false);
  const [bfRateLimit, setBfRateLimit] = useState(false);

  // 2. SQL Injection
  const [sqlInput, setSqlInput] = useState("");
  const [sqlResult, setSqlResult] = useState(null);
  const [sqlSecure, setSqlSecure] = useState(false);
  const sqlQuery = sqlSecure
    ? "SELECT * FROM users WHERE username = ?"
    : `SELECT * FROM users WHERE username = '${sqlInput}'`;

  // 3. XSS
  const [xssInput, setXssInput] = useState("");
  const [xssRender, setXssRender] = useState("");
  const [xssSanitize, setXssSanitize] = useState(false);

  // 4. Anomaly Detection
  const [adEvents, setAdEvents] = useState([
    { id: 1, ip: "192.168.1.10", location: "New York, USA", time: "09:00 AM", status: "Normal" },
    { id: 2, ip: "192.168.1.12", location: "New York, USA", time: "09:15 AM", status: "Normal" }
  ]);
  const [adMfaTriggered, setAdMfaTriggered] = useState(false);

  // 5. DDoS
  const [ddosTraffic, setDdosTraffic] = useState([{ time: 0, reqs: 10 }]);
  const [ddosRunning, setDdosRunning] = useState(false);
  const [ddosWaf, setDdosWaf] = useState(false);
  const timerRef = useRef(null);

  // 6. Phishing
  const [phishingEmails] = useState([
    { id: 1, subject: "Urgent: Update Password", from: "support@g00gle.com", body: "Click here immediately to update your credentials.", isPhishing: true, redFlags: ["Misspelled domain (g00gle.com)", "Urgent threat language"] },
    { id: 2, subject: "Team Meeting Tomorrow", from: "manager@company.com", body: "See you at 2pm in the conference room.", isPhishing: false, redFlags: [] }
  ]);
  const [phishingRevealed, setPhishingRevealed] = useState({});

  // 7. Broken Access Control
  const [bacRole, setBacRole] = useState("user");
  const [bacUrl, setBacUrl] = useState("/dashboard/user");
  const [bacLog, setBacLog] = useState("");

  // 8. Spoofing
  const [spoofAuth, setSpoofAuth] = useState(false);
  const [spoofLog, setSpoofLog] = useState("");

  // --- Logic ---
  useEffect(() => {
    let interval;
    if (bfRunning && !bfLocked) {
      interval = setInterval(() => {
        bfAttemptsRef.current += 1;
        const next = bfAttemptsRef.current;
        if (bfRateLimit && next > 5) {
          setBfLocked(true);
          setBfLogs(p => ["🔒 System Locked due to excessive attempts!", ...p]);
          setBfRunning(false);
          return;
        }
        const guess = Math.random().toString(36).substring(7);
        setBfLogs(p => [`Attempt ${next}: Trying '${guess}'... Failed`, ...p]);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [bfRunning, bfLocked, bfRateLimit]);

  const startBruteForce = () => {
    bfAttemptsRef.current = 0;
    setBfLogs([]);
    setBfLocked(false);
    setBfRunning(true);
  };

  const runSql = () => {
    if (sqlSecure) {
      setSqlResult({ safe: true, text: "Safe: No results found (Input treated as literal string)." });
    } else if (sqlInput.includes("'") || sqlInput.includes("OR")) {
      setSqlResult({ safe: false, text: "⚠️ UNLOCKED: Admin Access Granted! (Logic bypassed)" });
    } else {
      setSqlResult({ safe: true, text: "No results found." });
    }
  };

  const runXss = () => {
    if (xssSanitize) {
      setXssRender(xssInput.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    } else {
      setXssRender(xssInput);
      if (xssInput.includes("<script>")) {
        alert("XSS EXECUTED! Session Hijacked.");
      }
    }
  };

  const simulateAttackLogin = () => {
    setAdEvents(prev => [
      { id: Date.now(), ip: "45.12.19.99", location: "Unknown, Russia", time: "03:00 AM", status: "Suspicious" },
      ...prev
    ]);
    setAdMfaTriggered(true);
  };

  useEffect(() => {
    if (ddosRunning) {
      timerRef.current = setInterval(() => {
        setDdosTraffic(prev => {
          const lastTime = prev[prev.length - 1].time;
          const newReqs = ddosWaf ? 20 : Math.floor(Math.random() * 50) + 100;
          return [...prev.slice(-19), { time: lastTime + 1, reqs: newReqs }];
        });
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [ddosRunning, ddosWaf]);

  const tryAccess = () => {
    if (bacUrl.includes("admin") && bacRole !== "admin") {
      setBacLog("❌ 403 Forbidden: You do not have permission to access /admin");
    } else {
      setBacLog(`✅ 200 OK: Accessed ${bacUrl} as ${bacRole}`);
    }
  };

  const sendSpoofedPacket = () => {
    if (spoofAuth) {
      setSpoofLog("🛡️ REJECTED: Packet lacks valid digital signature.");
    } else {
      setSpoofLog("✅ ACCEPTED: Server accepted packet from Attacker thinking it was User.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>🛡️ Security Simulation Lab</h1>
          <p className={styles.pageSub}>
            Interactive modules to understand and defend against common cyber attacks
          </p>
        </div>

        <div className={styles.grid}>
          {/* 1. Brute Force */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>🔓 Brute Force Attack</div>
              <Badge variant={bfLocked ? "danger" : "warning"}>{bfLocked ? "LOCKED" : "Vulnerable"}</Badge>
            </div>
            <div className={styles.moduleBody}>
              <p className={styles.description}>
                Simulates an attacker guessing passwords rapidly.
              </p>
              <div className={styles.control}>
                <input type="checkbox" checked={bfRateLimit} onChange={e => setBfRateLimit(e.target.checked)} />
                <span className={styles.controlLabel}>Enable Rate Limiting (Defense)</span>
              </div>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={startBruteForce}
                disabled={bfRunning}
                style={{ marginBottom: "var(--space-4)" }}
              >
                {bfRunning ? "Attacking..." : "Start Attack"}
              </button>
              <div className={styles.terminal}>
                {bfLogs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </div>

          {/* 2. SQL Injection */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>💉 SQL Injection</div>
              <Badge variant="danger">Target: Database</Badge>
            </div>
            <div className={styles.moduleBody}>
              <p className={styles.codeHint}>
                Try entering: <code>admin&apos; OR 1=1 --</code>
              </p>
              <div className={styles.control}>
                <input type="checkbox" checked={sqlSecure} onChange={e => setSqlSecure(e.target.checked)} />
                <span className={styles.controlLabel}>Use Parameterized Query (Defense)</span>
              </div>
              <input
                className={styles.input}
                type="text"
                placeholder="Username"
                value={sqlInput}
                onChange={e => setSqlInput(e.target.value)}
              />
              <div className={styles.codeBlock}>
                <strong>Executing Query:</strong>
                <code>{sqlQuery}</code>
              </div>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={runSql}>
                Login
              </button>
              {sqlResult && (
                <div className={`${styles.result} ${sqlResult.safe ? styles.resultSafe : styles.resultDanger}`}>
                  {sqlResult.text}
                </div>
              )}
            </div>
          </div>

          {/* 3. XSS Playground */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>📜 XSS Playground</div>
              <Badge variant="warning">Target: Browser</Badge>
            </div>
            <div className={styles.moduleBody}>
              <p className={styles.codeHint}>
                Try: <code>&lt;script&gt;alert(1)&lt;/script&gt;</code>
              </p>
              <div className={styles.control}>
                <input type="checkbox" checked={xssSanitize} onChange={e => setXssSanitize(e.target.checked)} />
                <span className={styles.controlLabel}>Enable Output Sanitization (Defense)</span>
              </div>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter comment..."
                value={xssInput}
                onChange={e => setXssInput(e.target.value)}
              />
              <button className={`${styles.btn} ${styles.btnPurple}`} onClick={runXss}>
                Post Comment
              </button>
              <div className={styles.output}>
                <div className={styles.outputLabel}>Output</div>
                <div
                  className={styles.outputRender}
                  dangerouslySetInnerHTML={{ __html: xssRender }}
                />
              </div>
            </div>
          </div>

          {/* 4. Anomaly Detection */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>📊 Anomaly Detection</div>
              <Badge variant={adMfaTriggered ? "danger" : "success"}>
                Risk: {adMfaTriggered ? "HIGH" : "LOW"}
              </Badge>
            </div>
            <div className={styles.moduleBody}>
              <button
                className={`${styles.btn} ${styles.btnWarning}`}
                onClick={simulateAttackLogin}
              >
                Simulate Foreign Login
              </button>
              <div className={styles.eventList}>
                {adEvents.map(event => (
                  <div
                    key={event.id}
                    className={`${styles.event} ${event.status === "Suspicious" ? styles.eventSuspicious : styles.eventNormal}`}
                  >
                    <div>
                      <div className={styles.eventDetails}>{event.ip} — {event.location}</div>
                      <div className={styles.eventMeta}>@ {event.time}</div>
                    </div>
                    <Badge>{event.status}</Badge>
                  </div>
                ))}
              </div>
              {adMfaTriggered && (
                <div className={styles.mfaAlert}>
                  ⚠️ Anomaly Detected! MFA Requested.
                </div>
              )}
            </div>
          </div>

          {/* 5. DDoS Visualizer */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>🔥 DDoS Traffic</div>
              <Badge variant={ddosWaf ? "success" : "danger"}>WAF: {ddosWaf ? "ON" : "OFF"}</Badge>
            </div>
            <div className={styles.moduleBody}>
              <div className={styles.btnRow}>
                <button
                  className={`${styles.btn} ${ddosRunning ? styles.btnDanger : styles.btnPrimary}`}
                  onClick={() => setDdosRunning(!ddosRunning)}
                >
                  {ddosRunning ? "Stop Attack" : "Launch Botnet"}
                </button>
                <div className={styles.control} style={{ marginBottom: 0 }}>
                  <input type="checkbox" checked={ddosWaf} onChange={e => setDdosWaf(e.target.checked)} />
                  <span className={styles.controlLabel}>Enable WAF</span>
                </div>
              </div>
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ddosTraffic}>
                    <Line
                      type="monotone"
                      dataKey="reqs"
                      stroke={ddosWaf ? "#059669" : "#DC2626"}
                      strokeWidth={2}
                      dot={false}
                    />
                    <XAxis hide />
                    <YAxis width={30} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-dark-bg)",
                        border: "1px solid var(--color-dark-border)",
                        borderRadius: "8px",
                        color: "var(--color-dark-text)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px"
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 6. Phishing Lab */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>🎣 Phishing Awareness</div>
            </div>
            <div className={styles.moduleBody}>
              {phishingEmails.map(email => (
                <div key={email.id} className={styles.emailCard}>
                  <div className={styles.emailSubject}>{email.subject}</div>
                  <div className={styles.emailFrom}>From: {email.from}</div>
                  <p className={styles.emailBody}>{email.body}</p>
                  <button
                    className={styles.analyzeBtn}
                    onClick={() => setPhishingRevealed({ ...phishingRevealed, [email.id]: true })}
                  >
                    Analyze Email
                  </button>
                  {phishingRevealed[email.id] && (
                    <div className={`${styles.analyzeResult} ${email.isPhishing ? styles.phishing : styles.legitimate}`}>
                      {email.isPhishing ? (
                        <>
                          <strong>⚠ PHISHING DETECTED</strong>
                          <ul className={styles.redFlags}>
                            {email.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                          </ul>
                        </>
                      ) : (
                        <strong>✓ Legitimate Email</strong>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 7. Broken Access Control */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>🚧 Broken Access Control</div>
            </div>
            <div className={styles.moduleBody}>
              <div className={styles.roleSelector}>
                <label>
                  <input
                    type="radio"
                    name="role"
                    checked={bacRole === "user"}
                    onChange={() => { setBacRole("user"); setBacUrl("/dashboard/user"); }}
                  />
                  Role: User
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    checked={bacRole === "admin"}
                    onChange={() => { setBacRole("admin"); setBacUrl("/dashboard/admin"); }}
                  />
                  Role: Admin
                </label>
              </div>
              <p className={styles.description} style={{ marginBottom: "var(--space-2)" }}>
                Browser URL Bar Simulator:
              </p>
              <div className={styles.urlBar}>
                <input
                  className={styles.input}
                  style={{ marginBottom: 0 }}
                  type="text"
                  value={bacUrl}
                  onChange={e => setBacUrl(e.target.value)}
                />
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={tryAccess}>
                  Go
                </button>
              </div>
              {bacLog && (
                <div className={`${styles.result} ${bacLog.includes("200") ? styles.resultSafe : styles.resultDanger}`}>
                  {bacLog}
                </div>
              )}
            </div>
          </div>

          {/* 8. IP/ARP Spoofing */}
          <div className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitle}>🎭 IP/ARP Spoofing</div>
              <Badge variant={spoofAuth ? "success" : "danger"}>Auth: {spoofAuth ? "ON" : "OFF"}</Badge>
            </div>
            <div className={styles.moduleBody}>
              <p className={styles.description}>
                Simulate an attacker pretending to be a trusted user.
              </p>
              <div className={styles.control}>
                <input type="checkbox" checked={spoofAuth} onChange={e => setSpoofAuth(e.target.checked)} />
                <span className={styles.controlLabel}>Enable Authenticated Encryption (Defense)</span>
              </div>

              <div className={styles.spoofDiagram}>
                <div className={styles.spoofNode}>
                  <div className={styles.spoofEmoji}>😈</div>
                  <div className={styles.spoofLabel}>Attacker</div>
                  <div className={styles.spoofIp}>10.0.0.13</div>
                </div>
                <div className={styles.spoofLine}>
                  <span className={styles.spoofLineLabel}>Spoofing: &quot;User&quot;</span>
                  <span className={styles.spoofArrow}>▶</span>
                </div>
                <div className={styles.spoofNode}>
                  <div className={styles.spoofEmoji}>🖥️</div>
                  <div className={styles.spoofLabel}>Server</div>
                  <div className={styles.spoofIp}>10.0.0.1</div>
                </div>
              </div>

              <button
                className={`${styles.btn} ${styles.btnIndigo} ${styles.btnFull}`}
                onClick={sendSpoofedPacket}
              >
                Send Spoofed Packet
              </button>

              {spoofLog && (
                <div
                  className={`${styles.result} ${spoofLog.includes("REJECTED") ? styles.resultSafe : styles.resultDanger}`}
                  style={{ textAlign: "center" }}
                >
                  {spoofLog}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLab;
