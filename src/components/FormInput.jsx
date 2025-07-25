import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormInput({
  name,
  type,
  placeholder,
  required,
  className = "",
  value,
  onChange,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`relative w-full ${className}`}>
      <label htmlFor={name} className="sr-only">
        {placeholder}
      </label>
      <input
        type={isPassword && showPassword ? "text" : type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pr-12 border border-gray-400 rounded-xl text-black bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
        aria-label={placeholder}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}
