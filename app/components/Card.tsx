type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
};

export default function Card({
  children,
  className = "",
  title,
  actions,
}: CardProps) {
  return (
    <div
  className={`rounded-xl border border-slate-800 p-5 ${className}`}
>
  {title && (
  <div className="mb-5 flex items-center justify-between">
    <h2 className="text-xl font-semibold">
      {title}
    </h2>

    {actions}
  </div>
)}

  {children}
</div>
  );
}