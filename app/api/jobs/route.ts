import { NextResponse } from "next/server";

import { evaluateEntitlement } from "../../../lib/billingDomain";
import { createClient } from "../../../lib/supabase/server";

type CreateJobRequest = {
  title?: string;
  source?: string;
  reportId?: string;
  reportTitle?: string;
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

    // 1. Authenticate the user at the trusted server boundary.
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

    // 2. Validate the incoming job request.
    const body = (await request.json()) as CreateJobRequest;

    const title = body.title?.trim();
    const source = body.source?.trim();

    if (!title) {
      return NextResponse.json(
        { error: "A job title is required." },
        { status: 400 }
      );
    }

    if (!source) {
      return NextResponse.json(
        { error: "A job source is required." },
        { status: 400 }
      );
    }

    // 3. Load the user's current subscription.
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
        "Job creation subscription lookup failed:",
        subscriptionError
      );

      return NextResponse.json(
        { error: "Billing status could not be verified." },
        { status: 500 }
      );
    }

    /*
     * A missing subscription row is treated as Free.
     * This matches AppStack's existing billing-domain default.
     */
    const plan =
      subscription?.plan === "pro" ? "pro" : "free";

    const defaultPeriod = getDefaultMonthlyPeriod();

    const periodStart =
      subscription?.current_period_start ??
      defaultPeriod.periodStart;

    const periodEnd =
      subscription?.current_period_end ??
      defaultPeriod.periodEnd;

    // 4. Count this user's jobs in the current billing period.
    const {
      count: jobsUsed,
      error: usageError,
    } = await supabase
      .from("workspace_items")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("type", "job")
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd);

    if (usageError) {
      console.error(
        "Job creation usage lookup failed:",
        usageError
      );

      return NextResponse.json(
        { error: "Current billing usage could not be verified." },
        { status: 500 }
      );
    }

    // 5. Apply the SAME deterministic billing rule used elsewhere.
    const entitlement = evaluateEntitlement({
      plan,
      capability: "job",
      used: jobsUsed ?? 0,
    });

    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error:
            entitlement.reason ??
            "Your current plan does not allow another job this billing period.",
          entitlement,
        },
        { status: 403 }
      );
    }

    // 6. Build server-controlled job metadata.
    const metadata: Record<string, string> = {
      source,
    };

    if (body.reportId) {
      metadata.reportId = body.reportId;
    }

    if (body.reportTitle) {
      metadata.reportTitle = body.reportTitle;
    }

    // 7. Only after authentication + entitlement approval do we write.
    const {
      data: job,
      error: createError,
    } = await supabase
      .from("workspace_items")
      .insert({
        type: "job",
        title,
        status: "Queued",
        metadata,
        user_id: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error(
        "Server-side job creation failed:",
        createError
      );

      return NextResponse.json(
        { error: "Job could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        job,
        entitlement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Unexpected job creation failure:",
      error
    );

    return NextResponse.json(
      { error: "Job creation failed." },
      { status: 500 }
    );
  }
}