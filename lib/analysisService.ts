import { Event } from "./eventService";

export type WorkspaceItemType =
  | "analysis"
  | "report"
  | "job";

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
  events: Event[]
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

  if (isDeleted) {
    stage = "Archived";
    health = "Archived";
  } else if (itemType === "analysis") {
    if (hasReport) {
      stage = "Reporting";
      health = "Healthy";

      insights.push(
        "This analysis has progressed to a generated report."
      );
    } else if (hasAnalysis) {
      stage = "Analysis";
      health = "Needs Attention";

      missingSteps.push("No report generated yet.");
    }
  } else if (itemType === "report") {
    if (hasJob) {
      stage = "Execution";
      health = "Healthy";

      insights.push(
        "This report has progressed to an execution job."
      );
    } else if (hasReport) {
      stage = "Reporting";
      health = "Needs Attention";

      missingSteps.push("No follow-up job created yet.");
      insights.push(
        "This report does not have an execution step."
      );
    }
  } else if (itemType === "job") {
    if (hasJob) {
      stage = "Execution";
      health = "Healthy";
    }
  }

  return {
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