import { useEffect, useState } from "react";
import {
  Plus,
  ShoppingCart,
  Pencil,
  Trash,
  Filter,
  Search,
} from "lucide-react";
import { useUserContext } from "../context/UserContext";
import { retryFetch } from "../utils/retryFetch";
import toast from "react-hot-toast";
import { lazy, Suspense } from "react";
import AppLoader from "../components/AppLoader";

const AddBookModal = lazy(() => import("../components/AddBookModal"));
const UpdateBookModal = lazy(() => import("../components/UpdateBookModal"));
const AcquireModal = lazy(() => import("../components/AcquireModal"));
const DeleteConfirmModal = lazy(() =>
  import("../components/DeleteConfirmModal")
);
import { useBooksContext } from "../context/BooksContext";
import { useNavigate } from "react-router";

export default function Books() {
  const { user, token } = useUserContext();
  const isStaff = user?.role === "staff";

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { selectedBooks, setSelectedBooks } = useBooksContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAcquireModal, setShowAcquireModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);
  const [activeTab, setActiveTab] = useState("manage");

  const totalPages = Math.ceil(totalBooks / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBooks = async () => {
    try {
      setLoading(true); // ✅ start loading

      const pageRes = await retryFetch(
        `https://libarybackend.vercel.app/books/?skip=${skip}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const pageData = await pageRes.json();
      setBooks(pageData);

      const countRes = await retryFetch(
        `https://libarybackend.vercel.app/books/?skip=0&limit=10000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const allBooks = await countRes.json();
      setTotalBooks(allBooks.length);
    } catch (err) {
      if (err?.type === "AUTH_ERROR") {
        toast.error("Session expired. Please log in again.");
        navigate(`/${user?.role || "student"}/login`);
      } else {
        toast.error("Failed to load data.");
      }
    } finally {
      setLoading(false); // ✅ end loading
    }
  };

  // Fetch books
  useEffect(() => {
    if (token) fetchBooks();
  }, [token, skip, limit]);

  useEffect(() => {
    if (!isStaff || activeTab === "borrow") {
      import("../components/AcquireModal");
    }
  }, [isStaff, activeTab]);

  const handleSelect = (id) =>
    setSelectedBooks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      book.genre.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (loading) {
    return <AppLoader message="Loading books..." />; // ✅ full-page loader
  }

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          {!isStaff ? "Available Books" : "Book Management"}
        </h2>

        {isStaff && (
          <div className="flex gap-4 truncate">
            <button
              className={`px-3 py-1 rounded-lg ${
                activeTab === "manage"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("manage")}
            >
              Manage Books
            </button>
            <button
              className={`px-3 py-1 rounded-lg ${
                activeTab === "borrow"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("borrow")}
            >
              Borrow Books
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-4 items-start sm:items-center">
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isStaff) {
                    if (activeTab === "manage") {
                      setShowAddModal(true);
                    } else {
                      setShowAcquireModal(true);
                    }
                  } else {
                    setShowAcquireModal(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
              >
                {isStaff ? (
                  <Plus className="w-4 h-4" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {isStaff
                  ? activeTab === "manage"
                    ? "Add Book"
                    : "Acquire"
                  : "Acquire"}
              </button>

              {(!isStaff || activeTab === "borrow") &&
                selectedBooks.length > 0 && (
                  <button
                    onClick={() => setSelectedBooks([])}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:underline"
                  >
                    Clear All
                  </button>
                )}
            </div>

            <div className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-800">
              <Filter className="w-4 h-4" />
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setSkip(0);
                }}
                className="bg-transparent text-sm outline-none dark:text-white"
              >
                {[5, 10, 20, 50].map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="dark:bg-zinc-800 dark:text-white"
                  >
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-900 dark:border-zinc-600 dark:text-white"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Results summary */}
      {debouncedSearch && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredBooks.length} result
          {filteredBooks.length !== 1 && "s"} for "{debouncedSearch}"
        </p>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {activeTab === "manage" && (
          <table className="min-w-full text-sm text-left border dark:border-zinc-700">
            <thead className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white">
              <tr>
                <th className="px-4 py-2">Book ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Genre</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-t dark:border-zinc-700">
                  <td className="px-4 py-2">{book.id}</td>
                  <td className="px-4 py-2">{book.title}</td>
                  <td className="px-4 py-2">{book.author}</td>
                  <td className="px-4 py-2">{book.genre}</td>
                  <td className="px-4 py-2">
                    {isStaff ? (
                      <div className="flex gap-3">
                        <Pencil
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                          onClick={() => {
                            setEditingBook(book);
                            setShowUpdateModal(true);
                          }}
                        />
                        <Trash
                          className="w-4 h-4 text-red-600 cursor-pointer"
                          onClick={() => {
                            setEditingBook(book);
                            setShowDeleteModal(true);
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(book.id)}
                        onChange={() => handleSelect(book.id)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "borrow" && (
          <table className="min-w-full text-sm text-left border dark:border-zinc-700">
            <thead className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white">
              <tr>
                <th className="px-4 py-2">Book ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Genre</th>
                <th className="px-4 py-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-t dark:border-zinc-700">
                  <td className="px-4 py-2">{book.id}</td>
                  <td className="px-4 py-2">{book.title}</td>
                  <td className="px-4 py-2">{book.author}</td>
                  <td className="px-4 py-2">{book.genre}</td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book.id)}
                      onChange={() => handleSelect(book.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          className="px-3 py-1 border rounded-lg disabled:opacity-50"
          disabled={skip === 0}
          onClick={() => setSkip(skip - limit)}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded-lg disabled:opacity-50"
          disabled={skip + limit >= totalBooks}
          onClick={() => setSkip(skip + limit)}
        >
          Next
        </button>
      </div>

      {/* Modals */}
      <Suspense
        fallback={<div className="text-center text-sm py-4">Loading...</div>}
      >
        {showAddModal && (
          <AddBookModal onClose={() => setShowAddModal(false)} />
        )}
        {showUpdateModal && editingBook && (
          <UpdateBookModal
            book={editingBook}
            onClose={() => setShowUpdateModal(false)}
          />
        )}
        {showDeleteModal && editingBook && (
          <DeleteConfirmModal
            book={editingBook}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
        {showAcquireModal && (
          <AcquireModal
            selectedBookIds={selectedBooks}
            onClose={() => setShowAcquireModal(false)}
            setSelectedBooks={setSelectedBooks}
            onBorrowSuccess={() => {
              setSelectedBooks([]);
              fetchBooks();
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
