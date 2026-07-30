import type { WorkspaceHistory } from "./workspaceHistoryService";

export type WorkspaceVelocity =
  | "No Activity"
  | "Slow"
  | "Moderate"
  | "Fast";

export type WorkspaceMetrics = {
  eventsPerDay: number;
  analysesPerDay: number;
  reportsPerDay: number;
  jobsPerDay: number;

  reportToAnalysisRatio: number;
  jobToReportRatio: number;

  recentActivityShare: number;
  workspaceVelocity: WorkspaceVelocity;
};

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

function safeDivide(
  numerator: number,
  denominator: number
): number {
  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function determineWorkspaceVelocity(
  eventsPerDay: number
): WorkspaceVelocity {
  if (eventsPerDay === 0) {
    return "No Activity";
  }

  if (eventsPerDay < 1) {
    return "Slow";
  }

  if (eventsPerDay < 3) {
    return "Moderate";
  }

  return "Fast";
}

export function buildWorkspaceMetrics(
  history: WorkspaceHistory
): WorkspaceMetrics {
  const activeDays = Math.max(history.daysActive, 1);

  const eventsPerDay = safeDivide(
    history.totalEvents,
    activeDays
  );

  const analysesPerDay = safeDivide(
    history.analysesCreated,
    activeDays
  );

  const reportsPerDay = safeDivide(
    history.reportsGenerated,
    activeDays
  );

  const jobsPerDay = safeDivide(
    history.jobsCreated,
    activeDays
  );

  const reportToAnalysisRatio = safeDivide(
    history.reportsGenerated,
    history.analysesCreated
  );

  const jobToReportRatio = safeDivide(
    history.jobsCreated,
    history.reportsGenerated
  );

  const recentActivityShare = safeDivide(
    history.recentEventCount,
    history.totalEvents
  );

  return {
    eventsPerDay: roundMetric(eventsPerDay),
    analysesPerDay: roundMetric(analysesPerDay),
    reportsPerDay: roundMetric(reportsPerDay),
    jobsPerDay: roundMetric(jobsPerDay),

    reportToAnalysisRatio: roundMetric(
      reportToAnalysisRatio
    ),

    jobToReportRatio: roundMetric(
      jobToReportRatio
    ),

    recentActivityShare: roundMetric(
      recentActivityShare
    ),

    workspaceVelocity:
      determineWorkspaceVelocity(eventsPerDay),
  };
}