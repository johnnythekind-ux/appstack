"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import ExpandableList from "../components/ExpandableList";
import Page from "../components/Page";
import Card from "../components/Card";
import ExecutiveBriefing, {
  type ExecutiveBriefingModel,
} from "../components/platform/ExecutiveBriefing";
import CreateWorkspaceItemModal from "../components/workspace/CreateWorkspaceItemModal";

import {
  createWorkspaceTask,
  getWorkspaceItems,
} from "../../lib/workspaceService";
import { buildWorkspaceIntelligence } from "../../lib/workspaceIntelligenceCoordinator";
import type { ExecutiveWorkspaceIntelligence } from "../../lib/executiveWorkspaceIntelligence";

const engineeringConcepts = [
  "Modular architecture",
  "Shared services",
  "CRUD operations",
  "Event tracking",
  "Background processing",
  "Deterministic business rules",
  "Platform intelligence",
];

const walkthroughSteps = [
  {
    number: 1,
    title: "Analyze Your First Deal",
    description:
      "Open Deal Analyzer, enter sample property data, and run the evaluation.",
    href: "/deal-analyzer",
  },
  {
    number: 2,
    title: "Save Your Analysis",
    description:
      "Save the completed analysis so the other modules can use it.",
    href: "/deal-analyzer",
  },
  {
    number: 3,
    title: "Generate Your First Report",
    description:
      "Open ReportForge and generate a report from the saved analysis.",
    href: "/reportforge",
  },
  {
    number: 4,
    title: "Create Your First Job",
    description:
      "Open Jobs and create simulated work that progresses through its lifecycle.",
    href: "/jobs",
  },
  {
    number: 5,
    title: "Open Workspace to inspect persisted objects, history, recommended actions, and direct workspace tasks.",
    description:
      "Open Workspace to inspect the objects, history, and recommended next actions.",
    href: "/workspace",
  },
  {
    number: 6,
    title: "Explore Platform Intelligence",
    description:
      "Finish in Intelligence to review the conclusions produced from platform activity.",
    href: "/intelligence",
  },
];

const architectureSteps = [
  {
    step: "Step 1",
    title: "Analyze",
    description:
      "Deterministic business rules convert structured input into a repeatable decision.",
  },
  {
    step: "Step 2",
    title: "Persist",
    description:
      "The saved record becomes a shared source of truth for services and modules.",
  },
  {
    step: "Step 3",
    title: "Generate",
    description:
      "A reporting service transforms persisted data into a reusable artifact.",
  },
  {
    step: "Step 4",
    title: "Execute",
    description:
      "A job workflow represents asynchronous processing and observable state transitions.",
  },
];

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("—");
  const [executiveIntelligence, setExecutiveIntelligence] =
    useState<ExecutiveWorkspaceIntelligence | null>(null);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [creatingItem, setCreatingItem] = useState(false);

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await getWorkspaceItems();

      if (error) {
        console.error(error);
        toast.error("Dashboard data could not be loaded.");
        setLoading(false);
        return;
      }

      const workspaceItems = data || [];
      setItems(workspaceItems);

      const {
        data: intelligenceData,
        error: intelligenceError,
      } = await buildWorkspaceIntelligence(workspaceItems);

      if (intelligenceError) {
        console.error("Dashboard intelligence load error:", intelligenceError);
        setExecutiveIntelligence(null);
      } else {
        setExecutiveIntelligence(
          intelligenceData?.executiveIntelligence ?? null
        );
      }

      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    }

    loadItems();

    const interval = window.setInterval(() => {
      loadItems();
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  const analyses = items.filter(
    (item) => item.type === "analysis"
  );

  const reports = items.filter(
    (item) => item.type === "report"
  );

  const jobs = items.filter(
    (item) => item.type === "job"
  );

  const tasks = items.filter(
    (item) => item.type === "task"
  );

  // These raw job counts are retained only for the activity cards below.
  // They no longer drive the Executive Briefing.
  const activeJobs = jobs.filter(
    (job) => job.status !== "Completed"
  );

  const completedJobs = jobs.filter(
    (job) => job.status === "Completed"
  );

  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  const recentItems = sortedItems.slice(0, 8);

  const canonicalIntelligence = executiveIntelligence?.intelligence ?? null;
  const canonicalPriorities = executiveIntelligence?.priorities ?? [];

  const platformStatus: ExecutiveBriefingModel = {
    health:
      canonicalIntelligence?.workspaceHealth ??
      (loading ? "Loading" : "Unknown"),
    mission:
      canonicalIntelligence?.recommendedAction ??
      (loading
        ? "Loading current workspace intelligence."
        : "Workspace intelligence is unavailable."),
    priorityCount: canonicalPriorities.length,
    progress: canonicalIntelligence?.progressPercent ?? 0,
    lastUpdated,
  };

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

      const {
        data: intelligenceData,
        error: intelligenceError,
      } = await buildWorkspaceIntelligence([
        data,
        ...items.filter((item) => item.id !== data.id),
      ]);

      if (intelligenceError) {
        console.error(
          "Dashboard intelligence refresh error:",
          intelligenceError
        );
      } else {
        setExecutiveIntelligence(
          intelligenceData?.executiveIntelligence ?? null
        );
      }

      setLastUpdated(new Date().toLocaleTimeString());
      setCreateItemOpen(false);
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

  function getItemIcon(type: string) {
    switch (type) {
      case "analysis":
        return "📊";
      case "report":
        return "📄";
      case "job":
        return "⚙️";
      case "task":
        return "✓";
      default:
        return "📁";
    }
  }

  function formatItemType(type: string) {
    return (
      type.charAt(0).toUpperCase() +
      type.slice(1)
    );
  }

  return (
    <Page
      title="Dashboard"
      description="Explore a modern SaaS architecture by following a guided workflow that demonstrates business rules, shared services, reporting, background processing, and platform intelligence."
    >
      <ExecutiveBriefing status={platformStatus} />

      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            About AppStack
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Modern SaaS architecture, demonstrated through one connected application.
          </h2>

          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            AppStack is a portfolio platform that demonstrates how production software
moves structured data through deterministic business rules, persistence,
reusable reporting, operational processing, event history, and platform
intelligence. It also supports direct Workspace tasks for creating, editing,
tracking, and completing operational work outside the structured
analysis-to-report-to-job workflow.
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-subtle">
            The real-estate example provides context. The architecture, services,
            workflows, and engineering decisions are the primary demonstration.
          </p>

          <div className="mt-10 border-t border-border pt-8">
  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
    How AppStack Works
  </p>

  <div className="mt-6 space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-36 text-foreground font-medium">
        Structured Input
      </div>

      <div className="text-subtle">→</div>

      <div className="text-muted">
        User enters deterministic business data.
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="w-36 text-foreground font-medium">
        Business Rules
      </div>

      <div className="text-subtle">→</div>

      <div className="text-muted">
        Services evaluate the data using repeatable logic.
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="w-36 text-foreground font-medium">
        Persistence
      </div>

      <div className="text-subtle">→</div>

      <div className="text-muted">
        Results become a shared source of truth.
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="w-36 text-foreground font-medium">
        Reporting
      </div>

      <div className="text-subtle">→</div>

      <div className="text-muted">
        Reports transform stored information into reusable artifacts.
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="w-36 text-foreground font-medium">
        Operational Work
      </div>

      <div className="text-subtle">→</div>

      <div className="text-muted">
        Jobs simulate asynchronous processing, while Workspace tasks support direct CRUD workflows.
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="w-36 text-foreground font-medium">
        Intelligence
      </div>

      <div className="text-subtle">→</div>

      <div className="text-muted">
        Platform services produce recommendations and architectural insight.
      </div>
    </div>
  </div>
</div>

        </div>

        <Card title="Engineering Capabilities Demonstrated">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {engineeringConcepts.map((concept) => (
              <div
                key={concept}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent"
                >
                  ✓
                </span>

                <span className="text-sm font-medium text-foreground">
                  {concept}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Total Items
          </p>

          <p className="mt-2 text-3xl font-bold">
            {items.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Analyses
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analyses.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Reports
          </p>

          <p className="mt-2 text-3xl font-bold">
            {reports.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Jobs
          </p>

          <p className="mt-2 text-3xl font-bold">
            {jobs.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Tasks
          </p>

          <p className="mt-2 text-3xl font-bold">
            {tasks.length}
          </p>
        </Card>
      </section>

      <section className="mt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Operational Status
          </p>

          <p className="mt-2 text-sm text-muted">
            Job status is a breakdown of the {jobs.length} jobs already included in Total Items.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Active Jobs
            </p>

            <p className="mt-2 text-2xl font-bold">
              {activeJobs.length}
            </p>

            <p className="mt-2 text-sm text-muted">
              Jobs currently in an active processing state.
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Completed Jobs
            </p>

            <p className="mt-2 text-2xl font-bold">
              {completedJobs.length}
            </p>

            <p className="mt-2 text-sm text-muted">
              Jobs from the total above that reached their final state.
            </p>
          </Card>

        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/workspace"
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent hover:bg-surface-muted"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Continue Work
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Open Workspace
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Review stored objects, events, recommendations, and priority actions.
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setCreateItemOpen(true)}
          className="rounded-2xl border border-border bg-surface p-5 text-left transition hover:border-accent hover:bg-surface-muted"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Capture New Work
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Create Workspace Item
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Add a general task directly to Workspace without starting a deal analysis.
          </p>
        </button>

        <Link
          href="/intelligence"
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent hover:bg-surface-muted"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Understand Activity
          </p>

          <h2 className="mt-2 text-xl font-bold">
            View Intelligence
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Explore deterministic insights, forecasts, risks, and recommendations.
          </p>
        </Link>

        <Link
          href="/deal-analyzer"
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent hover:bg-surface-muted"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Start a New Analysis
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Analyze a Deal
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Create structured input, apply business rules, and persist the result.
          </p>
        </Link>
      </section>

      <Card
        title="Guided Walkthrough"
        className="mt-8"
      >
        <p className="mb-5 max-w-3xl text-sm leading-6 text-muted">
          Follow this guided sequence to experience how modern SaaS applications process, persist, transform, and orchestrate structured business information.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {walkthroughSteps.map((step) => (
            <Link
              key={step.number}
              href={step.href}
              className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent hover:bg-surface-muted"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {step.number}
                </span>

                <div>
                  <h3 className="font-semibold transition group-hover:text-accent">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
          <Link
            href="/deal-analyzer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Start the Guided Walkthrough
          </Link>

          <Link
            href="/workspace"
            className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:bg-surface-muted"
          >
            Open Existing Workspace
          </Link>
        </div>
      </Card>

      <Card
        title="Platform Activity"
        className="mt-8"
      >
        {loading && (
          <div className="rounded-xl border border-border bg-surface-muted p-5 text-sm text-muted">
            Loading recent activity...
          </div>
        )}

        {!loading && recentItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-border-strong bg-surface p-8 text-center">
            <p className="font-semibold">
              No activity has been recorded yet
            </p>

            <p className="mt-2 text-sm text-muted">
              Analyze and save a deal to begin generating platform history.
            </p>

            <Link
              href="/deal-analyzer"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
            >
              Start your first analysis
            </Link>
          </div>
        )}

        {!loading && recentItems.length > 0 && (
          <ExpandableList
            items={recentItems}
            initialCount={5}
          >
            {(item: any, index: number) => (
              <div
                key={`${item.type}-${item.id}-${item.created_at ?? "no-date"}-${index}`}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                    {getItemIcon(item.type)}{" "}
                    {formatItemType(item.type)}
                  </p>

                  <h3 className="mt-1 truncate font-semibold">
                    {item.title}
                  </h3>

                  {item.address && (
                    <p className="mt-1 truncate text-sm text-muted">
                      {item.address}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-sm font-medium text-foreground">
                    {item.status || "Saved"}
                  </p>

                  <p className="mt-1 text-xs text-subtle">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </ExpandableList>
        )}
      </Card>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Architectural Workflow
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            From structured input to operational intelligence
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Behind the scenes, every analysis moves through these architectural stages. Together they demonstrate how modern SaaS systems transform structured input into operational intelligence.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {architectureSteps.map((step) => (
            <div
              key={step.step}
              className="rounded-xl border border-border bg-surface-muted p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {step.step}
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
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
