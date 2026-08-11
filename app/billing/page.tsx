import Link from "next/link";

import Page from "../components/Page";
import Card from "../components/Card";

const billingStatus = [
  {
    label: "Identity foundation",
    value: "Active",
    detail: "Authenticated users and protected routes are already in place.",
  },
  {
    label: "Subscription system",
    value: "Planned",
    detail: "No plan catalog or entitlement model is connected yet.",
  },
  {
    label: "Usage metering",
    value: "Planned",
    detail: "Analyses, reports, and jobs are not yet tied to billing limits.",
  },
  {
    label: "Payments",
    value: "Planned",
    detail: "Stripe checkout, invoices, and billing portal are not yet connected.",
  },
];

const billingFlow = [
  {
    step: "Step 1",
    title: "Authenticate User",
    description:
      "AppStack already establishes the signed-in user and user-scoped application boundary.",
    status: "Complete",
  },
  {
    step: "Step 2",
    title: "Choose Plan",
    description:
      "A future plan catalog will define access levels, usage limits, and entitlements.",
    status: "Planned",
  },
  {
    step: "Step 3",
    title: "Activate Subscription",
    description:
      "Stripe will confirm payment and AppStack will persist the resulting subscription state.",
    status: "Planned",
  },
  {
    step: "Step 4",
    title: "Manage Billing",
    description:
      "Users will manage invoices, payment methods, plan changes, and billing history.",
    status: "Planned",
  },
];

export default function BillingPage() {
  return (
    <Page
      title="Billing"
      description="Review the current billing foundation and the subscription capabilities that will build on AppStack authentication."
    >
      <Card
        title="Billing Foundation"
        className="mt-10"
      >
        <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Identity Ready
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Authentication is complete. Billing integration is the next layer.
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            AppStack now has authenticated accounts, protected routes, persistent
            sessions, and user-scoped workspace data. Billing can build on that
            identity boundary, but subscription plans, usage entitlements, Stripe
            payments, and billing management are not connected yet.
          </p>
        </div>
      </Card>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {billingStatus.map((item) => (
          <Card key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {item.label}
            </p>

            <p
              className={`mt-3 text-xl font-bold ${
                item.value === "Active"
                  ? "text-emerald-400"
                  : "text-slate-200"
              }`}
            >
              {item.value}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {item.detail}
            </p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Subscription
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Plan Management
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            AppStack does not yet persist a subscription or plan assignment for
            the authenticated user.
          </p>

          <div className="mt-5 rounded-lg border border-slate-800 p-4">
            <p className="text-sm font-semibold text-slate-200">
              Planned capability
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Define plan tiers, assign entitlements, and expose upgrade or
              downgrade controls.
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Usage
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Limits & Metering
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Workspace activity is already measurable, but those counts are not
            yet tied to billing limits or entitlement enforcement.
          </p>

          <div className="mt-5 rounded-lg border border-slate-800 p-4">
            <p className="text-sm font-semibold text-slate-200">
              Planned capability
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Meter analyses, reports, jobs, and future AI usage against plan
              allowances.
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payments
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Payment Settings
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Payment methods, invoices, checkout, and billing portal access are
            not implemented yet.
          </p>

          <div className="mt-5 rounded-lg border border-slate-800 p-4">
            <p className="text-sm font-semibold text-slate-200">
              Planned capability
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Connect Stripe checkout, customer records, invoices, and billing
              portal management.
            </p>
          </div>
        </Card>
      </section>

      <Card
        title="Planned Billing Flow"
        className="mt-8"
      >
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Billing is intentionally staged on top of the identity work that is
          already complete. The remaining steps are subscription and payment
          capabilities, not authentication work.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {billingFlow.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-slate-800 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {item.step}
                </p>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.status === "Complete"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="mt-3 font-semibold">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="How this fits AppStack"
        className="mt-8"
      >
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Billing is an account-level service that depends on identity. AppStack
          now has that identity foundation, so future billing work can attach
          subscriptions, usage, entitlements, and payments to the correct
          authenticated user without redesigning the authentication boundary.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              1. Identity
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Authentication establishes the account owner.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              2. Subscription
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              A future billing record will attach plan state to that user.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              3. Entitlements
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Plan rules will control limits and feature access.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              4. Payments
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Stripe can manage checkout, invoices, and billing lifecycle.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Return to Dashboard
        </Link>

        <Link
          href="/settings"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
        >
          Open Settings
        </Link>
      </div>
    </Page>
  );
}
