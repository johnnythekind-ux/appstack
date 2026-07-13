import type { WorkspaceForecast } from "./workspaceForecastService";
import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";
import type { WorkspaceStrategy } from "./workspaceStrategyService";

export type WorkspaceRiskLevel = "Low" | "Moderate" | "High";

export type WorkspaceRisk = {
  title: string;
  overallRisk: WorkspaceRiskLevel;
  riskScore: number;
  primaryRisk: string;
  riskFactors: string[];
  safeguards: string[];
  confidence: "High" | "Moderate" | "Low";
};

export function buildWorkspaceRisk(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[],
  forecast: WorkspaceForecast,
  strategy: WorkspaceStrategy
): WorkspaceRisk {
  const reportActions = priorityActions.filter(
    (action) => action.actionType === "generate_report"
  );

  const jobActions = priorityActions.filter(
    (action) => action.actionType === "create_job"
  );

  const reviewActions = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const riskFactors: string[] = [];
  const safeguards: string[] = [];

  let riskScore = 0;

  if (intelligence.unknownItems > 0) {
    riskScore += 30;

    riskFactors.push(
      `${intelligence.unknownItems} workspace ${
        intelligence.unknownItems === 1 ? "item has" : "items have"
      } an unknown workflow stage.`
    );

    safeguards.push(
      "Review unknown items before relying on workspace-wide projections."
    );
  }

  if (reportActions.length > 0 && jobActions.length > 0) {
    riskScore += 20;

    riskFactors.push(
      "Some execution work depends on reports that are not yet complete."
    );

    safeguards.push(
      "Complete report actions before creating dependent execution jobs."
    );
  }

  if (reviewActions.length > reportActions.length + jobActions.length) {
    riskScore += 25;

    riskFactors.push(
      "Manual-review work outweighs clearly actionable workflow tasks."
    );

    safeguards.push(
      "Resolve the highest-impact uncertain items before expanding the workflow."
    );
  }

  if (forecast.confidence === "Low") {
    riskScore += 20;

    riskFactors.push(
      "The current forecast has low confidence because unresolved decisions remain."
    );

    safeguards.push(
      "Treat projected progress as directional until uncertain items are reviewed."
    );
  }

  if (
    forecast.projectedHealth === intelligence.workspaceHealth &&
    intelligence.workspaceHealth !== "Healthy"
  ) {
    riskScore += 15;

    riskFactors.push(
      "Completing the visible plan is not expected to resolve the overall workspace condition."
    );

    safeguards.push(
      "Recalculate priorities after the current plan is completed."
    );
  }

  riskScore = Math.min(riskScore, 100);

  let overallRisk: WorkspaceRiskLevel = "Low";

  if (riskScore >= 60) {
    overallRisk = "High";
  } else if (riskScore >= 30) {
    overallRisk = "Moderate";
  }

  if (riskFactors.length === 0) {
    riskFactors.push(
      "No significant risk factors are currently detected."
    );
  }

  if (safeguards.length === 0) {
    safeguards.push(
      "Continue monitoring events and recalculate intelligence after new activity."
    );
  }

  let primaryRisk = riskFactors[0];

  if (strategy.strategyConfidence === "Low") {
    primaryRisk =
      "The current strategy depends on unresolved items and low-confidence projections.";
  }

  let confidence: WorkspaceRisk["confidence"] = "Moderate";

  if (intelligence.unknownItems > 0) {
    confidence = "Low";
  } else if (
    forecast.confidence === "High" &&
    strategy.strategyConfidence === "High"
  ) {
    confidence = "High";
  }

  return {
    title: "Workspace Risk",
    overallRisk,
    riskScore,
    primaryRisk,
    riskFactors,
    safeguards,
    confidence,
  };
}