import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import styles from "./style.module.css";

const menuItems = [
  { href: "#inicio", label: "Início" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#sobre", label: "Sobre Nós" },
  
];

export default function LandingHeader() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>Gestoon</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={styles.link}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => navigate("/login")}>
          Fazer Login
        </Button>
      </div>
    </header>
  );
}
