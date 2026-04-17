import styles from "./style.module.css";

function Modal({
  title,
  children,
  actions,
  onClose,
  variant = "default", // default | center | between
}) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>

      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h2>{title}</h2>
          </div>
        )}

        <div className={styles.body}>
          {children}
        </div>

        {actions && (
          <div className={`${styles.actions} ${styles[variant]}`}>
            {actions}
          </div>
        )}
      </div>
    </>
  );
}

export default Modal;