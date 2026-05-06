import styles from "./style.module.css";

function PageActions({ left, center, right }) {
  return (
    <div className={styles.acoes}>
      <div className={styles.side}>{left}</div>

      {center && <div className={styles.center}>{center}</div>}

      <div className={styles.side}>{right}</div>
    </div>
  );
}

export default PageActions;