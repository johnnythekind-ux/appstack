import type { WorkspaceStrategy } from "../../../../lib/workspaceStrategyService";

type StrategyPanelProps = {
  strategy: WorkspaceStrategy | null;
};

export default function StrategyPanel({
  strategy,
}: StrategyPanelProps) {
  if (!strategy) {
    return (
      <p className="text-slate-400">
        Strategy intelligence is still loading.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Strategic Focus
          </p>

          <p className="mt-2 text-xl font-bold">
            {strategy.strategicFocus}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-sm text-slate-400">
            Confidence
          </p>

          <p className="mt-2 text-xl font-bold">
            {strategy.strategyConfidence}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Execution Order
        </p>

        <ol className="mt-4 space-y-3">
          {strategy.executionOrder.map((step, index) => (
            <li
              key={`${step}-${index}`}
              className="flex gap-3"
            >
              <span className="font-bold">
                {index + 1}.
              </span>

              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}