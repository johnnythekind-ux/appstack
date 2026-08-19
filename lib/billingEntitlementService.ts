import {
  evaluateEntitlement,
  type BillableCapability,
  type EntitlementDecision,
} from "./billingDomain";

import {
  getCurrentSubscription,
} from "./billingService";

import {
  getCurrentBillingUsage,
  type BillingUsage,
} from "./billingUsageService";

export type BillingAction =
  | "create_analysis"
  | "create_report"
  | "create_job"
  | "use_ai";

export type BillingActionDecision = {
  action: BillingAction;
  allowed: boolean;
  entitlement: EntitlementDecision | null;
  reason?: string;
};

function getCapabilityForAction(
  action: BillingAction
): BillableCapability {
  switch (action) {
    case "create_analysis":
      return "analysis";

    case "create_report":
      return "report";

    case "create_job":
      return "job";

    case "use_ai":
      return "ai_request";
  }
}

function getUsageForCapability(
  capability: BillableCapability,
  usage: BillingUsage
): number | null {
  switch (capability) {
    case "analysis":
      return usage.analyses;

    case "report":
      return usage.reports;

    case "job":
      return usage.jobs;

    case "ai_request":
      return null;
  }
}

function getActionLabel(
  action: BillingAction
): string {
  switch (action) {
    case "create_analysis":
      return "create another analysis";

    case "create_report":
  return "save another report";

    case "create_job":
      return "create another job";

    case "use_ai":
      return "use this AI capability";
  }
}

export async function canPerformBillingAction(
  action: BillingAction
): Promise<{
  data: BillingActionDecision | null;
  error: unknown;
}> {
  try {
    const [
      subscriptionResult,
      usageResult,
    ] = await Promise.all([
      getCurrentSubscription(),
      getCurrentBillingUsage(),
    ]);

    if (
      subscriptionResult.error ||
      !subscriptionResult.data
    ) {
      return {
        data: null,
        error:
          subscriptionResult.error ??
          new Error(
            "Subscription data is unavailable."
          ),
      };
    }

    if (
      usageResult.error ||
      !usageResult.data
    ) {
      return {
        data: null,
        error:
          usageResult.error ??
          new Error(
            "Billing usage data is unavailable."
          ),
      };
    }

    const subscription =
      subscriptionResult.data;

    const usage =
      usageResult.data;

    const capability =
      getCapabilityForAction(action);

    const used =
      getUsageForCapability(
        capability,
        usage
      );

    if (used === null) {
      return {
        data: {
          action,
          allowed: true,
          entitlement: null,
          reason:
            "AI usage metering is not connected yet, so this capability is not currently enforced.",
        },
        error: null,
      };
    }

    const entitlement =
      evaluateEntitlement({
        plan: subscription.plan,
        capability,
        used,
      });

    if (entitlement.allowed) {
      return {
        data: {
          action,
          allowed: true,
          entitlement,
        },
        error: null,
      };
    }

    return {
      data: {
        action,
        allowed: false,
        entitlement,
        reason: `You have reached the ${subscription.plan} plan limit and cannot ${getActionLabel(
          action
        )} this billing period.`,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      "Billing entitlement decision failed:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}

export async function getCurrentBillingDecisions(): Promise<{
  data:
    | Record<
        BillingAction,
        BillingActionDecision
      >
    | null;
  error: unknown;
}> {
  try {
    const actions: BillingAction[] = [
      "create_analysis",
      "create_report",
      "create_job",
      "use_ai",
    ];

    const results = await Promise.all(
      actions.map((action) =>
        canPerformBillingAction(action)
      )
    );

    const firstError =
      results.find(
        (result) => result.error
      )?.error ?? null;

    if (firstError) {
      return {
        data: null,
        error: firstError,
      };
    }

    const decisions =
      results.reduce(
        (accumulator, result) => {
          if (result.data) {
            accumulator[
              result.data.action
            ] = result.data;
          }

          return accumulator;
        },
        {} as Record<
          BillingAction,
          BillingActionDecision
        >
      );

    return {
      data: decisions,
      error: null,
    };
  } catch (error) {
    console.error(
      "Billing decision load failed:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}
