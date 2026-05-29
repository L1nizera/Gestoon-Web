import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import styles from "./style.module.css";

function Sidebar({ isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const { clearToast } = useToast();
  const navigate = useNavigate();

  const menuItems = [
    { to: "/home", label: "Home", allowed: ["admin"] },
    { to: "/funcionarios", label: "Funcionários", allowed: ["admin"] },
    { to: "/tarefas", label: "Tarefas", allowed: ["funcionario"] },
    { to: "/minhastarefas", label: "Minhas Tarefas", allowed: ["funcionario"] },
    { to: "/perfil", label: "Meu Perfil", allowed: ["admin", "funcionario"] },
    { to: "/relatorios", label: "Relatórios", allowed: ["admin"] },
  ];

  if (!user) return null;

  const availableItems = menuItems.filter((item) =>
    item.allowed.includes(user.tipo),
  );

  function handleLogout() {
    clearToast();

    logout();

    if (onClose) {
      onClose();
    }

    navigate("/");
  }

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <div className={styles.title}>Gestoon</div>
      <hr className={styles.separator} />
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2>Menu</h2>
        </div>
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

      <button className={styles.logoutBtn} 
      onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}

export default Sidebar;
