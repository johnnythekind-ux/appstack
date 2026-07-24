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
      <p className="text-slate-400">
        Forecast intelligence is still loading.
      </p>
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

  const isImproving =
    projectedProgress > currentProgress ||
    forecast.projectedHealth !== forecast.currentHealth;

  const isComplete = projectedProgress >= 100;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Workspace Forecast
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              {isComplete
                ? "The workspace is projected to reach full completion."
                : isImproving
                  ? "The workspace is projected to improve."
                  : "The workspace is expected to remain stable."}
            </h3>
          </div>

          <div className="rounded-full border border-slate-700 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confidence
            </span>
            <span className="ml-2 font-bold text-white">
              {forecast.confidence}
            </span>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          {forecast.prediction}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completion Outlook
            </p>

            <p className="mt-2 text-lg font-semibold">
              {currentProgress}% today
              <span className="mx-2 text-slate-600">→</span>
              {projectedProgress}% projected
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Expected Change
            </p>

            <p className="mt-2 text-lg font-bold">
              {progressGain > 0 ? `+${progressGain}%` : "No change"}
            </p>
          </div>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(projectedProgress, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Position
          </p>

          <p className="mt-3 text-xl font-bold">
            {forecast.currentHealth}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            The workspace is currently {currentProgress}% complete.
            This is the starting point used by the forecast.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Expected Position
          </p>

          <p className="mt-3 text-xl font-bold">
            {forecast.projectedHealth}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            The current rule-based projection places the workspace at{" "}
            {projectedProgress}% completion.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          What Happens Next
        </p>

        <ol className="mt-5 space-y-4">
          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 text-sm font-bold">
              1
            </span>

            <div>
              <p className="font-semibold">Current workspace state</p>
              <p className="mt-1 text-sm text-slate-400">
                Health is {forecast.currentHealth} at {currentProgress}%
                completion.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 text-sm font-bold">
              2
            </span>

            <div>
              <p className="font-semibold">Recommended work continues</p>
              <p className="mt-1 text-sm text-slate-400">
                AppStack evaluates how the current workspace should change
                as its unfinished work advances.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              3
            </span>

            <div>
              <p className="font-semibold">Projected workspace state</p>
              <p className="mt-1 text-sm text-slate-400">
                Health is expected to become {forecast.projectedHealth} at{" "}
                {projectedProgress}% completion.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Why We Believe This
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          This outlook is generated from the current Workspace Intelligence
          pipeline and its deterministic forecasting rules. It describes the
          expected direction of the workspace, not a guaranteed outcome.
        </p>
      </div>
    </div>
  );
}