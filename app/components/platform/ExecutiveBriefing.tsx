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
    <section className="mb-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Executive Briefing
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {status.mission}
          </h2>

          <p className="mt-2 text-sm text-muted">
            Current platform mission
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm lg:grid-cols-4">
          <div>
            <p className="text-subtle">
              Health
            </p>

            <p className="mt-1 font-semibold text-foreground">
              {status.health}
            </p>
          </div>

          <div>
            <p className="text-subtle">
              Priority Actions
            </p>

            <p className="mt-1 font-semibold text-foreground">
              {status.priorityCount}
            </p>
          </div>

          <div>
            <p className="text-subtle">
              Progress
            </p>

            <p className="mt-1 font-semibold text-foreground">
              {safeProgress}%
            </p>
          </div>

          <div>
            <p className="text-subtle">
              Last Updated
            </p>

            <p className="mt-1 font-semibold text-foreground">
              {status.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{
              width: `${safeProgress}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}