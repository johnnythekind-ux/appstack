"use client";

import { useState } from "react";

type ExpandableListProps<T> = {
  items: T[];
  initialCount?: number;
  children: (item: T, index: number) => React.ReactNode;
};

export default function ExpandableList<T>({
  items,
  initialCount = 5,
  children,
}: ExpandableListProps<T>) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded
    ? items
    : items.slice(0, initialCount);

  return (
    <>
      <div className="space-y-3">
        {visibleItems.map((item, index) =>
          children(item, index)
        )}
      </div>

      {items.length > initialCount && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
          >
            {expanded
              ? "Show Less ▲"
              : `Show ${items.length - initialCount} More ▼`}
          </button>
        </div>
      )}
    </>
  );
}