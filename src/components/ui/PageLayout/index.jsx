import styles from "./style.module.css";

function PageLayout({ children }) {
  return <div className={styles.dashboard}>{children}</div>;
}

export default PageLayout;