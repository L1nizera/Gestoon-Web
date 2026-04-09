import "../styles/login.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  function handleLogin(e){
    e.preventDefault()

    // 🔹 Simulação de usuários
    if(email === "admin" && senha === "admin"){
      navigate("/home")
    } 
    else if(email === "user" && senha === "user"){
      navigate("/perfil")
    } 
    else {
      alert("Usuário ou senha inválidos")
    }
  }

  return (

    <div className="login-container">

      <h1 className="logo">Gestoon</h1>

      <form className="login-box" onSubmit={handleLogin}>

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

        <button type="submit">
          Entrar
        </button>

      </form>

    </div>

  )
}

export default Login