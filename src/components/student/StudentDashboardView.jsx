import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { useThemeContext } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import DashboardPieChart from "../DashboardPieChart";
import { BookOpen, ArrowRightCircle } from "lucide-react";
import { phrases } from "../../data/phrases";
import black_logo from "../../assets/black_logo.png";
import white_logo from "../../assets/white_logo.png";
import { retryFetch } from "../../utils/retryFetch";
import book_image from "../../assets/Image.png";
import AcquireModal from "../AcquireModal";
import AppLoader from "../AppLoader";

export default function StudentDashboardView() {
  const { user, token } = useUserContext();
  const { theme } = useThemeContext();
  const navigate = useNavigate();

  const [borrowStats, setBorrowStats] = useState({ borrowed: 0, returned: 0 });
  const [quote, setQuote] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [loading, setLoading] = useState(true); // ✅

  useEffect(() => {
    const phraseIndex = parseInt(
      sessionStorage.getItem("quoteIndex") || "0",
      10
    );
    setQuote(phrases[phraseIndex]);
    sessionStorage.setItem(
      "quoteIndex",
      ((phraseIndex + 1) % phrases.length).toString()
    );
  }, []);

  const fetchStatsAndRecommendations = async () => {
    try {
      setLoading(true); // ✅ start loading

      const historyRes = await retryFetch(
        "https://libarybackend.vercel.app/users/me/borrow_history/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const allBooksRes = await retryFetch(
        "https://libarybackend.vercel.app/books/?skip=0&limit=10000",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const borrowHistory = await historyRes.json();
      const allBooks = await allBooksRes.json();

      const borrowed = borrowHistory.filter((b) => !b.returned_date).length;
      const returned = borrowHistory.filter((b) => b.returned_date).length;
      setBorrowStats({ borrowed, returned });

      const activeBorrowedIds = new Set(
        borrowHistory.filter((b) => !b.returned_date).map((b) => b.book_id)
      );

      const genreCount = {};
      for (let record of borrowHistory) {
        const book = allBooks.find((b) => b.id === record.book_id);
        if (book?.genre) {
          genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
        }
      }

      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre)
        .slice(0, 3);

      const genreMatches = allBooks.filter(
        (book) =>
          topGenres.includes(book.genre) && !activeBorrowedIds.has(book.id)
      );

      let finalSuggestions = [];

      if (genreMatches.length >= 5) {
        finalSuggestions = genreMatches
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
      } else {
        const unborrowedBooks = allBooks.filter(
          (book) => !activeBorrowedIds.has(book.id)
        );
        finalSuggestions = unborrowedBooks
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
      }

      setRecommendations(finalSuggestions);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchStatsAndRecommendations();
  }, [user, token]);

  const handleNav = (tab) => navigate(`/student/catalog?tab=${tab}`);

  const handleQuickBorrow = (bookId) => {
    setSelectedBookIds([bookId]);
    setShowModal(true);
  };

  if (loading) {
    return <AppLoader message="Loading dashboard..." />;
  }

  return (
    <div className="w-full flex flex-col h-full justify-between px-4 py-6 sm:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardPieChart
          borrowed={borrowStats.borrowed}
          returned={borrowStats.returned}
        />

        <div className="col-span-1 md:col-span-1 xl:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 mb-4 text-black dark:text-white">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Top books for you</h2>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No recommendations available yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recommendations.map((book) => (
                <div
                  key={book.id}
                  className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-xl flex flex-col items-center text-center"
                >
                  <div className="w-16 h-24 bg-gray-300 dark:bg-zinc-700 mb-2">
                    <img
                      className="w-full h-full object-cover rounded"
                      src={book_image}
                      alt="Image of book"
                    />
                  </div>

                  <div className="text-sm font-medium text-black dark:text-white mb-1 w-full truncate whitespace-nowrap overflow-hidden max-w-[6rem] sm:max-w-full">
                    {book.title}
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {book.author}
                  </div>

                  <button
                    onClick={() => handleQuickBorrow(book.id)}
                    className="text-xs cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Borrow now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <img
          src={theme === "dark" ? white_logo : black_logo}
          alt="BookWorm Logo"
          className="w-60 h-60 opacity-50"
        />
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div
            onClick={() => handleNav("borrowed")}
            className="cursor-pointer bg-gray-100 dark:bg-zinc-800 p-5 rounded-xl flex justify-between items-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
          >
            <span className="text-sm font-medium text-black dark:text-white">
              Your Borrowed Book List
            </span>
            <ArrowRightCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div
            onClick={() => handleNav("returned")}
            className="cursor-pointer bg-gray-100 dark:bg-zinc-800 p-5 rounded-xl flex justify-between items-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
          >
            <span className="text-sm font-medium text-black dark:text-white">
              Your Returned Book List
            </span>
            <ArrowRightCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
        </div>

        <div className="mt-5 text-center text-gray-600 dark:text-gray-400 italic">
          “{quote}”
        </div>
      </div>

      {showModal && (
        <AcquireModal
          selectedBookIds={selectedBookIds}
          setSelectedBooks={() => setSelectedBookIds([])}
          onClose={() => setShowModal(false)}
          onBorrowSuccess={() => {
            setSelectedBookIds([]);
            setShowModal(false);
            fetchStatsAndRecommendations();
          }}
        />
      )}
    </div>
  );
}
