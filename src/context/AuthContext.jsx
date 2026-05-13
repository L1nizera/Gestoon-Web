import { createContext, useContext, useState } from "react";

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

  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem("gestoon:user");
    localStorage.removeItem("gestoon:token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}