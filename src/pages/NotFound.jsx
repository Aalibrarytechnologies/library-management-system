import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";
import black_logo from "../assets/black_logo.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-black dark:bg-black dark:text-white text-center">
      <img src={black_logo} alt="BookWorm Logo" className="w-16 h-16 mb-6" />

      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-2">Page Not Found</p>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>

      <button
        onClick={() => navigate(-1)}
        className="inline-flex cursor-pointer items-center gap-2 px-5 py-2 border border-black dark:border-white rounded-full text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300"
      >
        <ArrowLeftCircle size={20} />
        Go Back
      </button>
    </div>
  );
}
