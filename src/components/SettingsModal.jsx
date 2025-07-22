import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useUserContext } from "../context/UserContext";
import ThemeToggle from "./ThemeToggle";

export default function SettingsModal({ onClose }) {
  const { user, updateUser, token } = useUserContext();
  const [name, setName] = useState(user?.full_name || "");
  const [password, setPassword] = useState("");
  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`https://libarybackend.vercel.app/users/me/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: name,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      updateUser({ full_name: name });
      toast.success("Profile updated successfully!");
      setPassword("");
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl shadow-lg w-[90%] max-w-md p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Theme</label>
            <ThemeToggle />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-black text-white dark:bg-white dark:text-black rounded hover:opacity-90 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
