import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import styles from "./PatientDashboard.module.css";

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

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};

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
        /* keep UI alive */
      }
    };
    fetchRequests();
    const id = setInterval(fetchRequests, 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const fetchConsents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/consent/patient/current", {
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
    if (!window.confirm("Are you sure you want to revoke this consent?")) return;
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const activeConsents = consents.filter(c => c.status === "active");
  const revokedConsents = consents.filter(c => c.status === "revoked");

  return (
    <div className={styles.page}>
      <Navbar user={user} onLogout={logout} />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>Welcome back, {user.name}</h1>
          <p className={styles.greetingSub}>
            Manage your healthcare data consents and access permissions
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard
            icon="✓"
            label="Active Consents"
            value={activeConsents.length}
            variant="success"
          />
          <StatCard
            icon="⏳"
            label="Pending Requests"
            value={pendingRequests.length}
            variant="warning"
          />
          <StatCard
            icon="⊘"
            label="Revoked"
            value={revokedConsents.length}
            variant="danger"
          />
        </div>

        {/* Access Requests - Live */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span className={styles.liveDot} />
              Access Requests
              <span className={styles.liveLabel}>Live</span>
            </div>
          </div>
          <div className={styles.sectionBody}>
            {pendingRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <p className={styles.emptyText}>No pending requests right now</p>
              </div>
            ) : (
              pendingRequests.map(r => (
                <div key={r.id} className={styles.requestItem}>
                  <div className={styles.requestInfo}>
                    <h4>{r.purpose}</h4>
                    <p>Staff ID: {r.staff_id}</p>
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      className={styles.btnApprove}
                      onClick={() => decideRequest(r.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className={styles.btnReject}
                      onClick={() => decideRequest(r.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consents */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Data Consents</div>
            <button
              className={styles.btnNew}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              + New Consent
            </button>
          </div>

          {showCreateForm && (
            <div className={styles.createForm}>
              <form onSubmit={createConsent}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>Requester ID</label>
                    <input
                      type="text"
                      required
                      placeholder="Hospital or Pharmacy ID"
                      value={newConsent.requesterId}
                      onChange={e => setNewConsent({ ...newConsent, requesterId: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Purpose</label>
                    <input
                      type="text"
                      required
                      placeholder="Treatment, Emergency..."
                      value={newConsent.purpose}
                      onChange={e => setNewConsent({ ...newConsent, purpose: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={newConsent.expiry}
                      onChange={e => setNewConsent({ ...newConsent, expiry: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" disabled={loading} className={styles.btnSubmit}>
                    {loading ? "Creating..." : "Create Consent"}
                  </button>
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div>
            {consents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📄</div>
                <p className={styles.emptyText}>
                  No consents found. Create your first consent to get started.
                </p>
              </div>
            ) : (
              consents.map(consent => (
                <div key={consent.id} className={styles.consentItem}>
                  <div className={styles.consentInfo}>
                    <div className={styles.consentIcon}>📋</div>
                    <div className={styles.consentDetails}>
                      <h4>
                        {consent.purpose}
                        <Badge>{consent.status}</Badge>
                      </h4>
                      <p>Requester: {consent.requester}</p>
                    </div>
                  </div>
                  {consent.status === "active" && (
                    <button
                      className={styles.btnRevoke}
                      onClick={() => revokeConsent(consent.id)}
                    >
                      Revoke Access
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
