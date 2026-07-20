import { WorkspaceDirectorPlan } from "./workspaceDirectorService";
import { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import { WorkspacePriorityAction } from "./workspacePriorityService";

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

export function buildWorkspaceForecast(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[],
  directorPlan: WorkspaceDirectorPlan
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

  if (
    intelligence.totalItems > 0 &&
    intelligence.unknownItems === 0 &&
    remainingReports === 0 &&
    remainingJobs === 0 &&
    reportActions.length === 0
  ) {
    projectedHealth = "Healthy";
  } else if (intelligence.totalItems === 0) {
    projectedHealth = "Unknown";
  } else {
    projectedHealth = "Needs Attention";
  }

  let confidence: ForecastConfidence = "Moderate";

  if (priorityActions.length === 0) {
    confidence = "High";
  } else if (reviewActions.length > 0) {
    confidence = "Low";
  } else if (
    reportActions.length + jobActions.length === priorityActions.length
  ) {
    confidence = "High";
  }

  let prediction =
    "Completing today's visible actions should improve workspace progress.";

  if (priorityActions.length === 0) {
    prediction =
      "No immediate improvement is required because the workspace is currently stable.";
  } else if (projectedHealth === "Healthy") {
    prediction =
      "Completing today's visible actions is expected to move the workspace into a healthy state.";
  } else if (reportActions.length > 0) {
    prediction =
      "Generating the visible reports will advance analyzed items, but follow-up jobs will still be required.";
  } else if (reviewActions.length > 0) {
    prediction =
      "Completing the visible plan may improve progress, but reviewed items could require additional decisions.";
  } else if (directorPlan.estimatedMinutes > 0) {
    prediction =
      "Completing the visible job actions should increase healthy workspace items and reduce the current execution backlog.";
  }

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
