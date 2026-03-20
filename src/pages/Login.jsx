import "../styles/login.css"
import { useNavigate } from "react-router-dom"

function Login() {

  const navigate = useNavigate()

  function handleLogin(e){
    e.preventDefault()

    navigate("/home")
  }

  return (

    <div className="login-container">

      <h1 className="logo">Gestoon</h1>

      <form className="login-box" onSubmit={handleLogin}>

        <h2>Login</h2>

        <input placeholder="Email / Usuário" />

        <input type="password" placeholder="Senha"/>

        <button type="submit">
          Entrar
        </button>

      </form>

    </div>

  )
}

export default Login