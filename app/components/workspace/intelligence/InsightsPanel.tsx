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
    return "This condition strengthens the workspace's operational picture and can support more reliable downstream decisions.";
  }

  return "This recurring pattern helps explain how work is moving through the workspace and provides context for future changes.";
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
    return "Maintain this structured workflow state and continue capturing new activity so the intelligence layer can detect meaningful changes.";
  }

  return "Continue monitoring this pattern and recalculate intelligence after new workspace activity.";
}

function shouldShowSeverityBadge(
  insight: WorkspaceInsight
) {
  return getSeverityLabel(insight.severity) !== insight.type;
}

export default function InsightsPanel({
  insights,
}: InsightsPanelProps) {
  if (!insights) {
    return (
      <p className="text-muted">
        Insights are still loading.
      </p>
    );
  }

  const highestPriorityInsight = insights.insights[0];
  const remainingInsights = insights.insights.slice(1);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          Executive Insight Brief
        </p>

        <h3 className="mt-4 max-w-4xl text-2xl font-bold">
          {insights.headline}
        </h3>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          Workspace Intelligence reviewed workflow stages, priority actions,
          and operational patterns to surface the observations most useful
          for understanding the workspace's current position.
        </p>
      </div>

      {highestPriorityInsight && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Highest-Priority Observation
              </p>

              <h3 className="mt-3 text-xl font-bold">
                {highestPriorityInsight.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {shouldShowSeverityBadge(highestPriorityInsight) && (
                <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
                  {getSeverityLabel(
                    highestPriorityInsight.severity
                  )}
                </span>
              )}

              <StatusBadge
                status={highestPriorityInsight.type}
              />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                What the System Noticed
              </p>

              <p className="mt-2 leading-7 text-muted">
                {highestPriorityInsight.explanation}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Why It Matters
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                {getMeaning(highestPriorityInsight)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Recommended Response
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                {getRecommendedResponse(
                  highestPriorityInsight
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {remainingInsights.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Ranked Workspace Observations
              </p>

              <p className="mt-2 text-sm text-muted">
                Additional patterns ranked by operational significance.
              </p>
            </div>

            <span className="text-sm font-semibold text-muted">
              {remainingInsights.length} additional
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {remainingInsights.map((insight, index) => (
              <div
                key={`${insight.title}-${index}`}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-bold text-muted">
                      {index + 2}
                    </span>

                    <div>
                      <p className="font-semibold">
                        {insight.title}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted">
                        {insight.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {shouldShowSeverityBadge(insight) && (
                      <span className="rounded-full border border-border-strong px-3 py-1 text-xs font-semibold text-muted">
                        {getSeverityLabel(insight.severity)}
                      </span>
                    )}

                    <StatusBadge status={insight.type} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                      Why It Matters
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted">
                      {getMeaning(insight)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                      Recommended Response
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted">
                      {getRecommendedResponse(insight)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
          How to Read These Insights
        </p>

        <p className="mt-3 text-sm leading-6 text-muted">
          Constraints and imbalances deserve attention first. Opportunities
          identify favorable operating conditions worth preserving. Patterns
          explain recurring workspace behavior and should be monitored as new
          events enter the intelligence pipeline.
        </p>
      </div>
    </div>
  );
}
