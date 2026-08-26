import { NextResponse } from "next/server";

import { evaluateEntitlement } from "../../../lib/billingDomain";
import { createClient } from "../../../lib/supabase/server";

type CreateReportRequest = {
  title?: string;
  address?: string | null;
  status?: string;
  content?: string | null;
  analysisId?: string;
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

    // 2. Validate the incoming report.
    const body = (await request.json()) as CreateReportRequest;

    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json(
        { error: "A report title is required." },
        { status: 400 }
      );
    }

    // 3. Load subscription information.
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
        "Report creation subscription lookup failed:",
        subscriptionError
      );

      return NextResponse.json(
        { error: "Billing status could not be verified." },
        { status: 500 }
      );
    }

    const plan =
      subscription?.plan === "pro" ? "pro" : "free";

    const defaultPeriod = getDefaultMonthlyPeriod();

    const periodStart =
      subscription?.current_period_start ??
      defaultPeriod.periodStart;

    const periodEnd =
      subscription?.current_period_end ??
      defaultPeriod.periodEnd;

    // 4. Count reports already created this billing period.
    const {
      count: reportsUsed,
      error: usageError,
    } = await supabase
      .from("workspace_items")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("type", "report")
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd);

    if (usageError) {
      console.error(
        "Report creation usage lookup failed:",
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
    const entitlement = evaluateEntitlement({
      plan,
      capability: "report",
      used: reportsUsed ?? 0,
    });

    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error:
            entitlement.reason ??
            "Your current plan does not allow another report this billing period.",
          entitlement,
        },
        { status: 403 }
      );
    }

    // 6. Only after entitlement approval do we create the report.
    const {
      data: report,
      error: createError,
    } = await supabase
      .from("workspace_items")
      .insert({
        type: "report",
        title,
        address: body.address ?? null,
        status: body.status ?? "Saved",
        content: body.content ?? null,
        metadata: body.analysisId
          ? {
              analysis_id: body.analysisId,
            }
          : null,
        user_id: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error(
        "Server-side report creation failed:",
        createError
      );

      return NextResponse.json(
        { error: "Report could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        report,
        entitlement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Unexpected report creation failure:",
      error
    );

    return NextResponse.json(
      { error: "Report creation failed." },
      { status: 500 }
    );
  }
}