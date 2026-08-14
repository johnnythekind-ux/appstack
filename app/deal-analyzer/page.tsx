"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

import { supabase } from "../../lib/supabase";
import { createEvent } from "../../lib/eventService";

type SavedAnalysis = {
  id: string;
  name: string;
  address: string;
  purchasePrice: number;
  arv: number;
  repairCost: number;
  maxOffer: number;
  recommendation: string;
};

function parseCurrencyInput(value: string) {
  const normalized = value.replace(/[$,\s]/g, "").trim();

  if (!normalized) {
    return Number.NaN;
  }

  return Number(normalized);
}

export default function DealAnalyzerPage() {
  const [analysisName, setAnalysisName] =
    useState("");
  const [propertyAddress, setPropertyAddress] =
    useState("");
  const [purchasePrice, setPurchasePrice] =
    useState("");
  const [arv, setArv] = useState("");
  const [repairCost, setRepairCost] =
    useState("");
  const [result, setResult] =
    useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const arvValue = parseCurrencyInput(arv);
  const repairValue = parseCurrencyInput(repairCost);

  const maxOffer =
    Number.isFinite(arvValue) && Number.isFinite(repairValue)
      ? arvValue * 0.7 - repairValue
      : Number.NaN;

  function analyzeDeal() {
    const price = parseCurrencyInput(purchasePrice);
    const currentArvValue = parseCurrencyInput(arv);
    const currentRepairValue = parseCurrencyInput(repairCost);

    if (
      !purchasePrice.trim() ||
      !arv.trim() ||
      !repairCost.trim() ||
      !Number.isFinite(price) ||
      !Number.isFinite(currentArvValue) ||
      !Number.isFinite(currentRepairValue) ||
      price <= 0 ||
      currentArvValue <= 0 ||
      currentRepairValue < 0
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
      toast.error(
        "Analyze the deal before saving it."
      );
      return;
    }

    if (saving || saved) {
      return;
    }

    setSaving(true);

    const analysisData = {
      name:
        analysisName.trim() ||
        "Untitled Analysis",
      address:
        propertyAddress.trim() ||
        "No address entered",
      purchasePrice: parseCurrencyInput(purchasePrice),
      arv: parseCurrencyInput(arv),
      repairCost: parseCurrencyInput(repairCost),
      maxOffer,
      recommendation: result,
    };

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error(
        "You must be signed in to save an analysis."
      );
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("workspace_items")
      .insert({
        type: "analysis",
        title: analysisData.name,
        address: analysisData.address,
        status: analysisData.recommendation,
        metadata: {
          purchasePrice:
            analysisData.purchasePrice,
          arv: analysisData.arv,
          repairCost:
            analysisData.repairCost,
          maxOffer: analysisData.maxOffer,
        },
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error(
        "The analysis could not be saved."
      );
      setSaving(false);
      return;
    }

    const savedAnalysis: SavedAnalysis = {
      id: data.id,
      ...analysisData,
    };

    localStorage.setItem(
      "appstack_saved_analysis",
      JSON.stringify(savedAnalysis)
    );

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
    setSaving(false);
    toast.success(
      "Analysis saved successfully."
    );
  }

  function continueToReportForge() {
    window.location.href = "/reportforge";
  }

  function runAnotherAnalysis() {
    setAnalysisName("");
    setPropertyAddress("");
    setPurchasePrice("");
    setArv("");
    setRepairCost("");
    setResult(null);
    setSaved(false);
    setSaving(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <Page
      title="Deal Analyzer"
      description="Evaluate a property with deterministic deal rules, then save the result into the AppStack workflow."
    >
      <Card
        title="Analyze Deal"
        className="mt-10"
      >
        <p className="mb-6 max-w-3xl text-sm leading-6 text-muted">
          Enter the property assumptions AppStack needs to evaluate the deal.
          The recommendation is calculated from explicit business rules — not AI —
          so the same inputs always produce the same result.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm text-muted">
              Analysis Name
            </label>

            <input
              value={analysisName}
              onChange={(event) =>
                setAnalysisName(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="Houston Flip Test"
            />
          </div>

          <div>
            <label className="text-sm text-muted">
              Property Address
            </label>

            <input
              value={propertyAddress}
              onChange={(event) =>
                setPropertyAddress(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="123 Main St, Houston, TX"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="text-sm text-muted">
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
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="150000"
            />
          </div>

          <div>
            <label className="text-sm text-muted">
              ARV
            </label>

            <input
              value={arv}
              onChange={(event) =>
                setArv(event.target.value)
              }
              inputMode="decimal"
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="250000"
            />
          </div>

          <div>
            <label className="text-sm text-muted">
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
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            status={
              result === "PASS"
                ? "PASS ON DEAL"
                : result
            }
          />

          <div className="mt-4">
            <h3 className="text-xl font-semibold">
              {analysisName ||
                "Untitled Analysis"}
            </h3>

            <p className="mt-1 text-muted">
              {propertyAddress ||
                "No property address entered"}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">
              Deterministic result
            </p>

            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-xs text-muted">
                ARV
              </p>

              <p className="mt-2 text-xl font-semibold">
                ${parseCurrencyInput(arv).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-xs text-muted">
                Repairs
              </p>

              <p className="mt-2 text-xl font-semibold">
                ${parseCurrencyInput(repairCost).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-xs text-muted">
                Maximum Offer
              </p>

              <p className="mt-2 text-xl font-semibold">
                ${maxOffer.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-xs text-muted">
                Purchase Price
              </p>

              <p className="mt-2 text-xl font-semibold">
                ${parseCurrencyInput(purchasePrice).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

          <p className="mt-5 text-muted">
            This result is based on a simple
            maximum-offer rule: ARV × 70% minus
            repairs.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={saveAnalysis}
              variant="secondary"
              disabled={saved || saving}
            >
              {saving
                ? "Saving Analysis..."
                : saved
                  ? "Analysis Saved"
                  : "Save to Workspace"}
            </Button>

            <Button
              onClick={runAnotherAnalysis}
            >
              Run Another Analysis
            </Button>
          </div>

          {saved && (
            <div className="mt-4 rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm font-medium text-success">
                Analysis saved to the shared Workspace.
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                The saved analysis is now available as a persisted input for downstream
                AppStack workflows, including ReportForge.
              </p>

              <Button
                onClick={continueToReportForge}
                className="mt-4"
              >
                Continue to ReportForge
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card
        title="How this fits AppStack"
        className="mt-8"
      >
        <p className="max-w-3xl text-sm leading-6 text-muted">
          Deal Analyzer is the entry point into AppStack&apos;s connected workflow.
          It turns structured property inputs into a deterministic decision, then
          persists that result so other modules can build on the same shared data.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">1. Structured input</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Property assumptions are captured in a consistent form.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">2. Deterministic logic</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Explicit business rules calculate the maximum offer and recommendation.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">3. Persistence</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Saving creates a reusable analysis record in the shared workspace.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">4. Module handoff</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              ReportForge and later workflow stages can consume the saved analysis.
            </p>
          </div>
        </div>
      </Card>
    </Page>
  );
}