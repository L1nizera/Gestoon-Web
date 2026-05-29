import styles from "./style.module.css";

function PageTransition({ children }) {
  return <div className={styles.pageTransition}>{children}</div>;
}

export default PageTransition;