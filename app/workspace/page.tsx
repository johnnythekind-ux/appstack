"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

import MissionControl from "../components/workspace/MissionControl";
import WorkspaceStats from "../components/workspace/WorkspaceStats";
import RecentWork from "../components/workspace/RecentWork";
import SelectedWorkspaceItem from "../components/workspace/SelectedWorkspaceItem";
import Toolbar from "../components/Toolbar";
import Page from "../components/Page";
import SearchBar from "../components/SearchBar";

import { getWorkspaceRecommendation } from "../../lib/recommendationService";
import { analyzeWorkspaceEvents } from "../../lib/analysisService";
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
import { buildWorkspaceIntelligence } from "../../lib/workspaceIntelligenceCoordinator";

import type { WorkspacePriorityAction } from "../../lib/workspacePriorityService";
import type { WorkspaceDirectorPlan } from "../../lib/workspaceDirectorService";

export default function WorkspacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedItemEvents, setSelectedItemEvents] = useState<any[]>([]);
  const [selectionHighlighted, setSelectionHighlighted] = useState(false);

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

  const [loading, setLoading] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);

  const currentSelectionRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const workspaceAnalysis = analyzeWorkspaceEvents(
    selectedItem?.type ?? "analysis",
    selectedItemEvents
  );

  const recommendation = getWorkspaceRecommendation(workspaceAnalysis);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      const { data, error } = await getWorkspaceItems();

      if (!mounted) {
        return;
      }

      if (error) {
        console.log("Workspace item load error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        toast.error(error.message || "Failed to load workspace items.");
        setLoading(false);
        return;
      }

      const workspaceItems = data || [];
      setItems(workspaceItems);

      const {
        data: intelligence,
        error: intelligenceError,
      } = await buildWorkspaceIntelligence(workspaceItems);

      if (!mounted) {
        return;
      }

      if (intelligenceError) {
        console.error(intelligenceError);
        toast.error("Failed to load workspace intelligence.");
      }

      if (intelligence) {
        setWorkspaceIntelligence(intelligence.intelligence);
        setWorkspacePriorityActions(intelligence.priorityActions);
        setWorkspaceDirectorPlan(intelligence.directorPlan);
      }

      setLoading(false);
    }

    loadItems();

    const channel = supabase
      .channel("workspace-items-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_items",
        },
        () => {
          loadItems();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
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

  function revealCurrentSelection() {
    window.setTimeout(() => {
      currentSelectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setSelectionHighlighted(true);

      window.setTimeout(() => {
        setSelectionHighlighted(false);
      }, 1200);
    }, 100);
  }

  async function loadSelectedItem(item: any, shouldReveal = false) {
    setSelectedItem(item);

    const { data, error } = await getEventsForWorkspaceItem(item.id);

    if (error) {
      toast.error("Failed to load activity.");
      setSelectedItemEvents([]);
    } else {
      setSelectedItemEvents(data || []);
    }

    if (shouldReveal) {
      revealCurrentSelection();
    }
  }

  async function deleteSelectedItem() {
    if (!selectedItem) {
      return;
    }

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

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== selectedItem.id)
    );

    setSelectedItem(null);
    setSelectedItemEvents([]);
    toast.success("Item deleted successfully.");
  }

  async function generateReportFromItem(item: any) {
    if (!item || item.type !== "analysis") {
      return null;
    }

      const metadata = item.metadata ?? {};

  const formatCurrency = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    const numericValue =
      typeof value === "number" ? value : Number(value);

    return Number.isFinite(numericValue)
      ? `$${numericValue.toLocaleString()}`
      : "Not available";
  };

    const generatedReport = `Investor Report

Property:
${item.title}
${item.address}

Deal Summary:
This deal has a purchase price of ${formatCurrency(metadata.purchasePrice)}, an ARV of ${formatCurrency(metadata.arv)}, and estimated repairs of ${formatCurrency(metadata.repairCost)}.

Maximum Allowable Offer:
${formatCurrency(metadata.maxOffer)}

Recommendation:
${item.status}

Interpretation:
Based on the 70% rule, this deal currently receives a ${item.status} recommendation.`;

    const { data, error } = await createWorkspaceReport({
      title: `${item.title} Investor Report`,
      address: item.address,
      status: "Saved",
      content: generatedReport,
      analysisId: item.id,
    });

    if (error) {
      console.error(error);
      toast.error("Report generation failed.");
      return null;
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

    setItems((currentItems) => [data, ...currentItems]);
    setSelectedItem(data);

    return data;
  }

  async function generateReportFromSelectedItem() {
    const report = await generateReportFromItem(selectedItem);

    if (report) {
      toast.success("Report generated successfully.");
    }
  }

  function openJobCreationForItem(item: any) {
    if (!item || item.type !== "report") {
      toast.error("Select a report before creating an execution job.");
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

  function createJobFromSelectedItem() {
    openJobCreationForItem(selectedItem);
  }

  async function duplicateSelectedItem() {
    if (!selectedItem) {
      return;
    }

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

    setItems((currentItems) => [data, ...currentItems]);
    setSelectedItem(data);
    toast.success("Item duplicated successfully.");
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
      const report = await generateReportFromItem(item);

      if (report) {
        toast.success("Report generated from priority action.");
      }

      return;
    }

    if (action.actionType === "create_job") {
      openJobCreationForItem(item);
      return;
    }

    await loadSelectedItem(item, true);
  }

  async function selectWorkspaceItem(item: any) {
    await loadSelectedItem(item, false);
  }

  function openSelectedItem() {
    if (!selectedItem) {
      return;
    }

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
    }
  }

  const visibleItems = showAllItems
    ? filteredItems
    : filteredItems.slice(0, 5);

  return (
    <Page
      title="Workspace"
      description="Manage active work, complete priority actions, and keep every item moving."
    >
      <Toolbar>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search title or address..."
          className="flex-1 py-3"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">All</option>
          <option value="analysis">Analyses</option>
          <option value="report">Reports</option>
          <option value="job">Jobs</option>
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A–Z</option>
        </select>
      </Toolbar>

      <div className="mt-8">
        <MissionControl
          workspaceHealth={workspaceIntelligence.workspaceHealth}
          progressPercent={workspaceIntelligence.progressPercent}
          directorPlan={workspaceDirectorPlan}
          priorityActions={workspacePriorityActions}
          onAction={handlePriorityAction}
        />
      </div>

      <WorkspaceStats
        analysesCount={analyses.length}
        reportsCount={reports.length}
        jobsCount={jobs.length}
        progressPercent={workspaceIntelligence.progressPercent}
        workspaceHealth={workspaceIntelligence.workspaceHealth}
      />

      <section className="mt-8">
        <RecentWork
          loading={loading}
          visibleItems={visibleItems}
          filteredItems={filteredItems}
          selectedItem={selectedItem}
          showAllItems={showAllItems}
          onSelectItem={selectWorkspaceItem}
          onToggleShowAll={() =>
            setShowAllItems((current) => !current)
          }
        />
      </section>

      <div
        ref={currentSelectionRef}
        className={`scroll-mt-8 rounded-2xl transition-all duration-500 ${
          selectionHighlighted
            ? "ring-2 ring-accent ring-offset-4 ring-offset-background"
            : ""
        }`}
      >
        <SelectedWorkspaceItem
          selectedItem={selectedItem}
          selectedItemEvents={selectedItemEvents}
          workspaceAnalysis={workspaceAnalysis}
          recommendation={recommendation}
          onClose={() => {
            setSelectedItem(null);
            setSelectedItemEvents([]);
          }}
          onOpen={openSelectedItem}
          onGenerateReport={generateReportFromSelectedItem}
          onCreateJob={createJobFromSelectedItem}
          onDuplicate={duplicateSelectedItem}
          onDelete={deleteSelectedItem}
        />
      </div>
    </Page>
  );
}
