import { createContext, useContext, useRef, useState } from "react";
import styles from "./style.module.css";

const ToastContext = createContext(null);

const TOAST_DURATION = {
  success: 3000,
  warning: 5000,
  error: 7000,
  info: 4000,
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  function showToast(message, type = "info") {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({
      message,
      type,
    });

    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, TOAST_DURATION[type] || TOAST_DURATION.info);
  }

  function closeToast() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast(null);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <span>{toast.message}</span>

          <button type="button" onClick={closeToast}>
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast precisa estar dentro de ToastProvider");
  }

  return context;
}