import { NavLink } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!open);
  };

  const linkStyle = {
    display: "block",
    color: "white",
    background: "#334155",
    padding: "8px 10px",
    borderRadius: "5px",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "all 0.3s",
  };

  const activeStyle = {
    background: "#1c3968",
    fontWeight: "bold",
    borderLeft: "4px solid #38bdf8",
  };

  const btsair = {
    display: "block",
    color: "white",
    background: "#334155", // tom mais claro que o fundo
    padding: "8px 10px",
    borderRadius: "5px",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "background 0.3s",
  };

  return (
    <div
      style={{
        width: "220px",
        background: "#1e293b",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}
    >
      <h2>Menu</h2>

      <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
        <li>
          <NavLink
            to="/home"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
            onMouseEnter={(e) => (e.target.style.background = "#475569")}
            onMouseLeave={(e) => {
              if (!e.target.classList.contains("active")) {
                e.target.style.background = "#334155";
              }
            }}
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/funcionarios"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
            onMouseEnter={(e) => (e.target.style.background = "#475569")}
            onMouseLeave={(e) => {
              if (!e.target.classList.contains("active")) {
                e.target.style.background = "#334155";
              }
            }}
          >
            Funcionários
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/perfil"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
            onMouseEnter={(e) => (e.target.style.background = "#475569")}
            onMouseLeave={(e) => {
              if (!e.target.classList.contains("active")) {
                e.target.style.background = "#334155";
              }
            }}
          >
            Meu Perfil
          </NavLink>
        </li>

        <li>

          <NavLink
            to="/relatorios"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
            onMouseEnter={(e) => (e.target.style.background = "#475569")}
            onMouseLeave={(e) => {
              if (!e.target.classList.contains("active")) {
                e.target.style.background = "#334155";
              }
            }}
          >
            Relatórios
          </NavLink>
        </li>
      </ul>
      <NavLink
            to="/"
            style={btsair}
            onMouseEnter={(e) => (e.target.style.background = "#475569")}
            onMouseLeave={(e) => (e.target.style.background = "#334155")}
          >
            Sair
          </NavLink>
    </div>
  );
}

export default Sidebar;