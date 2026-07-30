"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Button from "../components/Button";
import WorkspaceMemory from "../components/workspace/intelligence/WorkspaceMemory";
import WorkspaceIntelligence from "../components/workspace/intelligence/WorkspaceIntelligence";

import { getWorkspaceItems, createWorkspaceReport } from "../../lib/workspaceService";
import { createJob as createWorkspaceJob } from "../../lib/jobService";
import { createEvent } from "../../lib/eventService";
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
  const [items, setItems] = useState<any[]>([]);

  const [workspaceIntelligence, setWorkspaceIntelligence] = useState(
    emptyWorkspaceIntelligence
  );

  const [workspacePriorityActions, setWorkspacePriorityActions] = useState<
    WorkspacePriorityAction[]
  >([]);

  const [workspaceDirectorPlan, setWorkspaceDirectorPlan] =
    useState<WorkspaceDirectorPlan | null>(null);

  const [workspaceHistory, setWorkspaceHistory] =
    useState<WorkspaceHistory | null>(null);

  const [workspaceMetrics, setWorkspaceMetrics] =
    useState<WorkspaceMetrics | null>(null);

  const [workspaceKnowledge, setWorkspaceKnowledge] =
    useState<WorkspaceKnowledge | null>(null);

  const [workspaceForecast, setWorkspaceForecast] =
    useState<WorkspaceForecast | null>(null);

  const [workspaceStrategy, setWorkspaceStrategy] =
    useState<WorkspaceStrategy | null>(null);

  const [workspaceRisk, setWorkspaceRisk] =
    useState<WorkspaceRisk | null>(null);

  const [workspaceInsights, setWorkspaceInsights] =
    useState<WorkspaceInsights | null>(null);

  const [workspaceAIQuestion, setWorkspaceAIQuestion] = useState("");

  const [workspaceAIAnswer, setWorkspaceAIAnswer] =
    useState<WorkspaceAIResponse | null>(null);

  const [workspaceAILoading, setWorkspaceAILoading] = useState(false);
  const [workspaceAIStale, setWorkspaceAIStale] = useState(false);

  async function loadIntelligence() {
    const { data, error } = await getWorkspaceItems();

    if (error) {
      console.error("Intelligence page load error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      toast.error(error.message || "Failed to load workspace intelligence.");
      return;
    }

    const workspaceItems = data || [];
    setItems(workspaceItems);

    const {
      data: intelligence,
      error: intelligenceError,
    } = await buildWorkspaceIntelligence(workspaceItems);

    if (intelligenceError) {
      console.error("Workspace intelligence error:", intelligenceError);
      toast.error("Failed to build workspace intelligence.");
      return;
    }

    if (!intelligence) {
      return;
    }

    setWorkspaceIntelligence(intelligence.intelligence);
    setWorkspaceHistory(intelligence.history);
    setWorkspaceMetrics(intelligence.metrics);
    setWorkspaceKnowledge(intelligence.knowledge);
    setWorkspacePriorityActions(intelligence.priorityActions);
    setWorkspaceDirectorPlan(intelligence.directorPlan);
    setWorkspaceForecast(intelligence.forecast);
    setWorkspaceStrategy(intelligence.strategy);
    setWorkspaceRisk(intelligence.risk);
    setWorkspaceInsights(intelligence.insights);
  }

  useEffect(() => {
    loadIntelligence();

    const interval = window.setInterval(() => {
      loadIntelligence();
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  async function generateReportFromItem(item: any) {
    if (!item || item.type !== "analysis") {
      return;
    }

    const generatedReport = `Investor Report

Property:
${item.title}
${item.address}

Deal Summary:
This deal has a purchase price of $${item.metadata.purchasePrice.toLocaleString()}, an ARV of $${item.metadata.arv.toLocaleString()}, and estimated repairs of $${item.metadata.repairCost.toLocaleString()}.

Maximum Allowable Offer:
$${item.metadata.maxOffer.toLocaleString()}

Recommendation:
${item.status}

Interpretation:
Based on the 70% rule, this deal currently receives a ${item.status} recommendation.`;

    const { data, error } = await createWorkspaceReport({
      title: `${item.title} Investor Report`,
      address: item.address,
      status: "Saved",
      content: generatedReport,
    });

    if (error) {
      console.error(error);
      toast.error("Report generation failed.");
      return;
    }

    const { error: eventError } = await createEvent({
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
      toast.error("Event tracking failed.");
    }

    setItems((currentItems) => [data, ...currentItems]);
    await loadIntelligence();
  }

  async function createJobFromItem(item: any) {
    if (!item) {
      return;
    }

    const { data, error } = await createWorkspaceJob({
      title: `${item.title} Processing Job`,
      status: "Completed",
      source: "Intelligence",
    });

    if (error) {
      console.error(error);
      toast.error("Job creation failed.");
      return;
    }

    const { error: eventError } = await createEvent({
      workspace_item_id: data.id,
      event_type: "job_created",
      description: `Job created for ${item.title}`,
      source: "Intelligence",
      metadata: {
        original_item_id: item.id,
        job_title: data.title,
      },
    });

    if (eventError) {
      toast.error("Event tracking failed.");
    }

    setItems((currentItems) => [data, ...currentItems]);
    await loadIntelligence();
  }

  async function handlePriorityAction(action: WorkspacePriorityAction) {
    const item = items.find(
      (workspaceItem) => workspaceItem.id === action.itemId
    );

    if (!item) {
      toast.error("Workspace item not found.");
      return;
    }

    if (action.actionType === "generate_report") {
      await generateReportFromItem(item);

      if (workspaceAIAnswer) {
        setWorkspaceAIStale(true);
      }

      toast.success("Report generated from priority action.");
      return;
    }

    if (action.actionType === "create_job") {
      await createJobFromItem(item);

      if (workspaceAIAnswer) {
        setWorkspaceAIStale(true);
      }

      toast.success("Job created from priority action.");
      return;
    }

    toast("Open the Workspace page to review this item.");
  }

  async function askWorkspaceAI() {
    const question = workspaceAIQuestion.trim();

    if (!question) {
      toast.error("Enter a workspace question.");
      return;
    }

    if (
      !workspaceDirectorPlan ||
      !workspaceForecast ||
      !workspaceStrategy ||
      !workspaceRisk ||
      !workspaceInsights
    ) {
      toast.error("Workspace intelligence is still loading.");
      return;
    }

    setWorkspaceAILoading(true);

    try {
      const response = await fetch("/api/workspace-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspace: workspaceIntelligence,
          priorities: workspacePriorityActions,
          director: workspaceDirectorPlan,
          forecast: workspaceForecast,
          strategy: workspaceStrategy,
          risk: workspaceRisk,
          insights: workspaceInsights,
          question,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The workspace AI request failed."
        );
      }

      setWorkspaceAIAnswer(result.answer);
      setWorkspaceAIStale(false);

      window.setTimeout(() => {
        document
          .getElementById("workspace-ai-answer")
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
      description="Workspace intelligence, trends, memory, forecasts, strategy, risk, and AI guidance."
    >
      <WorkspaceMemory
        workspaceHistory={workspaceHistory}
        workspaceMetrics={workspaceMetrics}
        workspaceKnowledge={workspaceKnowledge}
      />

      <div className="mt-8">
        <WorkspaceIntelligence
          progressPercent={workspaceIntelligence.progressPercent}
          directorPlan={workspaceDirectorPlan}
          priorityActions={workspacePriorityActions}
          forecast={workspaceForecast}
          strategy={workspaceStrategy}
          risk={workspaceRisk}
          insights={workspaceInsights}
          aiQuestion={workspaceAIQuestion}
          aiAnswer={workspaceAIAnswer}
          aiLoading={workspaceAILoading}
          onAIQuestionChange={setWorkspaceAIQuestion}
          onAskAI={askWorkspaceAI}
          onPriorityAction={handlePriorityAction}
        />
      </div>

      {workspaceAIStale && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))] rounded-xl border border-amber-600 bg-amber-950 p-5 shadow-2xl">
          <p className="font-semibold text-amber-200">
            The workspace changed after this advice was generated.
          </p>

          <p className="mt-2 text-sm text-amber-100/80">
            Refresh the AI advice so it reflects the current workspace.
          </p>

          <div className="mt-4">
            <Button
              onClick={askWorkspaceAI}
              disabled={workspaceAILoading}
            >
              {workspaceAILoading ? "Refreshing..." : "Refresh Advice"}
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}
