import type { WorkspaceDirectorPlan } from "./workspaceDirectorService";
import type { WorkspaceForecast } from "./workspaceForecastService";
import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";

export type WorkspaceStrategy = {
  title: string;
  strategicFocus: string;
  executionOrder: string[];
  delayActions: string[];
  bottleneckExplanation: string;
  tradeoffExplanation: string;
  strategyConfidence: "High" | "Moderate" | "Low";
};

export function buildWorkspaceStrategy(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[],
  directorPlan: WorkspaceDirectorPlan,
  forecast: WorkspaceForecast
): WorkspaceStrategy {
  const reportActions = priorityActions.filter(
    (action) => action.actionType === "generate_report"
  );

  const jobActions = priorityActions.filter(
    (action) => action.actionType === "create_job"
  );

  const reviewActions = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const executionOrder: string[] = [];
  const delayActions: string[] = [];

  if (reportActions.length > 0) {
    executionOrder.push(
      "Generate missing reports before starting additional downstream work."
    );
  }

  if (jobActions.length > 0) {
    executionOrder.push(
      "Create execution jobs after the required reports are complete."
    );
  }

  if (reviewActions.length > 0) {
    executionOrder.push(
      "Review uncertain items after higher-impact workflow actions are complete."
    );
  }

  if (executionOrder.length === 0) {
    executionOrder.push(
      "Continue monitoring the workspace for new activity."
    );
  }

  if (reportActions.length > 0) {
    delayActions.push(
      "Delay creating additional jobs that depend on unfinished reports."
    );
  }

  if (reviewActions.length > 0 && reportActions.length > 0) {
    delayActions.push(
      "Delay low-priority manual reviews until report bottlenecks are reduced."
    );
  }

  if (delayActions.length === 0) {
    delayActions.push(
      "No current action category needs to be deliberately delayed."
    );
  }

  let strategicFocus = "Maintain current workspace momentum.";

  if (intelligence.needsReports > 0) {
    strategicFocus = "Clear the report bottleneck first.";
  } else if (intelligence.needsJobs > 0) {
    strategicFocus = "Move completed reports into execution.";
  } else if (intelligence.unknownItems > 0) {
    strategicFocus = "Resolve uncertainty before expanding the workflow.";
  }

  let bottleneckExplanation =
    "No significant workflow bottleneck is currently detected.";

  if (intelligence.primaryBottleneck !== "None") {
    bottleneckExplanation =
      `${intelligence.primaryBottleneck} is currently limiting workspace progress.`;
  }

  let tradeoffExplanation =
    "The current strategy favors maintaining stability.";

  if (reportActions.length > 0) {
    tradeoffExplanation =
      "The strategy prioritizes report completion over lower-impact review work because reports unlock downstream execution.";
  } else if (jobActions.length > 0) {
    tradeoffExplanation =
      "The strategy prioritizes execution jobs because completed reports have already cleared the analysis bottleneck.";
  } else if (reviewActions.length > 0) {
    tradeoffExplanation =
      "The strategy prioritizes manual review because unresolved uncertainty is limiting better decisions.";
  }

  let strategyConfidence: WorkspaceStrategy["strategyConfidence"] =
    "Moderate";

  if (priorityActions.length === 0) {
    strategyConfidence = "High";
  } else if (
    forecast.confidence === "Low" ||
    reviewActions.length > reportActions.length + jobActions.length
  ) {
    strategyConfidence = "Low";
  } else if (
    forecast.confidence === "High" &&
    directorPlan.estimatedMinutes > 0
  ) {
    strategyConfidence = "High";
  }

  return {
    title: "Workspace Strategy",
    strategicFocus,
    executionOrder,
    delayActions,
    bottleneckExplanation,
    tradeoffExplanation,
    strategyConfidence,
  };
}