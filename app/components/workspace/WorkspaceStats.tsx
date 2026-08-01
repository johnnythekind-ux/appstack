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
  return (
    <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Analyses
        </p>

        <p className="mt-2 text-2xl font-bold">
          {analysesCount}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Reports
        </p>

        <p className="mt-2 text-2xl font-bold">
          {reportsCount}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Jobs
        </p>

        <p className="mt-2 text-2xl font-bold">
          {jobsCount}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Progress
        </p>

        <p className="mt-2 text-2xl font-bold">
          {progressPercent}%
        </p>
      </div>

      <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 lg:col-span-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Health
        </p>

        <p className="mt-2 text-2xl font-bold">
          {workspaceHealth}
        </p>
      </div>
    </section>
  );
}