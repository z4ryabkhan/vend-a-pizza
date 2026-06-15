// Orchestrates a full council run:
//   1. Ask all four seats in parallel.
//   2. Feed their answers to the Chairman.
// Seat failures are captured per-seat so one bad model doesn't sink the run.

import { chatCompletion } from "./openrouter";
import {
  COUNCIL_SEATS,
  buildSeatPrompt,
  councilTypeLabel,
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

/** Runs every council seat concurrently, returning one entry per seat. */
async function runSeats(
  question: string,
  typeLabel: string,
  signal?: AbortSignal
): Promise<SeatResponse[]> {
  const userPrompt = buildSeatPrompt(question, typeLabel);

  return Promise.all(
    COUNCIL_SEATS.map(async (seat): Promise<SeatResponse> => {
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
    })
  );
}

/** Full pipeline: four advisors, then the Chairman synthesis. */
export async function runCouncil(
  question: string,
  councilType: CouncilType,
  signal?: AbortSignal
): Promise<CouncilOutcome> {
  const typeLabel = councilTypeLabel(councilType);
  const seatResponses = await runSeats(question, typeLabel, signal);

  // Bail only if literally every advisor failed — otherwise the Chairman
  // can still reason over whatever came back.
  const anySuccess = seatResponses.some((r) => !r.error);
  if (!anySuccess) {
    throw new Error(
      "All council advisors failed. Check your OPENROUTER_API_KEY and model " +
        "access. First error: " + (seatResponses[0]?.error ?? "unknown")
    );
  }

  const verdict = await runChairman(question, typeLabel, seatResponses, signal);
  return { seatResponses, verdict };
}
