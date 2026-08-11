import { supabase } from "./supabase";

export type CreateJobInput = {
  title: string;
  status: string;
  source: string;
  reportId?: string;
  reportTitle?: string;
};

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to create a job.");
  }

  return user.id;
}

export async function createJob(job: CreateJobInput) {
  const userId = await getCurrentUserId();

  const metadata: Record<string, string> = {
    source: job.source,
  };

  if (job.reportId) {
    metadata.reportId = job.reportId;
  }

  if (job.reportTitle) {
    metadata.reportTitle = job.reportTitle;
  }

  return await supabase
    .from("workspace_items")
    .insert({
      type: "job",
      title: job.title,
      status: job.status,
      metadata,
      user_id: userId,
    })
    .select()
    .single();
}

export async function updateJobStatus(id: string, status: string) {
  return await supabase
    .from("workspace_items")
    .update({
      status,
    })
    .eq("id", id);
}
