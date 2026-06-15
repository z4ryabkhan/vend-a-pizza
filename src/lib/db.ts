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
