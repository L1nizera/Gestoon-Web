import styles from "./style.module.css";

function PageCard({ children }) {
  return <div className={styles.cardContainer}>{children}</div>;
}

export default PageCard;