import { WorkspaceAnalysis } from "./analysisService";

export type WorkspaceIntelligence = {
  totalItems: number;
  needsReports: number;
  needsJobs: number;
  healthyItems: number;
  unknownItems: number;
};

export function analyzeWorkspace(
  workspaceAnalyses: WorkspaceAnalysis[]
): WorkspaceIntelligence {
  return {
    totalItems: workspaceAnalyses.length,
    needsReports: workspaceAnalyses.filter(
      (analysis) => analysis.stage === "Analysis"
    ).length,
    needsJobs: workspaceAnalyses.filter(
      (analysis) => analysis.stage === "Reporting"
    ).length,
    healthyItems: workspaceAnalyses.filter(
      (analysis) => analysis.health === "Healthy"
    ).length,
    unknownItems: workspaceAnalyses.filter(
      (analysis) => analysis.stage === "Unknown"
    ).length,
  };
}