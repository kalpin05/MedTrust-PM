import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SecurityLab = () => {
    // --- 1. Brute Force Simulator State ---
    const [bfLogs, setBfLogs] = useState([]);
    const [bfRunning, setBfRunning] = useState(false);
    const [bfAttempts, setBfAttempts] = useState(0);
    const [bfLocked, setBfLocked] = useState(false);
    const [bfRateLimit, setBfRateLimit] = useState(false);

    // --- 2. SQL Injection State ---
    const [sqlInput, setSqlInput] = useState("");
    // const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users WHERE username = '...'"); // Removed state, derived instead
    const [sqlResult, setSqlResult] = useState(null);
    const [sqlSecure, setSqlSecure] = useState(false);

    // Derived State for SQL Query
    const sqlQuery = sqlSecure ? "SELECT * FROM users WHERE username = ?" : `SELECT * FROM users WHERE username = '${sqlInput}'`;

    // --- 3. XSS Playground State ---
    const [xssInput, setXssInput] = useState("");
    const [xssRender, setXssRender] = useState("");
    const [xssSanitize, setXssSanitize] = useState(false);

    // --- 4. Anomaly Detection State ---
    const [adEvents, setAdEvents] = useState([
        { id: 1, ip: "192.168.1.10", location: "New York, USA", time: "09:00 AM", status: "Normal" },
        { id: 2, ip: "192.168.1.12", location: "New York, USA", time: "09:15 AM", status: "Normal" }
    ]);
    const [adMfaTriggered, setAdMfaTriggered] = useState(false);

    // --- 5. DDoS Visualizer State ---
    const [ddosTraffic, setDdosTraffic] = useState([{ time: 0, reqs: 10 }]);
    const [ddosRunning, setDdosRunning] = useState(false);
    const [ddosWaf, setDdosWaf] = useState(false);
    const timerRef = useRef(null);

    // --- 6. Phishing Lab State ---
    const [phishingEmails] = useState([ // Removed unused setter
        { id: 1, subject: "Urgent: Update Password", from: "support@g00gle.com", body: "Click here immediately.", isPhishing: true, redFlags: ["Mispelled domain (g00gle.com)", "Urgent threat"] },
        { id: 2, subject: "Team Meeting", from: "manager@company.com", body: "See you at 2pm.", isPhishing: false, redFlags: [] }
    ]);
    const [phishingRevealed, setPhishingRevealed] = useState({});

    // --- 7. Broken Access Control State ---
    const [bacRole, setBacRole] = useState("user");
    const [bacUrl, setBacUrl] = useState("/dashboard/user");
    const [bacLog, setBacLog] = useState("");

    // --- 8. Spoofing Attack State ---
    const [spoofTarget] = useState("Server"); // Removed unused setter
    const [spoofSource] = useState("Attacker"); // Removed unused setter
    const [spoofAuth, setSpoofAuth] = useState(false);
    const [spoofLog, setSpoofLog] = useState("");

    // --- 1. Brute Force Logic ---
    useEffect(() => {
        let interval;
        if (bfRunning && !bfLocked) {
            interval = setInterval(() => {
                setBfAttempts(prev => {
                    const newAttempts = prev + 1;
                    if (bfRateLimit && newAttempts > 5) {
                        setBfLocked(true);
                        setBfLogs(prevLogs => [`🔒 System Locked due to excessive attempts!`, ...prevLogs]);
                        setBfRunning(false);
                        return prev;
                    }
                    const guess = Math.random().toString(36).substring(7);
                    setBfLogs(prevLogs => [`Attempt ${newAttempts}: Trying '${guess}'... Failed`, ...prevLogs]);
                    return newAttempts;
                });
            }, 200);
        }
        return () => clearInterval(interval);
    }, [bfRunning, bfLocked, bfRateLimit]);

    const startBruteForce = () => {
        setBfAttempts(0);
        setBfLogs([]);
        setBfLocked(false);
        setBfRunning(true);
    };

    // --- 2. SQL Injection Logic ---
    // Removed useEffect for sqlQuery as it is now derived state

    const runSql = () => {
        if (sqlSecure) {
            setSqlResult("Safe: No results found (Input treated as literal string).");
        } else {
            if (sqlInput.includes("'") || sqlInput.includes("OR")) {
                setSqlResult("⚠️ UNLOCKED: Admin Access Granted! (Logic bypassed)");
            } else {
                setSqlResult("No results found.");
            }
        }
    };

    // --- 3. XSS Logic ---
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

    // --- 4. Anomaly Logic ---
    const simulateAttackLogin = () => {
        const newEvent = {
            id: Date.now(),
            ip: "45.12.19.99",
            location: "Unknown, Russia",
            time: "03:00 AM",
            status: "Suspicious"
        };
        setAdEvents(prev => [newEvent, ...prev]);
        setAdMfaTriggered(true);
    };

    // --- 5. DDoS Logic ---
    useEffect(() => {
        if (ddosRunning) {
            timerRef.current = setInterval(() => {
                setDdosTraffic(prev => {
                    const lastTime = prev[prev.length - 1].time;
                    let newReqs = ddosWaf ? 20 : Math.floor(Math.random() * 50) + 100; // Spike or regulated
                    return [...prev.slice(-19), { time: lastTime + 1, reqs: newReqs }];
                });
            }, 500);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [ddosRunning, ddosWaf]);

    // --- 7. Broken Access Control Logic ---
    const tryAccess = () => {
        if (bacUrl.includes("admin") && bacRole !== "admin") {
            setBacLog("❌ 403 Forbidden: You do not have permission to access /admin");
        } else {
            setBacLog(`✅ 200 OK: Accessed ${bacUrl} as ${bacRole}`);
        }
    };

    // --- 8. Spoofing Logic ---
    const sendSpoofedPacket = () => {
        if (spoofAuth) {
            setSpoofLog("🛡️ REJECTED: Packet lacks valid digital signature.");
        } else {
            setSpoofLog(`✅ ACCEPTED: Server accepted packet from '${spoofSource}' thinking it was 'User'.`);
        }
    };

    // Styles
    const sectionStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
    };

    const headerStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#1f2937'
    };

    const badgeStyle = (active) => ({
        padding: '5px 10px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        backgroundColor: active ? '#dcfce7' : '#fee2e2',
        color: active ? '#166534' : '#991b1b',
        marginLeft: 'auto'
    });

    return (
        <div style={{ minHeight: '100vh', padding: '40px', background: '#f3f4f6' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', color: '#111827' }}>
                🛡️ Security Simulation Lab
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>

                {/* 1. Brute Force */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        🔓 Brute Force Attack
                        <div style={badgeStyle(bfLocked)}>Status: {bfLocked ? "LOCKED" : "Vulnerable"}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ marginBottom: '10px', color: '#4b5563' }}>Simulates an attacker guessing passwords rapidly.</p>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <input type="checkbox" checked={bfRateLimit} onChange={(e) => setBfRateLimit(e.target.checked)} />
                            Enable Rate Limiting (Defense)
                        </label>
                        <button
                            onClick={startBruteForce}
                            disabled={bfRunning}
                            style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                        >
                            {bfRunning ? "Attacking..." : "Start Attack"}
                        </button>
                    </div>
                    <div style={{ background: '#1f2937', color: '#10b981', padding: '10px', borderRadius: '5px', height: '150px', overflowY: 'auto', fontFamily: 'monospace' }}>
                        {bfLogs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                </div>

                {/* 2. SQL Injection */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        💉 SQL Injection
                        <div style={badgeStyle(false)}>Target: Database</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ marginBottom: '10px', color: '#4b5563' }}>Try entering: <code style={{ background: '#e5e7eb', padding: '2px 5px', borderRadius: '3px' }}>admin&apos; OR 1=1 --</code></p>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <input type="checkbox" checked={sqlSecure} onChange={(e) => setSqlSecure(e.target.checked)} />
                            Use Parameterized Query (Defense)
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={sqlInput}
                            onChange={(e) => setSqlInput(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '5px', marginBottom: '10px' }}
                        />
                        <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '5px', border: '1px solid #fecaca', marginBottom: '10px' }}>
                            <strong>Executing Query:</strong><br />
                            <code style={{ color: '#b91c1c' }}>{sqlQuery}</code>
                        </div>
                        <button
                            onClick={runSql}
                            style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                        >
                            Login
                        </button>
                        {sqlResult && <div style={{ marginTop: '10px', fontWeight: 'bold', color: sqlResult.includes("UNLOCKED") ? 'red' : 'green' }}>{sqlResult}</div>}
                    </div>
                </div>

                {/* 3. XSS Playground */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        📜 XSS Playground
                        <div style={badgeStyle(false)}>Target: Browser</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ marginBottom: '10px', color: '#4b5563' }}>Try: <code style={{ background: '#e5e7eb', padding: '2px 5px', borderRadius: '3px' }}>&lt;script&gt;alert(1)&lt;/script&gt;</code></p>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <input type="checkbox" checked={xssSanitize} onChange={(e) => setXssSanitize(e.target.checked)} />
                            Enable Output Sanitization (Defense)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter comment..."
                            value={xssInput}
                            onChange={(e) => setXssInput(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '5px', marginBottom: '10px' }}
                        />
                        <button
                            onClick={runXss}
                            style={{ backgroundColor: '#7c3aed', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                        >
                            Post Comment
                        </button>
                    </div>
                    <div style={{ marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                        <strong>Output:</strong>
                        <div dangerouslySetInnerHTML={{ __html: xssRender }} style={{ background: '#f9fafb', padding: '10px', marginTop: '5px', borderRadius: '5px' }} />
                    </div>
                </div>

                {/* 4. Anomaly Detection */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        📊 Anomaly Detection
                        <div style={badgeStyle(!adMfaTriggered)}>Risk: {adMfaTriggered ? "HIGH" : "LOW"}</div>
                    </div>
                    <button
                        onClick={simulateAttackLogin}
                        style={{ backgroundColor: '#d97706', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', marginBottom: '15px' }}
                    >
                        Simulate Foreign Login
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {adEvents.map(event => (
                            <div key={event.id} style={{
                                padding: '10px',
                                border: `1px solid ${event.status === 'Suspicious' ? '#fecaca' : '#bbf7d0'}`,
                                backgroundColor: event.status === 'Suspicious' ? '#fef2f2' : '#f0fdf4',
                                borderRadius: '5px'
                            }}>
                                <strong>{event.ip}</strong> - {event.location} @ {event.time}
                                <span style={{ float: 'right', color: event.status === 'Suspicious' ? 'red' : 'green', fontWeight: 'bold' }}>{event.status}</span>
                            </div>
                        ))}
                    </div>
                    {adMfaTriggered && (
                        <div style={{ marginTop: '15px', padding: '10px', background: '#fffbeb', border: '1px solid #cbd5e1', borderRadius: '5px', color: '#b45309', fontWeight: 'bold' }}>
                            ⚠️ Anomaly Detected! MFA Requested.
                        </div>
                    )}
                </div>

                {/* 5. DDoS Visualizer */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        🔥 DDoS Traffic
                        <div style={badgeStyle(ddosWaf)}>WAF: {ddosWaf ? "ON" : "OFF"}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <button
                            onClick={() => setDdosRunning(!ddosRunning)}
                            style={{ backgroundColor: ddosRunning ? '#dc2626' : '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', marginRight: '10px' }}
                        >
                            {ddosRunning ? "Stop Attack" : "Launch Botnet"}
                        </button>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" checked={ddosWaf} onChange={(e) => setDdosWaf(e.target.checked)} />
                            Enable WAF
                        </label>
                    </div>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ddosTraffic}>
                                <Line type="monotone" dataKey="reqs" stroke={ddosWaf ? "#10b981" : "#ef4444"} strokeWidth={2} dot={false} />
                                <XAxis hide />
                                <YAxis />
                                <Tooltip />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Phishing Lab */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        🎣 Phishing Awareness
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {phishingEmails.map(email => (
                            <div key={email.id} style={{ border: '1px solid #e5e7eb', borderRadius: '5px', padding: '15px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{email.subject}</div>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '10px' }}>From: {email.from}</div>
                                <p>{email.body}</p>
                                <button
                                    onClick={() => setPhishingRevealed({ ...phishingRevealed, [email.id]: true })}
                                    style={{ marginTop: '10px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                                >
                                    Analyze Email
                                </button>
                                {phishingRevealed[email.id] && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: email.isPhishing ? '#fee2e2' : '#dcfce7', borderRadius: '5px' }}>
                                        {email.isPhishing ? (
                                            <>
                                                <strong style={{ color: '#b91c1c' }}>PHISHING DETECTED</strong>
                                                <ul style={{ margin: '5px 0 0 20px', color: '#7f1d1d' }}>
                                                    {email.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                                                </ul>
                                            </>
                                        ) : (
                                            <strong style={{ color: '#166534' }}>Legitimate Email</strong>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. Broken Access Control */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        🚧 Broken Access Control
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <label><input type="radio" name="role" checked={bacRole === 'user'} onChange={() => { setBacRole('user'); setBacUrl('/dashboard/user'); }} /> Role: User</label>
                            <label><input type="radio" name="role" checked={bacRole === 'admin'} onChange={() => { setBacRole('admin'); setBacUrl('/dashboard/admin'); }} /> Role: Admin</label>
                        </div>
                        <p style={{ marginBottom: '5px' }}>Browser URL Bar Simulator:</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={bacUrl}
                                onChange={(e) => setBacUrl(e.target.value)}
                                style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '5px' }}
                            />
                            <button
                                onClick={tryAccess}
                                style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                            >
                                Go
                            </button>
                        </div>
                    </div>
                    {bacLog && (
                        <div style={{
                            padding: '10px',
                            borderRadius: '5px',
                            backgroundColor: bacLog.includes("200") ? '#dcfce7' : '#fee2e2',
                            color: bacLog.includes("200") ? '#166534' : '#991b1b',
                            fontWeight: 'bold'
                        }}>
                            {bacLog}
                        </div>
                    )}
                </div>

                {/* 8. IP/ARP Spoofing */}
                <div style={sectionStyle}>
                    <div style={headerStyle}>
                        🎭 IP/ARP Spoofing
                        <div style={badgeStyle(spoofAuth)}>Auth: {spoofAuth ? "ON" : "OFF"}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ marginBottom: '10px', color: '#4b5563' }}>Simulate an attacker pretending to be a trusted user.</p>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <input type="checkbox" checked={spoofAuth} onChange={(e) => setSpoofAuth(e.target.checked)} />
                            Enable Authenticated Encryption (Defense)
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>😈</div>
                                <div>Attacker</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>IP: 10.0.0.13</div>
                            </div>
                            <div style={{ flex: 1, borderBottom: '2px dashed #94a3b8', margin: '0 20px', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '0 5px', fontSize: '0.8rem' }}>
                                    Spoofing: &quot;User&quot;
                                </div>
                                <div style={{ position: 'absolute', right: '0', top: '-6px' }}>▶</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>🖥️</div>
                                <div>Server</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>IP: 10.0.0.1</div>
                            </div>
                        </div>

                        <button
                            onClick={sendSpoofedPacket}
                            style={{ width: '100%', backgroundColor: '#4f46e5', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Send Spoofed Packet
                        </button>

                        {spoofLog && (
                            <div style={{
                                marginTop: '15px',
                                padding: '10px',
                                borderRadius: '5px',
                                backgroundColor: spoofLog.includes("REJECTED") ? '#dcfce7' : '#fee2e2',
                                color: spoofLog.includes("REJECTED") ? '#166534' : '#991b1b',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}>
                                {spoofLog}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SecurityLab;
