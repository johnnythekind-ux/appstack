import type { Event, EventType } from "./eventService";

export type ActivityTrend =
  | "increasing"
  | "stable"
  | "declining"
  | "no_activity";

export type WorkspaceHistory = {
  totalEvents: number;

  firstEventAt: string | null;
  lastEventAt: string | null;
  daysActive: number;

  analysesCreated: number;
  reportsGenerated: number;
  jobsCreated: number;
  itemsDuplicated: number;
  itemsDeleted: number;

  recentEventCount: number;
  previousEventCount: number;
  activityTrend: ActivityTrend;
};

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const ACTIVITY_WINDOW_DAYS = 7;

function countEventsByType(
  events: Event[],
  eventType: EventType
): number {
  return events.filter(
    (event) => event.event_type === eventType
  ).length;
}

function getValidEventDates(events: Event[]): Date[] {
  return events
    .map((event) => {
      if (!event.created_at) {
        return null;
      }

      const date = new Date(event.created_at);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    })
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());
}

function getActivityTrend(
  recentEventCount: number,
  previousEventCount: number
): ActivityTrend {
  if (
    recentEventCount === 0 &&
    previousEventCount === 0
  ) {
    return "no_activity";
  }

  if (recentEventCount > previousEventCount) {
    return "increasing";
  }

  if (recentEventCount < previousEventCount) {
    return "declining";
  }

  return "stable";
}

export function buildWorkspaceHistory(
  events: Event[],
  now: Date = new Date()
): WorkspaceHistory {
  const eventDates = getValidEventDates(events);

  const firstEventDate = eventDates[0] ?? null;
  const lastEventDate =
    eventDates[eventDates.length - 1] ?? null;

  const daysActive = firstEventDate
    ? Math.max(
        1,
        Math.floor(
          (now.getTime() - firstEventDate.getTime()) /
            MILLISECONDS_PER_DAY
        ) + 1
      )
    : 0;

  const recentWindowStart = new Date(
    now.getTime() -
      ACTIVITY_WINDOW_DAYS * MILLISECONDS_PER_DAY
  );

  const previousWindowStart = new Date(
    now.getTime() -
      ACTIVITY_WINDOW_DAYS *
        2 *
        MILLISECONDS_PER_DAY
  );

  const recentEventCount = eventDates.filter(
    (date) =>
      date.getTime() >= recentWindowStart.getTime() &&
      date.getTime() <= now.getTime()
  ).length;

  const previousEventCount = eventDates.filter(
    (date) =>
      date.getTime() >= previousWindowStart.getTime() &&
      date.getTime() < recentWindowStart.getTime()
  ).length;

  return {
    totalEvents: events.length,

    firstEventAt: firstEventDate?.toISOString() ?? null,
    lastEventAt: lastEventDate?.toISOString() ?? null,
    daysActive,

    analysesCreated: countEventsByType(
      events,
      "analysis_created"
    ),

    reportsGenerated: countEventsByType(
      events,
      "report_generated"
    ),

    jobsCreated: countEventsByType(
      events,
      "job_created"
    ),

    itemsDuplicated: countEventsByType(
      events,
      "item_duplicated"
    ),

    itemsDeleted: countEventsByType(
      events,
      "item_deleted"
    ),

    recentEventCount,
    previousEventCount,

    activityTrend: getActivityTrend(
      recentEventCount,
      previousEventCount
    ),
  };
}