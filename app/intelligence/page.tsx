"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Button from "../components/Button";
import WorkspaceMemory from "../components/workspace/intelligence/WorkspaceMemory";
import WorkspaceIntelligence from "../components/workspace/intelligence/WorkspaceIntelligence";

import {
  getWorkspaceItems,
  createWorkspaceReport,
} from "../../lib/workspaceService";
import { createEvent } from "../../lib/eventService";
import { supabase } from "../../lib/supabase";
import { buildWorkspaceIntelligence } from "../../lib/workspaceIntelligenceCoordinator";

import type { WorkspacePriorityAction } from "../../lib/workspacePriorityService";
import type { WorkspaceDirectorPlan } from "../../lib/workspaceDirectorService";
import type { WorkspaceForecast } from "../../lib/workspaceForecastService";
import type { WorkspaceRisk } from "../../lib/workspaceRiskService";
import type { WorkspaceStrategy } from "../../lib/workspaceStrategyService";
import type { WorkspaceInsights } from "../../lib/workspaceInsightsService";
import type { WorkspaceAIResponse } from "../../lib/workspaceAIResponse";
import type { WorkspaceHistory } from "../../lib/workspaceHistoryService";
import type { WorkspaceMetrics } from "../../lib/workspaceMetricsService";
import type { WorkspaceKnowledge } from "../../lib/workspaceKnowledgeService";

const emptyWorkspaceIntelligence = {
  totalItems: 0,
  needsReports: 0,
  needsJobs: 0,
  healthyItems: 0,
  unknownItems: 0,
  workspaceHealth: "Unknown",
  primaryBottleneck: "No workspace data",
  recommendedAction: "Load workspace intelligence.",
  progressPercent: 0,
};

export default function IntelligencePage() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);

  const [
    workspaceIntelligence,
    setWorkspaceIntelligence,
  ] = useState(emptyWorkspaceIntelligence);

  const [
    workspacePriorityActions,
    setWorkspacePriorityActions,
  ] = useState<WorkspacePriorityAction[]>([]);

  const [
    workspaceDirectorPlan,
    setWorkspaceDirectorPlan,
  ] = useState<WorkspaceDirectorPlan | null>(
    null
  );

  const [
    workspaceHistory,
    setWorkspaceHistory,
  ] = useState<WorkspaceHistory | null>(null);

  const [
    workspaceMetrics,
    setWorkspaceMetrics,
  ] = useState<WorkspaceMetrics | null>(null);

  const [
    workspaceKnowledge,
    setWorkspaceKnowledge,
  ] = useState<WorkspaceKnowledge | null>(null);

  const [
    workspaceForecast,
    setWorkspaceForecast,
  ] = useState<WorkspaceForecast | null>(null);

  const [
    workspaceStrategy,
    setWorkspaceStrategy,
  ] = useState<WorkspaceStrategy | null>(null);

  const [
    workspaceRisk,
    setWorkspaceRisk,
  ] = useState<WorkspaceRisk | null>(null);

  const [
    workspaceInsights,
    setWorkspaceInsights,
  ] = useState<WorkspaceInsights | null>(null);

  const [
    workspaceAIQuestion,
    setWorkspaceAIQuestion,
  ] = useState("");

  const [
    workspaceAIAnswer,
    setWorkspaceAIAnswer,
  ] = useState<WorkspaceAIResponse | null>(null);

  const [
    workspaceAILoading,
    setWorkspaceAILoading,
  ] = useState(false);

  const [
    workspaceAIStale,
    setWorkspaceAIStale,
  ] = useState(false);

  async function loadIntelligence() {
    const { data, error } =
      await getWorkspaceItems();

    if (error) {
      console.error(
        "Intelligence page load error:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      toast.error(
        error.message ||
          "Failed to load workspace intelligence."
      );

      return;
    }

    const workspaceItems = data || [];

    setItems(workspaceItems);

    const {
      data: intelligence,
      error: intelligenceError,
    } = await buildWorkspaceIntelligence(
      workspaceItems
    );

    if (intelligenceError) {
      console.error(
        "Workspace intelligence error:",
        intelligenceError
      );

      toast.error(
        "Failed to build workspace intelligence."
      );

      return;
    }

    if (!intelligence) {
      return;
    }

    setWorkspaceIntelligence(
      intelligence.intelligence
    );

    setWorkspaceHistory(
      intelligence.history
    );

    setWorkspaceMetrics(
      intelligence.metrics
    );

    setWorkspaceKnowledge(
      intelligence.knowledge
    );

    setWorkspacePriorityActions(
      intelligence.priorityActions
    );

    setWorkspaceDirectorPlan(
      intelligence.directorPlan
    );

    setWorkspaceForecast(
      intelligence.forecast
    );

    setWorkspaceStrategy(
      intelligence.strategy
    );

    setWorkspaceRisk(
      intelligence.risk
    );

    setWorkspaceInsights(
      intelligence.insights
    );
  }

  useEffect(() => {
    let mounted = true;

    async function refreshIntelligence() {
      if (!mounted) {
        return;
      }

      await loadIntelligence();
    }

    refreshIntelligence();

    const channel = supabase
      .channel("intelligence-workspace-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_items",
        },
        () => {
          refreshIntelligence();

          if (workspaceAIAnswer) {
            setWorkspaceAIStale(true);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [workspaceAIAnswer]);

  async function generateReportFromItem(
    item: any
  ) {
    if (
      !item ||
      item.type !== "analysis"
    ) {
      return;
    }

    const formatCurrency = (
      value: unknown
    ) => {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {
        return "Not available";
      }

      return `$${value.toLocaleString()}`;
    };

    const purchasePrice =
      formatCurrency(
        item.metadata?.purchasePrice
      );

    const arv =
      formatCurrency(
        item.metadata?.arv
      );

    const repairCost =
      formatCurrency(
        item.metadata?.repairCost
      );

    const maxOffer =
      formatCurrency(
        item.metadata?.maxOffer
      );

    const generatedReport = `Investor Report

Property:
${item.title}
${item.address || "Address not available"}

Deal Summary:
This deal has a purchase price of ${purchasePrice}, an ARV of ${arv}, and estimated repairs of ${repairCost}.

Maximum Allowable Offer:
${maxOffer}

Recommendation:
${item.status || "Not available"}

Interpretation:
Based on the available deal data, this deal currently receives a ${
      item.status || "Not available"
    } recommendation.`;

    const {
      data,
      error,
    } = await createWorkspaceReport({
      title: `${item.title} Investor Report`,
      address: item.address,
      status: "Saved",
      content: generatedReport,
      analysisId: item.id,
    });

    if (error) {
      console.error(error);
      toast.error(
        "Report generation failed."
      );
      return;
    }

    const {
      error: eventError,
    } = await createEvent({
      workspace_item_id: data.id,
      event_type: "report_generated",
      description: `Report generated for ${item.title}`,
      source: "Intelligence",
      metadata: {
        original_item_id: item.id,
        report_title: data.title,
      },
    });

    if (eventError) {
      toast.error(
        "Event tracking failed."
      );
    }

    setItems(
      (currentItems) => [
        data,
        ...currentItems,
      ]
    );

    await loadIntelligence();
  }

  function openJobCreationForItem(
    item: any
  ) {
    if (
      !item ||
      item.type !== "report"
    ) {
      toast.error(
        "Select a report before creating an execution job."
      );

      return false;
    }

    localStorage.setItem(
      "appstack_pending_job_context",
      JSON.stringify({
        reportId: item.id,
        reportTitle: item.title,
      })
    );

    router.push("/jobs");

    return true;
  }

  async function handlePriorityAction(
    action: WorkspacePriorityAction
  ) {
    const item = items.find(
      (workspaceItem) =>
        workspaceItem.id === action.itemId
    );

    if (!item) {
      toast.error(
        "Workspace item not found."
      );

      return;
    }

    if (
      action.actionType ===
      "generate_report"
    ) {
      await generateReportFromItem(
        item
      );

      if (workspaceAIAnswer) {
        setWorkspaceAIStale(true);
      }

      toast.success(
        "Report generated from priority action."
      );

      return;
    }

    if (
      action.actionType ===
      "create_job"
    ) {
      const opened =
        openJobCreationForItem(
          item
        );

      if (
        opened &&
        workspaceAIAnswer
      ) {
        setWorkspaceAIStale(true);
      }

      return;
    }

    toast(
      "Open the Workspace page to review this item."
    );
  }

  async function askWorkspaceAI() {
    const question =
      workspaceAIQuestion.trim();

    if (!question) {
      toast.error(
        "Enter a workspace question."
      );

      return;
    }

    if (
      !workspaceDirectorPlan ||
      !workspaceForecast ||
      !workspaceStrategy ||
      !workspaceRisk ||
      !workspaceInsights
    ) {
      toast.error(
        "Workspace intelligence is still loading."
      );

      return;
    }

    setWorkspaceAILoading(true);

    try {
      const response = await fetch(
        "/api/workspace-ai",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            workspace:
              workspaceIntelligence,
            priorities:
              workspacePriorityActions,
            director:
              workspaceDirectorPlan,
            forecast:
              workspaceForecast,
            strategy:
              workspaceStrategy,
            risk:
              workspaceRisk,
            insights:
              workspaceInsights,
            question,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "The workspace AI request failed."
        );
      }

      setWorkspaceAIAnswer(
        result.answer
      );

      setWorkspaceAIStale(false);

      window.setTimeout(() => {
        document
          .getElementById(
            "workspace-ai-answer"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The workspace AI request failed.";

      toast.error(message);
    } finally {
      setWorkspaceAILoading(false);
    }
  }

  return (
    <Page
      title="Intelligence"
      description="Transform live workspace activity into operational intelligence, priorities, forecasts, risk, and advisory guidance."
    >
      <WorkspaceMemory
        workspaceHistory={
          workspaceHistory
        }
        workspaceMetrics={
          workspaceMetrics
        }
        workspaceKnowledge={
          workspaceKnowledge
        }
      />

      <div className="mt-10">
        <WorkspaceIntelligence
          progressPercent={
            workspaceIntelligence.progressPercent
          }
          directorPlan={
            workspaceDirectorPlan
          }
          priorityActions={
            workspacePriorityActions
          }
          forecast={
            workspaceForecast
          }
          strategy={
            workspaceStrategy
          }
          risk={
            workspaceRisk
          }
          insights={
            workspaceInsights
          }
          aiQuestion={
            workspaceAIQuestion
          }
          aiAnswer={
            workspaceAIAnswer
          }
          aiLoading={
            workspaceAILoading
          }
          isAdviceStale={
            workspaceAIStale
          }
          onAIQuestionChange={
            setWorkspaceAIQuestion
          }
          onAskAI={
            askWorkspaceAI
          }
          onPriorityAction={
            handlePriorityAction
          }
        />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Architecture Note
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Intelligence converts authenticated,
              user-scoped workspace activity into
              deterministic priorities, forecasts,
              risk, strategy, and insights before AI
              is allowed to synthesize that knowledge.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Live state",
              "Deterministic analysis",
              "AI synthesis",
              "Execution handoff",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-semibold text-muted"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {workspaceAIStale && (
        <div
          className="
            fixed bottom-6 right-6 z-50
            w-[min(420px,calc(100vw-3rem))]
            rounded-xl border p-5 shadow-2xl
            border-amber-300 bg-amber-50
            dark:border-amber-700 dark:bg-amber-950
          "
        >
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            The workspace changed after this advice
            was generated.
          </p>

          <p className="mt-2 text-sm text-amber-800 dark:text-amber-100/80">
            Refresh the AI advice so it reflects the
            current workspace.
          </p>

          <div className="mt-4">
            <Button
              onClick={
                askWorkspaceAI
              }
              disabled={
                workspaceAILoading
              }
            >
              {workspaceAILoading
                ? "Refreshing..."
                : "Refresh Advice"}
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}