import { createEvent, getAllEvents } from "./eventService";

export async function backfillWorkspaceEvents(workspaceItems: any[]) {
  const { data: existingEvents, error } = await getAllEvents();

  if (error) {
    return {
      created: 0,
      error,
    };
  }

  let created = 0;

  for (const item of workspaceItems) {
    const itemEvents = (existingEvents || []).filter((event: any) => {
      const metadata = event.metadata || {};

      return (
        event.workspace_item_id === item.id ||
        metadata.original_item_id === item.id ||
        metadata.deleted_item_id === item.id ||
        metadata.backfilled_item_id === item.id
      );
    });

    if (itemEvents.length > 0) {
      continue;
    }

    let eventType:
  | "analysis_created"
  | "report_generated"
  | "job_created"
  | "item_deleted"
  | "item_duplicated" = "analysis_created";
    let description = `Historical workspace item backfilled: ${item.title}`;

    if (item.type === "analysis") {
      eventType = "analysis_created";
      description = `Historical analysis backfilled: ${item.title}`;
    }

    if (item.type === "report") {
      eventType = "report_generated";
      description = `Historical report backfilled: ${item.title}`;
    }

    if (item.type === "job") {
      eventType = "job_created";
      description = `Historical job backfilled: ${item.title}`;
    }

    const { error: createError } = await createEvent({
      workspace_item_id: item.id,
      event_type: eventType,
      description,
      source: "Workspace Backfill",
      metadata: {
        backfilled: true,
        backfilled_item_id: item.id,
        original_type: item.type,
        original_created_at: item.created_at,
      },
    });

    if (createError) {
      return {
        created,
        error: createError,
      };
    }

    created++;
  }

  return {
    created,
    error: null,
  };
}