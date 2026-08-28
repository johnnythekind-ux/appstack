import { WorkspaceAnalysis } from "./analysisService";

export type WorkspacePriorityRecord = {
  item: any;
  analysis: WorkspaceAnalysis;
};

export type WorkspacePriorityAction = {
  title: string;
  itemId: string;
  itemTitle: string;
  actionType:
    | "generate_report"
    | "create_job"
    | "review_item";
  reason: string;
  priority: "High" | "Medium" | "Low";
};

export function buildWorkspacePriorities(
  records: WorkspacePriorityRecord[]
): WorkspacePriorityAction[] {
  const hasLinkedReport = (
    analysisId: string
  ) =>
    records.some(
      (record) =>
        record.item.type === "report" &&
        record.item.metadata?.analysis_id ===
          analysisId
    );

  const hasLinkedJob = (
    reportId: string
  ) =>
    records.some(
      (record) =>
        record.item.type === "job" &&
        record.item.metadata?.reportId ===
          reportId
    );

  const actions: WorkspacePriorityAction[] =
    [];

  for (const record of records) {
    if (
      record.analysis.health === "Healthy"
    ) {
      continue;
    }

    if (
      record.analysis.stage === "Analysis"
    ) {
      if (
        hasLinkedReport(record.item.id)
      ) {
        continue;
      }

      actions.push({
        title: "Generate Report",
        itemId: record.item.id,
        itemTitle: record.item.title,
        actionType: "generate_report",
        reason:
          "This analysis does not have a report yet.",
        priority: "High",
      });

      continue;
    }

    if (
      record.analysis.stage === "Reporting"
    ) {
      if (
        hasLinkedJob(record.item.id)
      ) {
        continue;
      }

      actions.push({
        title: "Create Job",
        itemId: record.item.id,
        itemTitle: record.item.title,
        actionType: "create_job",
        reason:
          "This report does not have an execution job yet.",
        priority: "Medium",
      });

      continue;
    }

    actions.push({
      title: "Review Item",
      itemId: record.item.id,
      itemTitle: record.item.title,
      actionType: "review_item",
      reason:
        "This item needs manual review.",
      priority: "Low",
    });
  }

  const uniqueActions =
    actions.filter(
      (action, index, self) =>
        index ===
        self.findIndex(
          (existingAction) =>
            existingAction.actionType ===
              action.actionType &&
            existingAction.itemId ===
              action.itemId
        )
    );

  const priorityRank: Record<
    WorkspacePriorityAction["priority"],
    number
  > = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return [...uniqueActions]
    .sort(
      (a, b) =>
        priorityRank[b.priority] -
        priorityRank[a.priority]
    )
    .slice(0, 5);
}