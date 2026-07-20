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

type RiskFinding = {
  rank: number;
  score: number;
  factor: string;
  safeguard: string;
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

  const findings: RiskFinding[] = [];

  if (intelligence.unknownItems > 0) {
    findings.push({
      rank: 50,
      score: 30,
      factor: `${intelligence.unknownItems} workspace ${
        intelligence.unknownItems === 1 ? "item has" : "items have"
      } an unknown workflow stage.`,
      safeguard:
        "Review unknown items before relying on workspace-wide projections.",
    });
  }

  if (strategy.strategyConfidence === "Low") {
    findings.push({
      rank: 45,
      score: 0,
      factor:
        "The current strategy depends on unresolved items and low-confidence projections.",
      safeguard:
        "Resolve uncertain items and recalculate the strategy before relying on the execution order.",
    });
  }

  if (reviewActions.length > reportActions.length + jobActions.length) {
    findings.push({
      rank: 40,
      score: 25,
      factor:
        "Manual-review work outweighs clearly actionable workflow tasks.",
      safeguard:
        "Resolve the highest-impact uncertain items before expanding the workflow.",
    });
  }

  if (forecast.confidence === "Low") {
    findings.push({
      rank: 35,
      score: 20,
      factor:
        "The current forecast has low confidence because unresolved decisions remain.",
      safeguard:
        "Treat projected progress as directional until uncertain items are reviewed.",
    });
  }

  if (reportActions.length > 0 && jobActions.length > 0) {
    findings.push({
      rank: 30,
      score: 20,
      factor:
        "Some execution work depends on reports that are not yet complete.",
      safeguard:
        "Complete report actions before creating dependent execution jobs.",
    });
  }

  if (
    forecast.projectedHealth === intelligence.workspaceHealth &&
    intelligence.workspaceHealth !== "Healthy"
  ) {
    findings.push({
      rank: 20,
      score: 15,
      factor:
        "Completing the visible plan is not expected to resolve the overall workspace condition.",
      safeguard:
        "Recalculate priorities after the current plan is completed.",
    });
  }

  const rankedFindings = [...findings].sort(
    (a, b) => b.rank - a.rank
  );

  const riskScore = Math.min(
    rankedFindings.reduce(
      (total, finding) => total + finding.score,
      0
    ),
    100
  );

  let overallRisk: WorkspaceRiskLevel = "Low";

  if (riskScore >= 60) {
    overallRisk = "High";
  } else if (riskScore >= 30) {
    overallRisk = "Moderate";
  }

  const riskFactors =
    rankedFindings.length > 0
      ? rankedFindings.map((finding) => finding.factor)
      : ["No significant risk factors are currently detected."];

  const safeguards =
    rankedFindings.length > 0
      ? rankedFindings.map((finding) => finding.safeguard)
      : [
          "Continue monitoring events and recalculate intelligence after new activity.",
        ];

  const primaryRisk = riskFactors[0];

  let confidence: WorkspaceRisk["confidence"] = "Moderate";

  if (
    intelligence.unknownItems > 0 ||
    forecast.confidence === "Low" ||
    strategy.strategyConfidence === "Low"
  ) {
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