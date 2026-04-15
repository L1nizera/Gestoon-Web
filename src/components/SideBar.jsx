import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const actionButtonStyle = {
    display: "block",
    color: "white",
    background: "#334155",
    padding: "8px 10px",
    borderRadius: "5px",
    marginBottom: "8px",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    transition: "background 0.3s",
  };

  const menuItems = [
    { to: "/home", label: "Home", allowed: ["admin"] },
    { to: "/funcionarios", label: "Funcionários", allowed: ["admin"] },
    { to: "/tarefas", label: "Tarefas", allowed: ["funcionario"] },
    { to: "/perfil", label: "Meu Perfil", allowed: ["admin", "funcionario"] },
    { to: "/relatorios", label: "Relatórios", allowed: ["admin"] },
  ];

  if (!user) {
    return null;
  }

  const availableItems = menuItems.filter((item) => item.allowed.includes(user.tipo));

  return (
    <div
      style={{
        width: "220px",
        background: "#1e293b",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h2>Menu</h2>
        <p style={{ margin: 0, color: "#cbd5e1", fontSize: "1.25rem" }}>
          {user.nome} • {user.tipo === "admin" ? "Admin" : "Funcionário"}
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
        {availableItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
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
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        type="button"
        style={actionButtonStyle}
        onClick={() => {
          logout();
          navigate("/");
        }}
        onMouseEnter={(e) => (e.target.style.background = "#475569")}
        onMouseLeave={(e) => (e.target.style.background = "#334155")}
      >
        Sair
      </button>
    </div>
  );
}

export default Sidebar;