import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("gestoon:user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("gestoon:token");
  });

  function login(usuario, tokenRecebido) {
    setUser(usuario);
    setToken(tokenRecebido);

    localStorage.setItem("gestoon:user", JSON.stringify(usuario));
    localStorage.setItem("gestoon:token", tokenRecebido);
  }

  function updateUser(updatedUser) {
    setUser((currentUser) => {
      const nextUser = { ...(currentUser || {}), ...updatedUser };
      localStorage.setItem("gestoon:user", JSON.stringify(nextUser));
      return nextUser;
    });
  }

  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem("gestoon:user");
    localStorage.removeItem("gestoon:token");
  }

  useEffect(() => {
    console.log("USER:", user);
    if (!user || !token) return;

    const verificarSessao = async () => {
      try {
        await api.get("/auth/verificar-sessao");
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);

        // só desloga se realmente não tiver autorização
        if (err.response?.status === 401) {
          logout();
          window.location.href = "/";
        }
      }
    };

    verificarSessao();

    const interval = setInterval(verificarSessao, 60000);

    return () => clearInterval(interval);
  }, [user, token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}