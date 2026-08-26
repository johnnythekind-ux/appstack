import { NextResponse } from "next/server";

import { evaluateEntitlement } from "../../../lib/billingDomain";
import { createClient } from "../../../lib/supabase/server";

type CreateAnalysisRequest = {
  name?: string;
  address?: string;
  purchasePrice?: number;
  arv?: number;
  repairCost?: number;
  maxOffer?: number;
  recommendation?: string;
};

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate at the trusted server boundary.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Validate incoming analysis data.
    const body =
      (await request.json()) as CreateAnalysisRequest;

    const name =
      body.name?.trim() || "Untitled Analysis";

    const address =
      body.address?.trim() || "No address entered";

    if (
      typeof body.purchasePrice !== "number" ||
      typeof body.arv !== "number" ||
      typeof body.repairCost !== "number" ||
      typeof body.maxOffer !== "number" ||
      !body.recommendation
    ) {
      return NextResponse.json(
        { error: "Valid analysis data is required." },
        { status: 400 }
      );
    }

    // 3. Load the user's subscription.
    const {
      data: subscription,
      error: subscriptionError,
    } = await supabase
      .from("subscriptions")
      .select(
        "plan, status, current_period_start, current_period_end"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error(
        "Analysis creation subscription lookup failed:",
        subscriptionError
      );

      return NextResponse.json(
        { error: "Billing status could not be verified." },
        { status: 500 }
      );
    }

    const plan =
      subscription?.plan === "pro"
        ? "pro"
        : "free";

    const defaultPeriod =
      getDefaultMonthlyPeriod();

    const periodStart =
      subscription?.current_period_start ??
      defaultPeriod.periodStart;

    const periodEnd =
      subscription?.current_period_end ??
      defaultPeriod.periodEnd;

    // 4. Count analyses already created this billing period.
    const {
      count: analysesUsed,
      error: usageError,
    } = await supabase
      .from("workspace_items")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("type", "analysis")
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd);

    if (usageError) {
      console.error(
        "Analysis creation usage lookup failed:",
        usageError
      );

      return NextResponse.json(
        {
          error:
            "Current billing usage could not be verified.",
        },
        { status: 500 }
      );
    }

    // 5. Apply the shared deterministic entitlement rule.
    const entitlement =
      evaluateEntitlement({
        plan,
        capability: "analysis",
        used: analysesUsed ?? 0,
      });

    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error:
            entitlement.reason ??
            "Your current plan does not allow another analysis this billing period.",
          entitlement,
        },
        { status: 403 }
      );
    }

    // 6. Create the analysis only after entitlement approval.
    const {
      data: analysis,
      error: createError,
    } = await supabase
      .from("workspace_items")
      .insert({
        type: "analysis",
        title: name,
        address,
        status: body.recommendation,
        metadata: {
          purchasePrice: body.purchasePrice,
          arv: body.arv,
          repairCost: body.repairCost,
          maxOffer: body.maxOffer,
        },
        user_id: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error(
        "Server-side analysis creation failed:",
        createError
      );

      return NextResponse.json(
        { error: "Analysis could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        analysis,
        entitlement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Unexpected analysis creation failure:",
      error
    );

    return NextResponse.json(
      { error: "Analysis creation failed." },
      { status: 500 }
    );
  }
}