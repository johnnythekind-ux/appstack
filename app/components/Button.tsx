type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "success" | "danger" | "secondary";
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
  type = "button",
}: ButtonProps) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500",
    success: "bg-green-600 text-white hover:bg-green-500",
    danger:
      "border border-red-700 text-red-400 hover:bg-red-900/20",
    secondary:
      "border border-slate-600 text-white hover:bg-slate-800",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}