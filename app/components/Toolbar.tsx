type ToolbarProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Toolbar({
  children,
  className = "",
}: ToolbarProps) {
  return (
    <div
      className={`mt-8 flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}