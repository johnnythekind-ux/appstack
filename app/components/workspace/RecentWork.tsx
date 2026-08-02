import Card from "../Card";
import StatusBadge from "../StatusBadge";

type RecentWorkProps = {
  loading: boolean;
  visibleItems: any[];
  filteredItems: any[];
  selectedItem: any;
  showAllItems: boolean;
  onSelectItem: (item: any) => void;
  onToggleShowAll: () => void;
};

function getItemIcon(type: string) {
  switch (type) {
    case "analysis":
      return "📊";

    case "report":
      return "📄";

    case "job":
      return "⚙️";

    default:
      return "📁";
  }
}

export default function RecentWork({
  loading,
  visibleItems,
  filteredItems,
  selectedItem,
  showAllItems,
  onSelectItem,
  onToggleShowAll,
}: RecentWorkProps) {
  return (
    <Card title="Active Work">
      <div className="space-y-3">
        {loading && (
          <div className="rounded-xl border border-slate-800 p-5 text-slate-400">
            Loading workspace items...
          </div>
        )}

        {!loading && visibleItems.length === 0 && (
          <div className="rounded-xl border border-slate-800 p-5 text-slate-400">
            No workspace items found.
          </div>
        )}

        {!loading &&
          visibleItems.map((item, index) => (
  <button
    key={`${item.type}-${item.id}-${item.created_at ?? "no-date"}-${index}`}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selectedItem?.id === item.id
                  ? "border-blue-500 bg-slate-900"
                  : "border-slate-800 hover:border-slate-600 hover:bg-slate-950/70"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {getItemIcon(item.type)} {item.type}
                  </p>

                  <p className="mt-1 truncate font-semibold">
                    {item.title}
                  </p>

                  {item.address && (
                    <p className="mt-1 truncate text-sm text-slate-400">
                      {item.address}
                    </p>
                  )}
                </div>

                {item.status && (
                  <StatusBadge status={item.status} />
                )}
              </div>
            </button>
          ))}
      </div>

      {filteredItems.length > 5 && (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="mt-5 text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          {showAllItems
            ? "Show only five"
            : `View all ${filteredItems.length} items`}
        </button>
      )}
    </Card>
  );
}