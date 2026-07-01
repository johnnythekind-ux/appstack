"use client";

import { createJob as createWorkspaceJob, updateJobStatus } from "../../lib/jobService";
import { useState } from "react";
import toast from "react-hot-toast";
import { jobs } from "../data/jobs";

export default function JobsPage() {
  const [jobName, setJobName] = useState("");
  const [saved, setSaved] = useState(false);

  async function createJob() {
  const newJob = {
  title: jobName || "Investor Report Processing Job",
  status: "Queued",
  source: "QueuePilot",
};

  jobs.push(newJob);

  const { data, error } = await createWorkspaceJob(newJob);

  if (error) {
    console.error(error);
    toast.error("Failed to save job.");
    return;
  }

  setTimeout(async () => {
  console.log("Attempting to update job to Running:", data);

  const { error: updateError } = await updateJobStatus(data.id, "Running");

  if (updateError) {
  console.log("Update error object:", updateError);
console.log("Inserted row:", data);
  toast.error(updateError.message);
  return;
}

  console.log("Job updated to Running.");
}, 2000);

setTimeout(async () => {
  const { error: completeError } = await updateJobStatus(data.id, "Completed");

  if (completeError) {
    console.error("Completed update failed:", completeError);
    toast.error(completeError.message);
    return;
  }

  console.log("Job updated to Completed.");
}, 5000);

  localStorage.setItem(
    "appstack_saved_job",
    JSON.stringify(newJob)
  );

  setSaved(true);
toast.success("Job queued successfully.");
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
              Job queued and saved to Workspace.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}