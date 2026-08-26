import { supabase } from "./supabase";

import {
  getSubscriptionForUserId,
} from "./billingService";

export type BillingUsage = {
  analyses: number;
  reports: number;
  jobs: number;
  aiRequests: number;

  periodStart: string;
  periodEnd: string;
};

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(
      "You must be signed in to access billing usage."
    );
  }

  return user.id;
}

function getDefaultMonthlyPeriod() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );

  return {
    periodStart:
      start.toISOString(),

    periodEnd:
      end.toISOString(),
  };
}

async function countWorkspaceItems({
  userId,
  type,
  periodStart,
  periodEnd,
}: {
  userId: string;
  type:
    | "analysis"
    | "report"
    | "job";
  periodStart: string;
  periodEnd: string;
}) {
  const {
    count,
    error,
  } = await supabase
    .from("workspace_items")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("type", type)
    .gte(
      "created_at",
      periodStart
    )
    .lt(
      "created_at",
      periodEnd
    );

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function countAIRequests({
  userId,
  periodStart,
  periodEnd,
}: {
  userId: string;
  periodStart: string;
  periodEnd: string;
}) {
  const {
    count,
    error,
  } = await supabase
    .from("ai_usage")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .gte(
      "created_at",
      periodStart
    )
    .lt(
      "created_at",
      periodEnd
    );

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getCurrentBillingUsage(): Promise<{
  data: BillingUsage | null;
  error: unknown;
}> {
  try {
    /*
     * Resolve the current user once.
     */
    const userId =
      await getCurrentUserId();

    /*
     * Reuse that same trusted user ID
     * when loading subscription state.
     *
     * This avoids another auth.getUser()
     * call inside billingService.
     */
    const {
      data: subscription,
      error: subscriptionError,
    } =
      await getSubscriptionForUserId(
        userId
      );

    if (subscriptionError) {
      return {
        data: null,
        error:
          subscriptionError,
      };
    }

    const defaultPeriod =
      getDefaultMonthlyPeriod();

    const periodStart =
      subscription
        ?.currentPeriodStart ??
      defaultPeriod.periodStart;

    const periodEnd =
      subscription
        ?.currentPeriodEnd ??
      defaultPeriod.periodEnd;

    const [
      analyses,
      reports,
      jobs,
      aiRequests,
    ] = await Promise.all([
      countWorkspaceItems({
        userId,
        type: "analysis",
        periodStart,
        periodEnd,
      }),

      countWorkspaceItems({
        userId,
        type: "report",
        periodStart,
        periodEnd,
      }),

      countWorkspaceItems({
        userId,
        type: "job",
        periodStart,
        periodEnd,
      }),

      countAIRequests({
        userId,
        periodStart,
        periodEnd,
      }),
    ]);

    return {
      data: {
        analyses,
        reports,
        jobs,
        aiRequests,
        periodStart,
        periodEnd,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Billing usage load failed:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}