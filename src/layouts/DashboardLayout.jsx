import { Outlet } from "react-router-dom"
import SideBar from "../components/SideBar"
import TopBar from "../components/TopBar"
import "../styles/layout.css"

function DashboardLayout() {
  return (
    <div className="app-layout">

      <SideBar />

      <div className="main-area">
        <TopBar />
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default DashboardLayout