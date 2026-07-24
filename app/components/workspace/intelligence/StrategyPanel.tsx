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
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Strategic Brief
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              {strategy.strategicFocus}
            </h3>
          </div>

          <div className="rounded-full border border-slate-700 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confidence
            </span>

            <span className="ml-2 font-bold text-white">
              {strategy.strategyConfidence}
            </span>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
          The current strategy identifies the highest-leverage sequence of
          work while deliberately postponing actions that could create
          unnecessary friction or dependency problems.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Primary Bottleneck
        </p>

        <p className="mt-3 text-lg font-semibold">
          {strategy.bottleneckExplanation}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          This bottleneck is the constraint currently shaping the recommended
          execution order.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recommended Sequence
        </p>

        <ol className="mt-5 space-y-4">
          {strategy.executionOrder.map((action, index) => (
            <li
              key={`${action}-${index}`}
              className="flex gap-4 rounded-lg border border-slate-800 p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {index + 1}
              </span>

              <div>
                <p className="font-semibold">
                  {action}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Complete this stage before advancing to lower-priority work.
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          What Should Wait
        </p>

        <div className="mt-5 space-y-4">
          {strategy.delayActions.map((action, index) => (
            <div
              key={`${action}-${index}`}
              className="flex gap-4 rounded-lg border border-slate-800 p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 text-sm font-bold">
                {index + 1}
              </span>

              <p className="text-sm leading-6 text-slate-300">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Strategic Tradeoff
        </p>

        <p className="mt-3 leading-7 text-slate-400">
          {strategy.tradeoffExplanation}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Expected Result
        </p>

        <p className="mt-3 leading-7 text-slate-400">
          Following this order should reduce the current bottleneck, preserve
          workflow dependencies, and improve the quality of the next
          Workspace Intelligence calculation.
        </p>
      </div>
    </div>
  );
}