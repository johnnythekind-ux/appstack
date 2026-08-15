"use client";

import { useEffect, useState } from "react";

type CreateWorkspaceItemModalProps = {
  open: boolean;
  creating?: boolean;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    description?: string;
  }) => Promise<boolean | void>;
};

export default function CreateWorkspaceItemModal({
  open,
  creating = false,
  onClose,
  onCreate,
}: CreateWorkspaceItemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !creating) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, creating, onClose]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || creating) {
      return;
    }

    const created = await onCreate({
      title: trimmedTitle,
      description: description.trim() || undefined,
    });

    if (created !== false) {
      setTitle("");
      setDescription("");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !creating) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-item-title"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Workspace
            </p>

            <h2
              id="create-workspace-item-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              Create Workspace Item
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              Add a general task directly to Workspace without starting a deal
              analysis, report, or execution job.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            aria-label="Close create workspace item"
            className="rounded-lg px-3 py-2 text-xl leading-none text-muted transition hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label
              htmlFor="workspace-item-title"
              className="text-sm font-medium text-foreground"
            >
              Title <span className="text-accent">*</span>
            </label>

            <input
              id="workspace-item-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Follow up with lender"
              autoFocus
              maxLength={160}
              disabled={creating}
              className="mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="workspace-item-description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>

            <textarea
              id="workspace-item-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Confirm updated financing terms and next steps."
              rows={5}
              maxLength={2000}
              disabled={creating}
              className="mt-2 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <p className="mt-4 text-xs leading-5 text-muted">
            New manual items are created as queued workspace tasks. Analyses,
            reports, and jobs continue to be created through their dedicated
            workflows.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating || !title.trim()}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {creating ? "Creating..." : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
