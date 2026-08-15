import { WorkspaceAnalysis } from "./analysisService";

export type WorkspaceIntelligence = {
  totalItems: number;
  needsReports: number;
  needsJobs: number;
  healthyItems: number;
  unknownItems: number;
  workspaceHealth: "Healthy" | "Needs Attention" | "Unknown" | "New";
  primaryBottleneck: string;
  recommendedAction: string;
  progressPercent: number;
};

export function analyzeWorkspace(
  workspaceAnalyses: WorkspaceAnalysis[]
): WorkspaceIntelligence {
  const totalItems = workspaceAnalyses.length;

  const needsReports = workspaceAnalyses.filter(
    (analysis) =>
      analysis.itemType === "analysis" &&
      analysis.stage === "Analysis" &&
      analysis.health !== "Healthy"
  ).length;

  const needsJobs = workspaceAnalyses.filter(
    (analysis) =>
      analysis.itemType === "report" &&
      analysis.stage === "Reporting" &&
      analysis.health !== "Healthy"
  ).length;

  const pendingTasks = workspaceAnalyses.filter(
    (analysis) =>
      analysis.itemType === "task" &&
      analysis.itemStatus?.toLowerCase() !== "completed"
  ).length;

  const healthyItems = workspaceAnalyses.filter(
    (analysis) => analysis.health === "Healthy"
  ).length;

  const unknownItems = workspaceAnalyses.filter(
    (analysis) =>
      analysis.stage === "Unknown" &&
      analysis.health !== "Healthy"
  ).length;

  const unresolvedItems =
    needsReports +
    needsJobs +
    pendingTasks +
    unknownItems;

  const completedItems = Math.max(
    0,
    totalItems - unresolvedItems
  );

  const progressPercent =
    totalItems === 0
      ? 0
      : unresolvedItems === 0
        ? 100
        : Math.min(
            99,
            Math.round(
              (completedItems / totalItems) * 100
            )
          );

  let workspaceHealth: WorkspaceIntelligence["workspaceHealth"] =
    "Healthy";
  let primaryBottleneck = "None";
  let recommendedAction =
    "Continue monitoring workspace activity.";

  if (totalItems === 0) {
    workspaceHealth = "New";
    primaryBottleneck = "None";
    recommendedAction =
      "Create or save your first workspace item.";
  } else if (unknownItems > 0) {
    workspaceHealth = "Needs Attention";
    primaryBottleneck = "Unknown items";
    recommendedAction =
      "Review items with no clear activity history.";
  } else if (needsReports > 0) {
    workspaceHealth = "Needs Attention";
    primaryBottleneck = "Reports needed";
    recommendedAction =
      "Generate investor reports for analyzed deals.";
  } else if (needsJobs > 0) {
    workspaceHealth = "Needs Attention";
    primaryBottleneck = "Jobs needed";
    recommendedAction =
      "Create execution jobs for completed reports.";
  } else if (pendingTasks > 0) {
    workspaceHealth = "Needs Attention";
    primaryBottleneck = "Tasks pending";
    recommendedAction =
      pendingTasks === 1
        ? "Complete the pending workspace task."
        : `Complete the ${pendingTasks} pending workspace tasks.`;
  }

  return {
    totalItems,
    needsReports,
    needsJobs,
    healthyItems,
    unknownItems,
    workspaceHealth,
    primaryBottleneck,
    recommendedAction,
    progressPercent,
  };
}
