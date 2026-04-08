import { Link } from "react-router-dom"
import { useState } from "react"

function Sidebar() {

  const [open, setOpen] = useState(false)

  const toggleMenu = () => {
    setOpen(!open)
  }

  const linkStyle = {
    display: "block",
    color: "white",
    background: "#334155", // tom mais claro que o fundo
    padding: "8px 10px",
    borderRadius: "5px",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "background 0.3s"
  }

  const subLinkStyle = {
    display: "block",
    color: "white",
    background: "#475569",
    padding: "6px 10px",
    borderRadius: "5px",
    marginBottom: "6px",
    textDecoration: "none",
    transition: "background 0.3s"
  }

  return (
    <div style={{
      width: "220px",
      background: "#1e293b",
      color: "white",
      padding: "20px"
    }}>

      <h2>Menu</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>

        <li>
          <Link 
            to="/home" 
            style={linkStyle}
            onMouseEnter={(e) => e.target.style.background = "#475569"}
            onMouseLeave={(e) => e.target.style.background = "#334155"}
          >
            Home
          </Link>
        </li>

        <li>
          <span
            onClick={toggleMenu}
            style={{
              ...linkStyle,
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.target.style.background = "#475569"}
            onMouseLeave={(e) => e.target.style.background = "#334155"}
          >
            {open ? "Cadastrar🔼" : "Cadastrar🔽"}
          </span>

          <ul
            style={{
              marginTop: "5px",
              listStyle: "none",
              overflow: "hidden",
              maxHeight: open ? "200px" : "0px",
              opacity: open ? 1 : 0,
              transition: "all 0.3s ease",
              paddingLeft: "10px"
            }}
          >
            <li>
              <Link 
                to="/cadastrar/funcionario" 
                style={subLinkStyle}
                onClick={() => setOpen(false)}
                onMouseEnter={(e) => e.target.style.background = "#64748b"}
                onMouseLeave={(e) => e.target.style.background = "#475569"}
              >
                Funcionários
              </Link>
            </li>
            <li>
              <Link 
                to="/cadastrar/tarefa" 
                style={subLinkStyle}
                onClick={() => setOpen(false)}
                onMouseEnter={(e) => e.target.style.background = "#64748b"}
                onMouseLeave={(e) => e.target.style.background = "#475569"}
              >
                Tarefas
              </Link>
            </li>
            <li>
              <Link 
                to="/cadastrar/usuario" 
                style={subLinkStyle}
                onClick={() => setOpen(false)}
                onMouseEnter={(e) => e.target.style.background = "#64748b"}
                onMouseLeave={(e) => e.target.style.background = "#475569"}
              >
                Usuários
              </Link>
            </li>
          </ul>
        </li>

        <li>
          <Link 
            to="/perfil" 
            style={linkStyle}
            onMouseEnter={(e) => e.target.style.background = "#475569"}
            onMouseLeave={(e) => e.target.style.background = "#334155"}
          >
            Meu Perfil
          </Link>
        </li>



        <li>
          <Link 
            to="/relatorio" 
            style={linkStyle}
            onMouseEnter={(e) => e.target.style.background = "#475569"}
            onMouseLeave={(e) => e.target.style.background = "#334155"}
          >
            Relatórios
          </Link>
        </li>

      </ul>

    </div>
  )
}

export default Sidebar