import PropTypes from "prop-types";
import styles from "./StatCard.module.css";

const colorMap = {
  primary: { bg: "var(--color-primary-faint)", color: "var(--color-primary)" },
  success: { bg: "var(--color-success-light)", color: "var(--color-success)" },
  warning: { bg: "var(--color-warning-light)", color: "var(--color-warning)" },
  danger: { bg: "var(--color-danger-light)", color: "var(--color-danger)" },
  accent: { bg: "var(--color-accent-light)", color: "var(--color-accent)" },
};

export default function StatCard({ icon, label, value, variant = "primary" }) {
  const colors = colorMap[variant] || colorMap.primary;

  return (
    <div className={styles.card}>
      <div
        className={styles.iconWrap}
        style={{ backgroundColor: colors.bg, color: colors.color }}
      >
        {icon}
      </div>
      <div>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.string,
};
