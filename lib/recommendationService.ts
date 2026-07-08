import { WorkspaceAnalysis } from "./analysisService";

export type WorkspaceRecommendation = {
  action: string;
  reason: string;
  priority: "Low" | "Medium" | "High";
};

export function getWorkspaceRecommendation(
  analysis: WorkspaceAnalysis
): WorkspaceRecommendation {
  if (analysis.stage === "Analysis") {
    return {
      action: "Generate a report",
      reason: "This item has been analyzed but no report has been generated yet.",
      priority: "High",
    };
  }

  if (analysis.stage === "Reporting") {
    return {
      action: "Create a follow-up job",
      reason: "A report exists, but there is no execution step yet.",
      priority: "Medium",
    };
  }

  if (analysis.stage === "Execution") {
    return {
      action: "Continue execution",
      reason: "This item has progressed into the execution stage.",
      priority: "Low",
    };
  }

  if (analysis.stage === "Archived") {
    return {
      action: "No action needed",
      reason: "This item has been archived or deleted.",
      priority: "Low",
    };
  }

  return {
    action: "Review item",
    reason: "There is not enough activity history to determine a clear next step.",
    priority: "Medium",
  };
}