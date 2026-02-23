import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import styles from "./SecurityDashboard.module.css";

const SecurityDashboard = () => {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    blockedIps: 0,
    systemHealth: "Unknown"
  });
  const [alerts, setAlerts] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/security/stats"),
        axios.get("http://localhost:5000/api/security/alerts")
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setTrafficData(prev => {
        const newData = [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            requests:
              Math.floor(Math.random() * 50) +
              (statsRes.data.activeAlerts > 0 ? 100 : 0)
          }
        ];
        if (newData.length > 20) newData.shift();
        return newData;
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch security data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = () => { fetchData(); };
    init();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/security/alerts/${id}/resolve`
      );
      fetchData();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Critical": return styles.severityCritical;
      case "High": return styles.severityHigh;
      case "Medium": return styles.severityMedium;
      default: return styles.severityLow;
    }
  };



  if (loading) {
    return <div className={styles.page}><div className={styles.content}>Loading...</div></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>
          🛡️ Cyber-Resilient Infrastructure Monitor
        </h1>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Active Threats</div>
            <div
              className={styles.statValue}
              style={{
                color: stats.activeAlerts > 0 ? "#F87171" : "#4ADE80"
              }}
            >
              {stats.activeAlerts}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Blocked IPs</div>
            <div
              className={styles.statValue}
              style={{ color: "#FBBF24" }}
            >
              {stats.blockedIps}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Network Traffic (Req/s)</div>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alert Table */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Security Alerts</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Severity</th>
                <th>Type</th>
                <th>Source IP</th>
                <th>Message</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <tr key={alert.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </td>
                  <td>
                    <span className={`${styles.severityBadge} ${getSeverityClass(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td>{alert.type}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{alert.source_ip}</td>
                  <td>{alert.message}</td>
                  <td className={alert.status === "Resolved" ? styles.statusResolved : styles.statusActive}>
                    {alert.status}
                  </td>
                  <td>
                    {alert.status === "Active" && (
                      <button
                        className={styles.btnResolve}
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
