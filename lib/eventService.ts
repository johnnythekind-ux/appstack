import { supabase } from "./supabase";

export type EventType =
  | "analysis_created"
  | "report_generated"
  | "job_created"
  | "item_duplicated"
  | "item_deleted";

export type Event = {
  id: string;
  workspace_item_id: string;
  event_type: EventType;
  description: string;
  source?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
};

export async function createEvent(event: {
  workspace_item_id: string;
  event_type: EventType;
  description: string;
  source?: string;
  metadata?: Record<string, any>;
}) {
  return await supabase
    .from("events")
    .insert(event)
    .select()
    .single();
}

export async function getEventsForWorkspaceItem(
  workspaceItemId: string
) {
  return await supabase
    .from("events")
    .select("*")
    .eq("workspace_item_id", workspaceItemId)
    .order("created_at", { ascending: false });
}