"use client";

import Page from "../components/Page";
import Card from "../components/Card";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { getWorkspaceItems } from "../../lib/workspaceService";

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
  async function loadItems() {
    const { data, error } = await getWorkspaceItems();

    if (error) {
      console.error(error);
      toast.error("Failed to load dashboard data.");
      return;
    }
    setItems(data || []);
  }

    loadItems();

  const interval = setInterval(() => {
    loadItems();
  }, 2000);

  return () => clearInterval(interval);
}, []);

const analyses = items.filter((item) => item.type === "analysis");
const reports = items.filter((item) => item.type === "report");
const jobs = items.filter((item) => item.type === "job");
const activeJobs = jobs.filter((job) => job.status !== "Completed");
const completedJobs = jobs.filter((job) => job.status === "Completed");
const latestAnalysis = analyses[0];

const totalItems = items.length;
const recentItems = items.slice(0, 8);

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

  return (
  <Page
    title="Dashboard"
    description="Control center for modules, workflows, and platform activity."
  >
      <div className="mx-auto max-w-6xl px-6 py-12">

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
  <p className="text-sm text-slate-400">Total Items</p>

  <p className="mt-2 text-4xl font-bold">
    {totalItems}
  </p>
</Card>
          <Card>
            <p className="text-sm text-slate-400">Saved Analyses</p>
            <p className="mt-2 text-4xl font-bold">
              {analyses.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">Reports</p>
            <p className="mt-2 text-4xl font-bold">
              {reports.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">Jobs</p>
            <p className="mt-2 text-4xl font-bold">
              {jobs.length}
            </p>
          </Card>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
  <Card>
    <p className="text-sm text-slate-400">Active Jobs</p>
    <p className="mt-2 text-3xl font-bold">{activeJobs.length}</p>
  </Card>

  <Card>
    <p className="text-sm text-slate-400">Completed Jobs</p>
    <p className="mt-2 text-3xl font-bold">{completedJobs.length}</p>
  </Card>

  <Card>
    <p className="text-sm text-slate-400">Reports Generated</p>
    <p className="mt-2 text-3xl font-bold">{reports.length}</p>
  </Card>

  <Card>
    <p className="text-sm text-slate-400">Latest Analysis</p>
    <p className="mt-2 truncate text-lg font-semibold">
      {latestAnalysis ? latestAnalysis.title : "None yet"}
    </p>
  </Card>
</section>

        <Card
  title="Recent Activity"
  className="mt-10"
>

  <div className="mt-6 space-y-4">
    {recentItems.map((item) => (
      <div
        key={item.id}
        className="rounded-lg border border-slate-800 p-4"
      >
        <p className="text-sm text-slate-400">
  {getItemIcon(item.type)} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
</p>

        <h3 className="mt-1 font-semibold">
          {item.title}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
  Status: {item.status}
</p>

<p className="mt-1 text-xs text-slate-600">
  {new Date(item.created_at).toLocaleString()}
</p>
      </div>
    ))}
  </div>
</Card>

        <section className="mt-10 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold">Platform Workflow</h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm text-slate-400">Step 1</p>
              <h3 className="mt-2 font-semibold">Analyze Deal</h3>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm text-slate-400">Step 2</p>
              <h3 className="mt-2 font-semibold">Save to Workspace</h3>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm text-slate-400">Step 3</p>
              <h3 className="mt-2 font-semibold">Generate Report</h3>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm text-slate-400">Step 4</p>
              <h3 className="mt-2 font-semibold">Complete Job</h3>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}