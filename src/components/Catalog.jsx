import { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { Search, FileText as ReceiptIcon } from "lucide-react";
import toast from "react-hot-toast";
import { retryFetch } from "../utils/retryFetch";
import ReceiptModal from "../components/ReceiptModal";
import ConfirmationModal from "../components/ConfirmationModal";
import DatePicker from "react-datepicker";
import { useLocation } from "react-router-dom";

export default function Catalog() {
  const { token, user } = useUserContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "borrowed";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [allBooksMap, setAllBooksMap] = useState({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptBook, setReceiptBook] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [renewDate, setRenewDate] = useState(new Date());
  const [renewingBookId, setRenewingBookId] = useState(null);
  const [renewDueLimit, setRenewDueLimit] = useState(null);

  const isStaff = user?.role === "staff";

  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksRes = await retryFetch(
          `https://libarybackend.vercel.app/books/?skip=0&limit=10000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const books = await booksRes.json();
        const map = {};
        books.forEach((b) => (map[b.id] = b));
        setAllBooksMap(map);

        if (isStaff) {
          const allRes = await retryFetch(
            `https://libarybackend.vercel.app/borrowed_books/all/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const all = await allRes.json();
          setBorrowedBooks(all.filter((b) => !b.returned_date));
          setReturnedBooks(all.filter((b) => b.returned_date));
        } else {
          const [borrowedRes, returnedRes] = await Promise.all([
            retryFetch(
              `https://libarybackend.vercel.app/users/me/borrowed_books/`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            retryFetch(
              `https://libarybackend.vercel.app/users/me/borrow_history/`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
          ]);
          setBorrowedBooks(await borrowedRes.json());
          setReturnedBooks(
            (await returnedRes.json()).filter((b) => b.returned_date)
          );
        }
      } catch {
        toast.error("Error loading your catalog.");
      }
    };

    if (user && token) fetchData();
  }, [user, token]);

  const filteredBooks = (
    activeTab === "borrowed" ? borrowedBooks : returnedBooks
  ).filter((entry) => {
    const book = allBooksMap[entry.book_id];
    const lower = debouncedSearch.toLowerCase();
    return (
      entry.book_id.toString().includes(lower) ||
      entry.user_id?.toString().includes(lower) ||
      book?.title?.toLowerCase().includes(lower) ||
      book?.author?.toLowerCase().includes(lower)
    );
  });

  const handleShowReceipt = async (bookId) => {
    try {
      const res = await retryFetch(
        `https://libarybackend.vercel.app/books/${bookId}`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      setReceiptBook(data);
      setShowReceipt(true);
    } catch {
      toast.error("Unable to fetch book details.");
    }
  };

  const handleReturn = async (borrowId) => {
    setConfirmLoading(true);
    try {
      await retryFetch(
        `https://libarybackend.vercel.app/borrow/${borrowId}/return`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Book returned!");
      setBorrowedBooks((prev) => prev.filter((b) => b.id !== borrowId));
      setShowConfirm(false);
    } catch {
      toast.error("Failed to return book.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRebook = async (book) => {
    setConfirmLoading(true);
    try {
      await retryFetch(`https://libarybackend.vercel.app/borrow/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: book.book_id,
          user_id: book.user_id,
          due_date: new Date().toISOString().split("T")[0],
        }),
      });
      toast.success("Book borrowed again!");
      setShowConfirm(false);
    } catch {
      toast.error("Rebook failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRenew = async () => {
    setConfirmLoading(true);

    if (renewDate > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      toast.error("Renewal exceeds 30-day limit.");
      setConfirmLoading(false);
      return;
    }

    const formattedDate = renewDate
      .toLocaleDateString("en-GB")
      .split("/")
      .join("%2F");

    try {
      await retryFetch(
        `https://libarybackend.vercel.app/borrow/${renewingBookId}/renew?new_due_date=${formattedDate}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Book renewed successfully.");
      setShowConfirm(false);
    } catch {
      toast.error("Failed to renew book.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const isOverdue = (dueDateStr) => {
    const dueDate = new Date(dueDateStr);
    return new Date() > dueDate;
  };

  return (
    <div className="px-4 py-6 sm:px-8">
      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("borrowed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "borrowed"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-200 dark:bg-zinc-700 text-black dark:text-white"
            }`}
          >
            Borrowed Books
          </button>
          <button
            onClick={() => setActiveTab(isStaff ? "overdue" : "returned")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === (isStaff ? "overdue" : "returned")
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-200 dark:bg-zinc-700 text-black dark:text-white"
            }`}
          >
            {isStaff ? "Overdue Books" : "Returned Books"}
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-900 dark:border-zinc-600 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-zinc-700">
              <th className="px-4 py-3">Book ID</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Returned Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr
                key={book.id}
                className="border-b border-gray-200 dark:border-zinc-700 text-sm"
              >
                <td className="px-4 py-3">{book.book_id}</td>
                <td className="px-4 py-3">{book.user_id}</td>
                <td className="px-4 py-3">{book.due_date}</td>
                <td className="px-4 py-3">{book.returned_date || "--"}</td>
                <td className="px-4 py-3">
                  {!isOverdue(book.due_date) ? (
                    <button
                      className="text-purple-600 hover:underline"
                      onClick={() => {
                        setConfirmTitle("Renew Book");
                        setRenewDate(new Date());
                        setRenewingBookId(book.id);
                        setRenewDueLimit(new Date(book.due_date));
                        setConfirmAction(() => handleRenew);
                        setShowConfirm(true);
                      }}
                    >
                      Renew
                    </button>
                  ) : (
                    <span className="text-red-500 italic">Overdue</span>
                  )}

                  {activeTab === "borrowed" ? (
                    <button
                      className="ml-4 text-blue-600 hover:underline"
                      onClick={() => {
                        setConfirmTitle("Return Book");
                        setConfirmMessage(
                          "Are you sure you want to return this book?"
                        );
                        setConfirmAction(() => () => handleReturn(book.id));
                        setShowConfirm(true);
                      }}
                    >
                      Return
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => {
                          setConfirmTitle("Rebook Book");
                          setConfirmMessage(
                            "Do you want to borrow this book again?"
                          );
                          setConfirmAction(() => () => handleRebook(book));
                          setShowConfirm(true);
                        }}
                      >
                        Rebook
                      </button>
                      <button onClick={() => handleShowReceipt(book.book_id)}>
                        <ReceiptIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showReceipt && (
        <ReceiptModal
          book={receiptBook}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {showConfirm && (
        <ConfirmationModal
          title={confirmTitle}
          onCancel={() => setShowConfirm(false)}
          loading={confirmLoading}
          onConfirm={confirmAction}
        >
          {renewingBookId && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Select a new due date (within 30 days)
              </p>
              <DatePicker
                selected={renewDate}
                onChange={(date) => setRenewDate(date)}
                minDate={new Date()}
                maxDate={
                  renewDueLimit
                    ? new Date(
                        Math.min(
                          new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
                          new Date(renewDueLimit).getTime()
                        )
                      )
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-black dark:text-white"
              />
            </div>
          )}
        </ConfirmationModal>
      )}
    </div>
  );
}
