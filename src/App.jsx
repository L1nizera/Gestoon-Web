
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import DashboardLayout from "./layouts/DashboardLayout"

function App() {
  return (
    
      <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
        </Route>

      </Routes>

    </BrowserRouter>

  )
}

export default App
