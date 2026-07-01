import { supabase } from "./supabase";

export async function createJob(job: {
  title: string;
  status: string;
  source: string;
}) {
  return await supabase
    .from("workspace_items")
    .insert({
      type: "job",
      title: job.title,
      status: job.status,
      metadata: {
        source: job.source,
      },
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