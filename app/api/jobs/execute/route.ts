import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const jobId = body?.jobId;

  if (!jobId || typeof jobId !== "string") {
    return NextResponse.json(
      { error: "A valid jobId is required." },
      { status: 400 }
    );
  }

  const { data: job, error: jobError } = await supabase
    .from("workspace_items")
    .select("id, type, status, user_id")
    .eq("id", jobId)
    .eq("type", "job")
    .eq("user_id", user.id)
    .single();

  if (jobError || !job) {
    return NextResponse.json(
      { error: "Job not found." },
      { status: 404 }
    );
  }

  if (job.status !== "Queued") {
    return NextResponse.json(
      {
        error: `Job cannot execute from status ${job.status}.`,
      },
      { status: 409 }
    );
  }

  const { error: runningError } = await supabase
    .from("workspace_items")
    .update({
      status: "Running",
    })
    .eq("id", job.id)
    .eq("user_id", user.id);

  if (runningError) {
    console.error(runningError);

    return NextResponse.json(
      { error: "Job could not enter Running state." },
      { status: 500 }
    );
  }

  await wait(3000);

  const { error: completedError } = await supabase
    .from("workspace_items")
    .update({
      status: "Completed",
    })
    .eq("id", job.id)
    .eq("user_id", user.id);

  if (completedError) {
    console.error(completedError);

    return NextResponse.json(
      { error: "Job could not enter Completed state." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    jobId: job.id,
    status: "Completed",
  });
}