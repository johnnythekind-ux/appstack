"use client";

import { useEffect, useState } from "react";

import Card from "../Card";
import Button from "../Button";

type TaskUpdateInput = {
  title: string;
  description?: string;
  status: "queued" | "running" | "completed";
};

type SelectedWorkspaceItemProps = {
  selectedItem: any;
  selectedItemEvents: any[];
  workspaceAnalysis: any;
  recommendation: any;
  onClose: () => void;
  onOpen: () => void;
  onGenerateReport: () => void;
  onCreateJob: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateTask: (input: TaskUpdateInput) => Promise<boolean | void>;
};

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

function formatStatus(status?: string) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

export default function SelectedWorkspaceItem({
  selectedItem,
  selectedItemEvents,
  workspaceAnalysis,
  recommendation,
  onClose,
  onOpen,
  onGenerateReport,
  onCreateJob,
  onDuplicate,
  onDelete,
  onUpdateTask,
}: SelectedWorkspaceItemProps) {
  const isTask = selectedItem?.type === "task";

  const [editingTask, setEditingTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] =
    useState<"queued" | "running" | "completed">("queued");

  useEffect(() => {
    if (!selectedItem || selectedItem.type !== "task") {
      setEditingTask(false);
      return;
    }

    setTaskTitle(selectedItem.title ?? "");
    setTaskDescription(selectedItem.content ?? "");

    const normalizedStatus = String(
      selectedItem.status ?? "queued"
    ).toLowerCase();

    setTaskStatus(
      normalizedStatus === "running" ||
        normalizedStatus === "completed"
        ? normalizedStatus
        : "queued"
    );

    setEditingTask(false);
  }, [selectedItem]);

  if (!selectedItem) {
    return null;
  }

  async function saveTask(
    nextStatus: "queued" | "running" | "completed" = taskStatus
  ) {
    if (!taskTitle.trim() || savingTask) {
      return;
    }

    setSavingTask(true);

    try {
      const saved = await onUpdateTask({
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        status: nextStatus,
      });

      if (saved !== false) {
        setTaskStatus(nextStatus);
        setEditingTask(false);
      }
    } finally {
      setSavingTask(false);
    }
  }

  const taskIsCompleted =
    String(selectedItem.status).toLowerCase() === "completed";

  return (
    <Card title="Current Selection" className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            {getItemIcon(selectedItem.type)} {selectedItem.type}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-foreground">
            {selectedItem.title}
          </h2>

          {selectedItem.address && (
            <p className="mt-2 text-muted">
              {selectedItem.address}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border-strong px-4 py-2 text-foreground transition hover:bg-surface-muted"
        >
          Close
        </button>
      </div>

      {isTask ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">
                Item Details
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Status</span>
                  <span className="font-medium text-foreground">
                    {formatStatus(selectedItem.status)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
  <span className="text-muted">Created</span>
  <span className="text-right text-foreground">
    {formatDate(selectedItem.created_at)}
  </span>
</div>

<div className="flex justify-between gap-4">
  <span className="text-muted">Last Updated</span>
  <span className="text-right text-foreground">
    {formatDate(selectedItem.updated_at)}
  </span>
</div>

              </div>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">
                Next Action
              </h3>

              <p className="mt-4 font-semibold text-foreground">
                {taskIsCompleted
                  ? "No action required"
                  : "Complete this task"}
              </p>

              <p className="mt-3 text-sm leading-6 text-muted">
                {taskIsCompleted
                  ? "This workspace task is complete. Reopen it if additional work is required."
                  : "Update the task as work progresses, add notes when needed, and mark it complete when finished."}
              </p>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">
                Activity
              </h3>

              <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
                {selectedItemEvents.length === 0 && (
                  <div className="space-y-2 text-sm text-muted">
                    <p>
                      Created {formatDate(selectedItem.created_at)}
                    </p>

                    {selectedItem.updated_at &&
                      selectedItem.updated_at !==
                        selectedItem.created_at && (
                        <p>
                          Last updated{" "}
                          {formatDate(selectedItem.updated_at)}
                        </p>
                      )}
                  </div>
                )}

                {selectedItemEvents.map((event) => (
                  <div key={event.id}>
                    <p className="text-sm font-medium text-foreground">
                      {event.description}
                    </p>

                    <p className="mt-1 text-xs text-subtle">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-foreground">
                Notes & Details
              </h3>

              {!editingTask && (
                <button
                  type="button"
                  onClick={() => setEditingTask(true)}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Edit details
                </button>
              )}
            </div>

            {editingTask ? (
              <div className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor="selected-task-title"
                    className="text-sm font-medium text-foreground"
                  >
                    Title
                  </label>

                  <input
                    id="selected-task-title"
                    type="text"
                    value={taskTitle}
                    onChange={(event) =>
                      setTaskTitle(event.target.value)
                    }
                    maxLength={160}
                    disabled={savingTask}
                    className="mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="selected-task-status"
                    className="text-sm font-medium text-foreground"
                  >
                    Status
                  </label>

                  <select
                    id="selected-task-status"
                    value={taskStatus}
                    onChange={(event) =>
                      setTaskStatus(
                        event.target.value as
                          | "queued"
                          | "running"
                          | "completed"
                      )
                    }
                    disabled={savingTask}
                    className="mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="queued">Queued</option>
                    <option value="running">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="selected-task-description"
                    className="text-sm font-medium text-foreground"
                  >
                    Notes / Description
                  </label>

                  <textarea
                    id="selected-task-description"
                    value={taskDescription}
                    onChange={(event) =>
                      setTaskDescription(event.target.value)
                    }
                    rows={6}
                    maxLength={4000}
                    disabled={savingTask}
                    placeholder="Add notes, context, next steps, or other details..."
                    className="mt-2 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-foreground outline-none placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTaskTitle(selectedItem.title ?? "");
                      setTaskDescription(selectedItem.content ?? "");
                      setTaskStatus(
                        String(selectedItem.status).toLowerCase() ===
                          "running"
                          ? "running"
                          : String(
                                selectedItem.status
                              ).toLowerCase() === "completed"
                            ? "completed"
                            : "queued"
                      );
                      setEditingTask(false);
                    }}
                    disabled={savingTask}
                    className="rounded-xl border border-border-strong px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => saveTask()}
                    disabled={savingTask || !taskTitle.trim()}
                    className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
                  >
                    {savingTask ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted">
                {selectedItem.content ||
                  "No notes or description have been added yet."}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setEditingTask(true)}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit Details
            </button>

            <button
              type="button"
              onClick={() =>
                saveTask(taskIsCompleted ? "queued" : "completed")
              }
              disabled={savingTask}
              className={
                taskIsCompleted
                  ? "rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  : "rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              }
            >
              {taskIsCompleted ? "Reopen" : "Mark Complete"}
            </button>

            <button
              type="button"
              onClick={onDuplicate}
              className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
            >
              Duplicate
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">
                Workflow
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Stage</span>
                  <span className="text-foreground">
                    {workspaceAnalysis.stage}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted">Health</span>
                  <span className="text-foreground">
                    {workspaceAnalysis.health}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted">Events</span>
                  <span className="text-foreground">
                    {workspaceAnalysis.eventCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">
                Recommendation
              </h3>

              <p className="mt-4 text-sm text-muted">
                Next Action
              </p>

              <p className="mt-1 font-semibold text-foreground">
                {recommendation.action}
              </p>

              <p className="mt-4 text-sm leading-6 text-muted">
                {recommendation.reason}
              </p>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">
                Activity
              </h3>

              <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
                {selectedItemEvents.length === 0 && (
                  <p className="text-sm text-muted">
                    No activity yet.
                  </p>
                )}

                {selectedItemEvents.map((event) => (
                  <div key={event.id}>
                    <p className="text-sm font-medium text-foreground">
                      {event.description}
                    </p>

                    <p className="mt-1 text-xs text-subtle">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedItem.content && (
            <details className="mt-6 rounded-xl border border-border p-5">
              <summary className="cursor-pointer font-semibold text-foreground">
                View saved content
              </summary>

              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-surface-muted p-4 text-sm text-foreground">
                {selectedItem.content}
              </pre>
            </details>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={onOpen}>
              Open
            </Button>

            {selectedItem.type === "analysis" && (
              <Button onClick={onGenerateReport}>
                Generate Report
              </Button>
            )}

            {selectedItem.type === "report" && (
              <Button onClick={onCreateJob}>
                Create Job
              </Button>
            )}

            <Button onClick={onDelete}>
              Delete
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
