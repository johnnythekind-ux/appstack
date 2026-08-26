import { supabase } from "./supabase";

export type CreateJobInput = {
  title: string;
  status: string;
  source: string;
  reportId?: string;
  reportTitle?: string;
};

export type WorkspaceJob = {
  id: string;
  type: string;
  title: string;
  status: string;
  user_id: string;
  metadata: {
    source?: string;
    reportId?: string;
    reportTitle?: string;
    [key: string]: unknown;
  } | null;
  created_at?: string;
  updated_at?: string;
};

type CreateJobApiResponse = {
  job?: WorkspaceJob;
  entitlement?: unknown;
  error?: string;
};

export async function createJob(
  job: CreateJobInput
): Promise<{
  data: WorkspaceJob | null;
  error: Error | null;
}> {
  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: job.title,
        source: job.source,
        reportId: job.reportId,
        reportTitle: job.reportTitle,
      }),
    });

    const result =
      (await response.json()) as CreateJobApiResponse;

    if (!response.ok) {
      return {
        data: null,
        error: new Error(
          result.error ??
            "Job could not be created."
        ),
      };
    }

    if (!result.job) {
      return {
        data: null,
        error: new Error(
          "Job creation returned no job."
        ),
      };
    }

    return {
      data: result.job,
      error: null,
    };
  } catch (error) {
    console.error(
      "Job creation request failed:",
      error
    );

    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error(
              "Job creation request failed."
            ),
    };
  }
}

export async function updateJobStatus(
  id: string,
  status: string
) {
  return await supabase
    .from("workspace_items")
    .update({
      status,
    })
    .eq("id", id);
}