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
  const actionableItems = priorityActions.filter(
    (action) =>
      action.actionType === "generate_report" ||
      action.actionType === "create_job"
  );

  const reviewItems = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const projectedResolvedActions = priorityActions.length;

  const projectedHealthyItems = Math.min(
    intelligence.totalItems,
    intelligence.healthyItems + actionableItems.length
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

  let projectedHealth: WorkspaceIntelligence["workspaceHealth"] =
    intelligence.workspaceHealth;

  if (
    intelligence.totalItems > 0 &&
    intelligence.unknownItems === 0 &&
    intelligence.needsReports <= actionableItems.length &&
    intelligence.needsJobs <= actionableItems.length
  ) {
    projectedHealth = "Healthy";
  }

  let confidence: ForecastConfidence = "Moderate";

  if (priorityActions.length === 0) {
    confidence = "High";
  } else if (reviewItems.length > actionableItems.length) {
    confidence = "Low";
  }

  let prediction =
    "Completing today's plan should improve workspace progress.";

  if (priorityActions.length === 0) {
    prediction =
      "No immediate improvement is required because the workspace is currently stable.";
  } else if (projectedHealth === "Healthy") {
    prediction =
      "Completing today's plan is expected to move the workspace into a healthy state.";
  } else if (reviewItems.length > 0) {
    prediction =
      "Completing today's plan should improve progress, but reviewed items may require additional decisions.";
  } else if (directorPlan.estimatedMinutes > 0) {
    prediction =
      "Completing the available actions should reduce the current workspace bottleneck.";
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