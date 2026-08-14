type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
    />
  );
}
