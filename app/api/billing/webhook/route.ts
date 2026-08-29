import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "../../../../lib/stripe";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET;

type SubscriptionItemWithPeriod =
  Stripe.SubscriptionItem & {
    current_period_start?: number;
    current_period_end?: number;
  };

function timestampToISOString(
  timestamp?: number | null
) {
  return typeof timestamp === "number"
    ? new Date(
        timestamp * 1000
      ).toISOString()
    : null;
}

function getSubscriptionPeriod(
  subscription: Stripe.Subscription
) {
  const item =
    subscription.items.data[0] as
      | SubscriptionItemWithPeriod
      | undefined;

  return {
    currentPeriodStart:
      timestampToISOString(
        item?.current_period_start
      ),

    currentPeriodEnd:
      timestampToISOString(
        item?.current_period_end
      ),
  };
}

function getSubscriptionPriceId(
  subscription: Stripe.Subscription
) {
  return subscription.items.data[0]?.price?.id ?? null;
}

function getSubscriptionCustomerId(
  subscription: Stripe.Subscription
) {
  return typeof subscription.customer ===
    "string"
    ? subscription.customer
    : subscription.customer.id;
}

function getSubscriptionState(
  subscription: Stripe.Subscription
) {
  const active =
    subscription.status === "active" ||
    subscription.status === "trialing";

  const cancellationScheduled =
    Boolean(
      subscription.cancel_at_period_end ||
        subscription.cancel_at !== null
    );

  const {
    currentPeriodStart,
    currentPeriodEnd,
  } = getSubscriptionPeriod(
    subscription
  );

  return {
    plan: active ? "pro" : "free",

    status: active
      ? "active"
      : subscription.status === "past_due"
        ? "past_due"
        : "canceled",

    stripe_customer_id:
      getSubscriptionCustomerId(
        subscription
      ),

    stripe_subscription_id:
      subscription.id,

    stripe_price_id:
      getSubscriptionPriceId(
        subscription
      ),

    cancel_at_period_end:
      cancellationScheduled,

    current_period_start:
      currentPeriodStart,

    current_period_end:
      currentPeriodEnd,
  };
}

async function syncSubscription(
  subscription: Stripe.Subscription
) {
  const userId =
    subscription.metadata
      ?.appstack_user_id;

  if (!userId) {
    console.error(
      "Subscription is missing appstack_user_id metadata."
    );

    return;
  }

  const {
    error,
  } = await supabaseAdmin
    .from("subscriptions")
    .update(
      getSubscriptionState(
        subscription
      )
    )
    .eq(
      "user_id",
      userId
    );

  if (error) {
    throw error;
  }
}

export async function POST(
  request: NextRequest
) {
  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "STRIPE_WEBHOOK_SECRET is not configured.",
      },
      {
        status: 500,
      }
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe signature.",
      },
      {
        status: 400,
      }
    );
  }

  const body =
    await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid webhook signature.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        const userId =
          session.metadata
            ?.appstack_user_id;

        const customerId =
          typeof session.customer ===
          "string"
            ? session.customer
            : session.customer?.id;

        const subscriptionId =
          typeof session.subscription ===
          "string"
            ? session.subscription
            : session.subscription?.id;

        if (!userId) {
          console.error(
            "Checkout session is missing appstack_user_id metadata."
          );

          break;
        }

        const {
          error,
        } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan: "pro",
            status: "active",

            stripe_customer_id:
              customerId ?? null,

            stripe_subscription_id:
              subscriptionId ?? null,
          })
          .eq(
            "user_id",
            userId
          );

        if (error) {
          throw error;
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription =
          event.data
            .object as Stripe.Subscription;

        await syncSubscription(
          subscription
        );

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook processing failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}
