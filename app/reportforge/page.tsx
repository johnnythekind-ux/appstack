"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import ExpandableList from "../components/ExpandableList";

import {
  createWorkspaceReport,
  getWorkspaceReports,
} from "../../lib/workspaceService";

export default function ReportForgePage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [report, setReport] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  async function loadReports() {
    const { data, error } = await getWorkspaceReports();

    if (error) {
      console.error(error);
      toast.error("Saved reports could not be loaded.");
      setLoadingReports(false);
      return;
    }

    const sortedReports = [...(data || [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

    setSavedReports(sortedReports);
    setLoadingReports(false);
  }

  useEffect(() => {
    const storedAnalysis = localStorage.getItem(
      "appstack_saved_analysis"
    );

    if (storedAnalysis) {
      try {
        setAnalysis(JSON.parse(storedAnalysis));
      } catch (error) {
        console.error(
          "Saved analysis could not be read:",
          error
        );

        toast.error(
          "The most recent analysis could not be loaded."
        );
      }
    }

    loadReports();
  }, []);

  function formatRecommendation(
    recommendation: string
  ) {
    return recommendation === "PASS"
      ? "PASS ON DEAL"
      : recommendation;
  }

  function generateReport() {
    if (!analysis) {
      toast.error(
        "Analyze and save a deal before generating a report."
      );
      return;
    }

    const displayedRecommendation =
      formatRecommendation(analysis.recommendation);

    const generatedReport = `Investor Report

Property:
${analysis.name}
${analysis.address}

Deal Summary:
This deal has a purchase price of $${analysis.purchasePrice.toLocaleString()}, an ARV of $${analysis.arv.toLocaleString()}, and estimated repairs of $${analysis.repairCost.toLocaleString()}.

Maximum Allowable Offer:
$${analysis.maxOffer.toLocaleString()}

Recommendation:
${displayedRecommendation}

Interpretation:
Based on the 70% rule, the purchase price ${
      analysis.recommendation === "BUY"
        ? "falls within"
        : analysis.recommendation === "NEGOTIATE"
          ? "is slightly above"
          : "exceeds"
    } the calculated maximum allowable offer.`;

    setReport(generatedReport);
    setSaved(false);

    toast.success("Investor report generated.");
  }

  async function saveReport() {
    if (!report || !analysis) {
      toast.error(
        "Generate an investor report before saving it."
      );
      return;
    }

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
      toast.error("The report could not be saved.");
      return;
    }

    setSaved(true);
    toast.success("Report saved successfully.");

    await loadReports();
  }

  return (
    <Page
      title="ReportForge"
      description="Turn completed deal analyses into clear, reusable investor reports."
    >
      {!analysis && (
        <Card
          title="No Analysis Loaded"
          className="mt-10"
        >
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
            <p className="text-lg font-semibold">
              Start with a saved deal analysis.
            </p>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              ReportForge uses the most recently saved
              analysis to prepare an investor report.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/deal-analyzer"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Analyze a Deal
              </Link>

              <Link
                href="/workspace"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Open Workspace
              </Link>
            </div>
          </div>
        </Card>
      )}

      {analysis && (
        <Card
          title="Analysis Ready for Reporting"
          className="mt-10"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Loaded Analysis
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {analysis.name}
              </h2>

              <p className="mt-2 text-slate-400">
                {analysis.address}
              </p>
            </div>

            <StatusBadge
              status={formatRecommendation(
                analysis.recommendation
              )}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Purchase Price
              </p>

              <p className="mt-2 text-xl font-bold">
                $
                {analysis.purchasePrice.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                ARV
              </p>

              <p className="mt-2 text-xl font-bold">
                ${analysis.arv.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Repairs
              </p>

              <p className="mt-2 text-xl font-bold">
                $
                {analysis.repairCost.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Maximum Offer
              </p>

              <p className="mt-2 text-xl font-bold">
                $
                {analysis.maxOffer.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={generateReport}>
              {report
                ? "Regenerate Investor Report"
                : "Generate Investor Report"}
            </Button>

            <Link
              href="/deal-analyzer"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Analyze Another Deal
            </Link>
          </div>
        </Card>
      )}

      {report && (
        <Card
          title="Generated Investor Report"
          className="mt-8"
        >
          <pre className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-sm leading-7 text-slate-300">
            {report}
          </pre>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={saveReport}
              variant="success"
              disabled={saved}
            >
              {saved ? "Report Saved" : "Save Report"}
            </Button>

            <Button
              variant="secondary"
              onClick={generateReport}
            >
              Regenerate
            </Button>
          </div>

          {saved && (
            <p className="mt-4 text-sm text-green-400">
              Report saved successfully.
            </p>
          )}
        </Card>
      )}

      <Card
        title="Saved Reports"
        className="mt-10"
      >
        {loadingReports && (
          <div className="rounded-xl border border-slate-800 p-5 text-sm text-slate-400">
            Loading saved reports...
          </div>
        )}

        {!loadingReports &&
          savedReports.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <p className="font-semibold">
                No reports saved yet
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Generated reports will appear here after
                they are saved.
              </p>
            </div>
          )}

        {!loadingReports &&
          savedReports.length > 0 && (
            <ExpandableList
  items={savedReports}
  initialCount={5}
>
  {(item: any, index: number) => (
    <div
      key={`${item.id}-${item.created_at ?? "no-date"}-${index}`}
      className="flex flex-col gap-3 rounded-xl border border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Investor Report
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

        {item.created_at && (
          <p className="mt-1 text-xs text-slate-500">
            {new Date(
              item.created_at
            ).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )}
</ExpandableList>
          )}
      </Card>
    </Page>
  );
}