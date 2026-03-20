import { Link } from "react-router-dom"

function Sidebar() {

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
          <Link to="/home" style={{ color: "white" }}>
            Home
          </Link>
        </li>

        <li>
          <Link to="/tarefas" style={{ color: "white"}}>
            Criar Tarefas
          </Link>
        </li>

      </ul>

    </div>
  )
}

export default Sidebar