import type { WorkspaceForecast } from "../../../../lib/workspaceForecastService";

type ForecastPanelProps = {
  currentProgress: number;
  forecast: WorkspaceForecast | null;
};

export default function ForecastPanel({
  currentProgress,
  forecast,
}: ForecastPanelProps) {
  if (!forecast) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-muted">
          Forecast intelligence is still loading.
        </p>
      </div>
    );
  }

  const projectedProgress = Math.max(
    currentProgress,
    forecast.projectedProgress
  );

  const progressGain = Math.max(
    0,
    projectedProgress - currentProgress
  );

  const isNewWorkspace =
    forecast.currentHealth === "New" &&
    forecast.projectedHealth === "New";

  const isCurrentlyComplete = currentProgress >= 100;
  const isProjectedComplete = projectedProgress >= 100;

  const isStableComplete =
    isCurrentlyComplete &&
    isProjectedComplete &&
    forecast.currentHealth === forecast.projectedHealth;

  const isImproving =
    projectedProgress > currentProgress ||
    forecast.projectedHealth !== forecast.currentHealth;

  const headline = isNewWorkspace
    ? "A forecast will form as workspace activity is recorded."
    : isStableComplete
      ? "The workspace is projected to remain fully caught up."
      : !isCurrentlyComplete && isProjectedComplete
        ? "The workspace is projected to reach full completion."
        : isImproving
          ? "The workspace is projected to improve."
          : "The workspace is expected to remain stable.";

  const stepTwoTitle = isNewWorkspace
    ? "Workspace activity establishes the baseline"
    : isStableComplete
      ? "Current conditions remain stable"
      : "Recommended work continues";

  const stepTwoMessage = isNewWorkspace
    ? "Create or save the first workspace item so AppStack has enough activity to begin forming a meaningful forecast."
    : isStableComplete
      ? "AppStack will continue evaluating new workspace activity for changes in health, completion, and risk."
      : "AppStack evaluates how the current workspace should change as its unfinished work advances.";

  const projectedStateMessage = isNewWorkspace
    ? "No projected change is available yet because the workspace has not established an activity baseline."
    : isStableComplete
      ? `Health is expected to remain ${forecast.projectedHealth} at ${projectedProgress}% completion.`
      : `Health is expected to become ${forecast.projectedHealth} at ${projectedProgress}% completion.`;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Workspace Forecast
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              {headline}
            </h3>
          </div>

          <div className="rounded-full border border-border bg-surface-muted px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Confidence
            </span>

            <span className="ml-2 font-bold text-foreground">
              {forecast.confidence}
            </span>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          {forecast.prediction}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Completion Outlook
            </p>

            <p className="mt-2 text-lg font-semibold">
  {currentProgress}% current
  <span className="mx-2 text-muted">→</span>
  {projectedProgress}% expected
</p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Expected Change
            </p>

            <p className="mt-2 text-lg font-bold">
              {progressGain > 0 ? `+${progressGain}%` : "No change"}
            </p>
          </div>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-surface-strong">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{
              width: `${Math.min(projectedProgress, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Current Position
          </p>

          <p className="mt-3 text-xl font-bold">
            {forecast.currentHealth}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted">
            {isNewWorkspace
              ? "No activity baseline exists yet. The first saved workspace item will establish the starting point for future forecasts."
              : `The workspace is currently ${currentProgress}% complete. This is the starting point used by the forecast.`}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Expected Position
          </p>

          <p className="mt-3 text-xl font-bold">
            {forecast.projectedHealth}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted">
            {isNewWorkspace
              ? "A projected position will appear after enough workspace activity has been recorded."
              : `The current rule-based projection places the workspace at ${projectedProgress}% completion.`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          What Happens Next
        </p>

        <ol className="mt-5 space-y-4">
          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-bold text-muted">
              1
            </span>

            <div>
              <p className="font-semibold">
                Current workspace state
              </p>

              <p className="mt-1 text-sm text-muted">
                Health is {forecast.currentHealth} at {currentProgress}%
                completion.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-bold text-muted">
              2
            </span>

            <div>
              <p className="font-semibold">
                {stepTwoTitle}
              </p>

              <p className="mt-1 text-sm text-muted">
                {stepTwoMessage}
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              3
            </span>

            <div>
              <p className="font-semibold">
                Projected workspace state
              </p>

              <p className="mt-1 text-sm text-muted">
                {projectedStateMessage}
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          Why We Believe This
        </p>

        <p className="mt-3 text-sm leading-6 text-muted">
          This outlook is generated from the current Workspace Intelligence
          pipeline and its deterministic forecasting rules. It describes the
          expected direction of the workspace, not a guaranteed outcome.
        </p>
      </div>
    </div>
  );
}