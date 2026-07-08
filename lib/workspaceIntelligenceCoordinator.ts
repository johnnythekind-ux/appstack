import { analyzeWorkspaceEvents } from "./analysisService";
import { getAllEvents } from "./eventService";
import { analyzeWorkspace } from "./workspaceIntelligenceService";

export async function buildWorkspaceIntelligence(workspaceItems: any[]) {
  const { data: events, error } = await getAllEvents();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  const workspaceAnalyses = workspaceItems.map((item) => {
    const relatedEvents = (events || []).filter((event: any) => {
      const metadata = event.metadata || {};

      return (
        event.workspace_item_id === item.id ||
        metadata.original_item_id === item.id ||
        metadata.deleted_item_id === item.id
      );
    });

    return analyzeWorkspaceEvents(relatedEvents);
  });

  return {
    data: analyzeWorkspace(workspaceAnalyses),
    error: null,
  };
}