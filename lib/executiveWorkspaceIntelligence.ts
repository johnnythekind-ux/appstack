import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";
import type { WorkspaceDirectorPlan } from "./workspaceDirectorService";
import type { WorkspaceForecast } from "./workspaceForecastService";
import type { WorkspaceRisk } from "./workspaceRiskService";
import type { WorkspaceStrategy } from "./workspaceStrategyService";
import type { WorkspaceInsights } from "./workspaceInsightsService";

export type ExecutiveWorkspaceIntelligence = {
  generatedAt: string;
  intelligence: WorkspaceIntelligence;
  priorities: WorkspacePriorityAction[];
  director: WorkspaceDirectorPlan;
  forecast: WorkspaceForecast;
  risk: WorkspaceRisk;
  strategy: WorkspaceStrategy;
  insights: WorkspaceInsights;
};

type BuildExecutiveWorkspaceIntelligenceInput = {
  intelligence: WorkspaceIntelligence;
  priorities: WorkspacePriorityAction[];
  director: WorkspaceDirectorPlan;
  forecast: WorkspaceForecast;
  risk: WorkspaceRisk;
  strategy: WorkspaceStrategy;
  insights: WorkspaceInsights;
};

export function buildExecutiveWorkspaceIntelligence({
  intelligence,
  priorities,
  director,
  forecast,
  risk,
  strategy,
  insights,
}: BuildExecutiveWorkspaceIntelligenceInput): ExecutiveWorkspaceIntelligence {
  return {
    generatedAt: new Date().toISOString(),
    intelligence,
    priorities,
    director,
    forecast,
    risk,
    strategy,
    insights,
  };
}