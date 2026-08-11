"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

import { createJob as createWorkspaceJob } from "../../lib/jobService";
import { createEvent } from "../../lib/eventService";

type PendingJobContext = {
  reportId: string;
  reportTitle: string;
};

type CurrentJob = {
  id: string;
  title: string;
  status: "Queued" | "Running" | "Completed";
  source: string;
  reportId?: string;
  reportTitle?: string;
};

export default function JobsPage() {
  const [jobName, setJobName] = useState("");
  const [currentJob, setCurrentJob] =
    useState<CurrentJob | null>(null);
  const [pendingContext, setPendingContext] =
    useState<PendingJobContext | null>(null);
  const [creating, setCreating] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const storedContext = localStorage.getItem(
      "appstack_pending_job_context"
    );

    if (!storedContext) {
      return;
    }

    try {
      const parsedContext: PendingJobContext =
        JSON.parse(storedContext);

      if (
        parsedContext.reportId &&
        parsedContext.reportTitle
      ) {
        setPendingContext(parsedContext);
        setJobName(
          `${parsedContext.reportTitle} Processing Job`
        );
      }
    } catch (error) {
      console.error(
        "Pending job context could not be read:",
        error
      );

      localStorage.removeItem(
        "appstack_pending_job_context"
      );
    }
  }, []);

  async function executeJob(queuedJob: CurrentJob) {
    setExecuting(true);

    try {
      const runningJob: CurrentJob = {
        ...queuedJob,
        status: "Running",
      };

      setCurrentJob(runningJob);

      localStorage.setItem(
        "appstack_saved_job",
        JSON.stringify(runningJob)
      );

      const response = await fetch("/api/jobs/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: queuedJob.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Job execution failed."
        );
      }

      const completedJob: CurrentJob = {
        ...queuedJob,
        status: "Completed",
      };

      setCurrentJob(completedJob);

      localStorage.setItem(
        "appstack_saved_job",
        JSON.stringify(completedJob)
      );

      toast.success("Job completed successfully.");
    } catch (error) {
      console.error("Job execution failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Job execution failed."
      );
    } finally {
      setExecuting(false);
    }
  }

  async function createJob() {
    if (creating || executing) {
      return;
    }

    const title =
      jobName.trim() ||
      (pendingContext?.reportTitle
        ? `${pendingContext.reportTitle} Processing Job`
        : "Investor Report Processing Job");

    setCreating(true);

    const { data, error } =
      await createWorkspaceJob({
        title,
        status: "Queued",
        source: "QueuePilot",
        reportId: pendingContext?.reportId,
        reportTitle: pendingContext?.reportTitle,
      });

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
      source: data.metadata?.source || "QueuePilot",
      reportId:
        data.metadata?.reportId ||
        pendingContext?.reportId,
      reportTitle:
        data.metadata?.reportTitle ||
        pendingContext?.reportTitle,
    };

    setCurrentJob(queuedJob);

    localStorage.setItem(
      "appstack_saved_job",
      JSON.stringify(queuedJob)
    );

    if (pendingContext?.reportId) {
      const { error: eventError } =
        await createEvent({
          workspace_item_id: pendingContext.reportId,
          event_type: "job_created",
          description: `Execution job created for ${pendingContext.reportTitle}`,
          source: "Jobs",
          metadata: {
            job_id: data.id,
            job_title: data.title,
            report_id: pendingContext.reportId,
            report_title: pendingContext.reportTitle,
          },
        });

      if (eventError) {
        console.error(eventError);
        toast.error(
          "The job was queued, but report activity tracking failed."
        );
      }
    }

    localStorage.removeItem(
      "appstack_pending_job_context"
    );

    setPendingContext(null);
    setCreating(false);

    toast.success("Job queued successfully.");

    await executeJob(queuedJob);
  }

  function createAnotherJob() {
    setJobName("");
    setCurrentJob(null);
    setPendingContext(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <Page
      title="Jobs"
      description="Create execution jobs, persist their workflow state, and follow each job from queue to completion."
    >
      <Card
        title="Create Processing Job"
        className="mt-10"
      >
        {pendingContext && (
          <div className="mb-6 rounded-xl border border-blue-900/60 bg-blue-950/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              Source Report
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              {pendingContext.reportTitle}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Workspace handed this persisted report into the execution layer.
              The new job retains the source report relationship in metadata.
            </p>
          </div>
        )}

        {!pendingContext && (
          <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-400">
            Create a standalone processing job, or begin from a report in
            Workspace to preserve the report-to-job relationship.
          </p>
        )}

        <label className="text-sm font-medium text-slate-300">
          Job Name
        </label>

        <p className="mt-1 text-sm text-slate-500">
          Give the job a clear name so it is easy to identify in the Workspace.
        </p>

        <input
          value={jobName}
          onChange={(event) =>
            setJobName(event.target.value)
          }
          disabled={creating || executing}
          className="mt-4 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Investor Report Processing Job"
        />

        <Button
          onClick={createJob}
          className="mt-6"
          disabled={creating || executing}
        >
          {creating
            ? "Creating Job..."
            : executing
              ? "Executing Job..."
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

              {currentJob.reportTitle && (
                <p className="mt-2 text-sm text-slate-500">
                  Source report: {currentJob.reportTitle}
                </p>
              )}
            </div>

            <StatusBadge status={currentJob.status} />
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
                The job has entered the persisted execution queue state.
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
                Server-side execution has started and the persisted job is moving through its lifecycle.
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
                Processing finished and the final state was persisted successfully.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-sm leading-6 text-slate-400">
              Job lifecycle orchestration now runs through a server route instead
              of browser timers. The request is still a portfolio-scale execution
              boundary; a production deployment would replace the request-bound
              delay with durable worker and queue infrastructure.
            </p>
          </div>

          {currentJob.status === "Completed" && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/workspace"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Continue to Workspace
              </Link>

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

      <Card
        title="How this fits AppStack"
        className="mt-8"
      >
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Jobs is AppStack&apos;s execution layer. It converts workflow work into
          persisted operational jobs and demonstrates how authenticated application
          state moves through a server-orchestrated execution lifecycle.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              1. Workflow handoff
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Workspace can hand a specific persisted report into Jobs.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              2. Linked persistence
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              The job retains the source report ID and title in persisted metadata.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              3. Server orchestration
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              An authenticated server route advances the persisted job through its execution states.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              4. Production boundary
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Durable workers and queue infrastructure are the next production evolution.
            </p>
          </div>
        </div>
      </Card>
    </Page>
  );
}
