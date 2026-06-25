"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [savedAnalysis, setSavedAnalysis] = useState<any>(null);
  const [savedReport, setSavedReport] = useState<any>(null);
  const [savedJob, setSavedJob] = useState<any>(null);

  useEffect(() => {
    const analysis = localStorage.getItem("appstack_saved_analysis");
    const report = localStorage.getItem("appstack_saved_report");
    const job = localStorage.getItem("appstack_saved_job");

    if (analysis) setSavedAnalysis(JSON.parse(analysis));
    if (report) setSavedReport(JSON.parse(report));
    if (job) setSavedJob(JSON.parse(job));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-bold">AppStack Dashboard</h1>

        <p className="mt-3 text-slate-400">
          Control center for modules, workflows, and platform activity.
        </p>

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-sm text-slate-400">Saved Analyses</p>
            <p className="mt-2 text-4xl font-bold">
              {savedAnalysis ? 1 : 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-sm text-slate-400">Reports</p>
            <p className="mt-2 text-4xl font-bold">
              {savedReport ? 1 : 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-sm text-slate-400">Jobs</p>
            <p className="mt-2 text-4xl font-bold">
              {savedJob ? 1 : 0}
            </p>
          </div>
        </section>

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
    </main>
  );
}