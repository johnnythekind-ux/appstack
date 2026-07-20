import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";

export type WorkspaceInsightType =
  | "Pattern"
  | "Imbalance"
  | "Constraint"
  | "Opportunity";

export type WorkspaceInsightSeverity =
  | "Critical"
  | "High"
  | "Medium"
  | "Opportunity";

export type WorkspaceInsight = {
  type: WorkspaceInsightType;
  severity: WorkspaceInsightSeverity;
  title: string;
  explanation: string;
};

export type WorkspaceInsights = {
  title: string;
  headline: string;
  insights: WorkspaceInsight[];
};

export function buildWorkspaceInsights(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[]
): WorkspaceInsights {
  const insights: WorkspaceInsight[] = [];

  const reportActions = priorityActions.filter(
    (action) => action.actionType === "generate_report"
  );

  const jobActions = priorityActions.filter(
    (action) => action.actionType === "create_job"
  );

  const reviewActions = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const actionableActions =
    reportActions.length + jobActions.length;

  if (intelligence.needsJobs > intelligence.needsReports) {
    insights.push({
      type: "Imbalance",
      severity: "High",
      title: "Execution work is accumulating",
      explanation:
        "More workspace items need jobs than reports, showing that completed reporting work is accumulating before execution begins.",
    });
  }

  if (intelligence.needsReports > intelligence.needsJobs) {
    insights.push({
      type: "Constraint",
      severity: "High",
      title: "Reporting demand exceeds execution demand",
      explanation:
        "More workspace items are waiting for reports than jobs, making reporting the most concentrated workflow stage.",
    });
  }

  if (
    intelligence.needsReports > 0 &&
    intelligence.needsReports === intelligence.needsJobs
  ) {
    insights.push({
      type: "Pattern",
      severity: "Medium",
      title: "Report and execution demand are evenly distributed",
      explanation:
        "The workspace contains an equal number of items waiting for reports and execution jobs.",
    });
  }

  if (reviewActions.length > actionableActions) {
    insights.push({
      type: "Pattern",
      severity: "High",
      title: "Manual review dominates the visible workload",
      explanation:
        "More visible priority actions require human interpretation than direct report or job execution.",
    });
  }

  if (
    actionableActions > 0 &&
    actionableActions > reviewActions.length
  ) {
    insights.push({
      type: "Opportunity",
      severity: "Opportunity",
      title: "Most visible work can advance immediately",
      explanation:
        "Direct report and job actions outnumber manual reviews, so most visible work can move forward without additional interpretation.",
    });
  }

  if (
    intelligence.totalItems > 0 &&
    intelligence.unknownItems === 0
  ) {
    insights.push({
      type: "Opportunity",
      severity: "Opportunity",
      title: "Every workspace item has a recognized stage",
      explanation:
        "The event history provides a defined workflow stage for every current workspace item.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "Pattern",
      severity: "Medium",
      title: "No dominant workspace pattern detected",
      explanation:
        "The current workspace does not show a strong imbalance, constraint, or immediately actionable opportunity.",
    });
  }

  const severityRank: Record<WorkspaceInsightSeverity, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Opportunity: 1,
  };

  const rankedInsights = [...insights].sort(
    (a, b) => severityRank[b.severity] - severityRank[a.severity]
  );

  let headline = "Workspace activity is broadly balanced.";

  if (intelligence.needsReports > intelligence.needsJobs) {
    headline =
      "Reporting demand is the strongest pattern shaping the workspace.";
  } else if (intelligence.needsJobs > intelligence.needsReports) {
    headline =
      "Execution demand is the strongest pattern shaping the workspace.";
  } else if (reviewActions.length > actionableActions) {
    headline =
      "Manual review is the most concentrated form of visible work.";
  } else if (actionableActions > 0) {
    headline =
      "Most visible workspace work is directly actionable.";
  }

  return {
    title: "Workspace Insights",
    headline,
    insights: rankedInsights.slice(0, 5),
  };
}