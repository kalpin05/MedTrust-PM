import PropTypes from "prop-types";
import styles from "./Badge.module.css";

const variantMap = {
  active: "success",
  approved: "success",
  granted: "success",
  Healthy: "success",
  Normal: "success",
  pending: "warning",
  Warning: "warning",
  Suspicious: "warning",
  revoked: "danger",
  rejected: "danger",
  Critical: "danger",
  Active: "danger",
  Resolved: "primary",
  default: "neutral",
};

export default function Badge({ children, variant, showDot = true, live = false }) {
  const resolvedVariant = variant || variantMap[children] || "neutral";

  return (
    <span className={`${styles.badge} ${styles[resolvedVariant] || styles.neutral} ${live ? styles.live : ""}`}>
      {showDot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  showDot: PropTypes.bool,
  live: PropTypes.bool,
};
