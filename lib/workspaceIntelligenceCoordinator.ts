import { analyzeWorkspaceEvents } from "./analysisService";
import { getAllEvents } from "./eventService";
import { analyzeWorkspace } from "./workspaceIntelligenceService";
import { buildWorkspacePriorities } from "./workspacePriorityService";
import { buildWorkspaceDirectorPlan } from "./workspaceDirectorService";
import { buildWorkspaceForecast } from "./workspaceForecastService";
import { buildWorkspaceRisk } from "./workspaceRiskService";
import { buildWorkspaceStrategy } from "./workspaceStrategyService";
import { buildWorkspaceInsights } from "./workspaceInsightsService";
import { buildExecutiveWorkspaceIntelligence } from "./executiveWorkspaceIntelligence";

export async function buildWorkspaceIntelligence(
  workspaceItems: any[]
) {
  const { data: events, error } = await getAllEvents();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  const workspaceAnalysisRecords = workspaceItems.map((item) => {
    const relatedEvents = (events || []).filter((event: any) => {
      const metadata = event.metadata || {};

      return (
        event.workspace_item_id === item.id ||
        metadata.original_item_id === item.id ||
        metadata.deleted_item_id === item.id ||
        metadata.backfilled_item_id === item.id
      );
    });

    return {
      item,
      analysis: analyzeWorkspaceEvents(
        item.type,
        relatedEvents
      ),
    };
  });

  const workspaceAnalyses = workspaceAnalysisRecords.map(
    (record) => record.analysis
  );

  const intelligence = analyzeWorkspace(
    workspaceAnalyses
  );

  const priorityActions = buildWorkspacePriorities(
    workspaceAnalysisRecords
  );

  const directorPlan = buildWorkspaceDirectorPlan(
    intelligence,
    priorityActions
  );

  const forecast = buildWorkspaceForecast(
    intelligence,
    priorityActions,
    directorPlan
  );

  const strategy = buildWorkspaceStrategy(
    intelligence,
    priorityActions,
    directorPlan,
    forecast
  );

  const risk = buildWorkspaceRisk(
    intelligence,
    priorityActions,
    forecast,
    strategy
  );

  const insights = buildWorkspaceInsights(
    intelligence,
    priorityActions
  );

  const executiveIntelligence =
    buildExecutiveWorkspaceIntelligence({
      intelligence,
      priorities: priorityActions,
      director: directorPlan,
      forecast,
      risk,
      strategy,
      insights,
    });

  return {
    data: {
      intelligence,
      priorityActions,
      directorPlan,
      forecast,
      strategy,
      risk,
      insights,
      executiveIntelligence,
    },
    error: null,
  };
}