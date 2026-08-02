"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

import { supabase } from "../../lib/supabase";
import { createEvent } from "../../lib/eventService";

export default function DealAnalyzerPage() {
  const [analysisName, setAnalysisName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [arv, setArv] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const maxOffer =
    Number(arv) * 0.7 - Number(repairCost);

  function analyzeDeal() {
    const price = Number(purchasePrice);
    const arvValue = Number(arv);
    const repairValue = Number(repairCost);

    if (
      !purchasePrice ||
      !arv ||
      !repairCost ||
      price <= 0 ||
      arvValue <= 0 ||
      repairValue < 0
    ) {
      toast.error(
        "Enter a valid purchase price, ARV, and repair cost."
      );
      return;
    }

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
    if (!result) {
      toast.error("Analyze the deal before saving it.");
      return;
    }

    const savedAnalysis = {
      name: analysisName || "Untitled Analysis",
      address:
        propertyAddress || "No address entered",
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

    const { data, error } = await supabase
      .from("workspace_items")
      .insert({
        type: "analysis",
        title: savedAnalysis.name,
        address: savedAnalysis.address,
        status: savedAnalysis.recommendation,
        metadata: {
          purchasePrice:
            savedAnalysis.purchasePrice,
          arv: savedAnalysis.arv,
          repairCost: savedAnalysis.repairCost,
          maxOffer: savedAnalysis.maxOffer,
        },
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error(
        "The analysis could not be saved."
      );
      return;
    }

    const { error: eventError } =
      await createEvent({
        workspace_item_id: data.id,
        event_type: "analysis_created",
        description: `Analysis created: ${savedAnalysis.name}`,
        source: "Deal Analyzer",
        metadata: {
          address: savedAnalysis.address,
          recommendation:
            savedAnalysis.recommendation,
          maxOffer: savedAnalysis.maxOffer,
        },
      });

    if (eventError) {
      toast.error(
        "The analysis was saved, but activity tracking failed."
      );
    }

    setSaved(true);
    toast.success("Analysis saved successfully.");
  }

  function runAnotherAnalysis() {
    setAnalysisName("");
    setPropertyAddress("");
    setPurchasePrice("");
    setArv("");
    setRepairCost("");
    setResult(null);
    setSaved(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <Page
      title="Deal Analyzer"
      description="Analyze investment properties and calculate maximum allowable offers."
    >
      <Card
        title="Analyze Deal"
        className="mt-10"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-400">
              Analysis Name
            </label>

            <input
              value={analysisName}
              onChange={(event) =>
                setAnalysisName(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
              placeholder="Houston Flip Test"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">
              Property Address
            </label>

            <input
              value={propertyAddress}
              onChange={(event) =>
                setPropertyAddress(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
              placeholder="123 Main St, Houston, TX"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="text-sm text-slate-400">
              Purchase Price
            </label>

            <input
              value={purchasePrice}
              onChange={(event) =>
                setPurchasePrice(
                  event.target.value
                )
              }
              inputMode="decimal"
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
              placeholder="150000"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">
              ARV
            </label>

            <input
              value={arv}
              onChange={(event) =>
                setArv(event.target.value)
              }
              inputMode="decimal"
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
              placeholder="250000"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">
              Repair Cost
            </label>

            <input
              value={repairCost}
              onChange={(event) =>
                setRepairCost(
                  event.target.value
                )
              }
              inputMode="decimal"
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
              placeholder="30000"
            />
          </div>
        </div>

        <Button
          onClick={analyzeDeal}
          className="mt-6"
        >
          Analyze Deal
        </Button>
      </Card>

      {result && (
        <Card
          title="Recommendation"
          className="mt-8"
        >
          <StatusBadge
  status={result === "PASS" ? "PASS ON DEAL" : result}
/>

          <div className="mt-4">
            <h3 className="text-xl font-semibold">
              {analysisName ||
                "Untitled Analysis"}
            </h3>

            <p className="mt-1 text-slate-400">
              {propertyAddress ||
                "No property address entered"}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-xs text-slate-400">
                ARV
              </p>

              <p className="mt-2 text-xl font-semibold">
                ${Number(arv).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-xs text-slate-400">
                Repairs
              </p>

              <p className="mt-2 text-xl font-semibold">
                $
                {Number(
                  repairCost
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-xs text-slate-400">
                Maximum Offer
              </p>

              <p className="mt-2 text-xl font-semibold">
                ${maxOffer.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-xs text-slate-400">
                Purchase Price
              </p>

              <p className="mt-2 text-xl font-semibold">
                $
                {Number(
                  purchasePrice
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <p className="mt-5 text-slate-400">
            This result is based on a simple
            maximum-offer rule: ARV × 70% minus
            repairs.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={saveAnalysis}
              variant="secondary"
              disabled={saved}
            >
              {saved
                ? "Analysis Saved"
                : "Save Analysis"}
            </Button>

            <Button
              onClick={runAnotherAnalysis}
            >
              Run Another Analysis
            </Button>
          </div>

          {saved && (
            <p className="mt-4 text-sm text-green-400">
              Analysis saved successfully.
            </p>
          )}
        </Card>
      )}
    </Page>
  );
}