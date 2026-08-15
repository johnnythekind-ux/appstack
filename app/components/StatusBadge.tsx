type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalizedStatus =
    status === "PASS ON DEAL"
      ? "PASS"
      : status.trim().toUpperCase();

  const colors: Record<string, string> = {
    BUY: "bg-green-600 text-white",
    PASS: "bg-red-600 text-white",
    NEGOTIATE: "bg-yellow-500 text-black",

    QUEUED: "bg-blue-600 text-white",
    RUNNING: "bg-yellow-500 text-black",
    COMPLETED: "bg-green-600 text-white",

    SAVED: "bg-slate-600 text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
        colors[normalizedStatus] ??
        "bg-slate-700 text-white"
      }`}
    >
      {status}
    </span>
  );
}