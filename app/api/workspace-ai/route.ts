import { NextResponse } from "next/server";

import { evaluateEntitlement } from "../../../lib/billingDomain";
import { generateWorkspaceAIResponse } from "../../../lib/openai";
import { createClient } from "../../../lib/supabase/server";
import {
  buildWorkspaceAIContext,
  type BuildWorkspaceAIContextInput,
} from "../../../lib/workspaceAIContextBuilder";
import { buildWorkspacePrompt } from "../../../lib/workspacePromptBuilder";

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
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    // 2. Enforce the user's AI Assistance preference at the trusted server boundary.
    const {
      data: userSettings,
      error: settingsError,
    } = await supabase
      .from("user_settings")
      .select("ai_assistance_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      console.error(
        "Workspace AI settings lookup failed:",
        settingsError
      );

      return NextResponse.json(
        {
          error: "AI Assistance preference could not be verified.",
        },
        {
          status: 500,
        }
      );
    }

    if (userSettings?.ai_assistance_enabled === false) {
      return NextResponse.json(
        {
          error:
            "AI Assistance is turned off in Settings. Turn it on to use Workspace AI.",
        },
        {
          status: 403,
        }
      );
    }

    // 3. Validate the AI request.
    const body =
      (await request.json()) as BuildWorkspaceAIContextInput;

    if (
      typeof body.question !== "string" ||
      body.question.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "A workspace question is required.",
        },
        {
          status: 400,
        }
      );
    }

    // 4. Load the user's subscription.
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
        "Workspace AI subscription lookup failed:",
        subscriptionError
      );

      return NextResponse.json(
        {
          error: "Billing status could not be verified.",
        },
        {
          status: 500,
        }
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

    // 5. Count AI requests already used this billing period.
    const {
      count: aiRequestsUsed,
      error: usageError,
    } = await supabase
      .from("ai_usage")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd);

    if (usageError) {
      console.error(
        "Workspace AI usage lookup failed:",
        usageError
      );

      return NextResponse.json(
        {
          error:
            "Current AI billing usage could not be verified.",
        },
        {
          status: 500,
        }
      );
    }

    // 6. Apply the shared deterministic entitlement rule.
    const entitlement =
      evaluateEntitlement({
        plan,
        capability: "ai_request",
        used: aiRequestsUsed ?? 0,
      });

    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error:
            entitlement.reason ??
            "Your current plan does not allow another AI request this billing period.",
          entitlement,
        },
        {
          status: 403,
        }
      );
    }

    // 7. Build trusted AI context and prompt.
    const context =
      buildWorkspaceAIContext({
        ...body,
        question: body.question.trim(),
      });

    const prompt =
      buildWorkspacePrompt(context);

    // 8. Only after authentication + preference + entitlement approval do we call OpenAI.
    const answer =
      await generateWorkspaceAIResponse(
        prompt
      );

    // 9. Record one successful AI usage unit.
    const {
      error: usageInsertError,
    } = await supabase
      .from("ai_usage")
      .insert({
        user_id: user.id,
        request_type: "workspace_ai",
      });

    if (usageInsertError) {
      console.error(
        "Workspace AI usage recording failed:",
        usageInsertError
      );

      return NextResponse.json(
        {
          error:
            "The AI response was generated, but usage tracking failed.",
        },
        {
          status: 500,
        }
      );
    }

    // 10. Return the AI response only after successful usage recording.
    return NextResponse.json({
      answer,
      entitlement: {
        ...entitlement,
        used: entitlement.used + 1,
        remaining: Math.max(
          0,
          entitlement.remaining - 1
        ),
      },
    });
  } catch (error) {
    console.error(
      "Workspace AI request failed:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "The workspace AI request failed.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}