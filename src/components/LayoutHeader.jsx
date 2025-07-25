import { useEffect, useState } from "react";
import { Menu, Settings } from "lucide-react";
import { useUserContext } from "../context/UserContext";
import { format } from "date-fns";

export default function LayoutHeader({ toggleSidebar, onOpenSettings }) {
  const { user, loading } = useUserContext(); // include loading
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>

        <div className="text-sm md:text-base">
          {!loading ? (
            <>
              <span className="font-semibold">{user?.full_name}</span> ·{" "}
              <span className="capitalize">{user?.role}</span>
            </>
          ) : (
            <span className="text-gray-400">Loading user...</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm hidden sm:inline">
          {format(dateTime, "EEEE, MMMM do yyyy — h:mm a")}
        </span>
        <button className="cursor-pointer" onClick={onOpenSettings}>
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
