"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

import {
  createJob as createWorkspaceJob,
  updateJobStatus,
} from "../../lib/jobService";

type CurrentJob = {
  id: string;
  title: string;
  status: "Queued" | "Running" | "Completed";
  source: string;
};

export default function JobsPage() {
  const [jobName, setJobName] = useState("");
  const [currentJob, setCurrentJob] =
    useState<CurrentJob | null>(null);
  const [creating, setCreating] = useState(false);

  async function createJob() {
    if (creating) {
      return;
    }

    const newJob = {
      title:
        jobName.trim() ||
        "Investor Report Processing Job",
      status: "Queued",
      source: "QueuePilot",
    };

    setCreating(true);

    const { data, error } =
      await createWorkspaceJob(newJob);

    if (error) {
      console.error(error);
      toast.error("The job could not be created.");
      setCreating(false);
      return;
    }

    const queuedJob: CurrentJob = {
      id: data.id,
      title: data.title,
      status: "Queued",
      source: data.source || "QueuePilot",
    };

    setCurrentJob(queuedJob);

    localStorage.setItem(
      "appstack_saved_job",
      JSON.stringify(queuedJob)
    );

    toast.success("Job queued successfully.");
    setCreating(false);

    window.setTimeout(async () => {
      const { error: updateError } =
        await updateJobStatus(data.id, "Running");

      if (updateError) {
        console.error(
          "Running update failed:",
          updateError
        );
        toast.error(
          "The job was created, but its status could not be updated."
        );
        return;
      }

      setCurrentJob((job) =>
        job
          ? {
              ...job,
              status: "Running",
            }
          : job
      );

      toast.success("Job processing started.");
    }, 2000);

    window.setTimeout(async () => {
      const { error: completeError } =
        await updateJobStatus(
          data.id,
          "Completed"
        );

      if (completeError) {
        console.error(
          "Completed update failed:",
          completeError
        );
        toast.error(
          "The job could not be marked as completed."
        );
        return;
      }

      setCurrentJob((job) =>
        job
          ? {
              ...job,
              status: "Completed",
            }
          : job
      );

      toast.success("Job completed successfully.");
    }, 5000);
  }

  function createAnotherJob() {
    setJobName("");
    setCurrentJob(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <Page
      title="Jobs"
      description="Create processing jobs and follow their progress from queue to completion."
    >
      <Card
        title="Create Processing Job"
        className="mt-10"
      >
        <label className="text-sm font-medium text-slate-300">
          Job Name
        </label>

        <p className="mt-1 text-sm text-slate-500">
          Give the job a clear name so it is
          easy to identify in the Workspace.
        </p>

        <input
          value={jobName}
          onChange={(event) =>
            setJobName(event.target.value)
          }
          disabled={creating}
          className="mt-4 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Investor Report Processing Job"
        />

        <Button
          onClick={createJob}
          className="mt-6"
          disabled={creating}
        >
          {creating
            ? "Creating Job..."
            : "Create Job"}
        </Button>
      </Card>

      {currentJob && (
        <Card
          title="Current Job"
          className="mt-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Processing Status
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {currentJob.title}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Managed by {currentJob.source}
              </p>
            </div>

            <StatusBadge
              status={currentJob.status}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div
              className={`rounded-xl border p-5 ${
                currentJob.status === "Queued"
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-slate-800"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Step 1
              </p>

              <p className="mt-2 font-semibold">
                Queued
              </p>

              <p className="mt-2 text-sm text-slate-400">
                The job has entered the processing
                queue.
              </p>
            </div>

            <div
              className={`rounded-xl border p-5 ${
                currentJob.status === "Running"
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-slate-800"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Step 2
              </p>

              <p className="mt-2 font-semibold">
                Running
              </p>

              <p className="mt-2 text-sm text-slate-400">
                AppStack is processing the job.
              </p>
            </div>

            <div
              className={`rounded-xl border p-5 ${
                currentJob.status === "Completed"
                  ? "border-green-600 bg-green-950/20"
                  : "border-slate-800"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Step 3
              </p>

              <p className="mt-2 font-semibold">
                Completed
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Processing has finished successfully.
              </p>
            </div>
          </div>

          {currentJob.status === "Completed" && (
            <div className="mt-6">
              <Button
                onClick={createAnotherJob}
                variant="secondary"
              >
                Create Another Job
              </Button>
            </div>
          )}
        </Card>
      )}
    </Page>
  );
}