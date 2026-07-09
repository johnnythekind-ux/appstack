"use client";

import { useState } from "react";
import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { getWorkspaceItems } from "../../lib/workspaceService";
import { backfillWorkspaceEvents } from "../../lib/workspaceEventBackfillService";

export default function DevToolsPage() {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function runWorkspaceEventBackfill() {
    setRunning(true);
    setLastResult(null);

    const { data: items, error: itemsError } = await getWorkspaceItems();

    if (itemsError) {
      console.error(itemsError);
      toast.error("Failed to load workspace items.");
      setRunning(false);
      return;
    }

    const { created, error } = await backfillWorkspaceEvents(items || []);

    if (error) {
      console.error(error);
      toast.error("Workspace event backfill failed.");
      setRunning(false);
      return;
    }

    const message = `Backfill complete. ${created} events created.`;

    setLastResult(message);
    toast.success(message);
    setRunning(false);
  }

  return (
    <Page
      title="Developer Tools"
      description="Maintenance utilities for AppStack training, migrations, diagnostics, and data repair."
    >
      <Card title="Workspace Event Backfill" className="mt-10">
        <p className="text-slate-400">
          Creates missing historical events for older workspace items so the
          intelligence layer can analyze legacy data.
        </p>

        <div className="mt-6">
          <Button onClick={runWorkspaceEventBackfill} disabled={running}>
            {running ? "Running Backfill..." : "Backfill Workspace Events"}
          </Button>
        </div>

        {lastResult && (
          <div className="mt-6 rounded-lg border border-slate-800 p-4">
            <p className="text-sm text-slate-400">Last Result</p>
            <p className="mt-2 text-lg font-semibold">{lastResult}</p>
          </div>
        )}
      </Card>
    </Page>
  );
}