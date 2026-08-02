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
      className={`mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}