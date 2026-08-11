import type { WorkspaceDirectorPlan } from "../../../../lib/workspaceDirectorService";
import type { WorkspacePriorityAction } from "../../../../lib/workspacePriorityService";

type DirectorPanelProps = {
  progressPercent: number;
  directorPlan: WorkspaceDirectorPlan | null;
  priorityActions: WorkspacePriorityAction[];
};

export default function DirectorPanel({
  progressPercent,
  directorPlan,
  priorityActions,
}: DirectorPanelProps) {
  if (!directorPlan) {
    return (
      <div className="rounded-xl border border-slate-800 p-6">
        <p className="text-slate-400">
          Director intelligence is still loading.
        </p>
      </div>
    );
  }

  const primaryAction = priorityActions[0];

  const isCaughtUp =
    progressPercent === 100 &&
    directorPlan.workspaceStatus === "Healthy" &&
    priorityActions.length === 0;

  const briefHeadline = isCaughtUp
    ? "The workspace is fully caught up."
    : primaryAction
      ? priorityActions.length === 1
        ? "One priority is shaping the current workspace."
        : `${priorityActions.length} priorities are shaping the current workspace.`
      : progressPercent >= 90
        ? "The workspace is approaching a fully resolved state."
        : "The workspace still has meaningful work in motion.";

  const briefMessage = isCaughtUp
    ? "No priority actions are waiting. Use Forecast, Strategy, Risk, and Insights to understand what the completed workspace activity is telling you."
    : primaryAction
      ? `The strongest immediate signal is ${primaryAction.title.toLowerCase()} for ${primaryAction.itemTitle}. The current action plan is estimated to take about ${directorPlan.estimatedMinutes} minutes.`
      : "No immediate priority action is available, but the workspace has not yet reached a fully resolved state.";

  const focusTitle = isCaughtUp
    ? "No immediate action required"
    : primaryAction?.itemTitle ?? directorPlan.nextBestAction;

  const focusMessage = isCaughtUp
    ? "Operational work is caught up. The intelligence views can now be used for context, patterns, risk, and forward-looking decisions."
    : primaryAction?.reason ??
      "Review the current workspace position before beginning additional work.";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          Today&apos;s Brief
        </p>

        <h3 className="mt-4 text-2xl font-bold">
          {briefHeadline}
        </h3>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          {briefMessage}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Focus
          </p>

          <p className="mt-3 text-xl font-bold">
            {focusTitle}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {focusMessage}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Position
          </p>

          <p className="mt-3 text-xl font-bold">
            {progressPercent}% complete
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {isCaughtUp
              ? "The workspace is caught up and no priority work remains."
              : priorityActions.length > 0
                ? `${priorityActions.length} priority ${
                    priorityActions.length === 1
                      ? "action remains"
                      : "actions remain"
                  } before the workspace is fully caught up.`
                : "The workspace is still progressing toward a fully resolved state."}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recommended Sequence
          </p>

          {directorPlan.estimatedMinutes > 0 && (
  <span className="text-sm text-slate-500">
    {directorPlan.estimatedMinutes} min
  </span>
)}
        </div>

        {priorityActions.length === 0 ? (
          <div className="mt-5">
            <p className="font-semibold">
              No action sequence is required.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              No execution sequence is needed. Use Forecast, Strategy, Risk, and Insights
to interpret the workspace&apos;s current position and monitor what changes next.
            </p>
          </div>
        ) : (
          <ol className="mt-5 space-y-4">
            {priorityActions.slice(0, 4).map((action, index) => (
              <li
                key={`${action.itemId}-${action.actionType}`}
                className="flex gap-4 rounded-lg border border-slate-800/80 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {index + 1}
                </span>

                <div>
                  <p className="font-semibold">
                    {action.itemTitle}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {action.title} — {action.reason}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}