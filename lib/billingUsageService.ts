import { supabase } from "./supabase";

import {
  getCurrentSubscription,
} from "./billingService";

export type BillingUsage = {
  analyses: number;
  reports: number;
  jobs: number;

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
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}

async function countWorkspaceItems({
  userId,
  type,
  periodStart,
  periodEnd,
}: {
  userId: string;
  type: "analysis" | "report" | "job";
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
    .gte("created_at", periodStart)
    .lt("created_at", periodEnd);

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
    const userId = await getCurrentUserId();

    const {
      data: subscription,
      error: subscriptionError,
    } = await getCurrentSubscription();

    if (subscriptionError) {
      return {
        data: null,
        error: subscriptionError,
      };
    }

    const defaultPeriod =
      getDefaultMonthlyPeriod();

    const periodStart =
      subscription?.currentPeriodStart ??
      defaultPeriod.periodStart;

    const periodEnd =
      subscription?.currentPeriodEnd ??
      defaultPeriod.periodEnd;

    const [
      analyses,
      reports,
      jobs,
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
    ]);

    return {
      data: {
        analyses,
        reports,
        jobs,
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