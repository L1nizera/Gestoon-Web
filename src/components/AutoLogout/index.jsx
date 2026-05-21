import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const TEMPO_TOTAL = 5 * 60 * 1000;
const TEMPO_AVISO = 4 * 60 * 1000;
const CHAVE_ATIVIDADE = "gestoon:ultimaAtividade";

export default function AutoLogout() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const deslogarUsuario = () => {
    logout();

    navigate("/", { replace: true });
  };

  const atualizarUltimaAtividade = () => {
    localStorage.setItem(
      CHAVE_ATIVIDADE,
      Date.now().toString()
    );
  };

  const iniciarCountdown = () => {
    const segundosRestantes =
      (TEMPO_TOTAL - TEMPO_AVISO) / 1000;

    setCountdown(segundosRestantes);

    clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    if (mostrarModal) {
      setMostrarModal(false);
      clearInterval(countdownIntervalRef.current);
    }

    atualizarUltimaAtividade();

    clearTimeout(logoutTimerRef.current);
    clearTimeout(warningTimerRef.current);

    // aviso
    warningTimerRef.current = setTimeout(() => {
      setMostrarModal(true);

      iniciarCountdown();
    }, TEMPO_AVISO);

    // logout final
    logoutTimerRef.current = setTimeout(() => {
      const ultimaAtividade = localStorage.getItem(CHAVE_ATIVIDADE);
      const agora = Date.now();
      const tempoInativo = agora - Number(ultimaAtividade);

      // só desloga se TODAS as abas estiverem inativas
      if (tempoInativo >= TEMPO_TOTAL) {
        deslogarUsuario();
      } else {
        // reinicia timer porque outra aba teve atividade
        resetTimer();
      }
    }, TEMPO_TOTAL);
  };

  const continuarConectado = () => {
    setMostrarModal(false);

    clearInterval(countdownIntervalRef.current);

    resetTimer();
  };

  useEffect(() => {
    if (!user) return;

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

    // sincronização entre abas
    const sincronizarAbas = (event) => {
      if (event.key === "gestoon:token" && !event.newValue) {
        logout();

        navigate("/", { replace: true });
        return;
      }

      if (event.key === CHAVE_ATIVIDADE && event.newValue) {
        resetTimer();
      }
    };

    window.addEventListener("storage", sincronizarAbas);

    resetTimer();

    return () => {
      clearTimeout(logoutTimerRef.current);
      clearTimeout(warningTimerRef.current);
      clearInterval(countdownIntervalRef.current);

      eventos.forEach((evento) => {
        window.removeEventListener(evento, resetTimer);
      });

      window.removeEventListener("storage", sincronizarAbas);
    };
  }, [user]);

  return (
    <>
      {mostrarModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <FiAlertTriangle size={55} color="#f59e0b" />

            <h2 style={titleStyle}>
              Sessão expirando
            </h2>

            <p style={textStyle}>
              Você será desconectado por inatividade.
            </p>

            <div style={countdownStyle}>
              {countdown}s
            </div>

            <button
              onClick={continuarConectado}
              style={buttonStyle}
            >
              Continuar conectado
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  backdropFilter: "blur(3px)",
};

const modalStyle = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "20px",
  width: "90%",
  maxWidth: "420px",
  textAlign: "center",
  boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
};

const titleStyle = {
  marginTop: "1rem",
  fontSize: "1.5rem",
  fontWeight: "700",
};

const textStyle = {
  marginTop: "0.8rem",
  color: "#555",
  lineHeight: "1.5",
};

const countdownStyle = {
  marginTop: "1.5rem",
  fontSize: "2.5rem",
  fontWeight: "bold",
  color: "#dc2626",
};

const buttonStyle = {
  marginTop: "1.8rem",
  width: "100%",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "14px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
};