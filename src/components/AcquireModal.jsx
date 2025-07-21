// components/books/modals/AcquireModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { useUserContext } from "../context/UserContext";
import { X, BookOpen, Trash2 } from "lucide-react";

export default function AcquireModal({
  selectedBooks = [],
  onClose,
  onBorrowSuccess,
}) {
  const { token, user } = useUserContext();
  const [books, setBooks] = useState(selectedBooks);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRemove = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleBorrow = async () => {
    if (!dueDate) {
      toast.error("Please select a due date.");
      return;
    }

    setLoading(true);
    try {
      const borrowPromises = books.map((book) =>
        fetch("https://libarybackend.vercel.app/borrow/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            book_id: book.id,
            user_id: user.id,
            due_date: dueDate,
            returned_date: null,
          }),
        })
      );

      const results = await Promise.all(borrowPromises);

      const allSuccessful = results.every((res) => res.ok);
      if (allSuccessful) {
        toast.success("Books borrowed successfully!");
        onBorrowSuccess?.();
        onClose();
      } else {
        toast.error("Some books could not be borrowed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to borrow books.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Confirm Book Borrow
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Due Date:
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>

        {books.length === 0 ? (
          <div className="text-sm italic text-gray-500 dark:text-gray-400">
            No books selected.
          </div>
        ) : (
          <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-zinc-800"
              >
                <div className="text-sm text-black dark:text-white">
                  <div className="font-medium">{book.title}</div>
                  <div className="text-xs opacity-80">
                    {book.author} – {book.genre} – ISBN: {book.isbn}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(book.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleBorrow}
            disabled={loading || books.length === 0}
            className="px-4 py-2 text-sm rounded-lg bg-black dark:bg-white dark:text-black text-white flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            {loading ? "Borrowing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
