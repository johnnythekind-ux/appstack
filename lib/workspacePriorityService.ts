import { WorkspaceAnalysis } from "./analysisService";

export type WorkspacePriorityRecord = {
  item: any;
  analysis: WorkspaceAnalysis;
};

export type WorkspacePriorityAction = {
  title: string;
  itemTitle: string;
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
          itemTitle: record.item.title,
          reason: "This analysis does not have a report yet.",
          priority: "High" as const,
        };
      }

      if (record.analysis.stage === "Reporting") {
        return {
          title: "Create Job",
          itemTitle: record.item.title,
          reason: "This report does not have an execution job yet.",
          priority: "Medium" as const,
        };
      }

      return {
        title: "Review Item",
        itemTitle: record.item.title,
        reason: "This item needs manual review.",
        priority: "Low" as const,
      };
    });

  const uniqueActions = actions.filter((action, index, self) => {
    return (
      index ===
      self.findIndex(
        (existingAction) =>
          existingAction.title === action.title &&
          existingAction.itemTitle === action.itemTitle
      )
    );
  });

  return uniqueActions.slice(0, 5);
}