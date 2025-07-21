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

export default function StudentDashboardView() {
  const { user, token } = useUserContext();
  const { theme } = useThemeContext();
  const navigate = useNavigate();

  const [borrowStats, setBorrowStats] = useState({ borrowed: 0, returned: 0 });
  const [quote, setQuote] = useState("");
  const [recommendations, setRecommendations] = useState([]);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [borrowedRes, historyRes] = await Promise.all([
          retryFetch(
            "https://libarybackend.vercel.app/users/me/borrowed_books/",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          retryFetch(
            "https://libarybackend.vercel.app/users/me/borrow_history/",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);
        const borrowedBooks = await borrowedRes.json();
        const borrowHistory = await historyRes.json();

        const returned = borrowHistory.length - borrowedBooks.length;
        setBorrowStats({
          borrowed: borrowedBooks.length,
          returned: Math.max(returned, 0),
        });
      } catch (err) {
        toast.error("Unable to load book stats. Please retry.");
      }
    };

    if (user && token) fetchStats();
  }, [user, token]);

  const handleNav = (tab) => navigate(`/student/catalog?tab=${tab}`);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recommendations.map((book, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-xl flex flex-col items-center"
                >
                  <div className="w-16 h-24 bg-gray-300 dark:bg-zinc-700 mb-2 rounded" />
                  <div className="text-sm text-black dark:text-white">
                    {book.title}
                  </div>
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
    </div>
  );
}
