import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./style.module.css";

function Modal({
  title,
  children,
  actions,
  onClose,
  variant = "default",
}) {
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  return createPortal(
    <>
      <div className={styles.overlay} onClick={onClose}></div>

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <h2>{title}</h2>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {actions && (
          <div className={`${styles.actions} ${styles[variant]}`}>
            {actions}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

export default Modal;