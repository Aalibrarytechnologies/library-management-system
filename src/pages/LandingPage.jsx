// src/pages/LandingPage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import black_logo from "../assets/black_logo.png";
import white_logo from "../assets/white_logo.png";
import { useThemeContext } from "../context/ThemeContext";
import { phrases } from "../data/phrases";

export default function LandingPage() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useThemeContext();

  useEffect(() => {
    // Rotate phrases
    const phraseTimer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3500);

    // Progress logic
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => navigate("/student/signup"),
          });
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => {
      clearInterval(phraseTimer);
      clearInterval(progressTimer);
    };
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-8 px-6 max-w-xl w-full">
        {/* Themed Logo */}
        <img
          src={theme === "dark" ? white_logo : black_logo}
          alt="BookWorm Logo"
          className="w-24 h-24 animate-pulse"
        />

        {/* Progress Bar */}
        <div className="w-full h-2 rounded bg-gray-300 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Rotating Quote */}
        <p className="text-lg sm:text-xl italic font-medium transition-opacity duration-500 ease-in-out">
          {phrases[index]}
        </p>
      </div>
    </div>
  );
}
