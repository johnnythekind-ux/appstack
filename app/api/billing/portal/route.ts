import { NextResponse } from "next/server";

import { stripe } from "../../../../lib/stripe";
import { createClient } from "../../../../lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be signed in to manage billing.",
        },
        { status: 401 }
      );
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: "No Stripe customer is connected to this account.",
        },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: "http://localhost:3000/billing",
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Stripe billing portal session creation failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Billing portal could not be opened.",
      },
      { status: 500 }
    );
  }
}