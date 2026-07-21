"use client";

type WorkspaceCoachProps = {
  estimatedMinutes: number;
  priorityCount: number;
  primaryBottleneck: string;
  recommendedAction: string;
  onStartPlan: () => void;
  onShowBlocker: () => void;
  onShowOpportunity: () => void;
  onReviewPlan: () => void;
  onAskSomethingElse: () => void;
};

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning.";
  }

  if (hour < 17) {
    return "Good afternoon.";
  }

  return "Good evening.";
}

function getPrioritySummary(priorityCount: number) {
  if (priorityCount === 0) {
    return "Your workspace has no urgent priority actions waiting.";
  }

  if (priorityCount === 1) {
    return "Your workspace has 1 priority action ready to begin.";
  }

  return `Your workspace has ${priorityCount} priority actions ready to begin.`;
}

export default function WorkspaceCoach({
  estimatedMinutes,
  priorityCount,
  primaryBottleneck,
  recommendedAction,
  onStartPlan,
  onShowBlocker,
  onShowOpportunity,
  onReviewPlan,
  onAskSomethingElse,
}: WorkspaceCoachProps) {
  const greeting = getTimeGreeting();
  const prioritySummary = getPrioritySummary(priorityCount);

  return (
    <section className="space-y-6 pt-8">
  <div>
    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
      Workspace Coach
    </p>

    <h2 className="mt-2 text-3xl font-semibold text-white">
      Today&apos;s Plan
    </h2>

        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
  A focused plan based on the current state of your workspace.
</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">{greeting}</p>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {prioritySummary}
          </p>

          <p className="mt-6 text-xs font-medium uppercase tracking-wide text-slate-500">
            Today&apos;s focus
          </p>

          <h3 className="mt-2 max-w-3xl text-2xl font-semibold leading-8 text-slate-900">
            {recommendedAction}
          </h3>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Completing this work first will help remove the current bottleneck
            and keep the workspace moving forward.
          </p>

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Estimated effort
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {estimatedMinutes} minutes
              </p>
            </div>

            <button
              type="button"
              onClick={onStartPlan}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Start Today&apos;s Plan
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Today&apos;s Queue
          </p>

          <p className="mt-2 text-4xl font-semibold text-slate-900">
            {priorityCount}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {priorityCount === 1
              ? "priority action waiting"
              : "priority actions waiting"}
          </p>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Current blocker
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
              {primaryBottleneck}
            </p>

            <button
              type="button"
              onClick={onShowBlocker}
              className="mt-4 text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950"
            >
              Explain this blocker
            </button>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Guided help</p>

        <h3 className="mt-1 text-lg font-semibold text-slate-900">
          What would you like AppStack to help with?
        </h3>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={onShowBlocker}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            What&apos;s Blocking Me?
          </button>

          <button
            type="button"
            onClick={onShowOpportunity}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Biggest Opportunity
          </button>

          <button
            type="button"
            onClick={onReviewPlan}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Review Today&apos;s Plan
          </button>

          <button
            type="button"
            onClick={onAskSomethingElse}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Ask Something Else
          </button>
        </div>
      </article>
    </section>
  );
}