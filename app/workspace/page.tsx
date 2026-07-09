"use client";

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
import { supabase } from "../../lib/supabase";
import SearchBar from "../components/SearchBar";
import { buildWorkspaceIntelligence } from "../../lib/workspaceIntelligenceCoordinator";
import { WorkspacePriorityAction } from "../../lib/workspacePriorityService";

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
const [loading, setLoading] = useState(true);

const router = useRouter();
const workspaceAnalysis = analyzeWorkspaceEvents(selectedItemEvents);
const recommendation =
  getWorkspaceRecommendation(workspaceAnalysis);

  useEffect(() => {
    async function loadItems() {
  const { data, error } = await getWorkspaceItems();

  if (error) {
    console.error(error);
    toast.error("Failed to load workspace items.");
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

async function generateReportFromSelectedItem() {
  if (!selectedItem || selectedItem.type !== "analysis") return;

  const generatedReport = `Investor Report

Property:
${selectedItem.title}
${selectedItem.address}

Deal Summary:
This deal has a purchase price of $${selectedItem.metadata.purchasePrice.toLocaleString()}, an ARV of $${selectedItem.metadata.arv.toLocaleString()}, and estimated repairs of $${selectedItem.metadata.repairCost.toLocaleString()}.

Maximum Allowable Offer:
$${selectedItem.metadata.maxOffer.toLocaleString()}

Recommendation:
${selectedItem.status}

Interpretation:
Based on the 70% rule, this deal currently receives a ${selectedItem.status} recommendation.`;

  const { data, error } = await createWorkspaceReport({
  title: `${selectedItem.title} Investor Report`,
  address: selectedItem.address,
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
  description: `Report generated for ${selectedItem.title}`,
  source: "Workspace",
  metadata: {
    original_item_id: selectedItem.id,
    report_title: data.title,
  },
});

if (eventError) {
  toast.error("Event tracking failed.");
}

setItems([data, ...items]);
setSelectedItem(data);
}

async function createJobFromSelectedItem() {
  if (!selectedItem) return;

  const { data, error } = await createWorkspaceJob({
  title: `${selectedItem.title} Processing Job`,
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
  description: `Job created for ${selectedItem.title}`,
  source: "Workspace",
  metadata: {
    original_item_id: selectedItem.id,
    job_title: data.title,
  },
});

if (eventError) {
  toast.error("Event tracking failed.");
}

setItems([data, ...items]);
setSelectedItem(data);
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

        <Card title="Workspace Intelligence" className="mt-10">
  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
    <div>
      <p className="text-sm text-slate-400">Workspace Health</p>
      <p className="mt-2 text-2xl font-bold">
        {workspaceIntelligence.workspaceHealth}
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-400">Primary Bottleneck</p>
      <p className="mt-2 text-2xl font-bold">
        {workspaceIntelligence.primaryBottleneck}
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-400">Progress</p>
      <p className="mt-2 text-2xl font-bold">
        {workspaceIntelligence.progressPercent}%
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-400">Total Items</p>
      <p className="mt-2 text-2xl font-bold">
        {workspaceIntelligence.totalItems}
      </p>
    </div>
  </div>

  <div className="mt-8 rounded-lg border border-slate-800 p-4">
    <p className="text-sm text-slate-400">Recommended Action</p>
    <p className="mt-2 text-lg font-semibold">
      {workspaceIntelligence.recommendedAction}
    </p>
  </div>

  <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
    <div>
      <p className="text-sm text-slate-400">Needs Reports</p>
      <p className="mt-2 text-xl font-bold">
        {workspaceIntelligence.needsReports}
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-400">Needs Jobs</p>
      <p className="mt-2 text-xl font-bold">
        {workspaceIntelligence.needsJobs}
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-400">Healthy</p>
      <p className="mt-2 text-xl font-bold">
        {workspaceIntelligence.healthyItems}
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-400">Unknown</p>
      <p className="mt-2 text-xl font-bold">
        {workspaceIntelligence.unknownItems}
      </p>
    </div>
  </div>
</Card>

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