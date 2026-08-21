"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import Page from "../components/Page";
import Card from "../components/Card";

import { getCurrentSubscription } from "../../lib/billingService";
import {
  getCurrentBillingUsage,
  type BillingUsage,
} from "../../lib/billingUsageService";

import {
  BILLING_PLANS,
  formatPlanPrice,
  type SubscriptionRecord,
} from "../../lib/billingDomain";

const billingFlow = [
  {
    step: "Step 1",
    title: "Authenticate User",
    description:
      "AppStack establishes the signed-in user and user-scoped application boundary.",
    status: "Complete",
  },
  {
    step: "Step 2",
    title: "Assign Plan",
    description:
      "Each authenticated user now has a persisted AppStack subscription record and plan assignment.",
    status: "Complete",
  },
  {
  step: "Step 3",
  title: "Enforce Entitlements",
  description:
    "Plan limits are measured and enforced for analyses, reports, and jobs. AI usage enforcement remains intentionally deferred until reliable AI metering is connected.",
  status: "Complete",
},
  {
    step: "Step 4",
    title: "Connect Payments",
    description:
      "Stripe Checkout, customer records, subscription lifecycle events, and customer billing portal management are connected.",
    status: "Complete",
  },
];

function getStatusLabel(status: SubscriptionRecord["status"]) {
  switch (status) {
    case "free":
      return "Free";
    case "active":
      return "Active";
    case "past_due":
      return "Past Due";
    case "canceled":
      return "Canceled";
    default:
      return status;
  }
}

export default function BillingPage() {
  const [subscription, setSubscription] =
    useState<SubscriptionRecord | null>(null);

  const [loading, setLoading] = useState(true);

  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadBilling() {
      try {
        const [
          subscriptionResult,
          usageResult,
        ] = await Promise.all([
          getCurrentSubscription(),
          getCurrentBillingUsage(),
        ]);

        if (!mounted) {
          return;
        }

        if (
          subscriptionResult.error ||
          !subscriptionResult.data
        ) {
          console.error(
            "Subscription load failed:",
            subscriptionResult.error
          );

          toast.error(
            "Your billing information could not be loaded."
          );
        } else {
          setSubscription(subscriptionResult.data);
        }

        if (
          usageResult.error ||
          !usageResult.data
        ) {
          console.error(
            "Billing usage load failed:",
            usageResult.error
          );

          toast.error(
            "Your billing usage could not be loaded."
          );
        } else {
          setUsage(usageResult.data);
        }

        setLoading(false);
        setUsageLoading(false);
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error(
          "Billing load failed:",
          error
        );

        toast.error(
          "Your billing information could not be loaded."
        );

        setLoading(false);
        setUsageLoading(false);
      }
    }

    loadBilling();

    return () => {
      mounted = false;
    };
  }, []);

  async function startCheckout() {
    if (checkoutLoading) {
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch(
        "/api/billing/checkout",
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.error ||
            "Checkout could not be started."
        );
      }

      window.location.href = result.url;
    } catch (error) {
      console.error(
        "Checkout start failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Checkout could not be started."
      );

      setCheckoutLoading(false);
    }
  }

  async function openBillingPortal() {
    if (portalLoading) return;

    setPortalLoading(true);

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Billing portal could not be opened.");
      }

      window.location.href = result.url;
    } catch (error) {
      console.error("Billing portal start failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Billing portal could not be opened."
      );
      setPortalLoading(false);
    }
  }

  const plan = subscription
    ? BILLING_PLANS[subscription.plan]
    : null;

  const stripeConnected = Boolean(
    subscription?.stripeCustomerId &&
      subscription?.stripeSubscriptionId
  );

  const usagePeriodLabel = usage
    ? `${new Date(
        usage.periodStart
      ).toLocaleDateString()} – ${new Date(
        usage.periodEnd
      ).toLocaleDateString()}`
    : "Not available";

  const billingStatus = [
    {
      label: "Identity foundation",
      value: "Active",
      detail:
        "Authenticated users and protected routes establish the account boundary.",
      active: true,
    },
    {
      label: "Subscription record",
      value: subscription
        ? "Active"
        : loading
          ? "Loading"
          : "Unavailable",
      detail: subscription
        ? "The current user's plan and subscription status are persisted in Supabase."
        : "Subscription state could not be loaded.",
      active: Boolean(subscription),
    },
    {
      label: "Usage metering",
      value: usage ? "Active" : usageLoading ? "Loading" : "Unavailable",
      detail: usage
        ? "Current-period analyses, reports, and jobs are measured against plan allowances."
        : "Current-period usage could not be loaded.",
      active: Boolean(usage),
    },
    {
      label: "Payments",
      value: stripeConnected
        ? "Connected"
        : "Not Connected",
      detail: stripeConnected
        ? "Stripe identifiers are connected to the current subscription."
        : "Stripe Checkout is available; Stripe customer details will appear after a successful linked checkout.",
      active: stripeConnected,
    },
  ];

  return (
    <Page
      title="Billing"
      description="Review your current AppStack plan, persisted subscription state, and the billing capabilities being built on top of authentication."
    >
      <Card title="Current Subscription" className="mt-10">
        {loading && (
          <div className="rounded-xl border border-border bg-surface-muted p-6">
            <p className="text-sm text-muted">
              Loading subscription...
            </p>
          </div>
        )}

        {!loading && !subscription && (
          <div className="rounded-xl border border-border bg-surface-muted p-6">
            <p className="text-sm font-semibold text-foreground">
              Subscription unavailable
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              AppStack could not load the current subscription record.
            </p>
          </div>
        )}

        {!loading && subscription && plan && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-xl border border-border bg-surface-muted p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                Current Plan
              </p>

              <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
                <h2 className="text-3xl font-bold text-foreground">
                  {plan.name}
                </h2>

                {subscription.plan !== "free" && (
                  <p className="pb-1 text-lg font-semibold text-muted">
                    {formatPlanPrice(subscription.plan)}
                  </p>
                )}
              </div>

              <p className="mt-3 max-w-3xl leading-7 text-muted">
                {plan.description}
              </p>

              {subscription.plan === "free" && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={checkoutLoading}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutLoading
                      ? "Opening Checkout..."
                      : "Upgrade to Pro — $29/month"}
                  </button>
                </div>
              )}

              {subscription.plan === "pro" && stripeConnected && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={openBillingPortal}
                    disabled={portalLoading}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {portalLoading ? "Opening Billing..." : "Manage Billing"}
                  </button>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                    Analyses
                  </p>
                  <p className="mt-2 text-xl font-bold text-foreground">
                    {usage
                      ? `${usage.analyses} / ${plan.entitlements.analysisLimit}`
                      : `— / ${plan.entitlements.analysisLimit}`}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    used this period
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                    Reports
                  </p>
                  <p className="mt-2 text-xl font-bold text-foreground">
                    {usage
                      ? `${usage.reports} / ${plan.entitlements.reportLimit}`
                      : `— / ${plan.entitlements.reportLimit}`}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    used this period
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                    Jobs
                  </p>
                  <p className="mt-2 text-xl font-bold text-foreground">
                    {usage
                      ? `${usage.jobs} / ${plan.entitlements.jobLimit}`
                      : `— / ${plan.entitlements.jobLimit}`}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    used this period
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                    AI Requests
                  </p>
                  <p className="mt-2 text-xl font-bold text-foreground">
                    — / {plan.entitlements.aiRequestLimit}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    metering not connected
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Subscription Status
              </p>

              <p className="mt-3 text-2xl font-bold text-foreground">
                {getStatusLabel(subscription.status)}
              </p>

              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground">
                    Stripe
                  </p>
                  <p className="mt-1 text-muted">
                    {stripeConnected
                      ? "Connected"
                      : "Not connected yet"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Billing period
                  </p>
                  <p className="mt-1 text-muted">
                    {usage
                      ? usagePeriodLabel
                      : subscription.currentPeriodStart &&
                          subscription.currentPeriodEnd
                        ? `${new Date(
                            subscription.currentPeriodStart
                          ).toLocaleDateString()} – ${new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString()}`
                        : "Not established yet"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Cancellation
                  </p>
                  <p className="mt-1 text-muted">
                    {subscription.cancelAtPeriodEnd
                      ? "Scheduled at period end"
                      : "Not scheduled"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {billingStatus.map((item) => (
          <Card key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              {item.label}
            </p>

            <p
              className={`mt-3 text-xl font-bold ${
                item.active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              }`}
            >
              {item.value}
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              {item.detail}
            </p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Subscription
          </p>

          <h2 className="mt-3 text-xl font-bold text-foreground">
            Plan Assignment
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            AppStack now persists a subscription record for each authenticated
            user. The current plan is resolved through the billing service
            instead of being hard-coded into this page.
          </p>

          <div className="mt-5 rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">
              Current state
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              {subscription && plan
                ? `${plan.name} plan with ${getStatusLabel(
                    subscription.status
                  ).toLowerCase()} subscription status.`
                : "Waiting for subscription data."}
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Usage
          </p>

          <h2 className="mt-3 text-xl font-bold text-foreground">
            Limits & Metering
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Analyses, reports, and jobs are now measured for the current billing
            period and compared with the allowances defined by the active plan.
            AI request metering is intentionally deferred until a reliable usage
            source is connected.
          </p>

          <div className="mt-5 rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">
              Current period
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              {usage
                ? `${usage.analyses} analyses, ${usage.reports} reports, and ${usage.jobs} jobs recorded from ${usagePeriodLabel}.`
                : "Usage data is still loading or unavailable."}

            </p>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Payments
          </p>

          <h2 className="mt-3 text-xl font-bold text-foreground">
            Stripe Integration
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Stripe Checkout, subscription synchronization, and customer billing
            portal access are connected in sandbox mode.
          </p>

          <div className="mt-5 rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">
              Current state
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              {stripeConnected
                ? "Stripe identifiers are present on this subscription."
                : "Stripe identifiers will populate after a successful linked checkout and webhook synchronization."}
            </p>
          </div>
        </Card>
      </section>

      <Card title="Billing Flow" className="mt-8">
        <p className="max-w-3xl text-sm leading-6 text-muted">
  Billing is layered onto the identity boundary in stages. Identity, persisted
  plan assignment, current-period usage metering, entitlement enforcement,
  Stripe Checkout, subscription synchronization, and customer billing management
  are connected. AI usage enforcement remains deferred until reliable AI metering
  is available.
</p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {billingFlow.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border bg-surface-muted p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  {item.step}
                </p>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.status === "Complete"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : item.status === "Next"
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        : "border border-border bg-surface text-muted"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-foreground">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="How this fits AppStack" className="mt-8">
        <p className="max-w-3xl text-sm leading-6 text-muted">
          Billing remains an account-level service built on AppStack identity.
          Supabase now persists plan and subscription state for each user, while
          the billing domain defines deterministic plan allowances independently
          of Stripe.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            [
              "1. Identity",
              "Authentication establishes the account owner.",
            ],
            [
              "2. Subscription",
              "Supabase persists the current plan and subscription lifecycle state.",
            ],
            [
              "3. Entitlements",
              "Billing rules define the allowances that application services now enforce.",
            ],
            [
              "4. Payments",
              "Stripe manages checkout, invoices, customer billing controls, and the external payment lifecycle.",
            ],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface-muted p-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {title}
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                {description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          Return to Dashboard
        </Link>

        <Link
          href="/settings"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
        >
          Open Settings
        </Link>
      </div>
    </Page>
  );
}
