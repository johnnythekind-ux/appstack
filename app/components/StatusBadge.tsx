type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const colors: Record<string, string> = {
    BUY: "bg-green-600 text-white",
    PASS: "bg-red-600 text-white",
    NEGOTIATE: "bg-yellow-500 text-black",

    Queued: "bg-blue-600 text-white",
    Running: "bg-yellow-500 text-black",
    Completed: "bg-green-600 text-white",

    Saved: "bg-slate-600 text-white",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        colors[status] ??
        "bg-slate-700 text-white"
      }`}
    >
      {status}
    </span>
  );
}