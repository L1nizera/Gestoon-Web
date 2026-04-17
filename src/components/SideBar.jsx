import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setOpen(false);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user) return null;

  const menuItems = [
    { to: "/home", label: "Home", allowed: ["admin"] },
    { to: "/funcionarios", label: "Funcionários", allowed: ["admin"] },
    { to: "/tarefas", label: "Tarefas", allowed: ["funcionario"] },
    { to: "/perfil", label: "Meu Perfil", allowed: ["admin", "funcionario"] },
    { to: "/relatorios", label: "Relatórios", allowed: ["admin"] },
  ];

  const availableItems = menuItems.filter((item) =>
    item.allowed.includes(user.tipo)
  );

  const linkStyle = {
    display: "block",
    color: "white",
    background: "#334155",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "all 0.25s ease",
  };

  const activeStyle = {
    background: "#1c3968",
    fontWeight: "bold",
    borderLeft: "4px solid #38bdf8",
  };

  return (
    <>
      {/* 🔥 TOPBAR MOBILE */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "60px",
            background: "#1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 15px",
            color: "white",
            zIndex: 1100,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          {/* BOTÃO */}
          <div
            onClick={() => setOpen(!open)}
            style={{
              width: "30px",
              height: "22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                height: "3px",
                background: "white",
                borderRadius: "2px",
                transition: "0.3s",
                transform: open ? "rotate(45deg) translateY(9px)" : "none",
              }}
            />
            <span
              style={{
                height: "3px",
                background: "white",
                borderRadius: "2px",
                opacity: open ? 0 : 1,
                transition: "0.3s",
              }}
            />
            <span
              style={{
                height: "3px",
                background: "white",
                borderRadius: "2px",
                transition: "0.3s",
                transform: open ? "rotate(-45deg) translateY(-9px)" : "none",
              }}
            />
          </div>

          {/* 🔥 NOME DO SISTEMA */}
          <div style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginLeft: "0px",
            display: "flex",
            width: "100%",
            marginLeft: "15px",
          }}>
            Gestoon
          </div>

          {/* 👤 USUÁRIO */}
          <span style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
            {user.nome}
          </span>
        </div >
      )
      }

      {/* 🔥 OVERLAY COM FADE */}
      {
        isMobile && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.4)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.3s ease",
              zIndex: 999,
            }}
          />
        )
      }

      {/* 🔥 SIDEBAR */}
      <div
        style={{
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? "60px" : 0,
          left: isMobile ? (open ? "0" : "-260px") : "0",
          width: "220px",
          height: isMobile ? "calc(100vh - 60px)" : "100vh",
          background: "#1e293b",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          transition: "left 0.35s cubic-bezier(0.77, 0, 0.18, 1)",
          zIndex: 1000,
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <h2>Menu</h2>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "1.2rem" }}>
            {user.tipo === "admin" ? "Admin" : "Funcionário"}
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
                onClick={() => isMobile && setOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          style={{
            background: "#334155",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </>
  );
}

export default Sidebar;