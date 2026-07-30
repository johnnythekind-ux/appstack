import type { WorkspaceHistory } from "./workspaceHistoryService";
import type { WorkspaceMetrics } from "./workspaceMetricsService";

export type WorkspaceFocus =
  | "No Activity"
  | "Analysis"
  | "Reporting"
  | "Execution"
  | "Balanced";

export type WorkspaceKnowledge = {
  focus: WorkspaceFocus;
  activityStatus: string;
  productionStatus: string;
  executionStatus: string;
  recentActivityStatus: string;
  summary: string;
};

function determineWorkspaceFocus(
  history: WorkspaceHistory
): WorkspaceFocus {
  const {
    analysesCreated,
    reportsGenerated,
    jobsCreated,
  } = history;

  if (
    analysesCreated === 0 &&
    reportsGenerated === 0 &&
    jobsCreated === 0
  ) {
    return "No Activity";
  }

  const highestCount = Math.max(
    analysesCreated,
    reportsGenerated,
    jobsCreated
  );

  const highestTypes = [
    analysesCreated === highestCount,
    reportsGenerated === highestCount,
    jobsCreated === highestCount,
  ].filter(Boolean).length;

  if (highestTypes > 1) {
    return "Balanced";
  }

  if (analysesCreated === highestCount) {
    return "Analysis";
  }

  if (reportsGenerated === highestCount) {
    return "Reporting";
  }

  return "Execution";
}

function describeActivity(
  metrics: WorkspaceMetrics
): string {
  if (metrics.workspaceVelocity === "No Activity") {
    return "The workspace has no measurable activity.";
  }

  if (metrics.workspaceVelocity === "Slow") {
    return "The workspace is moving slowly.";
  }

  if (metrics.workspaceVelocity === "Moderate") {
    return "The workspace is moving at a moderate pace.";
  }

  return "The workspace is moving quickly.";
}

function describeProduction(
  metrics: WorkspaceMetrics
): string {
  if (metrics.reportToAnalysisRatio === 0) {
    return "No reports have been recorded relative to the analyses created.";
  }

  if (metrics.reportToAnalysisRatio < 1) {
    return "Fewer reports than analyses have been recorded.";
  }

  if (metrics.reportToAnalysisRatio === 1) {
    return "Reports and analyses have been recorded in equal numbers.";
  }

  return "More reports than analyses have been recorded.";
}

function describeExecution(
  metrics: WorkspaceMetrics
): string {
  if (metrics.jobToReportRatio === 0) {
    return "No execution jobs have been recorded relative to the reports generated.";
  }

  if (metrics.jobToReportRatio < 1) {
    return "Fewer execution jobs than reports have been recorded.";
  }

  if (metrics.jobToReportRatio === 1) {
    return "Execution jobs and reports have been recorded in equal numbers.";
  }

  return "More execution jobs than reports have been recorded.";
}

function describeRecentActivity(
  metrics: WorkspaceMetrics
): string {
  if (metrics.recentActivityShare === 0) {
    return "There has been no recent workspace activity.";
  }

  if (metrics.recentActivityShare < 0.2) {
    return "Only a small share of workspace activity is recent.";
  }

  if (metrics.recentActivityShare < 0.5) {
    return "A moderate share of workspace activity is recent.";
  }

  return "Most workspace activity is recent.";
}

function buildKnowledgeSummary(
  focus: WorkspaceFocus,
  activityStatus: string,
  recentActivityStatus: string
): string {
  if (focus === "No Activity") {
    return "The workspace does not yet contain enough activity to establish an operational pattern.";
  }

  return `The workspace is primarily focused on ${focus.toLowerCase()}. ${activityStatus} ${recentActivityStatus}`;
}

export function buildWorkspaceKnowledge(
  history: WorkspaceHistory,
  metrics: WorkspaceMetrics
): WorkspaceKnowledge {
  const focus = determineWorkspaceFocus(history);
  const activityStatus = describeActivity(metrics);
  const productionStatus = describeProduction(metrics);
  const executionStatus = describeExecution(metrics);
  const recentActivityStatus =
    describeRecentActivity(metrics);

  return {
    focus,
    activityStatus,
    productionStatus,
    executionStatus,
    recentActivityStatus,
    summary: buildKnowledgeSummary(
      focus,
      activityStatus,
      recentActivityStatus
    ),
  };
}