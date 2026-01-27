import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const nav = useNavigate();
  const [searchPatient, setSearchPatient] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentAccess, setRecentAccess] = useState([]);
  const [consents, setConsents] = useState([]);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};

  useEffect(() => {
    setRecentAccess([
      { id: 1, patient: "John Doe", purpose: "Emergency Treatment", time: "2 mins ago", status: "granted" },
      { id: 2, patient: "Jane Smith", purpose: "Routine Checkup", time: "15 mins ago", status: "granted" },
      { id: 3, patient: "Bob Johnson", purpose: "Surgery", time: "1 hour ago", status: "pending" }
    ]);
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  const searchPatientData = async () => {
    if (!searchPatient.trim()) return;
    
    setLoading(true);
    try {
      setTimeout(() => {
        setSearchResults([
          { id: "P001", name: "John Doe", email: "john@example.com", bloodType: "O+", lastVisit: "2024-01-15" },
          { id: "P002", name: "Jane Smith", email: "jane@example.com", bloodType: "A+", lastVisit: "2024-01-20" }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const requestAccess = async (patientId, purpose) => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/consent/create", {
        patientId,
        requesterId: "staff-current",
        purpose,
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Access request sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send access request");
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
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>1,247</p>
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
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>89</p>
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
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>12</p>
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
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>3</p>
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
                          <p style={{ fontWeight: '500', color: '#111827' }}>{patient.name}</p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            ID: {patient.id} | {patient.email}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Blood Type: {patient.bloodType} | Last Visit: {patient.lastVisit}
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
                    }}>{access.patient}</td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      borderTop: '1px solid #e5e7eb'
                    }}>{access.purpose}</td>
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
                      <div style={{ fontWeight: '600', color: '#111827' }}>{c.purpose}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>patient: {c.patient_id}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>requester: {c.requester_id}</div>
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
