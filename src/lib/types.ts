// Shared domain types for FounderCouncil AI.

export type CouncilType =
  | "startup"
  | "growth"
  | "fundraising"
  | "product"
  | "general";

export interface CouncilTypeOption {
  value: CouncilType;
  label: string;
  description: string;
}

/** A single council seat (one AI model playing a defined role). */
export type SeatId = "strategist" | "risk" | "researcher" | "builder";

export interface SeatResponse {
  seat: SeatId;
  role: string;
  model: string;
  content: string;
  /** Present when the model call failed. */
  error?: string;
}

export type FinalDecision = "Proceed" | "Pause" | "Reject";

/** Structured verdict produced by the Chairman model. */
export interface ChairmanVerdict {
  executiveSummary: string;
  bestRecommendation: string;
  keyRisks: string[];
  financialConsiderations: string[];
  actionPlan: string[];
  confidenceScore: number; // 0 - 100
  finalDecision: FinalDecision;
}

/** Row shape stored in / read from Supabase. */
export interface CouncilSession {
  id: string;
  question: string;
  council_type: CouncilType;
  model_responses: SeatResponse[];
  chairman_response: ChairmanVerdict;
  created_at: string;
}

/** Payload returned by POST /api/council. */
export interface CouncilRunResult {
  id: string;
  question: string;
  councilType: CouncilType;
  seatResponses: SeatResponse[];
  verdict: ChairmanVerdict;
  createdAt: string;
}

/**
 * Newline-delimited JSON events streamed from POST /api/council. The client
 * renders advisors as they land, then the verdict, then the saved id.
 */
export type CouncilStreamEvent =
  | { type: "status"; stage: "advisors" | "chairman" }
  | { type: "seat"; data: SeatResponse }
  | { type: "verdict"; data: ChairmanVerdict }
  | { type: "saved"; id: string; createdAt: string; persisted: boolean }
  | { type: "error"; error: string };
