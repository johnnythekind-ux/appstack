"use client";

export type ExecutiveBriefingModel = {
  health: string;
  mission: string;
  priorityCount: number;
  progress: number;
  lastUpdated: string;
};

type ExecutiveBriefingProps = {
  status: ExecutiveBriefingModel;
};

export default function ExecutiveBriefing({
  status,
}: ExecutiveBriefingProps) {
  const safeProgress = Math.min(
    100,
    Math.max(0, status.progress)
  );

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Executive Briefing
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {status.mission}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Current platform mission
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm lg:grid-cols-4">
          <div>
            <p className="text-slate-500">
              Health
            </p>

            <p className="mt-1 font-semibold text-white">
              {status.health}
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Priority Actions
            </p>

            <p className="mt-1 font-semibold text-white">
              {status.priorityCount}
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Progress
            </p>

            <p className="mt-1 font-semibold text-white">
              {safeProgress}%
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Last Updated
            </p>

            <p className="mt-1 font-semibold text-white">
              {status.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${safeProgress}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}