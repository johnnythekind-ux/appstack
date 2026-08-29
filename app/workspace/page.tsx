"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

import MissionControl from "../components/workspace/MissionControl";
import WorkspaceStats from "../components/workspace/WorkspaceStats";
import RecentWork from "../components/workspace/RecentWork";
import SelectedWorkspaceItem from "../components/workspace/SelectedWorkspaceItem";
import CreateWorkspaceItemModal from "../components/workspace/CreateWorkspaceItemModal";
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
  deleteWorkspaceItems,
  duplicateWorkspaceItem,
  createWorkspaceReport,
  createWorkspaceTask,
  updateWorkspaceTask,
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
  const [authResolved, setAuthResolved] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [creatingItem, setCreatingItem] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [deletingSelected, setDeletingSelected] = useState(false);

  const currentSelectionRef = useRef<HTMLDivElement | null>(null);
  const requestedItemHandledRef = useRef(false);
  const router = useRouter();

  const workspaceAnalysis = analyzeWorkspaceEvents(
    selectedItem?.type ?? "analysis",
    selectedItemEvents,
    selectedItem?.status
  );

  const recommendation = getWorkspaceRecommendation(workspaceAnalysis);

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadItems() {
      try {
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

        if (!requestedItemHandledRef.current) {
          const requestedItemId = new URLSearchParams(
            window.location.search
          ).get("itemId");

          if (requestedItemId) {
            requestedItemHandledRef.current = true;

            const requestedItem = workspaceItems.find(
              (item) => item.id === requestedItemId
            );

            if (requestedItem) {
              setFilter("all");
              setSearch("");
              await loadSelectedItem(requestedItem, true);
            } else {
              window.history.replaceState({}, "", "/workspace");
            }
          }
        }

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
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load workspace.";

        console.error("Workspace load failed:", error);
        setLoading(false);

        if (message.toLowerCase().includes("signed in")) {
          router.replace("/login");
          return;
        }

        toast.error(message);
      }
    }

    async function initializeWorkspace() {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (!mounted) {
    return;
  }

  if (
    authError ||
    !session?.user
  ) {
    window.location.replace("/login");
    return;
  }

  setAuthResolved(true);

  await loadItems();

  if (!mounted) {
    return;
  }

  channel = supabase
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
    }

    initializeWorkspace();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) {
        return;
      }

      if (event === "SIGNED_OUT") {
        window.location.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  const analyses = items.filter((item) => item.type === "analysis");
  const reports = items.filter((item) => item.type === "report");
  const jobs = items.filter((item) => item.type === "job");
  const tasks = items.filter((item) => item.type === "task");

  const filteredItems = items
    .filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.title?.toLowerCase().includes(searchText) ||
        item.address?.toLowerCase().includes(searchText) ||
        item.content?.toLowerCase().includes(searchText);

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

  async function createManualWorkspaceItem(input: {
    title: string;
    description?: string;
  }) {
    if (creatingItem) {
      return false;
    }

    setCreatingItem(true);

    try {
      const { data, error } = await createWorkspaceTask(input);

      if (error || !data) {
        console.error(error);
        toast.error(error?.message || "Workspace item creation failed.");
        return false;
      }

      setItems((currentItems) => [
        data,
        ...currentItems.filter((item) => item.id !== data.id),
      ]);
      setSelectedItem(data);
      setSelectedItemEvents([]);
      setCreateItemOpen(false);
      setFilter("all");
      setSearch("");

      toast.success("Workspace item created.");
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Workspace item creation failed.";

      console.error("Workspace item creation failed:", error);
      toast.error(message);
      return false;
    } finally {
      setCreatingItem(false);
    }
  }

  async function updateSelectedTask(input: {
    title: string;
    description?: string;
    status: "queued" | "running" | "completed";
  }) {
    if (!selectedItem || selectedItem.type !== "task") {
      return false;
    }

    try {
      const { data, error } = await updateWorkspaceTask(
        selectedItem.id,
        input
      );

      if (error || !data) {
        console.error(error);
        toast.error(error?.message || "Task update failed.");
        return false;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === data.id ? data : item
        )
      );

      setSelectedItem(data);
      toast.success(
        input.status === "completed"
          ? "Task completed."
          : "Task updated."
      );

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Task update failed.";

      console.error("Task update failed:", error);
      toast.error(message);
      return false;
    }
  }

  async function deleteBulkSelectedItems() {
    if (bulkSelectedIds.length === 0 || deletingSelected) {
      return;
    }

    const selectedItems = items.filter((item) =>
      bulkSelectedIds.includes(item.id)
    );

    if (selectedItems.length === 0) {
      setBulkSelectedIds([]);
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedItems.length} selected workspace ${
        selectedItems.length === 1 ? "item" : "items"
      }?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingSelected(true);

    try {
      const idsToDelete = selectedItems.map((item) => item.id);
      const { error } = await deleteWorkspaceItems(idsToDelete);

      if (error) {
        console.error("Bulk delete failed:", error);
        toast.error(error.message || "Bulk delete failed.");
        return;
      }

      const deletedIdSet = new Set(idsToDelete);
      const remainingItems = items.filter(
        (item) => !deletedIdSet.has(item.id)
      );

      setItems(remainingItems);
      setBulkSelectedIds([]);

      if (selectedItem && deletedIdSet.has(selectedItem.id)) {
        setSelectedItem(null);
        setSelectedItemEvents([]);
        window.history.replaceState({}, "", "/workspace");
      }

      const {
        data: intelligence,
        error: intelligenceError,
      } = await buildWorkspaceIntelligence(remainingItems);

      if (intelligenceError) {
        console.error(
          "Workspace intelligence refresh failed after bulk delete:",
          intelligenceError
        );
      } else if (intelligence) {
        setWorkspaceIntelligence(intelligence.intelligence);
        setWorkspacePriorityActions(intelligence.priorityActions);
        setWorkspaceDirectorPlan(intelligence.directorPlan);
      }

      const { error: eventError } = await createEvent({
        workspace_item_id: null,
        event_type: "item_deleted",
        description: `${selectedItems.length} workspace ${
          selectedItems.length === 1 ? "item was" : "items were"
        } deleted in bulk.`,
        source: "Workspace",
        metadata: {
          deleted_item_ids: idsToDelete,
          deleted_count: selectedItems.length,
          deleted_titles: selectedItems.map((item) => item.title),
          bulk_action: true,
        },
      });

      if (eventError) {
        console.error("Bulk delete event tracking failed:", eventError);
        toast.error(
          "Items were deleted, but activity tracking could not be recorded."
        );
      }

      toast.success(
        `${selectedItems.length} workspace ${
          selectedItems.length === 1 ? "item" : "items"
        } deleted.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Bulk delete failed.";

      console.error("Bulk delete failed:", error);
      toast.error(message);
    } finally {
      setDeletingSelected(false);
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
    window.history.replaceState({}, "", "/workspace");
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
      const message =
        error instanceof Error
          ? error.message
          : "Report generation failed.";

      const isBillingLimitError =
        message.includes("Monthly report limit") ||
        message.includes("current plan");

      if (!isBillingLimitError) {
        console.error("Report generation failed:", error);
      }

      toast.error(message);
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
    if (!selectedItem || selectedItem.type !== "analysis") {
      return;
    }

    const analysisId = selectedItem.id;
    const report = await generateReportFromItem(selectedItem);

    if (report) {
      toast.success("Report generated successfully.");
      router.push(`/reportforge?analysisId=${encodeURIComponent(analysisId)}`);
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
      const analysisId = item.id;
      const report = await generateReportFromItem(item);

      if (report) {
        toast.success("Report generated from priority action.");
        router.push(
          `/reportforge?analysisId=${encodeURIComponent(analysisId)}`
        );
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
    await loadSelectedItem(item, true);
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
      const analysisId = selectedItem.metadata?.analysis_id;

      if (!analysisId) {
        toast.error(
          "This report is not linked to a source analysis."
        );
        return;
      }

      router.push(
        `/reportforge?analysisId=${encodeURIComponent(analysisId)}`
      );
      return;
    }

    if (selectedItem.type === "job") {
      router.push("/jobs");
      return;
    }

    if (selectedItem.type === "task") {
      revealCurrentSelection();
    }
  }

  const visibleItems = showAllItems
    ? filteredItems
    : filteredItems.slice(0, 5);

  useEffect(() => {
    setBulkSelectedIds([]);
  }, [search, filter, sort, showAllItems]);

  if (!authResolved) {
    return (
      <Page
        title="Workspace"
        description="Manage active work, complete priority actions, and keep every item moving."
      >
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-muted">
          Checking your session...
        </div>
      </Page>
    );
  }

  return (
    <Page
      title="Workspace"
      description="Manage active work, complete priority actions, and keep every item moving."
    >
      <Toolbar className="flex-col sm:flex-row">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search title, address, or description..."
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
          <option value="task">Tasks</option>
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

        <button
  type="button"
  onClick={() => setCreateItemOpen(true)}
  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
>
  + New Workspace Item
</button>
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
        tasksCount={tasks.length}
        progressPercent={workspaceIntelligence.progressPercent}
        workspaceHealth={workspaceIntelligence.workspaceHealth}
      />

      <section className="mt-8">
        <RecentWork
          loading={loading}
          visibleItems={visibleItems}
          filteredItems={filteredItems}
          selectedItem={selectedItem}
          selectedIds={bulkSelectedIds}
          deletingSelected={deletingSelected}
          showAllItems={showAllItems}
          onSelectItem={selectWorkspaceItem}
          onSelectionChange={setBulkSelectedIds}
          onDeleteSelected={deleteBulkSelectedItems}
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
          onUpdateTask={updateSelectedTask}
        />
      </div>

      <CreateWorkspaceItemModal
        open={createItemOpen}
        creating={creatingItem}
        onClose={() => {
          if (!creatingItem) {
            setCreateItemOpen(false);
          }
        }}
        onCreate={createManualWorkspaceItem}
      />
    </Page>
  );
}
