import type { WorkspaceForecast } from "./workspaceForecastService";
import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";
import type { WorkspaceRisk } from "./workspaceRiskService";
import type { WorkspaceStrategy } from "./workspaceStrategyService";

export type WorkspaceInsightType =
  | "Pattern"
  | "Imbalance"
  | "Constraint"
  | "Opportunity";

export type WorkspaceInsight = {
  type: WorkspaceInsightType;
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
  priorityActions: WorkspacePriorityAction[],
  forecast: WorkspaceForecast,
  strategy: WorkspaceStrategy,
  risk: WorkspaceRisk
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

  if (intelligence.needsJobs > intelligence.needsReports) {
    insights.push({
      type: "Imbalance",
      title: "Execution work is accumulating",
      explanation:
        "More workspace items need jobs than reports, which suggests reported work is accumulating before execution is created.",
    });
  }

  if (intelligence.needsReports > intelligence.needsJobs) {
    insights.push({
      type: "Constraint",
      title: "Reporting is the dominant constraint",
      explanation:
        "More items are waiting for reports than jobs, so reporting is limiting downstream execution.",
    });
  }

  if (reviewActions.length > reportActions.length + jobActions.length) {
    insights.push({
      type: "Pattern",
      title: "Manual review is dominating the visible workload",
      explanation:
        "Most visible priority actions require human review rather than direct workflow execution.",
    });
  }

  if (
    priorityActions.length > 0 &&
    forecast.progressGain <= 3
  ) {
    insights.push({
      type: "Constraint",
      title: "The current plan has limited workspace-wide impact",
      explanation:
        "Completing the visible priority actions is expected to produce only a small increase in overall workspace progress.",
    });
  }

  if (
    forecast.projectedResolvedActions > 0 &&
    forecast.projectedHealth === intelligence.workspaceHealth
  ) {
    insights.push({
      type: "Pattern",
      title: "Visible progress may not change overall health",
      explanation:
        "The current plan resolves actions, but the projected workspace health remains unchanged because additional backlog remains.",
    });
  }

  if (
    intelligence.unknownItems === 0 &&
    risk.confidence !== "Low"
  ) {
    insights.push({
      type: "Opportunity",
      title: "The workspace has enough history for stronger decisions",
      explanation:
        "All workspace items have recognized stages, giving the intelligence pipeline a more reliable foundation.",
    });
  }

  if (strategy.strategyConfidence === "Low") {
    insights.push({
      type: "Constraint",
      title: "Strategic confidence is being reduced by uncertainty",
      explanation:
        "The current execution order is directionally useful, but unresolved items weaken confidence in the strategy.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "Pattern",
      title: "No dominant workspace pattern detected",
      explanation:
        "The current workspace does not show a strong imbalance, constraint, or opportunity.",
    });
  }

  let headline = "Workspace activity is broadly balanced.";

  if (intelligence.needsReports > 0) {
    headline =
      "Reporting remains the primary pattern shaping workspace progress.";
  } else if (intelligence.needsJobs > 0) {
    headline =
      "Execution readiness is the strongest pattern in the workspace.";
  } else if (reviewActions.length > 0) {
    headline =
      "Unresolved review work is the most visible workspace pattern.";
  }

  return {
    title: "Workspace Insights",
    headline,
    insights: insights.slice(0, 5),
  };
}