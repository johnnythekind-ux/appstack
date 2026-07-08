import { WorkspaceAnalysis } from "./analysisService";

export type WorkspaceIntelligence = {
  totalItems: number;
  needsReports: number;
  needsJobs: number;
  healthyItems: number;
  unknownItems: number;
  workspaceHealth: "Healthy" | "Needs Attention" | "Unknown";
  primaryBottleneck: string;
  recommendedAction: string;
  progressPercent: number;
};

export function analyzeWorkspace(
  workspaceAnalyses: WorkspaceAnalysis[]
): WorkspaceIntelligence {
  const totalItems = workspaceAnalyses.length;

  const needsReports = workspaceAnalyses.filter(
    (analysis) => analysis.stage === "Analysis"
  ).length;

  const needsJobs = workspaceAnalyses.filter(
    (analysis) => analysis.stage === "Reporting"
  ).length;

  const healthyItems = workspaceAnalyses.filter(
    (analysis) => analysis.health === "Healthy"
  ).length;

  const unknownItems = workspaceAnalyses.filter(
    (analysis) => analysis.stage === "Unknown"
  ).length;

  const progressPercent =
    totalItems === 0 ? 0 : Math.round((healthyItems / totalItems) * 100);

  let workspaceHealth: WorkspaceIntelligence["workspaceHealth"] = "Healthy";
  let primaryBottleneck = "None";
  let recommendedAction = "Continue monitoring workspace activity.";

  if (totalItems === 0) {
    workspaceHealth = "Unknown";
    primaryBottleneck = "No workspace items";
    recommendedAction = "Create or save your first workspace item.";
  } else if (unknownItems > 0) {
    workspaceHealth = "Needs Attention";
    primaryBottleneck = "Unknown items";
    recommendedAction = "Review items with no clear activity history.";
  } else if (needsReports > 0) {
    workspaceHealth = "Needs Attention";
    primaryBottleneck = "Reports needed";
    recommendedAction = "Generate investor reports for analyzed deals.";
  } else if (needsJobs > 0) {
    workspaceHealth = "Needs Attention";
    primaryBottleneck = "Jobs needed";
    recommendedAction = "Create execution jobs for completed reports.";
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