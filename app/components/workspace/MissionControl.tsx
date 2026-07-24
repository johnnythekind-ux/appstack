"use client";

import Card from "../Card";
import Button from "../Button";
import type { WorkspacePriorityAction } from "../../../lib/workspacePriorityService";

type MissionControlProps = {
  workspaceHealth: string;
  progressPercent: number;
  estimatedMinutes: number;
  nextBestAction: string;
  priorityActions: WorkspacePriorityAction[];
  onAction: (action: WorkspacePriorityAction) => void;
};

function getActionLabel(action: WorkspacePriorityAction) {
  if (action.actionType === "generate_report") return "Generate Report";
  if (action.actionType === "create_job") return "Create Job";
  return "Review Item";
}

export default function MissionControl({
  workspaceHealth,
  progressPercent,
  estimatedMinutes,
  nextBestAction,
  priorityActions,
  onAction,
}: MissionControlProps) {
  const primaryAction = priorityActions[0];
  const upcomingActions = priorityActions.slice(1, 3);

  return (
    <Card>
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
            Today&apos;s Mission
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {primaryAction?.title ?? nextBestAction}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-400">
          <span>
            Health:{" "}
            <strong className="font-semibold text-white">
              {workspaceHealth}
            </strong>
          </span>

          <span aria-hidden="true" className="text-slate-700">
            •
          </span>

          <span>
            Progress:{" "}
            <strong className="font-semibold text-white">
              {progressPercent}%
            </strong>
          </span>

          <span aria-hidden="true" className="text-slate-700">
            •
          </span>

          <span>
            Time:{" "}
            <strong className="font-semibold text-white">
              {estimatedMinutes} min
            </strong>
          </span>
        </div>
      </div>

      {!primaryAction ? (
        <div className="py-10">
          <p className="text-lg font-semibold">Workspace clear.</p>
          <p className="mt-2 text-slate-400">
            There are no priority actions requiring attention right now.
          </p>
        </div>
      ) : (
        <div className="py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Primary Objective
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                {primaryAction.itemTitle}
              </h3>

              <div className="mt-6 max-w-3xl">
                <p className="text-sm font-semibold text-slate-300">
                  Why this matters
                </p>

                <p className="mt-2 text-base leading-7 text-slate-400">
                  {primaryAction.reason}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                  {primaryAction.priority} priority
                </span>

                <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                  {getActionLabel(primaryAction)}
                </span>
              </div>
            </div>

            <div className="lg:min-w-44">
              <Button onClick={() => onAction(primaryAction)}>
                Start Mission
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-800 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Up Next
          </h3>

          <p className="text-sm text-slate-500">
            {Math.max(priorityActions.length - 1, 0)} remaining
          </p>
        </div>

        {upcomingActions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No additional actions are queued.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-800 rounded-xl border border-slate-800">
            {upcomingActions.map((action) => (
              <div
                key={`${action.itemId}-${action.actionType}`}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{action.title}</p>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {action.itemTitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onAction(action)}
                  className="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                >
                  {getActionLabel(action)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
