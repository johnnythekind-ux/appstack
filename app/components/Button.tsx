type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "success" | "danger" | "secondary";
};

export default function Button({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
}: ButtonProps) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    success: "bg-green-600 hover:bg-green-500 text-white",
    danger: "border border-red-700 text-red-400 hover:bg-red-900/20",
    secondary: "border border-slate-600 hover:bg-slate-800 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}