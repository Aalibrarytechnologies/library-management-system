import { useState } from "react";
import { useUserContext } from "../context/UserContext";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpdateBookModal({ book, onClose, onUpdateSuccess }) {
  const { token, logout, user } = useUserContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: book.title || "",
    author: book.author || "",
    isbn: book.isbn || "",
    genre: book.genre || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `https://libarybackend.vercel.app/books/${book.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        navigate(`/${user?.role || "student"}/login`);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to update book");
      }

      toast.success("Book updated successfully!");
      onUpdateSuccess?.(); 
      onClose(); 
    } catch (err) {
      toast.error(err.message || "Failed to update book");
      console.error("Update error:", err);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Update Book
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 cursor-pointer text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["title", "author", "isbn", "genre"].map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm mb-1 text-gray-700 dark:text-gray-300 capitalize"
              >
                {field}
              </label>
              <input
                type="text"
                name={field}
                id={field}
                required
                value={form[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-sm"
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 ${
                loading ? "cursor-not-allowed" : "cursor-pointer"
              } text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90`}
            >
              {loading ? "Updating..." : "Update Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
