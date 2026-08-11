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
  getWorkspaceReportByAnalysisId,
  getWorkspaceReports,
  updateWorkspaceReport,
  type WorkspaceItem,
} from "../../lib/workspaceService";

type SavedAnalysis = {
  id?: string;
  name: string;
  address: string;
  purchasePrice: number;
  arv: number;
  repairCost: number;
  maxOffer: number;
  recommendation: string;
};

export default function ReportForgePage() {
  const [analysis, setAnalysis] =
    useState<SavedAnalysis | null>(null);
  const [report, setReport] = useState("");
  const [existingReport, setExistingReport] =
    useState<WorkspaceItem | null>(null);
  const [draftChanged, setDraftChanged] =
    useState(false);
  const [saved, setSaved] = useState(false);
  const [savedReports, setSavedReports] =
    useState<WorkspaceItem[]>([]);
  const [loadingReports, setLoadingReports] =
    useState(true);
  const [loadingCurrentReport, setLoadingCurrentReport] =
    useState(false);
  const [savingReport, setSavingReport] =
    useState(false);

  async function loadReports() {
    const { data, error } =
      await getWorkspaceReports();

    if (error) {
      console.error(error);
      toast.error(
        "Saved reports could not be loaded."
      );
      setLoadingReports(false);
      return;
    }

    setSavedReports(data || []);
    setLoadingReports(false);
  }

  async function loadExistingReport(
    analysisId: string
  ) {
    setLoadingCurrentReport(true);

    const { data, error } =
      await getWorkspaceReportByAnalysisId(
        analysisId
      );

    if (error) {
      console.error(error);
      toast.error(
        "The existing report status could not be checked."
      );
      setLoadingCurrentReport(false);
      return;
    }

    if (data) {
      setExistingReport(data);
      setReport(data.content || "");
      setDraftChanged(false);
      setSaved(true);
    } else {
      setExistingReport(null);
      setReport("");
      setDraftChanged(false);
      setSaved(false);
    }

    setLoadingCurrentReport(false);
  }

  useEffect(() => {
    const storedAnalysis = localStorage.getItem(
      "appstack_saved_analysis"
    );

    if (storedAnalysis) {
      try {
        const parsedAnalysis: SavedAnalysis =
          JSON.parse(storedAnalysis);

        setAnalysis(parsedAnalysis);

        if (parsedAnalysis.id) {
          loadExistingReport(
            parsedAnalysis.id
          );
        }
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

  function getReportSections() {
    if (!analysis) {
      return null;
    }

    const displayedRecommendation =
      formatRecommendation(analysis.recommendation);

    const interpretation =
      analysis.recommendation === "BUY"
        ? "The purchase price falls within the calculated maximum allowable offer."
        : analysis.recommendation === "NEGOTIATE"
          ? "The purchase price is slightly above the calculated maximum allowable offer."
          : "The purchase price exceeds the calculated maximum allowable offer.";

    return {
      displayedRecommendation,
      interpretation,
    };
  }

  function generateReport() {
    if (!analysis) {
      toast.error(
        "Analyze and save a deal before generating a report."
      );
      return;
    }

    if (!analysis.id) {
      toast.error(
        "This analysis was saved before report tracking was added. Save a new analysis before generating its report."
      );
      return;
    }

    const displayedRecommendation =
      formatRecommendation(
        analysis.recommendation
      );

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
        : analysis.recommendation ===
            "NEGOTIATE"
          ? "is slightly above"
          : "exceeds"
    } the calculated maximum allowable offer.`;

    setReport(generatedReport);
    setDraftChanged(true);
    setSaved(false);

    toast.success(
      existingReport
        ? "Revised investor report generated."
        : "Investor report generated."
    );
  }

  async function saveReport() {
    if (!report || !analysis) {
      toast.error(
        "Generate an investor report before saving it."
      );
      return;
    }

    if (!analysis.id) {
      toast.error(
        "This analysis does not have a report-tracking ID. Save a new analysis first."
      );
      return;
    }

    if (savingReport) {
      return;
    }

    setSavingReport(true);

    const reportInput = {
      title: `${analysis.name} Investor Report`,
      address: analysis.address,
      status: "Saved",
      content: report,
      analysisId: analysis.id,
    };

    const response = existingReport
      ? await updateWorkspaceReport(
          existingReport.id,
          reportInput
        )
      : await createWorkspaceReport(
          reportInput
        );

    if (response.error) {
      console.error(response.error);
      toast.error(
        existingReport
          ? "The existing report could not be updated."
          : "The report could not be saved."
      );
      setSavingReport(false);
      return;
    }

    const savedReport =
      response.data as WorkspaceItem;

    setExistingReport(savedReport);
    setReport(savedReport.content || report);
    setDraftChanged(false);
    setSaved(true);
    setSavingReport(false);

    localStorage.setItem(
      "appstack_saved_report",
      JSON.stringify(savedReport)
    );

    toast.success(
      existingReport
        ? "Report updated successfully."
        : "Report saved successfully."
    );

    await loadReports();
  }

  function getReportStatusMessage() {
    if (loadingCurrentReport) {
      return "Checking for an existing report...";
    }

    if (!analysis?.id) {
      return "This older analysis is not connected to report tracking. Save a new analysis to begin.";
    }

    if (draftChanged && existingReport) {
      return "A revised report has been generated. Save it to update the existing report.";
    }

    if (draftChanged) {
      return "A report has been generated but has not been saved yet.";
    }

    if (existingReport) {
      return "A saved investor report already exists for this analysis.";
    }

    return "No report has been generated for this analysis yet.";
  }

  return (
    <Page
      title="ReportForge"
      description="Transform persisted deal analyses into reusable investor reports that can move into execution."
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
              ReportForge uses the most recently
              saved analysis to prepare an investor
              report.
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
          title="Current Analysis"
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

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Report Status
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {getReportStatusMessage()}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={generateReport}
              disabled={
                loadingCurrentReport ||
                !analysis.id
              }
            >
              {existingReport || report
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
          title={
            existingReport && !draftChanged
              ? "Saved Investor Report"
              : "Generated Investor Report"
          }
          className="mt-8"
        >
          {analysis && getReportSections() && (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
              <div className="border-b border-slate-800 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Investor Report
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  {analysis.name}
                </h3>
                <p className="mt-2 text-slate-400">
                  {analysis.address}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-px bg-slate-800 md:grid-cols-2">
                <div className="bg-slate-950 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Deal Summary
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Purchase price ${analysis.purchasePrice.toLocaleString()},
                    ARV ${analysis.arv.toLocaleString()}, with estimated repairs
                    of ${analysis.repairCost.toLocaleString()}.
                  </p>
                </div>

                <div className="bg-slate-950 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Maximum Allowable Offer
                  </p>
                  <p className="mt-3 text-2xl font-bold">
                    ${analysis.maxOffer.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-950 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recommendation
                  </p>
                  <div className="mt-3">
                    <StatusBadge
                      status={
                        getReportSections()!
                          .displayedRecommendation
                      }
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Interpretation
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {getReportSections()!.interpretation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={saveReport}
              variant="success"
              disabled={
                savingReport ||
                (!draftChanged &&
                  Boolean(existingReport))
              }
            >
              {savingReport
                ? "Saving Report..."
                : existingReport &&
                    !draftChanged
                  ? "Report Saved"
                  : existingReport
                    ? "Update Report"
                    : "Save Report"}
            </Button>

            <Button
              variant="secondary"
              onClick={generateReport}
            >
              Regenerate
            </Button>
          </div>

          {saved && !draftChanged && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-sm text-green-400">
                This report is saved and connected to the current analysis.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                The persisted report is now available to Workspace and can move
                into the execution stage as a processing job.
              </p>

              <Link
                href="/workspace"
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Continue to Workspace
              </Link>
            </div>
          )}
        </Card>
      )}

      <Card
        title="How this fits AppStack"
        className="mt-8"
      >
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          ReportForge transforms a persisted Deal Analyzer result into a reusable
          reporting artifact. The report stays linked to its source analysis so
          downstream workflow stages can operate on shared application state.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              1. Persisted input
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              ReportForge loads the saved analysis instead of recreating deal data.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              2. Transformation
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              ReportForge transforms the saved analysis using deterministic application logic—not an AI model—so the report remains grounded in the calculated source data.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              3. Linked persistence
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The saved report remains connected to the analysis that produced it.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              4. Execution handoff
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Workspace can recognize the report and advance it toward job execution.
            </p>
          </div>
        </div>
      </Card>

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
                Generated reports will appear here
                after they are saved.
              </p>
            </div>
          )}

        {!loadingReports &&
          savedReports.length > 0 && (
            <ExpandableList
              items={savedReports}
              initialCount={5}
            >
              {(item, index) => (
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