import { supabase } from "./supabase";
import {
  getCurrentClientUserId,
} from "./currentUser";

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
  | "job"
  | "task";

export type WorkspaceItem = {
  id: string;
  type: WorkspaceItemType;
  title: string;
  address?: string | null;
  status: WorkspaceStatus;
  metadata?: Record<string, any> | null;
  content?: string | null;
  user_id: string;
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

export type CreateWorkspaceTaskInput = {
  title: string;
  description?: string;
};

export type UpdateWorkspaceTaskInput = {
  title: string;
  description?: string;
  status:
    | "queued"
    | "running"
    | "completed";
};

export async function getWorkspaceItems() {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });
}

export async function deleteWorkspaceItem(
  id: string
) {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}

export async function deleteWorkspaceItems(
  ids: string[]
) {
  if (ids.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .delete()
    .eq("user_id", userId)
    .in("id", ids)
    .select("id");
}

export async function duplicateWorkspaceItem(
  item: WorkspaceItem
) {
  if (item.type !== "task") {
    return {
      data: null,
      error: new Error(
        "Only tasks can be duplicated directly. Analyses, reports, and jobs must be created through their billing-enforced workflows."
      ),
    };
  }

  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .insert({
      type: "task",
      title: `Copy of ${item.title}`,
      address: item.address,
      status: item.status,
      metadata: item.metadata,
      content: item.content,
      user_id: userId,
    })
    .select()
    .single();
}

export async function createWorkspaceTask(
  task: CreateWorkspaceTaskInput
) {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .insert({
      type: "task",
      title: task.title.trim(),
      address: null,
      status: "queued",
      content:
        task.description?.trim() ||
        null,
      metadata: {
        source: "manual",
      },
      user_id: userId,
    })
    .select()
    .single();
}

export async function updateWorkspaceTask(
  taskId: string,
  task: UpdateWorkspaceTaskInput
) {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .update({
      title: task.title.trim(),
      status: task.status,
      content:
        task.description?.trim() ||
        null,
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .eq("type", "task")
    .select()
    .single();
}

export async function createWorkspaceReport(
  report: CreateWorkspaceReportInput
) {
  try {
    const response = await fetch(
      "/api/reports",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          title: report.title,
          address: report.address,
          status: report.status,
          content: report.content,
          analysisId:
            report.analysisId,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: new Error(
          result.error ??
            "Report could not be created."
        ),
      };
    }

    if (!result.report) {
      return {
        data: null,
        error: new Error(
          "Report creation returned no report."
        ),
      };
    }

    return {
      data: result.report,
      error: null,
    };
  } catch (error) {
    console.error(
      "Report creation request failed:",
      error
    );

    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error(
              "Report creation request failed."
            ),
    };
  }
}

export async function updateWorkspaceReport(
  reportId: string,
  report: UpdateWorkspaceReportInput
) {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .update({
      title: report.title,
      address: report.address,
      status: report.status,
      content: report.content,
      metadata: {
        analysis_id:
          report.analysisId,
      },
    })
    .eq("id", reportId)
    .eq("user_id", userId)
    .select()
    .single();
}

export async function getWorkspaceAnalysisById(
  analysisId: string
) {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .select("*")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .eq("type", "analysis")
    .maybeSingle();
}

export async function getWorkspaceReports() {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "report")
    .order("created_at", {
      ascending: false,
    });
}

export async function getWorkspaceReportByAnalysisId(
  analysisId: string
) {
  const userId =
    await getCurrentClientUserId();

  return await supabase
    .from("workspace_items")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "report")
    .eq(
      "metadata->>analysis_id",
      analysisId
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();
}