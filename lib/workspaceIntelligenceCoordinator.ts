import { analyzeWorkspaceEvents } from "./analysisService";
import { getAllEvents } from "./eventService";
import { analyzeWorkspace } from "./workspaceIntelligenceService";
import { buildWorkspacePriorities } from "./workspacePriorityService";

export async function buildWorkspaceIntelligence(workspaceItems: any[]) {
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
      analysis: analyzeWorkspaceEvents(relatedEvents),
    };
  });

  const workspaceAnalyses = workspaceAnalysisRecords.map(
    (record) => record.analysis
  );

  return {
    data: {
      intelligence: analyzeWorkspace(workspaceAnalyses),
      priorityActions: buildWorkspacePriorities(workspaceAnalysisRecords),
    },
    error: null,
  };
}