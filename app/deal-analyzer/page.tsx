"use client";

import { useState } from "react";
import { analyses } from "../data/analyses";
import { supabase } from "../../lib/supabase";

export default function DealAnalyzerPage() {
  const [analysisName, setAnalysisName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [arv, setArv] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const maxOffer = Number(arv) * 0.7 - Number(repairCost);

  function analyzeDeal() {
    const price = Number(purchasePrice);

    if (price <= maxOffer) {
      setResult("BUY");
    } else if (price <= maxOffer * 1.1) {
      setResult("NEGOTIATE");
    } else {
      setResult("PASS");
    }

    setSaved(false);
  }

  async function saveAnalysis() {
  const savedAnalysis = {
    name: analysisName || "Untitled Analysis",
    address: propertyAddress || "No address entered",
    purchasePrice: Number(purchasePrice),
    arv: Number(arv),
    repairCost: Number(repairCost),
    maxOffer,
    recommendation: result,
  };

  localStorage.setItem(
    "appstack_saved_analysis",
    JSON.stringify(savedAnalysis)
  );

  const { error } = await supabase.from("workspace_items").insert({
    type: "analysis",
    title: savedAnalysis.name,
    address: savedAnalysis.address,
    status: savedAnalysis.recommendation,
    metadata: {
      purchasePrice: savedAnalysis.purchasePrice,
      arv: savedAnalysis.arv,
      repairCost: savedAnalysis.repairCost,
      maxOffer: savedAnalysis.maxOffer,
    },
  });

  if (error) {
    console.error(error);
    alert("Supabase save failed. Check console.");
    return;
  }

  setSaved(true);
}

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold">Deal Analyzer</h1>

        <p className="mt-3 text-slate-400">
          Analyze a real estate investment opportunity using basic deal logic.
        </p>

        <section className="mt-10 rounded-xl border border-slate-800 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-400">Analysis Name</label>
              <input
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
                placeholder="Houston Flip Test"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Property Address</label>
              <input
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
                placeholder="123 Main St, Houston, TX"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="text-sm text-slate-400">Purchase Price</label>
              <input
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
                placeholder="150000"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">ARV</label>
              <input
                value={arv}
                onChange={(e) => setArv(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
                placeholder="250000"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Repair Cost</label>
              <input
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
                placeholder="30000"
              />
            </div>
          </div>

          <button
            onClick={analyzeDeal}
            className="mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Analyze Deal
          </button>
        </section>

        {result && (
          <section className="mt-8 rounded-xl border border-slate-800 p-6">
            <p className="text-sm text-slate-400">Recommendation</p>

            <h2 className="mt-2 text-4xl font-bold">{result}</h2>

            <div className="mt-4">
              <h3 className="text-xl font-semibold">
                {analysisName || "Untitled Analysis"}
              </h3>

              <p className="mt-1 text-slate-400">
                {propertyAddress || "No property address entered"}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-xs text-slate-400">ARV</p>
                <p className="mt-2 text-xl font-semibold">
                  ${Number(arv).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-xs text-slate-400">Repairs</p>
                <p className="mt-2 text-xl font-semibold">
                  ${Number(repairCost).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-xs text-slate-400">Maximum Offer</p>
                <p className="mt-2 text-xl font-semibold">
                  ${maxOffer.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-xs text-slate-400">Purchase Price</p>
                <p className="mt-2 text-xl font-semibold">
                  ${Number(purchasePrice).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="mt-5 text-slate-400">
              This result is based on a simple max offer rule: ARV × 70% minus repairs.
            </p>

            <button
              onClick={saveAnalysis}
              className="mt-6 rounded-lg border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-400"
            >
              Save Analysis
            </button>

            {saved && (
              <p className="mt-4 text-sm text-green-400">
                Analysis saved to Supabase.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}