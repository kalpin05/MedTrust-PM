import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const nav = useNavigate();
  const [searchPatient, setSearchPatient] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const recentAccess = [
    { id: 1, patient: "John Doe", purpose: "Emergency Treatment", time: "2 mins ago", status: "granted" },
    { id: 2, patient: "Jane Smith", purpose: "Routine Checkup", time: "15 mins ago", status: "granted" },
    { id: 3, patient: "Bob Johnson", purpose: "Surgery", time: "1 hour ago", status: "pending" }
  ];
  const [consents, setConsents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [securityStats, setSecurityStats] = useState({ activeAlerts: 0, blockedIps: 0, systemHealth: 'Healthy' });
  const [simulating, setSimulating] = useState(false);
  const [logs, setLogs] = useState(["System monitor initialized...", "Waiting for events..."]);

  const renderData = (data, maskChars = "••••••••") => {
    return isEncrypted ? maskChars : data;
  };

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};

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
      } catch (err) {
        // keep UI alive
      }
    };

    fetchRequests();
    const id = setInterval(fetchRequests, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

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
      } catch (err) {
        // keep UI alive
      }
    };

    fetchConsents();
    const id = setInterval(fetchConsents, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchSecurityStats = async () => {
      try {
        const res = await api.get('http://localhost:5000/api/security/stats');
        if (mounted) setSecurityStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSecurityStats();
    const id = setInterval(fetchSecurityStats, 2000); // Poll faster for security updates
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const triggerSimulation = async (type) => {
    setSimulating(true);
    if (type === 'scenario') {
      setLogs(prev => ["🔄 Initiating Full Attack Scenario...", ...prev]);
      try {
        await api.post('http://localhost:5000/api/simulation/start', { type });

        // Artificial delay for storytelling
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
        await api.post('http://localhost:5000/api/simulation/start', { type });
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
      const res = await api.get(`/patients/search?q=${encodeURIComponent(searchPatient)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data.patients || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
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
      console.error(err);
      alert(err.response?.data?.error || "Failed to send access request");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #eff6ff, #f0fdf4)'
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#2563eb',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.75rem'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>M</span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>MedTrustID</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              borderRadius: '50%'
            }}></div>
            <button
              onClick={logout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.5rem 0.75rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
            <button
              onClick={() => setIsEncrypted(!isEncrypted)}
              style={{
                backgroundColor: isEncrypted ? '#dc2626' : '#2563eb',
                color: 'white',
                padding: '0.5rem 0.75rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isEncrypted ? (
                <>
                  <span>🔒</span> Encrypted
                </>
              ) : (
                <>
                  <span>🔓</span> Encrypt Data
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div style={{ padding: '1rem', maxWidth: '80rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
            Staff Dashboard
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
            Welcome back, {user.name}. Manage patient access and view medical records.
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>My Access Requests (Live)</h2>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {requests.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No requests yet.</div>
            ) : (
              requests.map((r) => (
                <div key={r.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{renderData(r.purpose)}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>patient: {renderData(r.patient_id, "ID-••••")}</div>
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: r.status === 'approved' ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: r.status === 'approved' ? '#16a34a' : r.status === 'rejected' ? '#dc2626' : '#ca8a04',
                      height: 'fit-content'
                    }}>
                      {r.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* Security Status Widget */}
        <div style={{
          backgroundColor: securityStats.systemHealth === 'Critical' ? '#fee2e2' : securityStats.systemHealth === 'Warning' ? '#fef3c7' : '#dcfce7',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '2rem',
          border: `2px solid ${securityStats.systemHealth === 'Critical' ? '#dc2626' : securityStats.systemHealth === 'Warning' ? '#d97706' : '#16a34a'}`
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🛡️ Cyber Security Status: {securityStats.systemHealth.toUpperCase()}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => triggerSimulation('scenario')}
                disabled={simulating}
                style={{ padding: '5px 15px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🚀 Run Attack Scenario
              </button>
              <button
                onClick={() => triggerSimulation('brute_force')}
                disabled={simulating}
                style={{ padding: '5px 10px', backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                ⚡ Sim Brute Force
              </button>
              <button
                onClick={() => triggerSimulation('ddos')}
                disabled={simulating}
                style={{ padding: '5px 10px', backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🔥 Sim DDoS
              </button>
              <button
                onClick={() => nav('/security-lab')}
                disabled={simulating}
                style={{ padding: '5px 10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}
              >
                🔬 Security Lab
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ padding: '1rem 1.5rem', flex: 1 }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>Active Threats:</span>
                <span style={{ marginLeft: '10px', color: securityStats.activeAlerts > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold', fontSize: '1.2em' }}>
                  {securityStats.activeAlerts}
                </span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>Blocked IPs:</span>
                <span style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: '1.2em' }}>
                  {securityStats.blockedIps}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Protection:</span>
                <span style={{ marginLeft: '10px', color: '#16a34a' }}>
                  {securityStats.systemHealth === 'Critical' ? 'Mitigation Active (Blocking IPs)' : 'Monitoring'}
                </span>
              </div>
            </div>
            {/* Live Feed */}
            <div style={{ flex: 1, padding: '10px', borderLeft: '1px solid #ccc', backgroundColor: '#111827', color: '#00ff00', fontFamily: 'monospace', height: '150px', overflowY: 'auto', fontSize: '0.85em' }}>
              <div style={{ borderBottom: '1px solid #333', marginBottom: '5px', paddingBottom: '3px', fontWeight: 'bold', color: '#fff' }}>LIVE SECURITY FEED</div>
              {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '2px' }}>{`> ${log}`}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#dbeafe',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginRight: '1rem'
            }}>
              <div style={{ width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%' }}></div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Patients</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>{renderData("1,247", "1,XXX")}</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#dcfce7',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginRight: '1rem'
            }}>
              <div style={{ width: '1.5rem', height: '1.5rem', backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Access Granted</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>{renderData("89", "XX")}</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginRight: '1rem'
            }}>
              <div style={{ width: '1.5rem', height: '1.5rem', backgroundColor: '#ca8a04', borderRadius: '50%' }}></div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>{renderData("12", "XX")}</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#fee2e2',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginRight: '1rem'
            }}>
              <div style={{ width: '1.5rem', height: '1.5rem', backgroundColor: '#dc2626', borderRadius: '50%' }}></div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Emergency</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>{renderData("3", "X")}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Patient Lookup */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Patient Lookup</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Search by Patient ID, Name, or Email"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPatientData()}
                />
                <button
                  onClick={searchPatientData}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
                    Search Results
                  </h3>
                  {searchResults.map(patient => (
                    <div key={patient.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '500', color: '#111827' }}>{renderData(patient.name)}</p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            ID: {renderData(patient.id, "ID-••••")} | {renderData(patient.email, "••••@••••.com")}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Blood Type: {renderData(patient.bloodType, "XX")} | Last Visit: {renderData(patient.lastVisit)}
                          </p>
                        </div>
                        <button
                          onClick={() => requestAccess(patient.id, "Routine Checkup")}
                          style={{
                            backgroundColor: '#16a34a',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            border: 'none'
                          }}
                        >
                          Request Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Quick Actions</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                <button
                  onClick={() => requestAccess("emergency-patient", "Emergency Treatment")}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  🚨 Emergency Access
                </button>
                <button
                  onClick={() => requestAccess("routine-patient", "Routine Checkup")}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  🏥 Routine Checkup
                </button>
                <button
                  onClick={() => requestAccess("surgery-patient", "Surgery")}
                  style={{
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  🔪 Surgery Access
                </button>
                <button
                  onClick={() => requestAccess("pharmacy-patient", "Pharmacy")}
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  💊 Pharmacy Request
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Access Log Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Recent Access Log</h2>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Patient</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Purpose</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Time</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAccess.map(access => (
                  <tr key={access.id} style={{ backgroundColor: '#f9fafb' }}>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#111827',
                      borderTop: '1px solid #e5e7eb'
                    }}>{renderData(access.patient)}</td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      borderTop: '1px solid #e5e7eb'
                    }}>{renderData(access.purpose)}</td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      borderTop: '1px solid #e5e7eb'
                    }}>{access.time}</td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: access.status === 'granted' ? '#dcfce7' : '#fef3c7',
                        color: access.status === 'granted' ? '#16a34a' : '#ca8a04'
                      }}>
                        {access.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Live Consents (updates every second)</h2>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {consents.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No consents yet.</div>
            ) : (
              consents.map((c) => (
                <div key={c.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{renderData(c.purpose)}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>patient: {renderData(c.patient_id, "ID-••••")}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>requester: {renderData(c.requester_id, "ID-••••")}</div>
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: c.status === 'active' ? '#dcfce7' : c.status === 'revoked' ? '#fee2e2' : '#fef3c7',
                      color: c.status === 'active' ? '#16a34a' : c.status === 'revoked' ? '#dc2626' : '#ca8a04',
                      height: 'fit-content'
                    }}>
                      {c.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
