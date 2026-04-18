import styles from "./style.module.css";

function Topbar({ onMenuClick }) {
  return (
    <div className={styles.topBar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        ☰
      </button>
      <div className={styles.brand}>Gestoon</div>
    </div>
  );
}

export default Topbar;