import { supabase } from "./supabase";

export type EventType =
  | "analysis_created"
  | "report_generated"
  | "job_created"
  | "item_duplicated"
  | "item_deleted";

export type Event = {
  id: string;
  workspace_item_id?: string | null;
  event_type: EventType;
  description: string;
  source?: string | null;
  metadata?: Record<string, any> | null;
  user_id: string;
  created_at?: string;
};

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(
      "You must be signed in to create or read events."
    );
  }

  return user.id;
}

export async function createEvent(event: {
  workspace_item_id?: string | null;
  event_type: EventType;
  description: string;
  source?: string;
  metadata?: Record<string, any>;
}) {
  const userId = await getCurrentUserId();

  return await supabase
    .from("events")
    .insert({
      ...event,
      user_id: userId,
    })
    .select()
    .single();
}

export async function getEventsForWorkspaceItem(
  workspaceItemId: string
) {
  const userId = await getCurrentUserId();

  return await supabase
    .from("events")
    .select("*")
    .eq("workspace_item_id", workspaceItemId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function getAllEvents() {
  const userId = await getCurrentUserId();

  return await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}