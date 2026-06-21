// Persistence helpers for council sessions. All reads/writes funnel through
// here so the table shape lives in one place.
//
// Writes use the admin (service-role) client and explicitly stamp a verified
// user_id. Reads accept a user-session client so RLS scopes them per user.

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase, COUNCIL_TABLE } from "./supabase";
import type {
  ChairmanVerdict,
  CouncilSession,
  CouncilType,
  SeatResponse,
} from "./types";

export interface NewCouncilSession {
  question: string;
  councilType: CouncilType;
  seatResponses: SeatResponse[];
  verdict: ChairmanVerdict;
  userId: string | null;
}

/** Inserts a completed council session and returns the stored row. */
export async function insertCouncilSession(
  input: NewCouncilSession
): Promise<CouncilSession> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from(COUNCIL_TABLE)
    .insert({
      user_id: input.userId,
      question: input.question,
      council_type: input.councilType,
      model_responses: input.seatResponses,
      chairman_response: input.verdict,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save council session: ${error.message}`);
  }
  return data as CouncilSession;
}

/** Fetches a single session by id, scoped to the caller via RLS. */
export async function getCouncilSession(
  client: SupabaseClient,
  id: string
): Promise<CouncilSession | null> {
  const { data, error } = await client
    .from(COUNCIL_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load council session: ${error.message}`);
  }
  return (data as CouncilSession) ?? null;
}

/** Lists the caller's recent sessions (RLS-scoped). */
export async function listCouncilSessions(
  client: SupabaseClient,
  limit = 50
): Promise<CouncilSession[]> {
  const { data, error } = await client
    .from(COUNCIL_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list council sessions: ${error.message}`);
  }
  return (data as CouncilSession[]) ?? [];
}

/** Deletes one of the caller's sessions (RLS enforces ownership). */
export async function deleteCouncilSession(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client.from(COUNCIL_TABLE).delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete council session: ${error.message}`);
  }
}

// ---- Subscription helpers ---------------------------------------------------

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  councils_used_this_month: number;
  current_period_end: string | null;
  created_at: string;
}

/** Fetches a user's subscription row (admin client, bypasses RLS). */
export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Failed to get subscription: ${error.message}`);
  return (data as Subscription) ?? null;
}

/** Upserts a subscription row from a Stripe webhook event. */
export async function upsertSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
}): Promise<void> {
  const supabase = getAdminSupabase();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      plan: params.plan,
      status: params.status,
      current_period_end: params.currentPeriodEnd?.toISOString() ?? null,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(`Failed to upsert subscription: ${error.message}`);
}

/** Marks a subscription as cancelled by Stripe subscription ID. */
export async function cancelSubscription(
  stripeSubscriptionId: string
): Promise<void> {
  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error)
    throw new Error(`Failed to cancel subscription: ${error.message}`);
}

/** Calls the increment_council_usage DB function. */
export async function incrementCouncilUsage(userId: string): Promise<void> {
  const supabase = getAdminSupabase();
  const { error } = await supabase.rpc("increment_council_usage", {
    p_user_id: userId,
  });
  if (error) throw new Error(`Failed to increment usage: ${error.message}`);
}

/** Returns the monthly council limit for a plan. -1 means unlimited. */
export function getPlanLimit(plan: string): number {
  switch (plan) {
    case "starter":
      return 5;
    case "growth":
      return 25;
    case "pro":
      return -1;
    default:
      return 1;
  }
}

/** Human-readable plan display name. */
export function getPlanLabel(plan: string): string {
  switch (plan) {
    case "starter":
      return "Starter";
    case "growth":
      return "Growth";
    case "pro":
      return "Pro";
    default:
      return "Free";
  }
}
