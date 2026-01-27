import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const nav = useNavigate();
  const [consents, setConsents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newConsent, setNewConsent] = useState({
    requesterId: "",
    purpose: "",
    expiry: ""
  });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchConsents();
  }, []);

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

  const fetchConsents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/consent/patient/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsents(res.data.consents || []);
    } catch (err) {
      console.error(err);
    }
  };

  const decideRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/access-requests/${requestId}/decision`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  const createConsent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post("/consent/create", newConsent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConsents();
      setNewConsent({ requesterId: "", purpose: "", expiry: "" });
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const revokeConsent = async (consentId) => {
    if (!confirm("Are you sure you want to revoke this consent?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await api.put(`/consent/${consentId}/revoke`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConsents();
    } catch (err) {
      console.error(err);
    }
  };

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
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
            Welcome back, {user.name}
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
            Manage your healthcare data consents and access permissions
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
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Access Requests (Live)</h2>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>updates every second</div>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <div style={{ color: '#6b7280' }}>No pending requests.</div>
            ) : (
              requests
                .filter(r => r.status === 'pending')
                .map((r) => (
                  <div key={r.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{r.purpose}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>staff: {r.staff_id}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => decideRequest(r.id, 'approved')}
                          style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => decideRequest(r.id, 'rejected')}
                          style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
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
              backgroundColor: '#dcfce7',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginRight: '1rem'
            }}>
              <div style={{ width: '1.5rem', height: '1.5rem', backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Consents</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
                {consents.filter(c => c.status === 'active').length}
              </p>
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
              backgroundColor: '#dbeafe',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginRight: '1rem'
            }}>
              <div style={{ width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%' }}></div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Requests</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>0</p>
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
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Emergency Revokes</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
                {consents.filter(c => c.status === 'revoked').length}
              </p>
            </div>
          </div>
        </div>

        {/* Consents Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Data Consents</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              + New Consent
            </button>
          </div>

          {showCreateForm && (
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <form onSubmit={createConsent}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Requester ID
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                    placeholder="Hospital or Pharmacy ID"
                    value={newConsent.requesterId}
                    onChange={(e) => setNewConsent({...newConsent, requesterId: e.target.value})}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Purpose
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                    placeholder="Treatment, Emergency, etc."
                    value={newConsent.purpose}
                    onChange={(e) => setNewConsent({...newConsent, purpose: e.target.value})}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                    value={newConsent.expiry}
                    onChange={(e) => setNewConsent({...newConsent, expiry: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="submit"
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
                    {loading ? "Creating..." : "Create Consent"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      backgroundColor: '#d1d5db',
                      color: '#374151',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div>
            {consents.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
                No consents found. Create your first consent to get started.
              </div>
            ) : (
              consents.map(consent => (
                <div key={consent.id} style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                        {consent.purpose}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: consent.status === 'active' ? '#dcfce7' : 
                                       consent.status === 'revoked' ? '#fee2e2' : '#f3f4f6',
                        color: consent.status === 'active' ? '#16a34a' : 
                               consent.status === 'revoked' ? '#dc2626' : '#6b7280'
                      }}>
                        {consent.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Requester: {consent.requester}
                    </p>
                  </div>
                  {consent.status === 'active' && (
                    <button
                      onClick={() => revokeConsent(consent.id)}
                      style={{
                        marginLeft: '1rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                    >
                      Emergency Revoke
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
