import StatusBadge from "../../StatusBadge";
import type {
  WorkspaceInsight,
  WorkspaceInsights,
} from "../../../../lib/workspaceInsightsService";

type InsightsPanelProps = {
  insights: WorkspaceInsights | null;
};

function getSeverityLabel(
  severity: WorkspaceInsight["severity"]
) {
  if (severity === "Critical") {
    return "Immediate Attention";
  }

  if (severity === "High") {
    return "High Priority";
  }

  if (severity === "Medium") {
    return "Worth Monitoring";
  }

  return "Opportunity";
}

function getMeaning(
  insight: WorkspaceInsight
) {
  if (insight.type === "Constraint") {
    return "This condition is limiting workspace progress and should be addressed before lower-impact work.";
  }

  if (insight.type === "Imbalance") {
    return "One stage of the workflow is accumulating faster than another, creating uneven operational pressure.";
  }

  if (insight.type === "Opportunity") {
    return "The workspace contains favorable conditions that can be used to create immediate progress.";
  }

  return "This recurring pattern helps explain how work is currently moving through the workspace.";
}

function getRecommendedResponse(
  insight: WorkspaceInsight
) {
  if (insight.type === "Constraint") {
    return "Reduce this constraint before adding more work to dependent stages.";
  }

  if (insight.type === "Imbalance") {
    return "Rebalance the workflow by directing attention toward the stage that is falling behind.";
  }

  if (insight.type === "Opportunity") {
    return "Act on this advantage while the work remains clearly actionable.";
  }

  return "Continue monitoring this pattern and recalculate intelligence after new workspace activity.";
}

export default function InsightsPanel({
  insights,
}: InsightsPanelProps) {
  if (!insights) {
    return (
      <p className="text-slate-400">
        Insights are still loading.
      </p>
    );
  }

  const highestPriorityInsight = insights.insights[0];
  const remainingInsights = insights.insights.slice(1);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          Executive Insight Brief
        </p>

        <h3 className="mt-4 max-w-4xl text-2xl font-bold">
          {insights.headline}
        </h3>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Workspace Intelligence reviewed current workflow stages,
          visible priority actions, and operational imbalances to identify
          the patterns most likely to affect progress.
        </p>
      </div>

      {highestPriorityInsight && (
        <div className="rounded-2xl border border-slate-700 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Highest-Priority Observation
              </p>

              <h3 className="mt-3 text-xl font-bold">
                {highestPriorityInsight.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                {getSeverityLabel(
                  highestPriorityInsight.severity
                )}
              </span>

              <StatusBadge
                status={highestPriorityInsight.type}
              />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                What the System Noticed
              </p>

              <p className="mt-2 leading-7 text-slate-300">
                {highestPriorityInsight.explanation}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Why It Matters
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {getMeaning(highestPriorityInsight)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recommended Response
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {getRecommendedResponse(
                  highestPriorityInsight
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {remainingInsights.length > 0 && (
        <div className="rounded-xl border border-slate-800 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ranked Workspace Observations
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Additional patterns ranked by operational significance.
              </p>
            </div>

            <span className="text-sm font-semibold text-slate-400">
              {remainingInsights.length} additional
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {remainingInsights.map((insight, index) => (
              <div
                key={`${insight.title}-${index}`}
                className="rounded-xl border border-slate-800 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 text-sm font-bold">
                      {index + 2}
                    </span>

                    <div>
                      <p className="font-semibold">
                        {insight.title}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {insight.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-400">
                      {getSeverityLabel(insight.severity)}
                    </span>

                    <StatusBadge status={insight.type} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-800 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Why It Matters
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {getMeaning(insight)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Recommended Response
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {getRecommendedResponse(insight)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          How to Read These Insights
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Constraints and imbalances deserve attention first.
          Opportunities identify work that can advance immediately.
          Patterns explain recurring workspace behavior and should be
          monitored as new events enter the intelligence pipeline.
        </p>
      </div>
    </div>
  );
}