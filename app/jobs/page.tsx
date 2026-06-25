"use client";

import { useState } from "react";
import { jobs } from "../data/jobs";
import { supabase } from "../../lib/supabase";

export default function JobsPage() {
  const [jobName, setJobName] = useState("");
  const [saved, setSaved] = useState(false);

  async function createJob() {
  const newJob = {
    title: jobName || "Investor Report Processing Job",
    status: "Completed",
    source: "QueuePilot",
  };

  jobs.push(newJob);

  const { error } = await supabase
    .from("workspace_items")
    .insert({
      type: "job",
      title: newJob.title,
      status: newJob.status,
      metadata: {
        source: newJob.source,
      },
    });

  if (error) {
    console.error(error);
    alert("Supabase save failed.");
    return;
  }

  localStorage.setItem(
    "appstack_saved_job",
    JSON.stringify(newJob)
  );

  setSaved(true);
}

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold">QueuePilot Jobs</h1>

        <p className="mt-3 text-slate-400">
          Create and track async processing jobs.
        </p>

        <section className="mt-10 rounded-xl border border-slate-800 p-6">
          <label className="text-sm text-slate-400">Job Name</label>

          <input
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
            placeholder="Investor Report Processing Job"
          />

          <button
            onClick={createJob}
            className="mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Create Job
          </button>

          {saved && (
            <p className="mt-4 text-green-400">
              Job completed and saved locally.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}