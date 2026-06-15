// Orchestrates a full council run:
//   1. Ask all four seats in parallel.
//   2. Feed their answers to the Chairman.
// Seat failures are captured per-seat so one bad model doesn't sink the run.
//
// An optional onSeat callback fires as each advisor resolves, enabling the
// streaming API to push results to the client incrementally.

import { chatCompletion } from "./openrouter";
import {
  COUNCIL_SEATS,
  buildSeatPrompt,
  councilTypeLabel,
  type SeatConfig,
} from "./council";
import { runChairman } from "./chairman";
import type {
  ChairmanVerdict,
  CouncilType,
  SeatResponse,
} from "./types";

export interface CouncilOutcome {
  seatResponses: SeatResponse[];
  verdict: ChairmanVerdict;
}

/** Runs a single council seat, never throwing — failures become SeatResponse.error. */
export async function runSeat(
  seat: SeatConfig,
  userPrompt: string,
  signal?: AbortSignal
): Promise<SeatResponse> {
  try {
    const content = await chatCompletion({
      model: seat.model,
      temperature: 0.7,
      maxTokens: 1200,
      signal,
      messages: [
        { role: "system", content: seat.system },
        { role: "user", content: userPrompt },
      ],
    });
    return { seat: seat.id, role: seat.role, model: seat.model, content };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      seat: seat.id,
      role: seat.role,
      model: seat.model,
      content: "",
      error: message,
    };
  }
}

/**
 * Runs every council seat concurrently. `onSeat` (if provided) fires the
 * moment each advisor resolves, in completion order.
 */
export async function runSeats(
  question: string,
  typeLabel: string,
  opts: { signal?: AbortSignal; onSeat?: (r: SeatResponse) => void } = {}
): Promise<SeatResponse[]> {
  const userPrompt = buildSeatPrompt(question, typeLabel);

  return Promise.all(
    COUNCIL_SEATS.map(async (seat) => {
      const result = await runSeat(seat, userPrompt, opts.signal);
      opts.onSeat?.(result);
      return result;
    })
  );
}

/** True unless literally every advisor failed. */
export function hasUsableResponses(responses: SeatResponse[]): boolean {
  return responses.some((r) => !r.error);
}

/** Full pipeline: four advisors, then the Chairman synthesis (non-streaming). */
export async function runCouncil(
  question: string,
  councilType: CouncilType,
  signal?: AbortSignal
): Promise<CouncilOutcome> {
  const typeLabel = councilTypeLabel(councilType);
  const seatResponses = await runSeats(question, typeLabel, { signal });

  if (!hasUsableResponses(seatResponses)) {
    throw new Error(
      "All council advisors failed. Check your OPENROUTER_API_KEY and model " +
        "access. First error: " + (seatResponses[0]?.error ?? "unknown")
    );
  }

  const verdict = await runChairman(question, typeLabel, seatResponses, signal);
  return { seatResponses, verdict };
}
