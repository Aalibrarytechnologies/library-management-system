import { Link, useLocation } from "react-router-dom";
import white_logo from "../assets/white_logo.png";

export default function AuthLayout({ children, type }) {
  const isSignup = type === "signup";
  const location = useLocation();

  // Extract role from current URL: /student/signup → "student"
  const role = location.pathname.split("/")[1] || "student";

  return (
    <div className="flex min-h-screen font-montserrat">
      {/* Left side */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-center px-6 py-8 rounded-tr-3xl rounded-br-3xl">
        <img src={white_logo} alt="BookWorm" className="w-16 h-16 mb-4" />
        <h1 className="text-2xl sm:text-4xl font-light">BookWorm</h1>
        <span className="tracking-widest text-lg mb-8">LIBRARY</span>

        <p className="mb-4">
          {isSignup
            ? "Already have an account? Sign In now."
            : "New to our platform? Sign Up now."}
        </p>

        <Link
          to={`/${role}/${isSignup ? "login" : "signup"}`}
          className="border border-white truncate px-6 py-2 rounded-full text-white hover:bg-white hover:text-black transition-colors duration-300"
        >
          {isSignup ? "SIGN IN" : "SIGN UP"}
        </Link>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-white flex justify-center items-center px-6 py-8">
        {children}
      </div>
    </div>
  );
}
