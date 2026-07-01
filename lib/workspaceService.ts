import { supabase } from "./supabase";

export async function getWorkspaceItems() {
  return await supabase
    .from("workspace_items")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function deleteWorkspaceItem(id: string) {
  return await supabase
    .from("workspace_items")
    .delete()
    .eq("id", id);
}

export async function duplicateWorkspaceItem(item: any) {
  return await supabase
    .from("workspace_items")
    .insert({
      type: item.type,
      title: `Copy of ${item.title}`,
      address: item.address,
      status: item.status,
      metadata: item.metadata,
      content: item.content,
    })
    .select()
    .single();
}

export async function createWorkspaceReport(report: {
  title: string;
  address?: string;
  status: string;
  content: string;
}) {
  return await supabase
    .from("workspace_items")
    .insert({
      type: "report",
      title: report.title,
      address: report.address,
      status: report.status,
      content: report.content,
    })
    .select()
    .single();
}

export async function getWorkspaceReports() {
  return await supabase
    .from("workspace_items")
    .select("*")
    .eq("type", "report")
    .order("created_at", { ascending: false });
}