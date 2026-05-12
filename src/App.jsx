
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Adm/Home";
import DashboardLayout from "./layouts";
import Funcionarios from "./pages/Adm/Funcionarios";
import Perfil from "./pages/Perfil";
import Relatorios from "./pages/Adm/Relatorios";
import Tarefas from "./pages/Funcionarios/Tarefas";
import Historico from "./pages/Funcionarios/Historico";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.tipo === "admin" ? "/home" : "/tarefas"} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        element={
          <ProtectedRoute allowedFor={["admin", "funcionario"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedFor={["admin"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/funcionarios"
          element={
            <ProtectedRoute allowedFor={["admin"]}>
              <Funcionarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute allowedFor={["admin", "funcionario"]}>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/relatorios"
          element={
            <ProtectedRoute allowedFor={["admin"]}>
              <Relatorios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tarefas"
          element={
            <ProtectedRoute allowedFor={["admin", "funcionario"]}>
              <Tarefas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historico"
          element={
            <ProtectedRoute allowedFor={["funcionario"]}>
              <Historico />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={user ? "/tarefas" : "/"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
