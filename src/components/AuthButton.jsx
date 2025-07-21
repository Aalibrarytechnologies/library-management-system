export default function AuthButton({
  label,
  onClick,
  type = "submit",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-full font-semibold transition-opacity 
        ${
          disabled
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-black text-white hover:opacity-90 cursor-pointer"
        }`}
      aria-label={label}
    >
      {label}
    </button>
  );
}
