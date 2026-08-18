"use client";

import Card from "../Card";
import StatusBadge from "../StatusBadge";

type RecentWorkProps = {
  loading: boolean;
  visibleItems: any[];
  filteredItems: any[];
  selectedItem: any;
  selectedIds: string[];
  deletingSelected: boolean;
  showAllItems: boolean;
  onSelectItem: (item: any) => void;
  onSelectionChange: (ids: string[]) => void;
  onDeleteSelected: () => void;
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
    case "task":
      return "Task";
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
    case "task":
      return "✓";
    default:
      return "📁";
  }
}

export default function RecentWork({
  loading,
  visibleItems,
  filteredItems,
  selectedItem,
  selectedIds,
  deletingSelected,
  showAllItems,
  onSelectItem,
  onSelectionChange,
  onDeleteSelected,
  onToggleShowAll,
}: RecentWorkProps) {
  const selectedIdSet = new Set(selectedIds);
  const visibleIds = visibleItems.map((item) => item.id);

  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIdSet.has(id)
  ).length;

  const allVisibleSelected =
    visibleItems.length > 0 &&
    selectedVisibleCount === visibleItems.length;

  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  function toggleItemSelection(itemId: string) {
    const next = new Set(selectedIds);

    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }

    onSelectionChange([...next]);
  }

  function toggleSelectAllVisible() {
    const next = new Set(selectedIds);

    if (allVisibleSelected) {
      visibleIds.forEach((id) => next.delete(id));
    } else {
      visibleIds.forEach((id) => next.add(id));
    }

    onSelectionChange([...next]);
  }

  return (
    <Card>
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-subtle">
            Workspace Activity
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Active Work
          </h2>

          <p className="mt-1 text-sm text-muted">
            Recent tasks, analyses, reports, and jobs across the workspace.
          </p>
        </div>

        {!loading && filteredItems.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-subtle">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </p>

            {selectedIds.length > 0 && (
              <p className="mt-1 text-sm font-semibold text-accent">
                {selectedIds.length} selected
              </p>
            )}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">
              {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "item selected" : "items selected"}
            </p>

            <p className="mt-1 text-sm text-muted">
              Bulk actions apply only to the items you explicitly selected.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSelectionChange([])}
              disabled={deletingSelected}
              className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear Selection
            </button>

            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={deletingSelected}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {deletingSelected
                ? "Deleting..."
                : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="py-10 text-center text-sm text-muted">
          Loading workspace items...
        </div>
      )}

      {!loading && visibleItems.length === 0 && (
        <div className="py-10 text-center">
          <p className="font-semibold text-foreground">
            No active work found.
          </p>

          <p className="mt-1 text-sm text-subtle">
            Workspace activity will appear here as work is created.
          </p>
        </div>
      )}

      {!loading && visibleItems.length > 0 && (
        <div className="mt-2">
          <div className="hidden grid-cols-[44px_130px_minmax(0,1fr)_minmax(180px,0.7fr)_auto] gap-4 border-b border-border px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-subtle md:grid">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(element) => {
                  if (element) {
                    element.indeterminate = someVisibleSelected;
                  }
                }}
                onChange={toggleSelectAllVisible}
                disabled={deletingSelected}
                aria-label={
                  allVisibleSelected
                    ? "Clear all visible selections"
                    : "Select all visible items"
                }
                className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>Type</div>
            <div>Item</div>
            <div>Address</div>
            <div className="text-right">Status</div>
          </div>

          <div className="divide-y divide-border">
            {visibleItems.map((item, index) => {
              const isCurrentSelection =
                selectedItem?.id === item.id &&
                selectedItem?.type === item.type;

              const isBulkSelected = selectedIdSet.has(item.id);

              return (
                <div
                  key={`${item.type}-${item.id}-${item.created_at ?? "no-date"}-${index}`}
                  className={`group px-3 py-4 transition ${
                    isCurrentSelection
                      ? "bg-accent-soft"
                      : isBulkSelected
                        ? "bg-surface-muted"
                        : "hover:bg-surface-muted"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[44px_130px_minmax(0,1fr)_minmax(180px,0.7fr)_auto] md:items-center md:gap-4">
                    <div className="flex items-center gap-3 md:justify-center">
                      <input
                        type="checkbox"
                        checked={isBulkSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={deletingSelected}
                        aria-label={`Select ${item.title || "workspace item"}`}
                        className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <span className="text-xs font-semibold uppercase tracking-wider text-subtle md:hidden">
                        Select
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      disabled={deletingSelected}
                      className="flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-subtle disabled:cursor-not-allowed"
                    >
                      <span aria-hidden="true">
                        {getItemIcon(item.type)}
                      </span>

                      <span>{getItemTypeLabel(item.type)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      disabled={deletingSelected}
                      className="min-w-0 text-left disabled:cursor-not-allowed"
                    >
                      <p
                        className={`truncate font-semibold transition ${
                          isCurrentSelection
                            ? "text-accent"
                            : "text-foreground group-hover:text-accent"
                        }`}
                      >
                        {item.title || "Untitled item"}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      disabled={deletingSelected}
                      className="min-w-0 text-left disabled:cursor-not-allowed"
                    >
                      {item.address ? (
                        <p className="truncate text-sm text-muted">
                          {item.address}
                        </p>
                      ) : (
                        <p className="text-sm text-subtle">—</p>
                      )}
                    </button>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <span className="text-xs text-subtle md:hidden">
                        Status
                      </span>

                      <button
                        type="button"
                        onClick={() => onSelectItem(item)}
                        disabled={deletingSelected}
                        className="rounded-full disabled:cursor-not-allowed"
                        aria-label={`Open ${item.title || "workspace item"}`}
                      >
                        {item.status ? (
                          <StatusBadge status={item.status} />
                        ) : (
                          <span className="text-sm text-subtle">—</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredItems.length > 5 && (
        <div className="border-t border-border pt-5">
          <button
            type="button"
            onClick={onToggleShowAll}
            disabled={deletingSelected}
            className="text-left text-sm font-semibold text-accent transition hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
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
