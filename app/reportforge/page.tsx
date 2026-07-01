"use client";

import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createWorkspaceReport,
  getWorkspaceReports,
} from "../../lib/workspaceService";

export default function ReportForgePage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [report, setReport] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  async function loadReports() {
  const { data, error } = await getWorkspaceReports();

  if (error) {
    console.error(error);
    toast.error("Failed to load reports.");
    return;
  }

  setSavedReports(data || []);
}

useEffect(() => {
  const stored = localStorage.getItem(
    "appstack_saved_analysis"
  );

  if (stored) {
    setAnalysis(JSON.parse(stored));
  }

  loadReports();
}, []);

function generateReport() {
  if (!analysis) return;

  const generatedReport = `
Investor Report

Property:
${analysis.name}
${analysis.address}

Deal Summary:
This deal has a purchase price of $${analysis.purchasePrice.toLocaleString()}, an ARV of $${analysis.arv.toLocaleString()}, and estimated repairs of $${analysis.repairCost.toLocaleString()}.

Maximum Allowable Offer:
$${analysis.maxOffer.toLocaleString()}

Recommendation:
${analysis.recommendation}

Interpretation:
Based on the 70% rule, this deal currently receives a ${analysis.recommendation} recommendation.
`;

  setReport(generatedReport);
}

async function saveReport() {
  if (!report || !analysis) return;

  const savedReport = {
    title: `${analysis.name} Investor Report`,
    address: analysis.address,
    content: report,
  };

  localStorage.setItem(
    "appstack_saved_report",
    JSON.stringify(savedReport)
  );

  const { error } = await createWorkspaceReport({
  title: savedReport.title,
  address: savedReport.address,
  status: "Saved",
  content: savedReport.content,
});

  if (error) {
    console.error(error);
    toast.error("Failed to save report.");
    return;
  }

  setSaved(true);
  toast.success("Report saved successfully.");
}

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold">
        ReportForge
      </h1>

      <p className="text-slate-400 mt-2">
        Generate investor reports.
      </p>

      {analysis && (
  <Card
  title="Loaded Analysis"
  className="mt-8"
>

    <p className="mt-4">
      <strong>Name:</strong> {analysis.name}
    </p>

    <p>
      <strong>Address:</strong> {analysis.address}
    </p>

    <p>
      <strong>Purchase Price:</strong> $
      {analysis.purchasePrice.toLocaleString()}
    </p>

    <p>
      <strong>ARV:</strong> $
      {analysis.arv.toLocaleString()}
    </p>

    <p>
      <strong>Repairs:</strong> $
      {analysis.repairCost.toLocaleString()}
    </p>

    <p>
      <strong>Maximum Offer:</strong> $
      {analysis.maxOffer.toLocaleString()}
    </p>

    <p>
      <strong>Recommendation:</strong>{" "}
      {analysis.recommendation}
    </p>
    <Button onClick={generateReport} className="mt-6">
  Generate Investor Report
</Button>
  </Card>
  )}
  {report && (
  <Card
  title="Generated Investor Report"
  className="mt-8"
  actions={
    <Button
      variant="secondary"
      onClick={loadReports}
    >
      Refresh
    </Button>
  }
>

    <pre className="mt-4 whitespace-pre-wrap text-slate-300">
      {report}
    </pre>
    <Button
  onClick={saveReport}
  className="mt-6"
  variant="success"
>
  Save Report
</Button>
{saved && (
  <p className="mt-4 text-green-400">
    Report saved to Supabase.
  </p>
)}
  </Card>
)}
<section className="mt-10 rounded-xl border border-slate-800 p-5">
  <h2 className="text-xl font-semibold">Saved Reports</h2>

  <div className="mt-5 space-y-4">
    {savedReports.map((item) => (
      <div
        key={item.id}
        className="rounded-lg border border-slate-800 p-4"
      >
        <p className="text-sm text-slate-400">
          {item.status}
        </p>

        <h3 className="mt-1 font-semibold">
          {item.title}
        </h3>

        {item.address && (
          <p className="mt-2 text-slate-400">
            {item.address}
          </p>
        )}
      </div>
    ))}
  </div>
</section>
    </main>
  );
}