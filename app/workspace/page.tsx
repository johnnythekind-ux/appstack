"use client";

import Toolbar from "../components/Toolbar";
import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import { createJob as createWorkspaceJob } from "../../lib/jobService";
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

export default function WorkspacePage() {
  const [items, setItems] = useState<any[]>([]);
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("all");
const [sort, setSort] = useState("newest");
const [selectedItem, setSelectedItem] = useState<any | null>(null);
const [loading, setLoading] = useState(true);

const router = useRouter();

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await getWorkspaceItems();

      if (error) {
        console.error(error);
        toast.error("Failed to load workspace items.");
        return;
      }

      setItems(data || []);
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

  setItems(items.filter((item) => item.id !== selectedItem.id));
  setSelectedItem(null);
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
  onClick={() => setSelectedItem(item)}
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
        onClick={() => setSelectedItem(null)}
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