import { NextResponse } from "next/server";

import { stripe } from "../../../../lib/stripe";
import { createClient } from "../../../../lib/supabase/server";

export async function POST() {
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      {
        error: "STRIPE_PRO_PRICE_ID is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be signed in to start checkout.",
        },
        { status: 401 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      metadata: {
        appstack_user_id: user.id,
      },

      subscription_data: {
        metadata: {
          appstack_user_id: user.id,
        },
      },

      customer_email: user.email ?? undefined,

      success_url:
        "http://localhost:3000/billing?checkout=success",

      cancel_url:
        "http://localhost:3000/billing?checkout=cancelled",
    });

    if (!session.url) {
      return NextResponse.json(
        {
          error: "Stripe did not return a checkout URL.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Stripe checkout session creation failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Checkout session could not be created.",
      },
      { status: 500 }
    );
  }
}