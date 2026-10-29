import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import "./AppLayout.css";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // On smaller screens default to collapsed
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        setCollapsed(true);
      }
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className={`app-layout ${collapsed ? "app-layout--collapsed" : ""}`}>
      <TopNavbar onMenuToggle={toggleSidebar} sidebarOpen={!collapsed} />
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <main className="app-main">
        <div className="app-main__content">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default AppLayout;

