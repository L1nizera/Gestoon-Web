import styles from "./style.module.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import PageTransition from "../../components/ui/PageTransition/index.jsx";


function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const messageTimer = useRef(null);

  const showMessage = (text, type) => {
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }

    setMessage(text);
    setMessageType(type);

    messageTimer.current = setTimeout(() => {
      setMessage("");
      setMessageType("");
      messageTimer.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, []);

  if (user) {
    return (
      <Navigate to={user.tipo === "admin" ? "/home" : "/tarefas"} replace />
    );
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      showMessage("Preencha usuário e senha", "error");
      return;
    }

    try {
      const response = await api.post("/login", {
        login: email,
        senha,
      });

      const { usuario, token } = response.data.dados;

      showMessage("Login realizado com sucesso", "success");

      setTimeout(() => {
        login(usuario, token);
        if (usuario.tipo === "admin") {
          navigate("/home");
        } else {
          navigate("/tarefas");
        }
      }, 500);
    } catch (err) {
      console.error("Erro no login:", err.response?.data || err.message);

      showMessage(
        err.response?.data?.mensagem || "Usuário ou senha inválidos.",
        "error",
      );
    }
  }

  return (
    <PageTransition>
      <div className={styles.loginContainer}>
        <h1 className={styles.logo}>Gestoon</h1>

        <form className={styles.loginBox} onSubmit={handleLogin}>
          <h2>Login</h2>

          <input
            placeholder="Email / Usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {message && (
            <p className={`${styles.message} ${styles[messageType]}`}>
              {message}
            </p>
          )}

          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>
      </div>
    </PageTransition>
  );
}

export default Login;
