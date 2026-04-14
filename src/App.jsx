
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login/index"
import Home from "./pages/Home"
import DashboardLayout from "./layouts/index"
import Funcionarios from "./pages/Funcionarios/index"
import Perfil from "./pages/perfil/index"
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
