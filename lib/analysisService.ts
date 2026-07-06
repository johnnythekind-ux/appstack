import { Event } from "./eventService";

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

export function analyzeWorkspaceEvents(events: Event[]): WorkspaceAnalysis {
  const eventTypes = events.map((event) => event.event_type);

  const hasReport = eventTypes.includes("report_generated");
  const hasJob = eventTypes.includes("job_created");
  const isDeleted = eventTypes.includes("item_deleted");

  let stage: WorkflowStage = "Unknown";

  if (isDeleted) {
    stage = "Archived";
  } else if (hasJob) {
    stage = "Execution";
  } else if (hasReport) {
    stage = "Reporting";
  } else if (eventTypes.includes("analysis_created")) {
    stage = "Analysis";
  }

  const missingSteps: string[] = [];
  const insights: string[] = [];

  if (!hasReport && !isDeleted) {
    missingSteps.push("No report generated yet.");
  }

  if (hasReport && !hasJob && !isDeleted) {
    missingSteps.push("No follow-up job created yet.");
    insights.push("This item has a report but no execution step.");
  }

  const health: WorkspaceHealth = isDeleted
    ? "Archived"
    : missingSteps.length > 0
      ? "Needs Attention"
      : "Healthy";

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