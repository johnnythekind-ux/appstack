import type { WorkspaceRisk } from "../../../../lib/workspaceRiskService";

type RiskPanelProps = {
  risk: WorkspaceRisk | null;
};

export default function RiskPanel({
  risk,
}: RiskPanelProps) {
  if (!risk) {
    return (
      <p className="text-slate-400">
        Risk intelligence is still loading.
      </p>
    );
  }

  const severe = risk.overallRisk === "High";

  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
          Executive Risk Brief
        </p>

        <h3 className="mt-4 text-2xl font-bold">
          Overall Risk: {risk.overallRisk}
        </h3>

        <p className="mt-5 leading-7 text-slate-400">
          The workspace is currently operating at a {risk.overallRisk.toLowerCase()} risk level. The primary risk identified by the intelligence pipeline is "{risk.primaryRisk}".
        </p>

      </div>

      <div className="rounded-xl border border-slate-800 p-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Current Exposure
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          This assessment represents the current operational exposure
          of the workspace. It reflects the deterministic intelligence
          pipeline after evaluating workspace health, completion
          progress, priorities, and execution state.
        </p>

      </div>

      <div className="rounded-xl border border-slate-800 p-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Greatest Threat
        </p>

        <div className="mt-4 rounded-lg border border-slate-700 p-4">

          <p className="font-semibold">
            {risk.primaryRisk}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            This issue currently represents the largest source of
            uncertainty inside the workspace.
          </p>

        </div>

      </div>

      <div className="rounded-xl border border-slate-800 p-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          If Nothing Changes
        </p>

        <p className="mt-4 leading-7 text-slate-400">

          {severe
            ? "The workspace is expected to accumulate additional execution risk until the primary issue is addressed."
            : "The workspace is expected to remain relatively stable, although unresolved work may gradually increase operational risk."
          }

        </p>

      </div>

      <div className="rounded-xl border border-slate-800 p-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Risk Reduction
        </p>

        <div className="mt-4 rounded-lg bg-slate-900 p-4">

          <p className="font-semibold">
            Focus on resolving the primary risk: {risk.primaryRisk}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            This recommendation is expected to reduce the largest
            measurable source of workspace risk first.
          </p>

        </div>

      </div>

      <div className="rounded-xl border border-slate-800 p-5">

        <div className="flex items-center justify-between">

          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Confidence
          </span>

          <span className="font-bold">
            {risk.confidence}
          </span>

        </div>

      </div>

    </div>
  );
}