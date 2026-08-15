"use client";

import Card from "../Card";
import Button from "../Button";
import type { WorkspacePriorityAction } from "../../../lib/workspacePriorityService";
import type { WorkspaceDirectorPlan } from "../../../lib/workspaceDirectorService";

type MissionControlProps = {
  workspaceHealth: string;
  progressPercent: number;
  directorPlan: WorkspaceDirectorPlan | null;
  priorityActions: WorkspacePriorityAction[];
  onAction: (action: WorkspacePriorityAction) => void;
};

function getActionLabel(action: WorkspacePriorityAction) {
  if (action.actionType === "generate_report") {
    return "Generate Report";
  }

  if (action.actionType === "create_job") {
    return "Create Job";
  }

  return "Review Item";
}

function getActionStatusLabel(action: WorkspacePriorityAction) {
  if (action.actionType === "generate_report") {
    return "Report required";
  }

  if (action.actionType === "create_job") {
    return "Job required";
  }

  return "Review required";
}

export default function MissionControl({
  workspaceHealth,
  progressPercent,
  directorPlan,
  priorityActions,
  onAction,
}: MissionControlProps) {
  const primaryAction = priorityActions[0];
  const upcomingActions = priorityActions.slice(1, 3);

  const headline =
    directorPlan?.headline ?? "Loading workspace status.";

  const statusTitle =
    directorPlan?.statusTitle ?? "Workspace status is being prepared.";

  const statusMessage =
    directorPlan?.statusMessage ??
    "Current workspace guidance will appear here shortly.";

  const estimatedMinutes =
    directorPlan?.estimatedMinutes ?? 0;

  return (
    <Card>
      <div className="flex flex-col gap-2 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Mission Control
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {headline}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          <span>
            Health:{" "}
            <strong className="font-semibold text-foreground">
              {workspaceHealth}
            </strong>
          </span>

          <span aria-hidden="true" className="text-subtle">
            •
          </span>

          <span>
            Progress:{" "}
            <strong className="font-semibold text-foreground">
              {progressPercent}%
            </strong>
          </span>

          <span aria-hidden="true" className="text-subtle">
            •
          </span>

          <span>
            Time:{" "}
            <strong className="font-semibold text-foreground">
              {estimatedMinutes} min
            </strong>
          </span>
        </div>
      </div>

      {!primaryAction ? (
        <div className="py-4">
          <p className="text-lg font-semibold">
            {statusTitle}
          </p>

          <p className="mt-2 text-slate-400">
            {statusMessage}
          </p>
        </div>
      ) : (
        <div className="py-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Primary Objective
                </p>

                <span
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                  title={`${primaryAction.priority} priority`}
                >
                  {getActionStatusLabel(primaryAction)}
                </span>
              </div>

              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                {primaryAction.itemTitle}
              </h3>

              <div className="mt-3 max-w-3xl">
                <p className="text-sm font-semibold text-slate-300">
                  Why this matters
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400 sm:text-base">
                  {primaryAction.reason}
                </p>
              </div>
            </div>

            <div className="lg:min-w-40">
              <Button onClick={() => onAction(primaryAction)}>
                {getActionLabel(primaryAction)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {upcomingActions.length > 0 && (
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Up Next
            </h3>

            <p className="text-sm text-slate-500">
              {priorityActions.length - 1} remaining
            </p>
          </div>

          <div className="mt-3 divide-y divide-slate-800 rounded-xl border border-slate-800">
            {upcomingActions.map((action) => (
              <div
                key={`${action.itemId}-${action.actionType}`}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {action.title}
                  </p>

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
        </div>
      )}
    </Card>
  );
}
