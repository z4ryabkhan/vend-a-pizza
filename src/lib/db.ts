// Persistence helpers for council sessions. All reads/writes funnel through
// here so the table shape lives in one place.

import { getServerSupabase, COUNCIL_TABLE } from "./supabase";
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
}

/** Inserts a completed council session and returns the stored row. */
export async function insertCouncilSession(
  input: NewCouncilSession
): Promise<CouncilSession> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from(COUNCIL_TABLE)
    .insert({
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

/** Fetches a single session by id (server-side, service role). */
export async function getCouncilSession(
  id: string
): Promise<CouncilSession | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from(COUNCIL_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load council session: ${error.message}`);
  }
  return (data as CouncilSession) ?? null;
}

/** Lists recent sessions for the history page. */
export async function listCouncilSessions(
  limit = 50
): Promise<CouncilSession[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from(COUNCIL_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list council sessions: ${error.message}`);
  }
  return (data as CouncilSession[]) ?? [];
}
