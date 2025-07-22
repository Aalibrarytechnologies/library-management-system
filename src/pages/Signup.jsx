import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../layouts/AuthLayout";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import black_logo from "../assets/black_logo.png";
import { useUserContext } from "../context/UserContext";
import { retryFetch } from "../utils/retryFetch";

export default function Signup() {
  const containerRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUserContext();

  const role = location.pathname.includes("staff") ? "staff" : "student";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      full_name: form.name.trim(),
      email: form.email.trim(),
      role, // role from URL
      password: form.password,
    };

    try {
      const res = await retryFetch("https://libarybackend.vercel.app/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.detail || "Signup failed");
      }

      const data = await res.json();

      // Auto-login after signup
      const loginRes = await retryFetch(
        "https://libarybackend.vercel.app/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: new URLSearchParams({
            username: form.email,
            password: form.password,
          }),
        }
      );

      const loginData = await loginRes.json();
      if (!loginData.access_token) throw new Error("Auto-login failed");

      // Fetch user
      const userRes = await retryFetch(
        "https://libarybackend.vercel.app/users/me/",
        {
          headers: {
            Authorization: `Bearer ${loginData.access_token}`,
            Accept: "application/json",
          },
        }
      );

      const userData = await userRes.json();

      await login(userData, loginData.access_token);

      // Redirect to correct dashboard (in case role in backend differs from URL)
      const actualRole = userData.role;
      navigate(`/${actualRole}/dashboard`);
      toast.success("Signup successful!");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef}>
      <AuthLayout type="signup">
        <div>
          <img
            src={black_logo}
            alt="BookWorm Logo"
            className="w-16 h-16 mb-4"
          />
          <h2 className="text-3xl font-semibold text-black mb-2">Sign Up</h2>
          <p className="text-gray-600 mb-6">
            Please provide your information to sign up as a {role}.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <FormInput
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <FormInput
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && <p className="text-sm text-red-600 my-4 ">{error}</p>}

            <AuthButton
              label={loading ? "Creating account..." : "Sign Up"}
              disabled={loading}
            />
          </form>
        </div>
      </AuthLayout>
    </div>
  );
}
