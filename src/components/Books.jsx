import { useEffect, useState } from "react";
import { Plus, ShoppingCart, Pencil, Trash, Filter } from "lucide-react";
import { useUserContext } from "../context/UserContext";
import { retryFetch } from "../utils/retryFetch";
import toast from "react-hot-toast";
import AddBookModal from "../components/AddBookModal";
import UpdateBookModal from "../components/UpdateBookModal";
import AcquireModal from "../components/AcquireModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Books() {
  const { user, token } = useUserContext();
  const isStaff = user?.role === "staff";

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAcquireModal, setShowAcquireModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);

  const totalPages = Math.ceil(totalBooks / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch current page
        const pageRes = await retryFetch(
          `https://libarybackend.vercel.app/books/?skip=${skip}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const pageData = await pageRes.json();
        setBooks(pageData);

        // Fetch full count
        const countRes = await retryFetch(
          `https://libarybackend.vercel.app/books/?skip=0&limit=10000`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const allBooks = await countRes.json();
        setTotalBooks(allBooks.length);
      } catch (err) {
        toast.error("Failed to fetch books.");
      }
    };

    if (token) fetchBooks();
  }, [token, skip, limit]);

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

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Book Management
        </h2>

        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() =>
                isStaff ? setShowAddModal(true) : setShowAcquireModal(true)
              }
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              {isStaff ? (
                <Plus className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              {isStaff ? "Add Book" : "Acquire"}
            </button>

            <button
              className="flex items-center gap-1 px-3 py-2 border rounded bg-gray-50 dark:bg-zinc-800"
              onClick={() => {
                const next = [5, 10, 20].find((n) => n > limit) || 5;
                setLimit(next);
                setSkip(0);
              }}
            >
              <Filter className="w-4 h-4" />
              Limit: {limit}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white w-full sm:w-64"
          />
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
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={skip === 0}
          onClick={() => setSkip(skip - limit)}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={skip + limit >= totalBooks}
          onClick={() => setSkip(skip + limit)}
        >
          Next
        </button>
      </div>

      {/* Modals */}
      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} />}
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
          allBooks={books}
          onClose={() => setShowAcquireModal(false)}
          setSelectedBooks={setSelectedBooks}
        />
      )}
    </div>
  );
}
