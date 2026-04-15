import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedFor = ["admin", "funcionario"], children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedFor.includes(user.tipo)) {
    return <Navigate to="/tarefas" replace />;
  }

  return children;
}
