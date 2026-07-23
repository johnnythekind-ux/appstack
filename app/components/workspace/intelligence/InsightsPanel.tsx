import StatusBadge from "../../StatusBadge";
import type { WorkspaceInsights } from "../../../../lib/workspaceInsightsService";

type InsightsPanelProps = {
  insights: WorkspaceInsights | null;
};

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

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-sm text-slate-400">
          Headline
        </p>

        <p className="mt-2 text-xl font-bold">
          {insights.headline}
        </p>
      </div>

      {insights.insights.map((insight, index) => (
        <div
          key={`${insight.title}-${index}`}
          className="rounded-xl border border-slate-800 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">
                {insight.title}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {insight.explanation}
              </p>
            </div>

            <StatusBadge status={insight.type} />
          </div>
        </div>
      ))}
    </div>
  );
}