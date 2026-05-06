import styles from "./style.module.css";

function FilterPanel({ children }) {
  return <div className={styles.filtrosAvancados}>{children}</div>;
}

export default FilterPanel;