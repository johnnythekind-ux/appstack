import type { WorkspaceIntelligence } from "./workspaceIntelligenceService";
import type { WorkspacePriorityAction } from "./workspacePriorityService";

export type WorkspaceDirectorPlan = {
  title: string;
  workspaceStatus: string;
  headline: string;
  statusTitle: string;
  statusMessage: string;
  summary: string[];
  nextBestAction: string;
  estimatedMinutes: number;
};

type WorkspaceBriefing = {
  headline: string;
  statusTitle: string;
  statusMessage: string;
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

function buildWorkspaceBriefing(
  intelligence: WorkspaceIntelligence,
  priorityActions: WorkspacePriorityAction[],
  nextBestAction: string
): WorkspaceBriefing {
  const highPriorityActions = priorityActions.filter(
    (action) => action.priority === "High"
  );

  const reviewActions = priorityActions.filter(
    (action) => action.actionType === "review_item"
  );

  const reportActions = priorityActions.filter(
    (action) => action.actionType === "generate_report"
  );

  const jobActions = priorityActions.filter(
    (action) => action.actionType === "create_job"
  );

  if (
    priorityActions.length === 0 &&
    intelligence.progressPercent === 100 &&
    intelligence.workspaceHealth === "Healthy"
  ) {
    return {
      headline: "Workspace is running smoothly.",
      statusTitle: "Everything is up to date.",
      statusMessage:
        "All priority work has been completed. New activity will appear here automatically.",
    };
  }

  if (highPriorityActions.length > 0) {
    return {
      headline:
        highPriorityActions.length === 1
          ? "One urgent item needs your attention."
          : `${highPriorityActions.length} urgent items need your attention.`,
      statusTitle: "Immediate action is recommended.",
      statusMessage:
        "Complete the highest-priority work first to prevent additional delays.",
    };
  }

  if (reviewActions.length > 0) {
    return {
      headline:
        reviewActions.length === 1
          ? "One item needs review."
          : `${reviewActions.length} items need review.`,
      statusTitle: "Some workspace activity is unresolved.",
      statusMessage:
        "Review the unresolved items before moving additional work forward.",
    };
  }

  if (reportActions.length > 0) {
    return {
      headline:
        reportActions.length === 1
          ? "One analysis is ready for reporting."
          : `${reportActions.length} analyses are ready for reporting.`,
      statusTitle: "Reporting is the next priority.",
      statusMessage:
        "Generate the outstanding reports to continue moving work toward execution.",
    };
  }

  if (jobActions.length > 0) {
    return {
      headline:
        jobActions.length === 1
          ? "One report is ready for execution."
          : `${jobActions.length} reports are ready for execution.`,
      statusTitle: "Execution work is waiting.",
      statusMessage:
        "Create the outstanding jobs to move completed reports into execution.",
    };
  }

  if (intelligence.progressPercent >= 90) {
    return {
      headline: "The workspace is nearly complete.",
      statusTitle: "Only a small amount of work remains.",
      statusMessage:
        "Complete the remaining steps to bring the workspace fully up to date.",
    };
  }

  if (intelligence.progressPercent >= 60) {
    return {
      headline: "The workspace is making progress.",
      statusTitle: "Important work is still underway.",
      statusMessage:
        "Continue with the recommended actions to improve the current position.",
    };
  }

  return {
    headline: nextBestAction,
    statusTitle: "The workspace needs attention.",
    statusMessage:
      "Several unfinished steps are limiting progress. Begin with the highest-priority action.",
  };
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

  const nextBestAction = determineNextBestAction(
    intelligence,
    priorityActions
  );

  const briefing = buildWorkspaceBriefing(
    intelligence,
    priorityActions,
    nextBestAction
  );

  const estimatedMinutes =
    reportActions.length * 8 +
    jobActions.length * 3 +
    reviewActions.length * 5;

  return {
    title: "Today's Workspace Plan",
    workspaceStatus: intelligence.workspaceHealth,
    headline: briefing.headline,
    statusTitle: briefing.statusTitle,
    statusMessage: briefing.statusMessage,
    summary,
    nextBestAction,
    estimatedMinutes,
  };
}
