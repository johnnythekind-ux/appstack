import type { WorkspaceDirectorPlan } from "./workspaceDirectorService";
import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspaceKnowledge } from "./workspaceKnowledgeService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";

export type ForecastConfidence = "High" | "Moderate" | "Low";

export type WorkspaceForecast = {
  title: string;
  currentHealth: WorkspaceIntelligence["workspaceHealth"];
  projectedHealth: WorkspaceIntelligence["workspaceHealth"];
  currentProgress: number;
  projectedProgress: number;
  progressGain: number;
  projectedResolvedActions: number;
  confidence: ForecastConfidence;
  prediction: string;
};

function determineForecastConfidence(
  priorityActions: WorkspacePriorityAction[],
  reviewActionCount: number,
  knowledge?: WorkspaceKnowledge
): ForecastConfidence {
  if (priorityActions.length === 0) {
    return "High";
  }

  if (reviewActionCount > 0) {
    return "Low";
  }

  const allActionsAreExecutable = priorityActions.every(
    (action) =>
      action.actionType === "generate_report" ||
      action.actionType === "create_job"
  );

  if (!allActionsAreExecutable) {
    return "Moderate";
  }

  if (
    knowledge &&
    knowledge.recentActivityStatus ===
      "There has been no recent workspace activity."
  ) {
    return "Moderate";
  }

  return "High";
}

function buildForecastPrediction({
  priorityActionCount,
  reportActionCount,
  reviewActionCount,
  projectedHealth,
  estimatedMinutes,
  knowledge,
}: {
  priorityActionCount: number;
  reportActionCount: number;
  reviewActionCount: number;
  projectedHealth: WorkspaceIntelligence["workspaceHealth"];
  estimatedMinutes: number;
  knowledge?: WorkspaceKnowledge;
}): string {
  if (priorityActionCount === 0) {
    return "No immediate improvement is required because the workspace is currently stable.";
  }

  if (projectedHealth === "Healthy") {
    return "Completing today's visible actions is expected to move the workspace into a healthy state.";
  }

  if (reportActionCount > 0) {
    return "Generating the visible reports will advance analyzed items, but follow-up jobs will still be required.";
  }

  if (reviewActionCount > 0) {
    return "Completing the visible plan may improve progress, but reviewed items could require additional decisions.";
  }

  if (
    knowledge?.focus === "Execution" &&
    estimatedMinutes > 0
  ) {
    return "The workspace is execution-focused. Completing the visible job actions should increase healthy items and reduce the current backlog.";
  }

  if (estimatedMinutes > 0) {
    return "Completing the visible job actions should increase healthy workspace items and reduce the current execution backlog.";
  }

  return "Completing today's visible actions should improve workspace progress.";
}

export function buildWorkspaceForecast(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[],
  directorPlan: WorkspaceDirectorPlan,
  knowledge?: WorkspaceKnowledge
): WorkspaceForecast {
  const reportActions = priorityActions.filter(
    (action) => action.actionType === "generate_report"
  );

  const jobActions = priorityActions.filter(
    (action) => action.actionType === "create_job"
  );

  const reviewActions = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const projectedResolvedActions =
    reportActions.length + jobActions.length;

  const projectedHealthyItems = Math.min(
    intelligence.totalItems,
    intelligence.healthyItems + jobActions.length
  );

  const projectedProgress =
    intelligence.totalItems === 0
      ? 0
      : Math.round(
          (projectedHealthyItems / intelligence.totalItems) * 100
        );

  const progressGain = Math.max(
    0,
    projectedProgress - intelligence.progressPercent
  );

  const remainingReports = Math.max(
    0,
    intelligence.needsReports - reportActions.length
  );

  const remainingJobs = Math.max(
    0,
    intelligence.needsJobs - jobActions.length
  );

  let projectedHealth: WorkspaceIntelligence["workspaceHealth"] =
    intelligence.workspaceHealth;

  if (intelligence.totalItems === 0) {
    projectedHealth = "Unknown";
  } else if (
    intelligence.unknownItems === 0 &&
    remainingReports === 0 &&
    remainingJobs === 0 &&
    reportActions.length === 0
  ) {
    projectedHealth = "Healthy";
  } else {
    projectedHealth = "Needs Attention";
  }

  const confidence = determineForecastConfidence(
    priorityActions,
    reviewActions.length,
    knowledge
  );

  const prediction = buildForecastPrediction({
    priorityActionCount: priorityActions.length,
    reportActionCount: reportActions.length,
    reviewActionCount: reviewActions.length,
    projectedHealth,
    estimatedMinutes: directorPlan.estimatedMinutes,
    knowledge,
  });

  return {
    title: "Workspace Forecast",
    currentHealth: intelligence.workspaceHealth,
    projectedHealth,
    currentProgress: intelligence.progressPercent,
    projectedProgress,
    progressGain,
    projectedResolvedActions,
    confidence,
    prediction,
  };
}