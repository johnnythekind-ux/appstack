import type { WorkspaceStrategy } from "../../../../lib/workspaceStrategyService";

type StrategyPanelProps = {
  strategy: WorkspaceStrategy | null;
};

export default function StrategyPanel({
  strategy,
}: StrategyPanelProps) {
  if (!strategy) {
    return (
      <p className="text-muted">
        Strategy intelligence is still loading.
      </p>
    );
  }

  const bottleneckText = strategy.bottleneckExplanation.toLowerCase();
  const strategicFocusText = strategy.strategicFocus.toLowerCase();

  const isNewWorkspace =
    strategicFocusText.includes("establish the workspace baseline") ||
    bottleneckText.includes("no activity yet") ||
    bottleneckText.includes("no operating workflow");

  const hasNoBottleneck =
    bottleneckText.includes("no significant") ||
    bottleneckText.includes("no current") ||
    bottleneckText.includes("no bottleneck") ||
    bottleneckText.includes("not currently");

  const isMaintenanceState =
    hasNoBottleneck &&
    strategy.executionOrder.length <= 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Strategic Brief
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              {strategy.strategicFocus}
            </h3>
          </div>

          <div className="rounded-full border border-border bg-surface-muted px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Confidence
            </span>

            <span className="ml-2 font-bold text-foreground">
              {strategy.strategyConfidence}
            </span>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
          {isNewWorkspace
            ? "There is not enough workspace activity yet to evaluate sequencing, dependencies, or operating constraints. The first objective is to establish a usable baseline."
            : isMaintenanceState
              ? "The workspace is currently stable. Strategy is focused on preserving momentum, monitoring new activity, and avoiding unnecessary changes."
              : "The current strategy identifies the highest-leverage sequence of work while deliberately postponing actions that could create unnecessary friction or dependency problems."}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          {isNewWorkspace
            ? "Baseline Status"
            : hasNoBottleneck
              ? "Current Constraint"
              : "Primary Bottleneck"}
        </p>

        <p className="mt-3 text-lg font-semibold">
          {strategy.bottleneckExplanation}
        </p>

        <p className="mt-2 text-sm leading-6 text-muted">
          {isNewWorkspace
            ? "No bottleneck or execution constraint can be evaluated yet because the workspace has not recorded operating activity."
            : hasNoBottleneck
              ? "No active constraint is currently affecting execution. Strategy can remain focused on maintaining the workspace's current position."
              : "This bottleneck is the constraint currently shaping the recommended execution order."}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          {isNewWorkspace || isMaintenanceState
            ? "Recommended Approach"
            : "Recommended Sequence"}
        </p>

        <ol className="mt-5 space-y-4">
          {strategy.executionOrder.map((action, index) => (
            <li
              key={`${action}-${index}`}
              className="flex gap-4 rounded-lg border border-border bg-surface-muted p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {index + 1}
              </span>

              <div>
                <p className="font-semibold">
                  {action}
                </p>

                <p className="mt-1 text-sm leading-6 text-muted">
                  {isNewWorkspace
                    ? "Complete this first step to establish the activity baseline Strategy needs before it can evaluate sequencing and dependencies."
                    : isMaintenanceState
                      ? "No immediate intervention is required. Continue observing workspace activity and respond when conditions change."
                      : "Complete this stage before advancing to lower-priority work."}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          Deferred Actions
        </p>

        <div className="mt-5 space-y-4">
          {strategy.delayActions.map((action, index) => (
            <div
              key={`${action}-${index}`}
              className="flex gap-4 rounded-lg border border-border bg-surface-muted p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-bold text-muted">
                {index + 1}
              </span>

              <p className="text-sm leading-6 text-muted">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          Strategic Tradeoff
        </p>

        <p className="mt-3 leading-7 text-muted">
          {strategy.tradeoffExplanation}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          Expected Result
        </p>

        <p className="mt-3 leading-7 text-muted">
          {isNewWorkspace
            ? "Recording the first workspace activity will establish the baseline needed for Strategy to evaluate real constraints, dependencies, and recommended sequencing."
            : isMaintenanceState
              ? "Maintaining the current approach should preserve workspace stability while allowing AppStack to detect and respond to meaningful new activity."
              : "Following this order should reduce the current bottleneck, preserve workflow dependencies, and improve the quality of the next Workspace Intelligence calculation."}
        </p>
      </div>
    </div>
  );
}