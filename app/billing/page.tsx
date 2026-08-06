import Link from "next/link";

import Page from "../components/Page";
import Card from "../components/Card";

export default function BillingPage() {
  return (
    <Page
      title="Billing"
      description="Manage subscription access, usage, and payment settings."
    >
      <Card
        title="Billing Setup"
        className="mt-10"
      >
        <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Integration Pending
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Billing will be connected after authentication.
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            AppStack will use authenticated accounts to connect
            subscriptions, payment methods, usage limits, and feature
            access to the correct user.
          </p>
        </div>
      </Card>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Subscription
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Plan management
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            View the active plan, upgrade access, or manage a
            subscription after billing is connected.
          </p>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Not connected yet
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Usage
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Limits and metering
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Track analyses, reports, jobs, and other plan-based usage
            from one place.
          </p>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Not connected yet
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payment
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Payment settings
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Update payment details, review invoices, and access the
            billing portal after Stripe integration.
          </p>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Not connected yet
          </p>
        </Card>
      </section>

      <Card
        title="Planned Billing Flow"
        className="mt-8"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 1
            </p>

            <h3 className="mt-2 font-semibold">
              Create Account
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Authentication establishes the user and account owner.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 2
            </p>

            <h3 className="mt-2 font-semibold">
              Choose Plan
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              The user selects the access level that fits their needs.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 3
            </p>

            <h3 className="mt-2 font-semibold">
              Activate Access
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Stripe confirms payment and AppStack applies the correct
              entitlements.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step 4
            </p>

            <h3 className="mt-2 font-semibold">
              Manage Billing
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              The user manages invoices, payment details, and plan
              changes.
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