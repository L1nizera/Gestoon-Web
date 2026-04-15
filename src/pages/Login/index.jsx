import styles from "./style.module.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  if (user) {
    return <Navigate to={user.tipo === "admin" ? "/home" : "/tarefas"} replace />;
  }

  function handleLogin(e) {
    e.preventDefault();

    if (email === "admin" && senha === "admin") {
      login({ nome: "Administrador", tipo: "admin" });
      navigate("/home");
      return;
    }

    if (email === "user" && senha === "user") {
      login({ nome: "Funcionário", tipo: "funcionario" });
      navigate("/tarefas");
      return;
    }

    alert("Usuário ou senha inválidos");
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