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
      <p className="text-slate-400">
        Director intelligence is still loading.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          Director&apos;s Brief
        </p>

        <h3 className="mt-4 text-2xl font-bold">
          {progressPercent >= 90
            ? "You are close to completing the workspace."
            : directorPlan.workspaceStatus === "Needs Attention"
              ? "A few unfinished steps are holding back progress."
              : "Your workspace is moving in the right direction."}
        </h3>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          {priorityActions.length === 0 ? (
            "There are no priority actions waiting. Review recent work or use the intelligence tabs for deeper context."
          ) : (
            <>
              {priorityActions.length} priority action
              {priorityActions.length === 1 ? " remains" : "s remain"}. The
              fastest path forward is to{" "}
              <strong className="font-semibold text-white">
                {priorityActions[0].title.toLowerCase()}
              </strong>{" "}
              for{" "}
              <strong className="font-semibold text-white">
                {priorityActions[0].itemTitle}
              </strong>
              . The current plan is estimated to take about{" "}
              <strong className="font-semibold text-white">
                {directorPlan.estimatedMinutes} minutes
              </strong>
              .
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Focus Now
          </p>

          <p className="mt-3 text-xl font-bold">
            {priorityActions[0]?.itemTitle ?? directorPlan.nextBestAction}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {priorityActions[0]?.reason ??
              "Complete the highest-impact unfinished step before beginning lower-priority work."}
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
            {priorityActions.length === 0
              ? "The workspace is caught up and no urgent work remains."
              : `Only ${priorityActions.length} priority ${
                  priorityActions.length === 1
                    ? "action remains"
                    : "actions remain"
                } before the workspace is fully caught up.`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recommended Sequence
          </p>

          <span className="text-sm text-slate-500">
            {directorPlan.estimatedMinutes} min
          </span>
        </div>

        {priorityActions.length === 0 ? (
          <p className="mt-5 text-sm text-slate-400">
            No action sequence is required right now.
          </p>
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
                  <p className="font-semibold">{action.itemTitle}</p>
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