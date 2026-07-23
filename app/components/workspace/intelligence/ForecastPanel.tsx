import type { WorkspaceForecast } from "../../../../lib/workspaceForecastService";

type ForecastPanelProps = {
  forecast: WorkspaceForecast | null;
};

export default function ForecastPanel({
  forecast,
}: ForecastPanelProps) {
  if (!forecast) {
    return (
      <p className="text-slate-400">
        Forecast intelligence is still loading.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Current</p>
          <p className="mt-2 text-xl font-bold">
            {forecast.currentHealth}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Projected</p>
          <p className="mt-2 text-xl font-bold">
            {forecast.projectedHealth}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Progress</p>
          <p className="mt-2 text-xl font-bold">
            {forecast.projectedProgress}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Confidence</p>
          <p className="mt-2 text-xl font-bold">
            {forecast.confidence}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-sm text-slate-400">Forecast</p>

        <p className="mt-2 text-lg font-semibold">
          {forecast.prediction}
        </p>

        <p className="mt-3 text-sm text-slate-500">
          Rule-based projection, not a guaranteed outcome.
        </p>
      </div>
    </div>
  );
}