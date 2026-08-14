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
    primary:
      "bg-accent text-white hover:bg-accent-hover",
    success:
      "bg-green-600 text-white hover:bg-green-500",
    danger:
      "border border-red-500 text-red-500 hover:bg-red-500/10",
    secondary:
      "border border-border-strong bg-surface text-foreground hover:bg-surface-muted",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      style={{
        ["--tw-ring-offset-color" as string]:
          "var(--ring-offset)",
      }}
    >
      {children}
    </button>
  );
}
