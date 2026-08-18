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
  getWorkspaceAnalysisById,
  getWorkspaceReportByAnalysisId,
  getWorkspaceReports,
  updateWorkspaceReport,
  type WorkspaceItem,
} from "../../lib/workspaceService";
import { downloadInvestorReportPdf } from "../../lib/reportPdf";

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

function workspaceItemToSavedAnalysis(
  item: WorkspaceItem
): SavedAnalysis {
  const metadata = item.metadata ?? {};

  const toNumber = (value: unknown) => {
    const numericValue =
      typeof value === "number" ? value : Number(value);

    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  return {
    id: item.id,
    name: item.title,
    address: item.address ?? "",
    purchasePrice: toNumber(metadata.purchasePrice),
    arv: toNumber(metadata.arv),
    repairCost: toNumber(metadata.repairCost),
    maxOffer: toNumber(metadata.maxOffer),
    recommendation: String(item.status ?? ""),
  };
}

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
    let mounted = true;

    async function initializeReportForge() {
      await loadReports();

      const params = new URLSearchParams(
        window.location.search
      );
      const requestedAnalysisId =
        params.get("analysisId");

      if (requestedAnalysisId) {
        const { data, error } =
          await getWorkspaceAnalysisById(
            requestedAnalysisId
          );

        if (!mounted) {
          return;
        }

        if (error) {
          console.error(
            "Requested analysis could not be loaded:",
            error
          );
          toast.error(
            "The report's source analysis could not be loaded."
          );
          return;
        }

        if (!data) {
          toast.error(
            "The report's source analysis was not found."
          );
          return;
        }

        const requestedAnalysis =
          workspaceItemToSavedAnalysis(data);

        setAnalysis(requestedAnalysis);

        localStorage.setItem(
          "appstack_saved_analysis",
          JSON.stringify(requestedAnalysis)
        );

        await loadExistingReport(data.id);
        return;
      }

      const storedAnalysis = localStorage.getItem(
        "appstack_saved_analysis"
      );

      if (!storedAnalysis) {
        return;
      }

      try {
        const parsedAnalysis: SavedAnalysis =
          JSON.parse(storedAnalysis);

        if (!mounted) {
          return;
        }

        setAnalysis(parsedAnalysis);

        if (parsedAnalysis.id) {
          await loadExistingReport(
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

    initializeReportForge();

    return () => {
      mounted = false;
    };
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

  function downloadReportPdf() {
    if (!analysis || !report) {
      toast.error(
        "Generate an investor report before downloading it."
      );
      return;
    }

    const sections = getReportSections();

    if (!sections) {
      toast.error(
        "The report details could not be prepared for download."
      );
      return;
    }

    downloadInvestorReportPdf({
      propertyName: analysis.name,
      address: analysis.address,
      purchasePrice: analysis.purchasePrice,
      arv: analysis.arv,
      repairCost: analysis.repairCost,
      maxOffer: analysis.maxOffer,
      recommendation: sections.displayedRecommendation,
      interpretation: sections.interpretation,
    });

    toast.success("Investor report downloaded.");
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
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Start with a saved deal analysis.
            </p>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
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
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
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

              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {analysis.name}
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
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
            <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Purchase Price
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                $
                {analysis.purchasePrice.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ARV
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                ${analysis.arv.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Repairs
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                $
                {analysis.repairCost.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Maximum Offer
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                $
                {analysis.maxOffer.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Report Status
            </p>

            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
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
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
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
            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Investor Report
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analysis.name}
                </h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  {analysis.address}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-2 dark:bg-slate-800">
                <div className="bg-slate-50 p-6 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Deal Summary
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                    Purchase price ${analysis.purchasePrice.toLocaleString()},
                    ARV ${analysis.arv.toLocaleString()}, with estimated repairs
                    of ${analysis.repairCost.toLocaleString()}.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Maximum Allowable Offer
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ${analysis.maxOffer.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-50 p-6 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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

                <div className="bg-slate-50 p-6 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Interpretation
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
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

            <Button
              variant="secondary"
              onClick={downloadReportPdf}
            >
              Download PDF
            </Button>
          </div>

          {saved && !draftChanged && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                This report is saved and connected to the current analysis.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
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
        <p className="max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          ReportForge transforms a persisted Deal Analyzer result into a reusable
          reporting artifact. The report stays linked to its source analysis so
          downstream workflow stages can operate on shared application state.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              1. Persisted input
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              ReportForge loads the saved analysis instead of recreating deal data.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              2. Transformation
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              ReportForge transforms the saved analysis using deterministic application logic—not an AI model—so the report remains grounded in the calculated source data.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              3. Linked persistence
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              The saved report remains connected to the analysis that produced it.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              4. Execution handoff
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
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
          <div className="rounded-xl border border-slate-300 p-5 text-sm text-slate-500 dark:text-slate-400">
            Loading saved reports...
          </div>
        )}

        {!loadingReports &&
          savedReports.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                No reports saved yet
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
                  className="flex flex-col gap-3 rounded-xl border border-slate-300 bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Investor Report
                    </p>

                    <h3 className="mt-1 truncate font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>

                    {item.address && (
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {item.address}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.status || "Saved"}
                    </p>

                    {item.created_at && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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