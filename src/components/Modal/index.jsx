import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./style.module.css";

function Modal({
  title,
  children,
  actions,
  onClose,
  variant = "default",
}) {
  const [isClosing, setIsClosing] = useState(false);

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

  function handleClose(afterClose) {
    setIsClosing(true);

    setTimeout(() => {
      onClose?.();

      if (typeof afterClose === "function") {
        afterClose();
      }
    }, 180);
  }

  return createPortal(
    <>
      <div
        className={`${styles.overlay} ${isClosing ? styles.overlayExit : ""}`}
        onClick={handleClose}
      ></div>

      <div
        className={`${styles.modal} ${isClosing ? styles.modalExit : ""}`}
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
            {typeof actions === "function" ? actions(handleClose) : actions}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

export default Modal;