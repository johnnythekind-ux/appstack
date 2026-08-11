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

  const isZeroRisk = risk.riskScore === 0;
  const isHighRisk = risk.overallRisk === "High";
  const isModerateRisk = risk.overallRisk === "Moderate";

  const riskMessage = isZeroRisk
    ? "No significant operational risks are currently affecting the workspace."
    : isHighRisk
      ? "Significant issues could interfere with successful workspace execution and should be addressed promptly."
      : isModerateRisk
        ? "The workspace can continue, but unresolved issues are creating meaningful operational exposure."
        : "Operational exposure is currently limited, but the workspace should continue to be monitored for changes.";

  const positionTitle = isZeroRisk
    ? "Current Risk Position"
    : "Greatest Threat";

  const positionMessage = isZeroRisk
  ? "No significant operational exposure is currently identified by the risk assessment."
  : "This is the highest-ranked risk currently identified by the deterministic Workspace Intelligence pipeline.";

  const factorsTitle = isZeroRisk
    ? "Current Safeguards"
    : "Risk Factors and Safeguards";

  const outlookTitle = isZeroRisk
    ? "Outlook"
    : "If Nothing Changes";

  const outlookMessage = isZeroRisk
    ? "If current conditions continue, operational risk is expected to remain low. New workspace activity will be evaluated for changes in health, completion, dependencies, and exposure."
    : isHighRisk
      ? "The identified issues may continue accumulating and could prevent the visible execution plan from producing the expected result."
      : isModerateRisk
        ? "If unresolved work continues, operational exposure may increase and begin affecting execution quality or sequencing."
        : "The workspace should remain relatively stable, although unresolved work may gradually increase operational exposure.";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              Executive Risk Brief
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              Overall Risk: {risk.overallRisk}
            </h3>
          </div>

          <div className="rounded-full border border-slate-700 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Risk Score
            </span>

            <span className="ml-2 font-bold text-white">
              {risk.riskScore}/100
            </span>
          </div>
        </div>

        <p className="mt-5 max-w-3xl leading-7 text-slate-400">
          {riskMessage}
        </p>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-red-500 transition-all duration-500"
            style={{
              width: `${Math.min(risk.riskScore, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {positionTitle}
        </p>

        <p className="mt-3 text-lg font-semibold">
          {risk.primaryRisk}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {positionMessage}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {factorsTitle}
        </p>

        <div className="mt-5 space-y-5">
          {risk.riskFactors.map((factor, index) => (
            <div
              key={`${factor}-${index}`}
              className="rounded-lg border border-slate-800 p-4"
            >
              <div className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 text-sm font-bold">
                  {index + 1}
                </span>

                <div>
                  <p className="font-semibold">
                    {factor}
                  </p>

                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {isZeroRisk ? "Monitoring Guidance" : "Safeguard"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {risk.safeguards[index] ??
                      "Continue monitoring the workspace and recalculate risk after new activity."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {outlookTitle}
        </p>

        <p className="mt-4 leading-7 text-slate-400">
          {outlookMessage}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assessment Confidence
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Confidence in the current risk assessment.
            </p>
          </div>

          <span className="font-bold">
            {risk.confidence}
          </span>
        </div>
      </div>
    </div>
  );
}
