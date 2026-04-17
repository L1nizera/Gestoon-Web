import { Outlet } from "react-router-dom"
import SideBar from "../components/Sidebar/SideBar.jsx"
import TopBar from "../components/TopBar"
import styles from "./style.module.css" 

function DashboardLayout() {
  return (
    <div className={styles.appLayout}>

      <SideBar />

      <div className={styles.mainArea}>
        <TopBar />
        
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default DashboardLayout