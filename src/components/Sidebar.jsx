import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Book, LogOut } from "lucide-react";
import { useUserContext } from "../context/UserContext";
import { useThemeContext } from "../context/ThemeContext";
import black_logo from "../assets/black_logo.png";
import white_logo from "../assets/white_logo.png";

const navLinks = {
  student: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
    { label: "Catalog", icon: BookOpen, to: "/student/catalog" },
    { label: "Books", icon: Book, to: "/student/books" },
  ],
  staff: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/staff/dashboard" },
    { label: "Catalog", icon: BookOpen, to: "/staff/catalog" },
    { label: "Books", icon: Book, to: "/staff/books" },
  ],
};

export default function Sidebar({ open, setSidebarOpen, role }) {
  const { user, logout } = useUserContext();
  const { theme } = useThemeContext();
  const navigate = useNavigate();

  if (!user) return null;

  const links = navLinks[role] || [];

  const handleLogout = () => {
    const userRole = user?.role || "student";
    logout();
    navigate(`/${userRole}/login`);
  };

  return (
    <aside
      className={`${
        open ? "w-64" : "w-0"
      } md:w-64 transition-all duration-300 bg-gray-100 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700 overflow-hidden min-h-[100dvh] flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-6 border-b border-gray-200 dark:border-zinc-700">
        <img
          src={theme === "dark" ? white_logo : black_logo}
          alt="BookWorm"
          className="w-10 h-10"
        />
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={() => {
              if (window.innerWidth < 768) setSidebarOpen(false); // ✅ auto close on small screens
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-zinc-800"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Sticky Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-black hover:bg-gray-200 cursor-pointer dark:text-white dark:hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
