import { supabase } from "./supabase";

import {
  DEFAULT_BILLING_PLAN,
  DEFAULT_SUBSCRIPTION_STATUS,
  evaluateEntitlement,
  getBillingPlan,
  type BillableCapability,
  type BillingPlan,
  type EntitlementDecision,
  type SubscriptionRecord,
  type SubscriptionStatus,
} from "./billingDomain";

type SubscriptionRow = {
  user_id: string;
  plan: BillingPlan;
  status: SubscriptionStatus;

  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;

  current_period_start: string | null;
  current_period_end: string | null;

  cancel_at_period_end: boolean;
  cancel_at: string | null;

  created_at?: string;
  updated_at?: string;
};

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(
      "You must be signed in to access billing data."
    );
  }

  return user.id;
}

function mapSubscriptionRow(
  row: SubscriptionRow
): SubscriptionRecord {
  return {
    userId: row.user_id,
    plan: row.plan,
    status: row.status,

    stripeCustomerId:
      row.stripe_customer_id,

    stripeSubscriptionId:
      row.stripe_subscription_id,

    stripePriceId:
      row.stripe_price_id,

    currentPeriodStart:
      row.current_period_start,

    currentPeriodEnd:
      row.current_period_end,

    cancelAtPeriodEnd:
      row.cancel_at_period_end,

    cancelAt:
      row.cancel_at,
  };
}

function createDefaultSubscription(
  userId: string
): SubscriptionRecord {
  return {
    userId,
    plan: DEFAULT_BILLING_PLAN,
    status:
      DEFAULT_SUBSCRIPTION_STATUS,

    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,

    currentPeriodStart: null,
    currentPeriodEnd: null,

    cancelAtPeriodEnd: false,
    cancelAt: null,
  };
}

export async function getSubscriptionForUserId(
  userId: string
): Promise<{
  data: SubscriptionRecord | null;
  error: unknown;
}> {
  const {
    data,
    error,
  } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data:
        createDefaultSubscription(
          userId
        ),
      error: null,
    };
  }

  return {
    data: mapSubscriptionRow(
      data as SubscriptionRow
    ),
    error: null,
  };
}

export async function getCurrentSubscription() {
  const userId =
    await getCurrentUserId();

  return await getSubscriptionForUserId(
    userId
  );
}

export async function getCurrentBillingPlan() {
  const {
    data: subscription,
    error,
  } = await getCurrentSubscription();

  if (
    error ||
    !subscription
  ) {
    return {
      data: null,
      error,
    };
  }

  return {
    data: getBillingPlan(
      subscription.plan
    ),
    error: null,
  };
}

export async function evaluateCurrentEntitlement({
  capability,
  used,
}: {
  capability: BillableCapability;
  used: number;
}): Promise<{
  data: EntitlementDecision | null;
  error: unknown;
}> {
  const {
    data: subscription,
    error,
  } = await getCurrentSubscription();

  if (
    error ||
    !subscription
  ) {
    return {
      data: null,
      error,
    };
  }

  return {
    data: evaluateEntitlement({
      plan: subscription.plan,
      capability,
      used,
    }),
    error: null,
  };
}