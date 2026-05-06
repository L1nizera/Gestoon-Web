import styles from "./style.module.css";

function InfoGrid({ children }) {
  return <div className={styles.modalGrid}>{children}</div>;
}

function InfoItem({ label, children }) {
  return (
    <div className={styles.infoItem}>
      <strong>{label}</strong>
      <div className={styles.infoValue}>{children}</div>
    </div>
  );
}

InfoGrid.Item = InfoItem;

export default InfoGrid;