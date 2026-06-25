"use client";

import { useEffect, useState } from "react";
import { reports } from "../data/reports";
import { supabase } from "../../lib/supabase";

export default function ReportForgePage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [report, setReport] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(
      "appstack_saved_analysis"
    );

    if (stored) {
      setAnalysis(JSON.parse(stored));
    }
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

  const { error } = await supabase
    .from("workspace_items")
    .insert({
      type: "report",
      title: savedReport.title,
      address: savedReport.address,
      status: "Saved",
      content: savedReport.content,
    });

  if (error) {
    console.error(error);
    alert("Supabase report save failed.");
    return;
  }

  setSaved(true);
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
  <div className="mt-8 rounded-xl border border-slate-800 p-5">
    <h2 className="text-xl font-semibold">
      Loaded Analysis
    </h2>

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
    <button
  onClick={generateReport}
  className="mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
>
  Generate Investor Report
</button>
  </div>
  )}
  {report && (
  <div className="mt-8 rounded-xl border border-slate-800 p-5">
    <h2 className="text-xl font-semibold">
      Generated Investor Report
    </h2>

    <pre className="mt-4 whitespace-pre-wrap text-slate-300">
      {report}
    </pre>
    <button
  onClick={saveReport}
  className="mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
>
  Save Report
</button>
{saved && (
  <p className="mt-4 text-green-400">
    Report saved to Supabase.
  </p>
)}
  </div>
)}
    </main>
  );
}