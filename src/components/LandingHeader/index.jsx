import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import styles from "./style.module.css";

const menuItems = [
  { href: "/inicio", label: "Início" },
  { href: "#funcionalidades", label: "Funcionalidades" },
];

export default function LandingHeader() {
  const navigate = useNavigate();

  function handleAnchorClick(e, href) {
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    const header = document.querySelector('header');
    const offset = header ? header.offsetHeight + 8 : 64;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      window.location.hash = href;
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>Gestoon</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={styles.link}
                onClick={(e) => handleAnchorClick(e, item.href)}
              >
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
