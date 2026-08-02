import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";

export type WorkspaceDirectorPlan = {
  title: string;
  workspaceStatus: string;
  summary: string[];
  nextBestAction: string;
  estimatedMinutes: number;
};

function determineNextBestAction(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[]
): string {
  const primaryAction = priorityActions[0];

  if (primaryAction) {
    return primaryAction.title;
  }

  if (
    intelligence.workspaceHealth === "Healthy" &&
    intelligence.progressPercent === 100
  ) {
    return "Workspace is running smoothly.";
  }

  if (intelligence.unknownItems > 0) {
    return "Review unresolved workspace items.";
  }

  if (intelligence.needsReports > 0) {
    return "Complete the outstanding reports.";
  }

  if (intelligence.needsJobs > 0) {
    return "Move completed reports into execution.";
  }

  if (intelligence.workspaceHealth === "Needs Attention") {
    return "The workspace needs your attention.";
  }

  return "Review the latest workspace activity.";
}

export function buildWorkspaceDirectorPlan(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[]
): WorkspaceDirectorPlan {
  const reportActions = priorityActions.filter(
    (action) => action.actionType === "generate_report"
  );

  const jobActions = priorityActions.filter(
    (action) => action.actionType === "create_job"
  );

  const reviewActions = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const summary: string[] = [];

  if (reportActions.length > 0) {
    summary.push(
      `Generate ${reportActions.length} ${
        reportActions.length === 1 ? "report" : "reports"
      }.`
    );
  }

  if (jobActions.length > 0) {
    summary.push(
      `Create ${jobActions.length} ${
        jobActions.length === 1 ? "job" : "jobs"
      }.`
    );
  }

  if (reviewActions.length > 0) {
    summary.push(
      `Review ${reviewActions.length} ${
        reviewActions.length === 1 ? "item" : "items"
      }.`
    );
  }

  if (summary.length === 0) {
    if (
      intelligence.workspaceHealth === "Healthy" &&
      intelligence.progressPercent === 100
    ) {
      summary.push("All priority work has been completed.");
    } else if (intelligence.workspaceHealth === "Needs Attention") {
      summary.push(
        "The workspace still contains unfinished or unresolved work."
      );
    } else {
      summary.push(
        "No immediate actions are currently available."
      );
    }
  }

  const estimatedMinutes =
    reportActions.length * 8 +
    jobActions.length * 3 +
    reviewActions.length * 5;

  return {
    title: "Today's Workspace Plan",
    workspaceStatus: intelligence.workspaceHealth,
    summary,
    nextBestAction: determineNextBestAction(
      intelligence,
      priorityActions
    ),
    estimatedMinutes,
  };
}