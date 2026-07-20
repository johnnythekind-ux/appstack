import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";

export type WorkspaceDirectorPlan = {
  title: string;
  workspaceStatus: string;
  summary: string[];
  nextBestAction: string;
  estimatedMinutes: number;
};

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
    summary.push("No urgent workspace actions are required.");
  }

  const estimatedMinutes =
    reportActions.length * 8 +
    jobActions.length * 3 +
    reviewActions.length * 5;

  const nextBestAction =
    priorityActions[0]?.title || "Continue monitoring the workspace.";

  return {
    title: "Today's Workspace Plan",
    workspaceStatus: intelligence.workspaceHealth,
    summary,
    nextBestAction,
    estimatedMinutes,
  };
}