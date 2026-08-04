"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import ExpandableList from "../components/ExpandableList";
import Page from "../components/Page";
import Card from "../components/Card";

import ExecutiveBriefing, {
  type ExecutiveBriefingModel,
} from "../components/platform/ExecutiveBriefing";

import { getWorkspaceItems } from "../../lib/workspaceService";

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await getWorkspaceItems();

      if (error) {
        console.error(error);
        toast.error("Dashboard data could not be loaded.");
        setLoading(false);
        return;
      }

      setItems(data || []);
      setLoading(false);
    }

    loadItems();

    const interval = window.setInterval(() => {
      loadItems();
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  const analyses = items.filter(
    (item) => item.type === "analysis"
  );

  const reports = items.filter(
    (item) => item.type === "report"
  );

  const jobs = items.filter(
    (item) => item.type === "job"
  );

  const activeJobs = jobs.filter(
    (job) => job.status !== "Completed"
  );

  const completedJobs = jobs.filter(
    (job) => job.status === "Completed"
  );

  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  const recentItems = sortedItems.slice(0, 8);
  const latestAnalysis = analyses
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];

    const platformStatus: ExecutiveBriefingModel = {
  health:
    activeJobs.length > 0
      ? "Active"
      : "Healthy",

  mission:
    activeJobs.length > 0
      ? "Complete active processing jobs."
      : "Review your latest workspace activity.",

  priorityCount: activeJobs.length,

  progress:
    jobs.length === 0
      ? 100
      : Math.round(
          (completedJobs.length / jobs.length) * 100
        ),

  lastUpdated: new Date().toLocaleTimeString(),
};

  function getItemIcon(type: string) {
    switch (type) {
      case "analysis":
        return "📊";

      case "report":
        return "📄";

      case "job":
        return "⚙️";

      default:
        return "📁";
    }
  }

  function formatItemType(type: string) {
    return (
      type.charAt(0).toUpperCase() +
      type.slice(1)
    );
  }

  return (
    <Page
      title="Dashboard"
      description="See what changed, review platform activity, and continue your work."
    >

<ExecutiveBriefing status={platformStatus} />

      <section className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Items
          </p>

          <p className="mt-2 text-3xl font-bold">
            {items.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Analyses
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analyses.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reports
          </p>

          <p className="mt-2 text-3xl font-bold">
            {reports.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Jobs
          </p>

          <p className="mt-2 text-3xl font-bold">
            {jobs.length}
          </p>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Jobs
          </p>

          <p className="mt-2 text-2xl font-bold">
            {activeJobs.length}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Jobs still moving through execution.
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completed Jobs
          </p>

          <p className="mt-2 text-2xl font-bold">
            {completedJobs.length}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Execution work completed successfully.
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Latest Analysis
          </p>

          <p className="mt-2 truncate text-lg font-bold">
            {latestAnalysis
              ? latestAnalysis.title
              : "No analyses yet"}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            {latestAnalysis?.address ||
              "Your latest saved deal will appear here."}
          </p>
        </Card>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/workspace"
          className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-blue-500 hover:bg-slate-900"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Continue Work
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Open Workspace
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review active items and complete priority actions.
          </p>
        </Link>

        <Link
          href="/intelligence"
          className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-blue-500 hover:bg-slate-900"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Understand Activity
          </p>

          <h2 className="mt-2 text-xl font-bold">
            View Intelligence
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Explore patterns, forecasts, risks, and recommendations.
          </p>
        </Link>

        <Link
          href="/deal-analyzer"
          className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-blue-500 hover:bg-slate-900"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Start New Work
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Analyze a Deal
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Evaluate another property and save it to the workspace.
          </p>
        </Link>
      </section>

      <Card
        title="Recent Activity"
        className="mt-8"
      >
        {loading && (
          <div className="rounded-xl border border-slate-800 p-5 text-sm text-slate-400">
            Loading recent activity...
          </div>
        )}

        {!loading && recentItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
            <p className="font-semibold">
              No activity yet
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Analyze a deal to begin building your workspace history.
            </p>

            <Link
              href="/deal-analyzer"
              className="mt-4 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Analyze your first deal
            </Link>
          </div>
        )}

        {!loading && recentItems.length > 0 && (
          <ExpandableList
  items={recentItems}
  initialCount={5}
>
  {(item: any, index: number) => (
    <div
      key={`${item.type}-${item.id}-${item.created_at ?? "no-date"}-${index}`}
      className="flex flex-col gap-3 rounded-xl border border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {getItemIcon(item.type)}{" "}
          {formatItemType(item.type)}
        </p>

        <h3 className="mt-1 truncate font-semibold">
          {item.title}
        </h3>

        {item.address && (
          <p className="mt-1 truncate text-sm text-slate-400">
            {item.address}
          </p>
        )}
      </div>

      <div className="shrink-0 text-left sm:text-right">
        <p className="text-sm font-medium text-slate-300">
          {item.status || "Saved"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {new Date(item.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )}
</ExpandableList>
        )}
      </Card>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Platform Workflow
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            From property analysis to completed work
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            AppStack keeps each step connected as work moves through the platform.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 1
            </p>

            <h3 className="mt-2 font-semibold">
              Analyze Deal
            </h3>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 2
            </p>

            <h3 className="mt-2 font-semibold">
              Save to Workspace
            </h3>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 3
            </p>

            <h3 className="mt-2 font-semibold">
              Generate Report
            </h3>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 4
            </p>

            <h3 className="mt-2 font-semibold">
              Complete Job
            </h3>
          </div>
        </div>
      </section>
    </Page>
  );
}