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

export default function Signup() {
  const containerRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUserContext();

  const role = location.pathname.includes("staff") ? "staff" : "student";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Manual field validation
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);

    const payload = {
      full_name: form.name.trim(),
      email: form.email.trim(),
      role,
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

      toast.success("Signup successful!");
      navigate(`/${role}/login`);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef}>
      <AuthLayout type="signup">
        <div className="w-full max-w-md">
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
