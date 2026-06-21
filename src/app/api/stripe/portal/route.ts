import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/db";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Auth not configured." },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const subscription = await getSubscription(user.id);
  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found for this account." },
      { status: 404 }
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${siteUrl}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
