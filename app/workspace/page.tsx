"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function WorkspacePage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await supabase
        .from("workspace_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        alert("Failed to load workspace items.");
        return;
      }

      setItems(data || []);
    }

    loadItems();
  }, []);

  const analyses = items.filter((item) => item.type === "analysis");
  const reports = items.filter((item) => item.type === "report");
  const jobs = items.filter((item) => item.type === "job");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-bold">Workspace</h1>

        <p className="mt-3 text-slate-400">
          Shared storage layer for analyses, reports, jobs, and generated outputs.
        </p>

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-sm text-slate-400">Saved Analyses</p>
            <p className="mt-2 text-3xl font-bold">{analyses.length}</p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-sm text-slate-400">Reports</p>
            <p className="mt-2 text-3xl font-bold">{reports.length}</p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-sm text-slate-400">Jobs</p>
            <p className="mt-2 text-3xl font-bold">{jobs.length}</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Recent Workspace Items</h2>

          <div className="mt-5 space-y-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{item.type}</p>
                    <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>

                    {item.address && (
                      <p className="mt-2 text-slate-400">{item.address}</p>
                    )}
                  </div>

                  {item.status && (
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                      {item.status}
                    </span>
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
        </section>
      </div>
    </main>
  );
}