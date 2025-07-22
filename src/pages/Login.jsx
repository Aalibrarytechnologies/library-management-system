import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import black_logo from "../assets/black_logo.png";
import { useUserContext } from "../context/UserContext";
import { retryFetch } from "../utils/retryFetch";

export default function Login() {
  const containerRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useUserContext();

  const role = location.pathname.includes("staff") ? "staff" : "student";

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // 👈 Inline error state

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { xPercent: -100 },
      { xPercent: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrorMsg(""); // Clear inline error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Reset error before submission

    const formBody = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
    });

    try {
      const res = await retryFetch("https://libarybackend.vercel.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formBody.toString(),
      });

      const data = await res.json();

      if (!data.access_token) throw new Error("Missing access token");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", role);

      const userRes = await retryFetch(
        "https://libarybackend.vercel.app/users/me/",
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            Accept: "application/json",
          },
        }
      );

      if (!userRes.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await userRes.json();

      login(userData, data.access_token);
      toast.success("Login successful!");
      navigate(`/${role}/dashboard`);
    } catch (err) {
      const fallback = "Invalid username or password.";
      try {
        const errorData = await err?.json?.();
        const message = errorData?.detail || fallback;
        toast.error(message);
        setErrorMsg(message);
      } catch {
        toast.error(err.message || fallback);
        setErrorMsg(err.message || fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef}>
      <AuthLayout type="login">
        <div className="w-full max-w-md">
          <img
            src={black_logo}
            alt="BookWorm Logo"
            className="w-16 h-16 mb-4"
          />
          <h2 className="text-3xl font-semibold text-black mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600 mb-6">
            Please enter your credentials to log in
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              name="username"
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
            <FormInput
              name="password"
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />

            {errorMsg && (
              <p className="text-red-600 text-sm my-4">{errorMsg}</p>
            )}

            <AuthButton
              label={loading ? "Signing in..." : "Sign In"}
              disabled={loading}
            />
          </form>
        </div>
      </AuthLayout>
    </div>
  );
}
