import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import styles from "./StaffDashboard.module.css";

export default function StaffDashboard() {
  const nav = useNavigate();
  const [searchPatient, setSearchPatient] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [securityStats, setSecurityStats] = useState({
    activeAlerts: 0,
    blockedIps: 0,
    systemHealth: "Healthy"
  });
  const [simulating, setSimulating] = useState(false);
  const [logs, setLogs] = useState([
    "System monitor initialized...",
    "Waiting for events..."
  ]);

  const recentAccess = [
    { id: 1, patient: "John Doe", purpose: "Emergency Treatment", time: "2 mins ago", status: "granted" },
    { id: 2, patient: "Jane Smith", purpose: "Routine Checkup", time: "15 mins ago", status: "granted" },
    { id: 3, patient: "Bob Johnson", purpose: "Surgery", time: "1 hour ago", status: "pending" }
  ];

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};

  const renderData = (data, maskChars = "••••••••") =>
    isEncrypted ? maskChars : data;

  // Fetch requests
  useEffect(() => {
    let mounted = true;
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/access-requests/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mounted) setRequests(res.data.requests || []);
      } catch (err) { /* keep alive */ }
    };
    fetchRequests();
    const id = setInterval(fetchRequests, 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Fetch consents
  useEffect(() => {
    let mounted = true;
    const fetchConsents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/consent/staff/consents", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mounted) setConsents(res.data.consents || []);
      } catch (err) { /* keep alive */ }
    };
    fetchConsents();
    const id = setInterval(fetchConsents, 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Fetch security stats
  useEffect(() => {
    let mounted = true;
    const fetchSecurityStats = async () => {
      try {
        const res = await api.get("http://localhost:5000/api/security/stats");
        if (mounted) setSecurityStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchSecurityStats();
    const id = setInterval(fetchSecurityStats, 2000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const triggerSimulation = async (type) => {
    setSimulating(true);
    if (type === "scenario") {
      setLogs(prev => ["🔄 Initiating Full Attack Scenario...", ...prev]);
      try {
        await api.post("http://localhost:5000/api/simulation/start", { type });
        setTimeout(() => setLogs(prev => ["✅ Phase 1: Normal Traffic Detected.", ...prev]), 1000);
        setTimeout(() => setLogs(prev => ["⚠️ Phase 2: Suspicious Reconnaissance Activity...", ...prev]), 4000);
        setTimeout(() => setLogs(prev => ["🚨 Phase 3: BRUTE FORCE ATTACK DETECTED!", ...prev]), 6000);
        setTimeout(() => setLogs(prev => ["🚨 Phase 3: DDoS BURST INCOMING!", ...prev]), 8000);
        setTimeout(() => setLogs(prev => ["🛡️ DEFENSE SYSTEM ACTIVE: Blocking IPs...", ...prev]), 9000);
        setTimeout(() => setLogs(prev => ["✅ THREAT NEUTRALIZED. System Secure.", ...prev]), 11000);
      } catch (err) {
        setLogs(prev => ["❌ Simulation Failed to Start", ...prev]);
      } finally {
        setTimeout(() => setSimulating(false), 12000);
      }
    } else {
      try {
        await api.post("http://localhost:5000/api/simulation/start", { type });
        setLogs(prev => [`⚡ Started ${type} simulation...`, ...prev]);
      } catch (err) {
        alert("Failed to start simulation");
      } finally {
        setTimeout(() => setSimulating(false), 2000);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  const searchPatientData = async () => {
    if (!searchPatient.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/patients/search?q=${encodeURIComponent(searchPatient)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(res.data.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestAccess = async (patientId, purpose) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/access-requests/create",
        { patientId, purpose },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Request sent to patient!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send access request");
    }
  };

  const healthClass =
    securityStats.systemHealth === "Critical"
      ? styles.bannerCritical
      : securityStats.systemHealth === "Warning"
      ? styles.bannerWarning
      : styles.bannerHealthy;

  const encryptToggle = (
    <button
      className={`${styles.encryptToggle} ${isEncrypted ? styles.encryptToggleActive : ""}`}
      onClick={() => setIsEncrypted(!isEncrypted)}
    >
      {isEncrypted ? "🔒 Encrypted" : "🔓 Encrypt"}
    </button>
  );

  return (
    <div className={styles.page}>
      <Navbar user={user} onLogout={logout} actions={encryptToggle} />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>Staff Dashboard</h1>
          <p className={styles.greetingSub}>
            Welcome back, {user.name}. Manage patient access and view medical records.
          </p>
        </div>

        {/* Security Status Banner */}
        <div className={`${styles.securityBanner} ${healthClass}`}>
          <div className={styles.bannerHeader}>
            <div className={styles.bannerTitle}>
              🛡️ Security Status: {securityStats.systemHealth.toUpperCase()}
            </div>
            <div className={styles.bannerActions}>
              <button
                className={`${styles.btnSim} ${styles.btnSimPrimary}`}
                onClick={() => triggerSimulation("scenario")}
                disabled={simulating}
              >
                🚀 Attack Scenario
              </button>
              <button
                className={`${styles.btnSim} ${styles.btnSimSecondary}`}
                onClick={() => triggerSimulation("brute_force")}
                disabled={simulating}
              >
                ⚡ Brute Force
              </button>
              <button
                className={`${styles.btnSim} ${styles.btnSimSecondary}`}
                onClick={() => triggerSimulation("ddos")}
                disabled={simulating}
              >
                🔥 DDoS
              </button>
              <button
                className={`${styles.btnSim} ${styles.btnSimLab}`}
                onClick={() => nav("/security-lab")}
              >
                🔬 Security Lab
              </button>
            </div>
          </div>
          <div className={styles.bannerBody}>
            <div className={styles.bannerStats}>
              <div className={styles.bannerStat}>
                <span className={styles.bannerStatLabel}>Active Threats</span>
                <span
                  className={styles.bannerStatValue}
                  style={{ color: securityStats.activeAlerts > 0 ? "var(--color-danger)" : "var(--color-success)" }}
                >
                  {securityStats.activeAlerts}
                </span>
              </div>
              <div className={styles.bannerStat}>
                <span className={styles.bannerStatLabel}>Blocked IPs</span>
                <span className={styles.bannerStatValue}>{securityStats.blockedIps}</span>
              </div>
              <div className={styles.bannerStat}>
                <span className={styles.bannerStatLabel}>Protection</span>
                <span style={{ color: "var(--color-success)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
                  {securityStats.systemHealth === "Critical"
                    ? "Mitigation Active"
                    : "Monitoring"}
                </span>
              </div>
            </div>
            <div className={styles.liveTerminal}>
              <div className={styles.terminalHeader}>Live Security Feed</div>
              {logs.map((log, i) => (
                <div key={i} className={styles.terminalLine}>{`> ${log}`}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard icon="👥" label="Total Patients" value={renderData("1,247", "1,XXX")} variant="primary" />
          <StatCard icon="✓" label="Access Granted" value={renderData("89", "XX")} variant="success" />
          <StatCard icon="⏳" label="Pending" value={renderData("12", "XX")} variant="warning" />
          <StatCard icon="🚨" label="Emergency" value={renderData("3", "X")} variant="danger" />
        </div>

        {/* Requests */}
        <div className={`${styles.section} ${styles.mb6}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span className={styles.liveDot} />
              My Access Requests
            </div>
          </div>
          <div className={styles.sectionBody}>
            {requests.length === 0 ? (
              <div className={styles.emptyState}>No requests yet.</div>
            ) : (
              requests.map(r => (
                <div key={r.id} className={styles.requestItem}>
                  <div className={styles.requestInfo}>
                    <h4>{renderData(r.purpose)}</h4>
                    <p>Patient: {renderData(r.patient_id, "ID-••••")}</p>
                  </div>
                  <Badge>{r.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Two-Column: Lookup + Quick Actions */}
        <div className={styles.twoCol}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Patient Lookup</div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.searchWrap}>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search by ID, Name, or Email"
                  value={searchPatient}
                  onChange={e => setSearchPatient(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchPatientData()}
                />
                <button
                  className={styles.btnSearch}
                  onClick={searchPatientData}
                  disabled={loading}
                >
                  {loading ? "..." : "Search"}
                </button>
              </div>
              {searchResults.map(patient => (
                <div key={patient.id} className={styles.searchResult}>
                  <div className={styles.resultInfo}>
                    <h4>{renderData(patient.name)}</h4>
                    <p>
                      {renderData(patient.id, "ID-••••")} · {renderData(patient.email, "••••@••••.com")} · Blood: {renderData(patient.bloodType, "XX")}
                    </p>
                  </div>
                  <button
                    className={styles.btnAccess}
                    onClick={() => requestAccess(patient.id, "Routine Checkup")}
                  >
                    Request Access
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Quick Actions</div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.quickActions}>
                {[
                  { icon: "🚨", label: "Emergency Access", sub: "Immediate override", purpose: "Emergency Treatment", pid: "emergency-patient" },
                  { icon: "🏥", label: "Routine Checkup", sub: "Standard access", purpose: "Routine Checkup", pid: "routine-patient" },
                  { icon: "🔬", label: "Surgery Access", sub: "Full record access", purpose: "Surgery", pid: "surgery-patient" },
                  { icon: "💊", label: "Pharmacy Request", sub: "Medication data", purpose: "Pharmacy", pid: "pharmacy-patient" }
                ].map(action => (
                  <button
                    key={action.label}
                    className={styles.btnQuick}
                    onClick={() => requestAccess(action.pid, action.purpose)}
                  >
                    <span className={styles.btnQuickIcon}>{action.icon}</span>
                    <span className={styles.btnQuickLabel}>{action.label}</span>
                    <span className={styles.btnQuickSub}>{action.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Access Log Table */}
        <div className={`${styles.section} ${styles.mb6}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Recent Access Log</div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Purpose</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAccess.map(access => (
                <tr key={access.id}>
                  <td style={{ fontWeight: 500 }}>{renderData(access.patient)}</td>
                  <td>{renderData(access.purpose)}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{access.time}</td>
                  <td><Badge>{access.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Consents */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span className={styles.liveDot} />
              Live Consents
            </div>
          </div>
          <div className={styles.sectionBody}>
            {consents.length === 0 ? (
              <div className={styles.emptyState}>No consents yet.</div>
            ) : (
              consents.map(c => (
                <div key={c.id} className={styles.consentItem}>
                  <div className={styles.consentInfo}>
                    <h4>{renderData(c.purpose)}</h4>
                    <p>
                      Patient: {renderData(c.patient_id, "ID-••••")} · Requester: {renderData(c.requester_id, "ID-••••")}
                    </p>
                  </div>
                  <Badge>{c.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
