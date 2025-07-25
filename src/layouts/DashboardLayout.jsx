import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SettingsModal from "../components/SettingsModal";
import LayoutHeader from "../components/LayoutHeader";
import { useUserContext } from "../context/UserContext";
import AppLoader from "../components/AppLoader"; 

export default function DashboardLayout() {
  const { user, loading } = useUserContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      const pathname = window.location.pathname;
      const role = pathname.includes("staff") ? "staff" : "student";
      navigate(`/${role}/login`);
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <AppLoader message="Loading dashboard..." />; // ✅ use AppLoader here
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white transition-colors duration-500 font-montserrat">
      <Sidebar
        open={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        role={user.role}
      />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <LayoutHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setShowSettings(true)}
        />

        <main className="flex-1 scrollbar-thin dark:scrollbar-thumb-[#737373] scrollbar-track-transparent p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
