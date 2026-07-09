import { WorkspaceAnalysis } from "./analysisService";

export type WorkspacePriorityRecord = {
  item: any;
  analysis: WorkspaceAnalysis;
};

export type WorkspacePriorityAction = {
  title: string;
  itemId: string;
  itemTitle: string;
  actionType: "generate_report" | "create_job" | "review_item";
  reason: string;
  priority: "High" | "Medium" | "Low";
};

export function buildWorkspacePriorities(
  records: WorkspacePriorityRecord[]
): WorkspacePriorityAction[] {
  const actions = records
    .filter((record) => record.analysis.health !== "Healthy")
    .map((record) => {
      if (record.analysis.stage === "Analysis") {
        return {
          title: "Generate Report",
          itemId: record.item.id,
          itemTitle: record.item.title,
          actionType: "generate_report" as const,
          reason: "This analysis does not have a report yet.",
          priority: "High" as const,
        };
      }

      if (record.analysis.stage === "Reporting") {
        return {
          title: "Create Job",
          itemId: record.item.id,
          itemTitle: record.item.title,
          actionType: "create_job" as const,
          reason: "This report does not have an execution job yet.",
          priority: "Medium" as const,
        };
      }

      return {
        title: "Review Item",
        itemId: record.item.id,
        itemTitle: record.item.title,
        actionType: "review_item" as const,
        reason: "This item needs manual review.",
        priority: "Low" as const,
      };
    });

  const uniqueActions = actions.filter((action, index, self) => {
    return (
      index ===
      self.findIndex(
        (existingAction) =>
          existingAction.actionType === action.actionType &&
          existingAction.itemId === action.itemId
      )
    );
  });

  return uniqueActions.slice(0, 5);
}