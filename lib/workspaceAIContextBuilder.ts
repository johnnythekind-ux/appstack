import type { WorkspaceDirectorPlan } from "./workspaceDirectorService";
import type { WorkspaceForecast } from "./workspaceForecastService";
import type { WorkspaceInsights } from "./workspaceInsightsService";
import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";
import type { WorkspaceRisk } from "./workspaceRiskService";
import type { WorkspaceStrategy } from "./workspaceStrategyService";

export type WorkspaceAIContext = {
  workspace: WorkspaceIntelligence;
  priorities: WorkspacePriorityAction[];
  director: WorkspaceDirectorPlan;
  forecast: WorkspaceForecast;
  strategy: WorkspaceStrategy;
  risk: WorkspaceRisk;
  insights: WorkspaceInsights;
  question: string;
};

export type BuildWorkspaceAIContextInput = {
  workspace: WorkspaceIntelligence;
  priorities: WorkspacePriorityAction[];
  director: WorkspaceDirectorPlan;
  forecast: WorkspaceForecast;
  strategy: WorkspaceStrategy;
  risk: WorkspaceRisk;
  insights: WorkspaceInsights;
  question: string;
};

export function buildWorkspaceAIContext({
  workspace,
  priorities,
  director,
  forecast,
  strategy,
  risk,
  insights,
  question,
}: BuildWorkspaceAIContextInput): WorkspaceAIContext {
  return {
    workspace,
    priorities,
    director,
    forecast,
    strategy,
    risk,
    insights,
    question,
  };
}