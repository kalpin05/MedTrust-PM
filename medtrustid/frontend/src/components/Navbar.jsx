import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar({ user, onLogout, actions }) {
  const nav = useNavigate();
  const location = useLocation();

  const links = user?.role === "staff"
    ? [
      { label: "Dashboard", path: "/staff" },
      { label: "Security Monitor", path: "/security/dashboard" },
      { label: "Security Lab", path: "/security-lab" },
    ]
    : [
      { label: "Dashboard", path: "/patient" },
    ];

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>M</div>
          <span className={styles.brandName}>MedTrustID</span>
        </div>

        <div className={styles.navLinks}>
          {links.map(link => (
            <button
              key={link.path}
              className={`${styles.navLink} ${location.pathname === link.path ? styles.navLinkActive : ""}`}
              onClick={() => nav(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {actions}
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{initials}</div>
            <span className={styles.userName}>{user?.name || "User"}</span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
    name: PropTypes.string,
  }),
  onLogout: PropTypes.func,
  actions: PropTypes.node,
};
