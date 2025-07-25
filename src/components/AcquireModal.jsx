import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUserContext } from "../context/UserContext";
import { X, BookOpen, Trash2 } from "lucide-react";
import { retryFetch } from "../utils/retryFetch";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router";

export default function AcquireModal({
  selectedBookIds = [],
  onClose,
  onBorrowSuccess,
  setSelectedBooks,
}) {
  const [books, setBooks] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, user, triggerUserRefetch } = useUserContext();

  // Fetch full book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const promises = selectedBookIds.map((id) =>
          retryFetch(`https://libarybackend.vercel.app/books/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          })
        );
        const responses = await Promise.all(promises);
        const bookData = await Promise.all(responses.map((res) => res.json()));
        setBooks(bookData);
      } catch (err) {
        if (err?.type === "AUTH_ERROR") {
          toast.error("Session expired. Please log in again.");
          navigate(`/${user?.role || "student"}/login`);
          return;
        }
        toast.error("Failed to load data.");
      }
    };

    if (selectedBookIds.length > 0) fetchBookDetails();
  }, [selectedBookIds, token]);

  const handleRemove = (id) => {
    setSelectedBooks((prev) => prev.filter((bookId) => bookId !== id));
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

const handleBorrow = async () => {
  if (!dueDate) {
    toast.error("Please select a due date.");
    return;
  }

  setLoading(true);
  try {
    // 1. Fetch user's borrow history
    const historyRes = await retryFetch(
      "https://libarybackend.vercel.app/users/me/borrow_history/",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const history = await historyRes.json();
    const borrowedBookIds = new Set(history.map((b) => b.book_id));

    // 2. Filter out duplicates
    const booksToBorrow = books.filter((book) => !borrowedBookIds.has(book.id));

    if (booksToBorrow.length === 0) {
      toast.error("You’ve already borrowed all selected books.");
      setLoading(false);
      return;
    }

    const borrowPromises = booksToBorrow.map((book) =>
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
          due_date: dueDate.toISOString().split("T")[0],
          returned_date: null,
        }),
      })
    );

    const results = await Promise.all(borrowPromises);

    const errors = [];
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          `Failed to borrow "${booksToBorrow[i].title}":`,
          errorText
        );
        errors.push(booksToBorrow[i].title);
      }
    }

    const successful = results.length - errors.length;
    const failed = errors.length;

    if (successful > 0 && failed === 0) {
      toast.success("All books borrowed successfully!");
    } else if (successful > 0 && failed > 0) {
      toast.success(`${successful} book(s) borrowed, ${failed} failed.`);
      toast.error(`Failed: ${errors.join(", ")}`);
    } else {
      toast.error("Failed to borrow any books.");
    }

    setSelectedBooks([]);
    triggerUserRefetch();
    onBorrowSuccess?.();
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to borrow books.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
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
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            dayClassName={(date) => {
              const now = new Date();
              const max = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              const isOutsideRange = date < now || date > max;
              return isOutsideRange ? "tooltip-day" : "";
            }}
            onCalendarOpen={() => {
              setTimeout(() => {
                document.querySelectorAll(".tooltip-day").forEach((el) => {
                  el.setAttribute(
                    "title",
                    "Date must be within 30 days from today"
                  );
                });
              }, 0);
            }}
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
