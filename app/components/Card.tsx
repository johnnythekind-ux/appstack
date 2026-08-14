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
      className={`rounded-xl border border-border bg-surface p-5 text-foreground ${className}`}
    >
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title ? (
            <h2 className="text-lg font-semibold">
              {title}
            </h2>
          ) : (
            <span />
          )}

          {actions}
        </div>
      )}

      {children}
    </div>
  );
}
