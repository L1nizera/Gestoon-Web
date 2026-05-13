import styles from "./style.module.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  if (user) {
    return <Navigate to={user.tipo === "admin" ? "/home" : "/tarefas"} replace />;
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      alert("Preencha usuário e senha.");
      return;
    }

    try {
      const response = await api.post("/login", {
        login: email,
        senha,
      });

      const { usuario, token } = response.data.dados;

      login(usuario, token);

      if (usuario.tipo === "admin") {
        navigate("/home");
      } else {
        navigate("/tarefas");
      }
    } catch (err) {
      console.error("Erro no login:", err.response?.data || err.message);

      alert(
        err.response?.data?.mensagem ||
        "Usuário ou senha inválidos."
      );
    }
  }

  return (
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

        <button type="submit" className={styles.button}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;