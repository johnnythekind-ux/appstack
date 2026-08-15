import { Event } from "./eventService";
import type { WorkspaceItemType } from "./workspaceService";

export type WorkflowStage =
  | "Analysis"
  | "Reporting"
  | "Execution"
  | "Archived"
  | "Unknown";

export type WorkspaceHealth =
  | "Healthy"
  | "Needs Attention"
  | "Archived"
  | "Unknown";

export type WorkspaceAnalysis = {
  itemType: WorkspaceItemType;
  itemStatus?: string;
  stage: WorkflowStage;
  health: WorkspaceHealth;
  eventCount: number;
  hasReport: boolean;
  hasJob: boolean;
  lastActivity?: string;
  missingSteps: string[];
  insights: string[];
};

export function analyzeWorkspaceEvents(
  itemType: WorkspaceItemType,
  events: Event[],
  itemStatus?: string
): WorkspaceAnalysis {
  const eventTypes = events.map((event) => event.event_type);

  const hasAnalysis = eventTypes.includes("analysis_created");
  const hasReport = eventTypes.includes("report_generated");
  const hasJob = eventTypes.includes("job_created");
  const isDeleted = eventTypes.includes("item_deleted");

  const missingSteps: string[] = [];
  const insights: string[] = [];

  let stage: WorkflowStage = "Unknown";
  let health: WorkspaceHealth = "Unknown";

  const normalizedStatus = itemStatus?.toLowerCase();

  if (isDeleted) {
    stage = "Archived";
    health = "Archived";
  } else if (itemType === "analysis") {
    const hasPersistedAnalysis =
      hasAnalysis || Boolean(itemStatus);

    if (hasReport) {
      stage = "Reporting";
      health = "Healthy";

      insights.push(
        "This analysis has progressed to a generated report."
      );
    } else if (hasPersistedAnalysis) {
      stage = "Analysis";
      health = "Needs Attention";

      missingSteps.push("No report generated yet.");
      insights.push(
        "This saved analysis is ready for report generation."
      );
    }
  } else if (itemType === "report") {
    const hasPersistedReport =
      hasReport || Boolean(itemStatus);

    if (hasJob) {
      stage = "Execution";
      health = "Healthy";

      insights.push(
        "This report has progressed to an execution job."
      );
    } else if (hasPersistedReport) {
      stage = "Reporting";
      health = "Needs Attention";

      missingSteps.push("No follow-up job created yet.");
      insights.push(
        "This saved report is ready for an execution job."
      );
    }
  } else if (itemType === "job") {
    if (
      hasJob ||
      normalizedStatus === "completed" ||
      normalizedStatus === "running" ||
      normalizedStatus === "queued"
    ) {
      stage = "Execution";
      health = "Healthy";

      if (normalizedStatus === "completed") {
        insights.push(
          "This job completed its operational workflow."
        );
      } else if (normalizedStatus === "running") {
        insights.push(
          "This job is currently moving through execution."
        );
      } else if (normalizedStatus === "queued") {
        insights.push(
          "This job is queued for execution."
        );
      }
    }
  } else if (itemType === "task") {
    stage = "Execution";

    if (normalizedStatus === "completed") {
      health = "Healthy";
      insights.push(
        "This workspace task has been completed."
      );
    } else {
      health = "Needs Attention";

      if (normalizedStatus === "running") {
        insights.push(
          "This workspace task is currently in progress."
        );
      } else {
        insights.push(
          "This workspace task is waiting to be completed."
        );
      }
    }
  }

  return {
    itemType,
    itemStatus,
    stage,
    health,
    eventCount: events.length,
    hasReport,
    hasJob,
    lastActivity: events[0]?.created_at,
    missingSteps,
    insights,
  };
}
