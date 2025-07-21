import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SettingsModal from "../components/SettingsModal";
import LayoutHeader from "../components/LayoutHeader";
import { useUserContext } from "../context/UserContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout() {
  const { user, loading } = useUserContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect to login if not authenticated and finished loading
  useEffect(() => {
    if (!loading && !user) {
      const pathname = window.location.pathname;
      const role = pathname.includes("staff") ? "staff" : "student";
      navigate(`/${role}/login`);
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin w-6 h-6 mb-2" />
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null; // avoid rendering layout before redirect

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white transition-colors duration-500 font-montserrat">
      <Sidebar open={sidebarOpen} role={user.role} />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <LayoutHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setShowSettings(true)}
        />

        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
