
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import DashboardLayout from "./layouts/DashboardLayout"
import Funcionarios from "./pages/Funcionarios"
import Perfil from "./pages/Perfil"
import Relatorios from "./pages/Relatorios"

function App() {
  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Route>

      </Routes>

    </BrowserRouter>

  )
}

export default App
