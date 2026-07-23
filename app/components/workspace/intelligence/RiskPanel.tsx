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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">
            Overall Risk
          </p>

          <p className="mt-2 text-xl font-bold">
            {risk.overallRisk}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">
            Risk Score
          </p>

          <p className="mt-2 text-xl font-bold">
            {risk.riskScore}/100
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">
            Confidence
          </p>

          <p className="mt-2 text-xl font-bold">
            {risk.confidence}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-sm text-slate-400">
          Primary Risk
        </p>

        <p className="mt-2 text-lg font-semibold">
          {risk.primaryRisk}
        </p>
      </div>
    </div>
  );
}