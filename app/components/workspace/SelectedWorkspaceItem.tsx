"use client";

import Card from "../Card";
import Button from "../Button";

type SelectedWorkspaceItemProps = {
  selectedItem: any;
  selectedItemEvents: any[];
  workspaceAnalysis: any;
  recommendation: any;
  onClose: () => void;
  onOpen: () => void;
  onGenerateReport: () => void;
  onCreateJob: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
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

export default function SelectedWorkspaceItem({
  selectedItem,
  selectedItemEvents,
  workspaceAnalysis,
  recommendation,
  onClose,
  onOpen,
  onGenerateReport,
  onCreateJob,
  onDuplicate,
  onDelete,
}: SelectedWorkspaceItemProps) {
  if (!selectedItem) {
    return null;
  }

  return (
    <Card title="Current Selection" className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {getItemIcon(selectedItem.type)} {selectedItem.type}
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {selectedItem.title}
          </h2>

          {selectedItem.address && (
            <p className="mt-2 text-slate-400">
              {selectedItem.address}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
        >
          Close
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 p-5">
          <h3 className="font-semibold">Analysis</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Stage</span>
              <span>{workspaceAnalysis.stage}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Health</span>
              <span>{workspaceAnalysis.health}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Events</span>
              <span>{workspaceAnalysis.eventCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 p-5">
          <h3 className="font-semibold">Recommendation</h3>

          <p className="mt-4 text-sm text-slate-400">
            Next Action
          </p>

          <p className="mt-1 font-semibold">
            {recommendation.action}
          </p>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            {recommendation.reason}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-5">
          <h3 className="font-semibold">Activity</h3>

          <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
            {selectedItemEvents.length === 0 && (
              <p className="text-sm text-slate-400">
                No activity yet.
              </p>
            )}

            {selectedItemEvents.map((event) => (
              <div key={event.id}>
                <p className="text-sm font-medium">
                  {event.description}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedItem.content && (
        <details className="mt-6 rounded-xl border border-slate-800 p-5">
          <summary className="cursor-pointer font-semibold">
            View saved content
          </summary>

          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm">
            {selectedItem.content}
          </pre>
        </details>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onOpen}>
          Open
        </Button>

        <Button
          onClick={onGenerateReport}
          disabled={selectedItem.type !== "analysis"}
        >
          Generate Report
        </Button>

        <Button
          onClick={onCreateJob}
          disabled={selectedItem.type === "job"}
        >
          Create Job
        </Button>

        <Button onClick={onDuplicate}>
          Duplicate
        </Button>

        <Button onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
