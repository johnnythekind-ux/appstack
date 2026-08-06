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

type MissionBriefing = {
  headline: string;
  statusTitle: string;
  statusMessage: string;
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

function buildMissionBriefing(
  workspaceHealth: string,
  progressPercent: number,
  priorityActions: WorkspacePriorityAction[],
  nextBestAction: string
): MissionBriefing {
  const highPriorityActions = priorityActions.filter(
    (action) => action.priority === "High"
  );

  const reviewActions = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const reportActions = priorityActions.filter(
    (action) => action.actionType === "generate_report"
  );

  const jobActions = priorityActions.filter(
    (action) => action.actionType === "create_job"
  );

  if (
    priorityActions.length === 0 &&
    progressPercent === 100 &&
    workspaceHealth === "Healthy"
  ) {
    return {
      headline: "Workspace is running smoothly.",
      statusTitle: "Everything is up to date.",
      statusMessage:
        "All priority work has been completed. New activity will appear here automatically.",
    };
  }

  if (highPriorityActions.length > 0) {
    return {
      headline:
        highPriorityActions.length === 1
          ? "One urgent item needs your attention."
          : `${highPriorityActions.length} urgent items need your attention.`,
      statusTitle: "Immediate action is recommended.",
      statusMessage:
        "Complete the highest-priority work first to prevent additional delays.",
    };
  }

  if (reviewActions.length > 0) {
    return {
      headline:
        reviewActions.length === 1
          ? "One item needs review."
          : `${reviewActions.length} items need review.`,
      statusTitle: "Some workspace activity is unresolved.",
      statusMessage:
        "Review the unresolved items before moving additional work forward.",
    };
  }

  if (reportActions.length > 0) {
    return {
      headline:
        reportActions.length === 1
          ? "One analysis is ready for reporting."
          : `${reportActions.length} analyses are ready for reporting.`,
      statusTitle: "Reporting is the next priority.",
      statusMessage:
        "Generate the outstanding reports to continue moving work toward execution.",
    };
  }

  if (jobActions.length > 0) {
    return {
      headline:
        jobActions.length === 1
          ? "One report is ready for execution."
          : `${jobActions.length} reports are ready for execution.`,
      statusTitle: "Execution work is waiting.",
      statusMessage:
        "Create the outstanding jobs to move completed reports into execution.",
    };
  }

  if (progressPercent >= 90) {
    return {
      headline: "The workspace is nearly complete.",
      statusTitle: "Only a small amount of work remains.",
      statusMessage:
        "Complete the remaining steps to bring the workspace fully up to date.",
    };
  }

  if (progressPercent >= 60) {
    return {
      headline: "The workspace is making progress.",
      statusTitle: "Important work is still underway.",
      statusMessage:
        "Continue with the recommended actions to improve the current position.",
    };
  }

  return {
    headline: nextBestAction,
    statusTitle: "The workspace needs attention.",
    statusMessage:
      "Several unfinished steps are limiting progress. Begin with the highest-priority action.",
  };
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

  const briefing = buildMissionBriefing(
    workspaceHealth,
    progressPercent,
    priorityActions,
    nextBestAction
  );

  return (
    <Card>
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Mission Control
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {briefing.headline}
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
        <div className="py-4">
          <p className="text-lg font-semibold">
            {briefing.statusTitle}
          </p>

          <p className="mt-2 text-slate-400">
            {briefing.statusMessage}
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
