import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TEMPO_INATIVIDADE =  5000;

export default function AutoLogout() {

  const { user, logout } = useAuth();

  // 👇 ADICIONE AQUI
  if (!user) return null;

  const navigate = useNavigate();

  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      logout();

      navigate("/", { replace: true });
    }, TEMPO_INATIVIDADE);
  };

  useEffect(() => {
    const eventos = [
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress",
    ];

    eventos.forEach((evento) => {
      window.addEventListener(evento, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      eventos.forEach((evento) => {
        window.removeEventListener(evento, resetTimer);
      });
    };
  }, []);

  return null;
}