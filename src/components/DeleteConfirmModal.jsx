// components/books/modals/DeleteConfirmModal.jsx
import { useState } from "react";
import { useUserContext } from "../context/UserContext";
import toast from "react-hot-toast";
import { X, Trash2 } from "lucide-react";

export default function DeleteConfirmModal({ bookId, onClose }) {
  const { token } = useUserContext();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://libarybackend.vercel.app/books/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete book");

      toast.success("Book deleted successfully!");
      onClose(true); // Pass true to indicate success
    } catch (err) {
      toast.error("Failed to delete book.");
      console.error(err);
      onClose(false); // Or false for failure (optional)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Confirm Deletion
          </h2>
          <button onClick={() => onClose(false)}>
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete this book? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
