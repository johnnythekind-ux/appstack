import Card from "../../Card";
import type { WorkspaceHistory } from "../../../../lib/workspaceHistoryService";
import type { WorkspaceMetrics } from "../../../../lib/workspaceMetricsService";
import type { WorkspaceKnowledge } from "../../../../lib/workspaceKnowledgeService";

type WorkspaceMemoryProps = {
  workspaceHistory: WorkspaceHistory | null;
  workspaceMetrics: WorkspaceMetrics | null;
  workspaceKnowledge: WorkspaceKnowledge | null;
};

export default function WorkspaceMemory({
  workspaceHistory,
  workspaceMetrics,
  workspaceKnowledge,
}: WorkspaceMemoryProps) {
  function formatHistoryDate(date: string | null) {
    if (!date) {
      return "No activity";
    }

    return new Date(date).toLocaleString();
  }

  return (
    <Card title="Workspace Profile">
      {!workspaceKnowledge ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Workspace memory is loading...
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current State
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-50">
                {workspaceKnowledge.focus}
              </p>
            </div>

            {workspaceHistory && (
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Last Updated
                </p>

                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {formatHistoryDate(workspaceHistory.lastEventAt)}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
              {workspaceKnowledge.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Production Pattern
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {workspaceKnowledge.productionStatus}
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Execution Pattern
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {workspaceKnowledge.executionStatus}
              </p>
            </div>
          </div>

          <details className="overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/70">
            <summary className="cursor-pointer px-5 py-4 font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800">
              Explore workspace history
            </summary>

            <div className="border-t border-slate-300 p-5 dark:border-slate-700">
              {!workspaceHistory || !workspaceMetrics ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Workspace details are loading...
                </p>
              ) : (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                      Historical Activity
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Events</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceHistory.totalEvents}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Days Active</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceHistory.daysActive}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Trend</p>
                        <p className="mt-1 text-xl font-bold capitalize text-slate-950 dark:text-slate-50">
                          {workspaceHistory.activityTrend.replace("_", " ")}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Recent Activity
                        </p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {Math.round(workspaceMetrics.recentActivityShare * 100)}%
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="border-t border-slate-200 pt-8 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                      Production Measurements
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Events Per Day</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceMetrics.eventsPerDay}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Reports Per Analysis</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceMetrics.reportToAnalysisRatio}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Jobs Per Report</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceMetrics.jobToReportRatio}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Workspace Velocity</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceMetrics.workspaceVelocity}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="border-t border-slate-200 pt-8 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                      Recorded Outcomes
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-5">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Analyses</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceHistory.analysesCreated}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Reports</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceHistory.reportsGenerated}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Jobs</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceHistory.jobsCreated}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Duplicated</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceHistory.itemsDuplicated}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Deleted</p>
                        <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
                          {workspaceHistory.itemsDeleted}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </Card>
  );
}
