import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./style.module.css";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { to: "/home", label: "Home", allowed: ["admin"] },
    { to: "/funcionarios", label: "Funcionários", allowed: ["admin"] },
    { to: "/tarefas", label: "Tarefas", allowed: ["funcionario"] },
    { to: "/perfil", label: "Meu Perfil", allowed: ["admin", "funcionario"] },
    { to: "/relatorios", label: "Relatórios", allowed: ["admin"] },
  ];

  if (!user) return null;

  const availableItems = menuItems.filter((item) =>
    item.allowed.includes(user.tipo)
  );

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>Menu</h2>
        <p>
          {user.nome} • {user.tipo === "admin" ? "Admin" : "Funcionário"}
        </p>
      </div>

      <ul className={styles.menu}>
        {availableItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        className={styles.logoutBtn}
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Sair
      </button>
    </div>
  );
}

export default Sidebar;