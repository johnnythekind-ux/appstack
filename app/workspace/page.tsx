"use client";

import { getWorkspaceRecommendation } from "../../lib/recommendationService";
import { analyzeWorkspaceEvents } from "../../lib/analysisService";
import Toolbar from "../components/Toolbar";
import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import { RecommendedActionButton } from "../components/RecommendedActionButton";
import WorkspaceCoach from "../components/workspace/WorkspaceCoach";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import { createJob as createWorkspaceJob } from "../../lib/jobService";
import {
  createEvent,
  getEventsForWorkspaceItem,
} from "../../lib/eventService";
import {
  getWorkspaceItems,
  deleteWorkspaceItem,
  duplicateWorkspaceItem,
  createWorkspaceReport,
} from "../../lib/workspaceService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import SearchBar from "../components/SearchBar";
import { buildWorkspaceIntelligence } from "../../lib/workspaceIntelligenceCoordinator";
import type { WorkspacePriorityAction } from "../../lib/workspacePriorityService";
import type { WorkspaceDirectorPlan } from "../../lib/workspaceDirectorService";
import type { WorkspaceForecast } from "../../lib/workspaceForecastService";
import type { WorkspaceRisk } from "../../lib/workspaceRiskService";
import type { WorkspaceStrategy } from "../../lib/workspaceStrategyService";
import type { WorkspaceInsights } from "../../lib/workspaceInsightsService";
import type { WorkspaceAIResponse } from "../../lib/workspaceAIResponse";

export default function WorkspacePage() {
  const [items, setItems] = useState<any[]>([]);
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("all");
const [sort, setSort] = useState("newest");
const [selectedItem, setSelectedItem] = useState<any | null>(null);
const [selectedItemEvents, setSelectedItemEvents] = useState<any[]>([]);
const [workspaceIntelligence, setWorkspaceIntelligence] = useState({
  totalItems: 0,
  needsReports: 0,
  needsJobs: 0,
  healthyItems: 0,
  unknownItems: 0,
  workspaceHealth: "Unknown",
  primaryBottleneck: "No workspace data",
  recommendedAction: "Load workspace intelligence.",
  progressPercent: 0,
});
const [workspacePriorityActions, setWorkspacePriorityActions] = useState<
  WorkspacePriorityAction[]
>([]);

const [workspaceDirectorPlan, setWorkspaceDirectorPlan] =
  useState<WorkspaceDirectorPlan | null>(null);

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

const [loading, setLoading] = useState(true);

const router = useRouter();
const workspaceAnalysis = analyzeWorkspaceEvents(
  selectedItem?.type ?? "analysis",
  selectedItemEvents
);
const recommendation =
  getWorkspaceRecommendation(workspaceAnalysis);

  useEffect(() => {
    async function loadItems() {
  const { data, error } = await getWorkspaceItems();

  if (error) {
  console.log("Workspace item load error:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  toast.error(
    error.message || "Failed to load workspace items."
  );

  setLoading(false);
  return;
}

  const workspaceItems = data || [];

  setItems(workspaceItems);

  const {
    data: intelligence,
    error: intelligenceError,
  } = await buildWorkspaceIntelligence(workspaceItems);

  if (intelligenceError) {
    console.error(intelligenceError);
    toast.error("Failed to load workspace intelligence.");
  }

  if (intelligence) {
  setWorkspaceIntelligence(intelligence.intelligence);
  setWorkspacePriorityActions(intelligence.priorityActions);
  setWorkspaceDirectorPlan(intelligence.directorPlan);
  setWorkspaceForecast(intelligence.forecast);
  setWorkspaceStrategy(intelligence.strategy);
  setWorkspaceRisk(intelligence.risk);
  setWorkspaceInsights(intelligence.insights);
}

  setLoading(false);
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

  const filteredItems = items
  .filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(searchText) ||
      item.address?.toLowerCase().includes(searchText);

    const matchesFilter = filter === "all" || item.type === filter;

    return matchesSearch && matchesFilter;
  })
  .sort((a, b) => {
    if (sort === "oldest") {
      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    }

    if (sort === "az") {
      return a.title.localeCompare(b.title);
    }

    return (
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
    );
  });

  async function deleteSelectedItem() {
  if (!selectedItem) return;

  const { error } = await deleteWorkspaceItem(selectedItem.id);

  if (error) {
    console.error(error);
    toast.error("Delete failed.");
    return;
  }

  const { error: eventError } = await createEvent({
  workspace_item_id: null,
  event_type: "item_deleted",
  description: `Item deleted: ${selectedItem.title}`,
  source: "Workspace",
  metadata: {
    deleted_item_id: selectedItem.id,
    deleted_title: selectedItem.title,
  },
});

if (eventError) {
  toast.error("Event tracking failed.");
}

setItems(items.filter((item) => item.id !== selectedItem.id));
setSelectedItem(null);
setSelectedItemEvents([]);
}

async function generateReportFromItem(item: any) {
  if (!item || item.type !== "analysis") return;

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
    source: "Workspace",
    metadata: {
      original_item_id: item.id,
      report_title: data.title,
    },
  });

  if (eventError) {
    toast.error("Event tracking failed.");
  }

  setItems([data, ...items]);
  setSelectedItem(data);
}

async function generateReportFromSelectedItem() {
  await generateReportFromItem(selectedItem);
}

async function createJobFromItem(item: any) {
  if (!item) return;

  const { data, error } = await createWorkspaceJob({
    title: `${item.title} Processing Job`,
    status: "Completed",
    source: "Workspace",
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
    source: "Workspace",
    metadata: {
      original_item_id: item.id,
      job_title: data.title,
    },
  });

  if (eventError) {
    toast.error("Event tracking failed.");
  }

  setItems([data, ...items]);
  setSelectedItem(data);
}

async function createJobFromSelectedItem() {
  await createJobFromItem(selectedItem);
}

async function duplicateSelectedItem() {
  if (!selectedItem) return;

  const { data, error } = await duplicateWorkspaceItem(selectedItem);

  if (error) {
    console.error(error);
    toast.error("Duplicate failed.");
    return;
  }

  const { error: eventError } = await createEvent({
  workspace_item_id: data.id,
  event_type: "item_duplicated",
  description: `Item duplicated from ${selectedItem.title}`,
  source: "Workspace",
  metadata: {
    original_item_id: selectedItem.id,
    duplicated_title: data.title,
  },
});

if (eventError) {
  toast.error("Event tracking failed.");
}

setItems([data, ...items]);
setSelectedItem(data);
}

async function handlePriorityAction(action: WorkspacePriorityAction) {
  const item = items.find((workspaceItem) => workspaceItem.id === action.itemId);

  if (!item) {
    toast.error("Workspace item not found.");
    return;
  }

  if (action.actionType === "generate_report") {
  await generateReportFromItem(item);
  setWorkspaceAIStale(true);
  toast.success("Report generated from priority action.");
  return;
}

  if (action.actionType === "create_job") {
  await createJobFromItem(item);
  setWorkspaceAIStale(true);
  toast.success("Job created from priority action.");
  return;
}

  setSelectedItem(item);
}

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

async function selectWorkspaceItem(item: any) {
  setSelectedItem(item);

  const { data, error } = await getEventsForWorkspaceItem(item.id);

  if (error) {
    toast.error("Failed to load activity.");
    setSelectedItemEvents([]);
    return;
  }

  setSelectedItemEvents(data || []);
}

function openSelectedItem() {
  if (!selectedItem) return;

  if (selectedItem.type === "analysis") {
    router.push("/deal-analyzer");
    return;
  }

  if (selectedItem.type === "report") {
    router.push("/reportforge");
    return;
  }

  if (selectedItem.type === "job") {
    router.push("/jobs");
    return;
  }
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
    title="Workspace"
    description="Shared storage layer for analyses, reports, jobs, and generated outputs."
  >

        <Toolbar>
          <SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Search title or address..."
  className="flex-1 bg-slate-900 py-3 text-white"
/>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white"
          >
            <option value="all">All</option>
            <option value="analysis">Analyses</option>
            <option value="report">Reports</option>
            <option value="job">Jobs</option>
          </select>

<select
  value={sort}
  onChange={(e) => setSort(e.target.value)}
  className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white"
>
  <option value="newest">Newest</option>
  <option value="oldest">Oldest</option>
  <option value="az">A–Z</option>
</select>

        </Toolbar>

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-400">Saved Analyses</p>
            <p className="mt-2 text-3xl font-bold">{analyses.length}</p>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">Reports</p>
            <p className="mt-2 text-3xl font-bold">{reports.length}</p>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">Jobs</p>
            <p className="mt-2 text-3xl font-bold">{jobs.length}</p>
          </Card>
        </section>

        <WorkspaceCoach
  estimatedMinutes={workspaceDirectorPlan?.estimatedMinutes ?? 15}
  priorityCount={workspacePriorityActions.length}
  primaryBottleneck={workspaceIntelligence.primaryBottleneck}
  recommendedAction={workspaceIntelligence.recommendedAction}
  onStartPlan={() =>
    setWorkspaceAIQuestion(
      "Walk me through today's plan one step at a time."
    )
  }
  onShowBlocker={() =>
    setWorkspaceAIQuestion(
      "Explain what is blocking my workspace and tell me what I should do about it."
    )
  }
  onShowOpportunity={() =>
    setWorkspaceAIQuestion(
      "Where is the biggest opportunity to make meaningful progress in my workspace?"
    )
  }
  onReviewPlan={() =>
    setWorkspaceAIQuestion(
      "Review today's plan, explain the order of work, and tell me what to do first."
    )
  }
  onAskSomethingElse={() => {
    const questionField = document.getElementById(
      "workspace-ai-question"
    );

    questionField?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    questionField?.focus();
  }}
/>

{workspaceDirectorPlan && (
  <Card title={workspaceDirectorPlan.title} className="mt-10">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div>
        <p className="text-sm text-slate-400">Workspace Status</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceDirectorPlan.workspaceStatus}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Next Best Action</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceDirectorPlan.nextBestAction}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Estimated Work</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceDirectorPlan.estimatedMinutes} minutes
        </p>
      </div>
    </div>

    <div className="mt-8 rounded-lg border border-slate-800 p-4">
      <p className="text-sm text-slate-400">Today&apos;s Plan</p>

      <ul className="mt-3 space-y-2">
        {workspaceDirectorPlan.summary.map((summaryItem) => (
          <li key={summaryItem} className="text-lg font-semibold">
            • {summaryItem}
          </li>
        ))}
      </ul>
    </div>

  </Card>
)}

{workspaceForecast && (
  <Card title={workspaceForecast.title} className="mt-10">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <div>
        <p className="text-sm text-slate-400">Current Health</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceForecast.currentHealth}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Projected Health</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceForecast.projectedHealth}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Projected Progress</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceForecast.projectedProgress}%
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Confidence</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceForecast.confidence}
        </p>
      </div>
    </div>

    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
  <div>
    <p className="text-sm text-slate-400">Current Progress</p>
    <p className="mt-2 text-xl font-bold">
      {workspaceForecast.currentProgress}%
    </p>
  </div>

  <div>
    <p className="text-sm text-slate-400">Expected Gain</p>
    <p className="mt-2 text-xl font-bold">
      +{workspaceForecast.progressGain}%
    </p>
  </div>

  <div>
    <p className="text-sm text-slate-400">
      Projected Resolved Actions
    </p>
    <p className="mt-2 text-xl font-bold">
      {workspaceForecast.projectedResolvedActions}
    </p>
  </div>
</div>

    <div className="mt-8 rounded-lg border border-slate-800 p-4">
      <p className="text-sm text-slate-400">Forecast</p>
      <p className="mt-2 text-lg font-semibold">
        {workspaceForecast.prediction}
      </p>
    </div>

    <p className="mt-4 text-sm text-slate-500">
      This is a rule-based projection, not a guaranteed outcome.
    </p>
  </Card>
)}

{workspaceStrategy && (
  <Card title={workspaceStrategy.title} className="mt-10">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <p className="text-sm text-slate-400">Strategic Focus</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceStrategy.strategicFocus}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Strategy Confidence</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceStrategy.strategyConfidence}
        </p>
      </div>
    </div>

    <div className="mt-8 rounded-lg border border-slate-800 p-4">
      <p className="text-sm text-slate-400">Execution Order</p>

      <ol className="mt-3 space-y-2">
        {workspaceStrategy.executionOrder.map((step, index) => (
          <li key={`${step}-${index}`} className="text-lg font-semibold">
            {index + 1}. {step}
          </li>
        ))}
      </ol>
    </div>

    <div className="mt-6 rounded-lg border border-slate-800 p-4">
      <p className="text-sm text-slate-400">What Should Wait</p>

      <ul className="mt-3 space-y-2">
        {workspaceStrategy.delayActions.map((action, index) => (
          <li key={`${action}-${index}`} className="text-lg font-semibold">
            • {action}
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-slate-800 p-4">
        <p className="text-sm text-slate-400">
          Bottleneck Explanation
        </p>

        <p className="mt-2 text-lg font-semibold">
          {workspaceStrategy.bottleneckExplanation}
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 p-4">
        <p className="text-sm text-slate-400">
          Tradeoff Explanation
        </p>

        <p className="mt-2 text-lg font-semibold">
          {workspaceStrategy.tradeoffExplanation}
        </p>
      </div>
    </div>
  </Card>
)}

{workspaceRisk && (
  <Card title={workspaceRisk.title} className="mt-10">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div>
        <p className="text-sm text-slate-400">Overall Risk</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceRisk.overallRisk}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Risk Score</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceRisk.riskScore}/100
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Assessment Confidence</p>
        <p className="mt-2 text-2xl font-bold">
          {workspaceRisk.confidence}
        </p>
      </div>
    </div>

    <div className="mt-8 rounded-lg border border-slate-800 p-4">
      <p className="text-sm text-slate-400">Primary Risk</p>
      <p className="mt-2 text-lg font-semibold">
        {workspaceRisk.primaryRisk}
      </p>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-slate-800 p-4">
        <p className="text-sm text-slate-400">Risk Factors</p>

        <ul className="mt-3 space-y-2">
          {workspaceRisk.riskFactors.map((factor, index) => (
            <li
              key={`${factor}-${index}`}
              className="text-lg font-semibold"
            >
              • {factor}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-800 p-4">
        <p className="text-sm text-slate-400">Safeguards</p>

        <ul className="mt-3 space-y-2">
          {workspaceRisk.safeguards.map((safeguard, index) => (
            <li
              key={`${safeguard}-${index}`}
              className="text-lg font-semibold"
            >
              • {safeguard}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Card>
)}

{workspaceInsights && (
  <Card title={workspaceInsights.title} className="mt-10">
    <div className="rounded-lg border border-slate-800 p-4">
      <p className="text-sm text-slate-400">Headline</p>

      <p className="mt-2 text-2xl font-bold">
        {workspaceInsights.headline}
      </p>
    </div>

    <div className="mt-6 space-y-4">
      {workspaceInsights.insights.map((insight, index) => (
        <div
          key={`${insight.title}-${index}`}
          className="rounded-lg border border-slate-800 p-4"
        >
          <div className="flex items-center justify-between gap-4">
  <div>
    <p className="text-lg font-semibold">
      {insight.title}
    </p>
  </div>

  <div className="flex items-center gap-2">
    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
      {insight.severity}
    </span>

    <StatusBadge status={insight.type} />
  </div>
</div>

          <div className="mt-3">
            <p className="text-sm text-slate-400">
              {insight.explanation}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Card>
)}

<Card title="Ask AppStack AI" className="mt-10">
  <p className="text-sm text-slate-400">
    Ask a question about the current workspace intelligence, priorities,
    forecast, strategy, risks, or insights.
  </p>

  <textarea
  id="workspace-ai-question"
    value={workspaceAIQuestion}
    onChange={(event) =>
      setWorkspaceAIQuestion(event.target.value)
    }
    placeholder="What should I focus on today?"
    rows={4}
    className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
  />

  <div className="mt-4">
    <Button
      onClick={askWorkspaceAI}
      disabled={workspaceAILoading}
    >
      {workspaceAILoading ? "Thinking..." : "Ask AppStack AI"}
    </Button>
  </div>

  {workspaceAIAnswer && (
    <div
      id="workspace-ai-answer"
      className="mt-6 scroll-mt-6 space-y-5 rounded-lg border border-slate-800 p-4"
    >
      <div>
        <p className="text-sm text-slate-400">
          Today&apos;s Situation
        </p>

        <p className="mt-2 text-lg leading-8">
          {workspaceAIAnswer.summary}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Today&apos;s Focus
        </p>

        <p className="mt-2 text-lg font-semibold leading-8">
          {workspaceAIAnswer.recommendation}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Why this matters
        </p>

        <ul className="mt-3 space-y-3">
          {workspaceAIAnswer.evidence.map((item, index) => (
            <li
              key={`${item.source}-${item.claim}-${index}`}
              className="flex gap-3 text-lg leading-8"
            >
              <span aria-hidden="true">✓</span>
              <span>{item.claim}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          How certain is this?
        </p>

        <p className="mt-2 text-lg font-semibold">
          {workspaceAIAnswer.confidence}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Do this now
        </p>

        <p className="mt-2 text-lg font-semibold leading-8">
          {workspaceAIAnswer.nextStep}
        </p>

        {workspacePriorityActions[0] && (
          <RecommendedActionButton
            label={workspacePriorityActions[0].title}
            onClick={() =>
              handlePriorityAction(
                workspacePriorityActions[0]
              )
            }
          />
        )}
      </div>
    </div>
  )}
</Card>

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
        {workspaceAILoading
          ? "Refreshing..."
          : "Refresh Advice"}
      </Button>
    </div>
  </div>
)}

<Card title="Priority Actions" className="mt-10">
  <div className="space-y-4">
    {workspacePriorityActions.length === 0 && (
      <p className="text-slate-400">
        No priority actions right now. Workspace is currently healthy.
      </p>
    )}

    {workspacePriorityActions.map((action, index) => (
      <div
        key={`${action.title}-${action.itemTitle}-${index}`}
        className="rounded-lg border border-slate-800 p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{action.title}</p>
            <p className="mt-1 text-sm text-slate-400">
              {action.itemTitle}
            </p>
          </div>

          <StatusBadge status={action.priority} />
        </div>

        <p className="mt-3 text-sm text-slate-400">{action.reason}</p>

<div className="mt-4">
  <Button onClick={() => handlePriorityAction(action)}>
    {action.actionType === "generate_report" && "Generate Now"}
    {action.actionType === "create_job" && "Create Job"}
    {action.actionType === "review_item" && "Review Item"}
  </Button>
</div>
      </div>
    ))}
  </div>
</Card>

        <Card
  title="Recent Workspace Items"
  className="mt-10"
>

          <div className="mt-5 space-y-5">
  {loading && (
    <div className="rounded-xl border border-slate-800 p-6 text-slate-400">
      Loading workspace items...
    </div>
  )}

  {!loading && filteredItems.length === 0 && (
    <div className="rounded-xl border border-slate-800 p-6 text-slate-400">
      No workspace items found.
    </div>
  )}

  {!loading && filteredItems.map((item) => (
              <div
  key={item.id}
  onClick={() => selectWorkspaceItem(item)}
  className={`cursor-pointer rounded-xl p-5 transition ${
  selectedItem?.id === item.id
    ? "border-2 border-blue-500 bg-slate-900"
    : "border border-slate-800 hover:border-blue-500"
}`}
>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
  {getItemIcon(item.type)} {item.type}
</p>

                    <h3 className="mt-1 text-xl font-semibold">
                      {item.title}
                    </h3>

                    {item.address && (
                      <p className="mt-2 text-slate-400">{item.address}</p>
                    )}
                  </div>

                  {item.status && (
  <StatusBadge status={item.status} />
)}
                </div>

                {item.metadata?.maxOffer && (
                  <p className="mt-3 text-slate-400">
                    Max Offer: ${item.metadata.maxOffer.toLocaleString()}
                  </p>
                )}

                {item.content && (
                  <p className="mt-3 text-slate-400">
                    Saved content available.
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
        {selectedItem && (
  <Card title="Workspace Item" className="mt-10">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Workspace Item</h2>

      <button
        onClick={() => {
  setSelectedItem(null);
  setSelectedItemEvents([]);
}}
        className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
      >
        Close
      </button>
    </div>

    <div className="mt-6 space-y-4">
        
      <div>
        <p className="text-sm text-slate-400">Type</p>
        <p className="text-lg">{selectedItem.type}</p>
      </div>

      <div>
        <p className="text-sm text-slate-400">Title</p>
        <p className="text-lg font-semibold">{selectedItem.title}</p>
      </div>

      {selectedItem.address && (
        <div>
          <p className="text-sm text-slate-400">Address</p>
          <p>{selectedItem.address}</p>
        </div>
      )}

      {selectedItem.status && (
        <div>
          <p className="text-sm text-slate-400">Status</p>
          <p>{selectedItem.status}</p>
        </div>
      )}

      {selectedItem.metadata && (
  <div>
    <p className="text-sm text-slate-400 mb-3">Details</p>

    <div className="space-y-3">

      {selectedItem.metadata.purchasePrice && (
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span>Purchase Price</span>
          <span>
            ${selectedItem.metadata.purchasePrice.toLocaleString()}
          </span>
        </div>
      )}

      {selectedItem.metadata.arv && (
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span>ARV</span>
          <span>
            ${selectedItem.metadata.arv.toLocaleString()}
          </span>
        </div>
      )}

      {selectedItem.metadata.repairCost && (
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span>Repairs</span>
          <span>
            ${selectedItem.metadata.repairCost.toLocaleString()}
          </span>
        </div>
      )}

      {selectedItem.metadata.maxOffer && (
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span>Maximum Offer</span>
          <span>
            ${selectedItem.metadata.maxOffer.toLocaleString()}
          </span>
        </div>
      )}

      {selectedItem.metadata.source && (
  <div className="border-b border-slate-800 pb-2">
    <p className="text-sm text-slate-400">Source</p>
    <p className="mt-1 text-lg font-semibold">
      {selectedItem.metadata.source}
    </p>
  </div>
)}

    </div>
  </div>
)}

<div className="mt-8">
  <h3 className="text-xl font-semibold">Activity</h3>

  <div className="mt-4 space-y-3">
    {selectedItemEvents.length === 0 && (
      <p className="text-sm text-slate-400">No activity yet.</p>
    )}

    {selectedItemEvents.map((event) => (
      <div
        key={event.id}
        className="rounded-lg border border-slate-800 p-4"
      >
        <p className="font-medium">{event.description}</p>
        <p className="mt-1 text-sm text-slate-400">
          {new Date(event.created_at).toLocaleString()}
        </p>
      </div>
    ))}
  </div>
</div>

<div className="mt-8">
  <h3 className="text-xl font-semibold">Analysis</h3>

  <div className="mt-4 space-y-3 rounded-lg border border-slate-800 p-4">
    <div className="flex justify-between">
      <span>Stage</span>
      <span>{workspaceAnalysis.stage}</span>
    </div>

    <div className="flex justify-between">
      <span>Health</span>
      <span>{workspaceAnalysis.health}</span>
    </div>

    <div className="flex justify-between">
      <span>Events</span>
      <span>{workspaceAnalysis.eventCount}</span>
    </div>

    {workspaceAnalysis.missingSteps.length > 0 && (
      <div>
        <p className="font-medium">Missing Steps</p>

        <ul className="mt-2 list-disc pl-6 text-sm text-slate-400">
          {workspaceAnalysis.missingSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    )}

    {workspaceAnalysis.insights.length > 0 && (
      <div>
        <p className="font-medium">Insights</p>

        <ul className="mt-2 list-disc pl-6 text-sm text-slate-400">
          {workspaceAnalysis.insights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
</div>

<div className="mt-8">
  <h3 className="text-xl font-semibold">Recommendation</h3>

  <div className="mt-4 rounded-lg border border-slate-800 p-4 space-y-3">
    <div className="flex justify-between">
      <span>Next Action</span>
      <span>{recommendation.action}</span>
    </div>

    <div>
      <p className="font-medium">Reason</p>
      <p className="mt-1 text-sm text-slate-400">
        {recommendation.reason}
      </p>
    </div>

    <div className="flex justify-between">
      <span>Priority</span>
      <span>{recommendation.priority}</span>
    </div>
  </div>
</div>

      {selectedItem.content && (
        <div>
          <p className="text-sm text-slate-400">Content</p>

          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm">
            {selectedItem.content}
          </pre>
        </div>
      )}
<div className="mt-10">
  <h3 className="text-xl font-semibold">Actions</h3>

  <div className="mt-4 flex flex-wrap gap-3">
    <Button onClick={openSelectedItem}>
  Open
</Button>

    <Button
  onClick={generateReportFromSelectedItem}
  disabled={selectedItem?.type !== "analysis"}
>
  Generate Report
</Button>

    <Button onClick={createJobFromSelectedItem}>
  Create Job
</Button>

    <Button onClick={duplicateSelectedItem}>
  Duplicate
</Button>

    <Button onClick={deleteSelectedItem}>
  Delete
</Button>
  </div>
</div>

    </div>
    </Card>
)}
        </Page>
  );
}