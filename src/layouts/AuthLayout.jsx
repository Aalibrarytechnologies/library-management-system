import { Link, useLocation } from "react-router-dom";
import white_logo from "../assets/white_logo.png";

export default function AuthLayout({ children, type }) {
  const isSignup = type === "signup";
  const location = useLocation();

  const role = location.pathname.split("/")[1] || "student";

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      {/* Left Side */}
      <div className="w-full sm:w-1/2 bg-black text-white flex flex-col justify-center items-center px-6 py-12 sm:rounded-tr-3xl sm:rounded-br-3xl">
        <img src={white_logo} alt="BookWorm" className="w-16 h-16 mb-4" />
        <h1 className="text-3xl sm:text-5xl font-light">The</h1>
        <h1 className="text-3xl sm:text-5xl font-light mb-2">BookWorm</h1>
        <span className="tracking-widest text-lg mb-8">LIBRARY</span>

        <p className="mb-4 text-center px-4">
          {isSignup
            ? "Already have an account? Sign In now."
            : "New to our platform? Sign Up now."}
        </p>

        <Link
          to={`/${role}/${isSignup ? "login" : "signup"}`}
          className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition-colors"
        >
          {isSignup ? "SIGN IN" : "SIGN UP"}
        </Link>
      </div>

      {/* Right Side */}
      <div className="w-full sm:w-1/2 bg-white flex justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
