export type BillingPlan = "free" | "pro";

export type SubscriptionStatus =
  | "free"
  | "active"
  | "past_due"
  | "canceled";

export type BillableCapability =
  | "analysis"
  | "report"
  | "job"
  | "ai_request";

export type PlanEntitlements = {
  analysisLimit: number;
  reportLimit: number;
  jobLimit: number;
  aiRequestLimit: number;
  pdfExportEnabled: boolean;
};

export type BillingPlanDefinition = {
  id: BillingPlan;
  name: string;
  description: string;
  monthlyPriceCents: number;
  entitlements: PlanEntitlements;
};

export type SubscriptionRecord = {
  userId: string;
  plan: BillingPlan;
  status: SubscriptionStatus;

  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;

  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;

  cancelAtPeriodEnd: boolean;
};

export type EntitlementDecision = {
  allowed: boolean;
  capability: BillableCapability;
  plan: BillingPlan;
  used: number;
  limit: number;
  remaining: number;
  reason?: string;
};

export const PLAN_ENTITLEMENTS: Record<
  BillingPlan,
  PlanEntitlements
> = {
  free: {
    analysisLimit: 5,
    reportLimit: 3,
    jobLimit: 10,
    aiRequestLimit: 25,
    pdfExportEnabled: true,
  },

  pro: {
    analysisLimit: 100,
    reportLimit: 100,
    jobLimit: 500,
    aiRequestLimit: 250,
    pdfExportEnabled: true,
  },
};

export const BILLING_PLANS: Record<
  BillingPlan,
  BillingPlanDefinition
> = {
  free: {
    id: "free",
    name: "Free",
    description:
      "Explore AppStack with a practical monthly usage allowance.",
    monthlyPriceCents: 0,
    entitlements: PLAN_ENTITLEMENTS.free,
  },

  pro: {
    id: "pro",
    name: "Pro",
    description:
      "Higher limits for active deal analysis, reporting, execution, and platform intelligence.",
    monthlyPriceCents: 2900,
    entitlements: PLAN_ENTITLEMENTS.pro,
  },
};

export const DEFAULT_BILLING_PLAN: BillingPlan = "free";

export const DEFAULT_SUBSCRIPTION_STATUS: SubscriptionStatus =
  "free";

export function getBillingPlan(
  plan: BillingPlan
): BillingPlanDefinition {
  return BILLING_PLANS[plan];
}

export function getPlanEntitlements(
  plan: BillingPlan
): PlanEntitlements {
  return PLAN_ENTITLEMENTS[plan];
}

export function getCapabilityLimit(
  plan: BillingPlan,
  capability: BillableCapability
): number {
  const entitlements = getPlanEntitlements(plan);

  switch (capability) {
    case "analysis":
      return entitlements.analysisLimit;

    case "report":
      return entitlements.reportLimit;

    case "job":
      return entitlements.jobLimit;

    case "ai_request":
      return entitlements.aiRequestLimit;
  }
}

export function evaluateEntitlement({
  plan,
  capability,
  used,
}: {
  plan: BillingPlan;
  capability: BillableCapability;
  used: number;
}): EntitlementDecision {
  const limit = getCapabilityLimit(
    plan,
    capability
  );

  const normalizedUsed = Math.max(0, used);

  const remaining = Math.max(
    0,
    limit - normalizedUsed
  );

  const allowed = normalizedUsed < limit;

  return {
    allowed,
    capability,
    plan,
    used: normalizedUsed,
    limit,
    remaining,
    reason: allowed
      ? undefined
      : getLimitReachedMessage(
          capability,
          limit
        ),
  };
}

export function getLimitReachedMessage(
  capability: BillableCapability,
  limit: number
): string {
  switch (capability) {
    case "analysis":
      return `Monthly analysis limit of ${limit} reached.`;

    case "report":
      return `Monthly report limit of ${limit} reached.`;

    case "job":
      return `Monthly job limit of ${limit} reached.`;

    case "ai_request":
      return `Monthly AI request limit of ${limit} reached.`;
  }
}

export function formatPlanPrice(
  plan: BillingPlan
): string {
  const price =
    BILLING_PLANS[plan].monthlyPriceCents;

  if (price === 0) {
    return "Free";
  }

  return `$${(price / 100).toFixed(0)}/month`;
}