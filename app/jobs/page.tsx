"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import { createJob as createWorkspaceJob, updateJobStatus } from "../../lib/jobService";
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
  <Page
    title="Jobs"
    description="Manage background jobs and processing tasks."
  >

        <Card
  title="Create Job"
  className="mt-10"
>
          <label className="text-sm text-slate-400">Job Name</label>

          <input
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
            placeholder="Investor Report Processing Job"
          />

          <Button
  onClick={createJob}
  className="mt-6"
>
  Create Job
</Button>

          {saved && (
            <p className="mt-4 text-green-400">
              Job queued and saved to Workspace.
            </p>
          )}
        </Card>
      </Page>
  );
}