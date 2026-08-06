import { supabase } from "./supabase";

export type WorkspaceStatus =
  | "queued"
  | "running"
  | "completed"
  | "buy"
  | "negotiate"
  | "pass"
  | "Queued"
  | "Running"
  | "Completed"
  | "BUY"
  | "NEGOTIATE"
  | "PASS"
  | "Saved";

export type WorkspaceItemType =
  | "analysis"
  | "report"
  | "job";

export type WorkspaceItem = {
  id: string;
  type: WorkspaceItemType;
  title: string;
  address?: string | null;
  status: WorkspaceStatus;
  metadata?: Record<string, any> | null;
  content?: string | null;
  created_at?: string;
  updated_at?: string;
};

type CreateWorkspaceReportInput = {
  title: string;
  address?: string;
  status: string;
  content: string;
  analysisId?: string;
};

type UpdateWorkspaceReportInput = {
  title: string;
  address?: string;
  status: string;
  content: string;
  analysisId: string;
};

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

export async function duplicateWorkspaceItem(
  item: WorkspaceItem
) {
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

export async function createWorkspaceReport(
  report: CreateWorkspaceReportInput
) {
  return await supabase
    .from("workspace_items")
    .insert({
      type: "report",
      title: report.title,
      address: report.address,
      status: report.status,
      content: report.content,
      metadata: report.analysisId
        ? {
            analysis_id: report.analysisId,
          }
        : null,
    })
    .select()
    .single();
}

export async function updateWorkspaceReport(
  reportId: string,
  report: UpdateWorkspaceReportInput
) {
  return await supabase
    .from("workspace_items")
    .update({
      title: report.title,
      address: report.address,
      status: report.status,
      content: report.content,
      metadata: {
        analysis_id: report.analysisId,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
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

export async function getWorkspaceReportByAnalysisId(
  analysisId: string
) {
  return await supabase
    .from("workspace_items")
    .select("*")
    .eq("type", "report")
    .eq("metadata->>analysis_id", analysisId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}