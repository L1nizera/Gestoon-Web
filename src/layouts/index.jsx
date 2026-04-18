import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/Sidebar/SideBar.jsx";
import TopBar from "../components/TopBar/TopBar.jsx";
import styles from "./style.module.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => setSidebarOpen((prev) => !prev);
  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <div className={styles.appLayout}>
      <SideBar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {sidebarOpen && (
        <div className={styles.mobileOverlay} onClick={handleCloseSidebar} />
      )}

      <div className={styles.mainArea}>
        <TopBar onMenuClick={handleMenuToggle} />

        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;