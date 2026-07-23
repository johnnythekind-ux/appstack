"use client";

import WorkspaceIntelligence from "../components/workspace/intelligence/WorkspaceIntelligence";
import MissionControl from "../components/workspace/MissionControl";
import { getWorkspaceRecommendation } from "../../lib/recommendationService";
import { analyzeWorkspaceEvents } from "../../lib/analysisService";
import Toolbar from "../components/Toolbar";
import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
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
const [showAllItems, setShowAllItems] = useState(false);

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

  const visibleItems = showAllItems
    ? filteredItems
    : filteredItems.slice(0, 5);

  return (
    <Page
      title="Workspace"
      description="Your operational command center for analyses, reports, jobs, and intelligence."
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
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white"
        >
          <option value="all">All</option>
          <option value="analysis">Analyses</option>
          <option value="report">Reports</option>
          <option value="job">Jobs</option>
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A–Z</option>
        </select>
      </Toolbar>

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Analyses
          </p>
          <p className="mt-2 text-2xl font-bold">{analyses.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reports
          </p>
          <p className="mt-2 text-2xl font-bold">{reports.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Jobs
          </p>
          <p className="mt-2 text-2xl font-bold">{jobs.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Progress
          </p>
          <p className="mt-2 text-2xl font-bold">
            {workspaceIntelligence.progressPercent}%
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Health
          </p>
          <p className="mt-2 text-2xl font-bold">
            {workspaceIntelligence.workspaceHealth}
          </p>
        </div>
      </section>

      <div className="mt-8">
        <MissionControl
          workspaceHealth={workspaceIntelligence.workspaceHealth}
          progressPercent={workspaceIntelligence.progressPercent}
          estimatedMinutes={workspaceDirectorPlan?.estimatedMinutes ?? 15}
          nextBestAction={
            workspaceDirectorPlan?.nextBestAction ??
            workspaceIntelligence.recommendedAction
          }
          priorityActions={workspacePriorityActions}
          onAction={handlePriorityAction}
        />
      </div>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.65fr)]">
        <Card title="Recent Work">
          <div className="space-y-3">
            {loading && (
              <div className="rounded-xl border border-slate-800 p-5 text-slate-400">
                Loading workspace items...
              </div>
            )}

            {!loading && visibleItems.length === 0 && (
              <div className="rounded-xl border border-slate-800 p-5 text-slate-400">
                No workspace items found.
              </div>
            )}

            {!loading &&
              visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectWorkspaceItem(item)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedItem?.id === item.id
                      ? "border-blue-500 bg-slate-900"
                      : "border-slate-800 hover:border-slate-600 hover:bg-slate-950/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        {getItemIcon(item.type)} {item.type}
                      </p>
                      <p className="mt-1 truncate font-semibold">
                        {item.title}
                      </p>
                      {item.address && (
                        <p className="mt-1 truncate text-sm text-slate-400">
                          {item.address}
                        </p>
                      )}
                    </div>

                    {item.status && <StatusBadge status={item.status} />}
                  </div>
                </button>
              ))}
          </div>

          {filteredItems.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllItems((current) => !current)}
              className="mt-5 text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              {showAllItems
                ? "Show only five"
                : `View all ${filteredItems.length} items`}
            </button>
          )}
        </Card>

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

      </section>

      {selectedItem && (
        <Card title="Selected Workspace Item" className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {getItemIcon(selectedItem.type)} {selectedItem.type}
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {selectedItem.title}
              </h2>
              {selectedItem.address && (
                <p className="mt-2 text-slate-400">{selectedItem.address}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setSelectedItemEvents([]);
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-800 p-5">
              <h3 className="font-semibold">Analysis</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Stage</span>
                  <span>{workspaceAnalysis.stage}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Health</span>
                  <span>{workspaceAnalysis.health}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Events</span>
                  <span>{workspaceAnalysis.eventCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 p-5">
              <h3 className="font-semibold">Recommendation</h3>
              <p className="mt-4 text-sm text-slate-400">Next Action</p>
              <p className="mt-1 font-semibold">{recommendation.action}</p>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {recommendation.reason}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-5">
              <h3 className="font-semibold">Activity</h3>
              <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
                {selectedItemEvents.length === 0 && (
                  <p className="text-sm text-slate-400">No activity yet.</p>
                )}

                {selectedItemEvents.map((event) => (
                  <div key={event.id}>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedItem.content && (
            <details className="mt-6 rounded-xl border border-slate-800 p-5">
              <summary className="cursor-pointer font-semibold">
                View saved content
              </summary>
              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm">
                {selectedItem.content}
              </pre>
            </details>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={openSelectedItem}>Open</Button>

            <Button
              onClick={generateReportFromSelectedItem}
              disabled={selectedItem.type !== "analysis"}
            >
              Generate Report
            </Button>

            <Button onClick={createJobFromSelectedItem}>Create Job</Button>
            <Button onClick={duplicateSelectedItem}>Duplicate</Button>
            <Button onClick={deleteSelectedItem}>Delete</Button>
          </div>
        </Card>
      )}

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
