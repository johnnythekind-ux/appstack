type WorkspaceStatsProps = {
  analysesCount: number;
  reportsCount: number;
  jobsCount: number;
  progressPercent: number;
  workspaceHealth: string;
};

export default function WorkspaceStats({
  analysesCount,
  reportsCount,
  jobsCount,
  progressPercent,
  workspaceHealth,
}: WorkspaceStatsProps) {
  const statCardClass =
    "rounded-xl border border-border bg-surface p-4 shadow-sm";

  const labelClass =
    "text-xs font-semibold uppercase tracking-wider text-subtle";

  const valueClass =
    "mt-2 text-2xl font-bold text-foreground";

  return (
    <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div className={statCardClass}>
        <p className={labelClass}>
          Analyses
        </p>

        <p className={valueClass}>
          {analysesCount}
        </p>
      </div>

      <div className={statCardClass}>
        <p className={labelClass}>
          Reports
        </p>

        <p className={valueClass}>
          {reportsCount}
        </p>
      </div>

      <div className={statCardClass}>
        <p className={labelClass}>
          Jobs
        </p>

        <p className={valueClass}>
          {jobsCount}
        </p>
      </div>

      <div className={statCardClass}>
        <p className={labelClass}>
          Progress
        </p>

        <p className={valueClass}>
          {progressPercent}%
        </p>
      </div>

      <div className={`col-span-2 lg:col-span-1 ${statCardClass}`}>
        <p className={labelClass}>
          Health
        </p>

        <p className={valueClass}>
          {workspaceHealth}
        </p>
      </div>
    </section>
  );
}
