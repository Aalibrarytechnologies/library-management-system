import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen } from "lucide-react";
import StatCard from "../staff/StatCard";
import DashboardPieChart from "../../components/DashboardPieChart";
import { phrases } from "../../data/phrases";
import { useUserContext } from "../../context/UserContext";
import { useThemeContext } from "../../context/ThemeContext";
import black_logo from "../../assets/black_logo.png";
import white_logo from "../../assets/white_logo.png";
import { retryFetch } from "../../utils/retryFetch";
import AppLoader from "../AppLoader";

export default function StaffDashboardView() {
  const { token } = useUserContext();
  const { theme } = useThemeContext();

  const [quote, setQuote] = useState("");
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const phraseIndex = parseInt(
      sessionStorage.getItem("quoteIndex") || "0",
      10
    );
    setQuote(phrases[phraseIndex]);
    const next = (phraseIndex + 1) % phrases.length;
    sessionStorage.setItem("quoteIndex", next.toString());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksRes, allBorrowRes] = await Promise.all([
          retryFetch(
            "https://libarybackend.vercel.app/books/?skip=0&limit=100",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          retryFetch("https://libarybackend.vercel.app/borrowed_books/all/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const bookData = await booksRes.json();
        const allBorrowData = await allBorrowRes.json();

        const returnedCount = allBorrowData.filter(
          (b) => b.returned_date !== null
        ).length;
        const borrowedCount = allBorrowData.length - returnedCount;

        setBooks(bookData);
        setBorrowed([borrowedCount, returnedCount]);
      } catch (err) {
        toast.error("Failed to load staff dashboard data.");
        console.error("Staff dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  if (loading) {
    return <AppLoader message="Loading dashboard..." />;
  }

  return (
    <div className="w-full flex flex-col h-full justify-between px-4 py-6 sm:px-8 font-montserrat space-y-8">
      {/* Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Borrowed Books"
          value={borrowed[0]}
          icon={BookOpen}
          color="bg-gray-500"
        />
        <StatCard
          title="Total Returned Books"
          value={borrowed[1]}
          icon={BookOpen}
          color="bg-gray-500"
        />
        <StatCard
          title="Total Books"
          value={books.length}
          icon={BookOpen}
          color="bg-gray-500"
        />
      </div>

      {/* Pie Chart + Logo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="w-full max-w-md mx-auto">
          <DashboardPieChart borrowed={borrowed[0]} returned={borrowed[1]} />
        </div>
        <div className="flex justify-center">
          <img
            src={theme === "dark" ? white_logo : black_logo}
            alt="BookWorm Logo"
            className="w-48 h-48 sm:w-60 sm:h-60 opacity-50"
          />
        </div>
      </div>

      {/* Quote */}
      <div className="text-center text-gray-600 dark:text-gray-400 italic text-sm sm:text-base">
        “{quote}”
      </div>
    </div>
  );
}
