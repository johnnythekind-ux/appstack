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

function getItemTypeLabel(type: string) {
  switch (type) {
    case "analysis":
      return "Analysis";
    case "report":
      return "Report";
    case "job":
      return "Job";
    default:
      return "Item";
  }
}

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
    <Card>
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace Activity
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Active Work
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Recent analyses, reports, and jobs across the workspace.
          </p>
        </div>

        {!loading && filteredItems.length > 0 && (
          <p className="text-sm text-slate-500">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {loading && (
        <div className="py-10 text-center text-sm text-slate-400">
          Loading workspace items...
        </div>
      )}

      {!loading && visibleItems.length === 0 && (
        <div className="py-10 text-center">
          <p className="font-semibold text-slate-200">
            No active work found.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Workspace activity will appear here as work is created.
          </p>
        </div>
      )}

      {!loading && visibleItems.length > 0 && (
        <div className="mt-2">
          <div className="hidden grid-cols-[130px_minmax(0,1fr)_minmax(180px,0.7fr)_auto] gap-4 border-b border-slate-800 px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:grid">
            <div>Type</div>
            <div>Item</div>
            <div>Address</div>
            <div className="text-right">Status</div>
          </div>

          <div className="divide-y divide-slate-800">
            {visibleItems.map((item, index) => {
              const isSelected =
                selectedItem?.id === item.id &&
                selectedItem?.type === item.type;

              return (
                <button
                  key={`${item.type}-${item.id}-${item.created_at ?? "no-date"}-${index}`}
                  type="button"
                  onClick={() => onSelectItem(item)}
                  className={`group w-full px-3 py-4 text-left transition ${
                    isSelected
                      ? "bg-blue-500/10"
                      : "hover:bg-slate-950/70"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[130px_minmax(0,1fr)_minmax(180px,0.7fr)_auto] md:items-center md:gap-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <span aria-hidden="true">
                        {getItemIcon(item.type)}
                      </span>

                      <span>{getItemTypeLabel(item.type)}</span>
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`truncate font-semibold transition ${
                          isSelected
                            ? "text-blue-300"
                            : "text-slate-100 group-hover:text-white"
                        }`}
                      >
                        {item.title || "Untitled item"}
                      </p>
                    </div>

                    <div className="min-w-0">
                      {item.address ? (
                        <p className="truncate text-sm text-slate-400">
                          {item.address}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-600">—</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <span className="text-xs text-slate-600 md:hidden">
                        Status
                      </span>

                      {item.status ? (
                        <StatusBadge status={item.status} />
                      ) : (
                        <span className="text-sm text-slate-600">—</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredItems.length > 5 && (
        <div className="border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={onToggleShowAll}
            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            {showAllItems
              ? "Show recent items only"
              : `View all ${filteredItems.length} items`}
          </button>
        </div>
      )}
    </Card>
  );
}