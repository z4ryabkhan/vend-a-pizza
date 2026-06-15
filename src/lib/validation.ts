// Pure request validation for the council endpoint. Kept side-effect free so
// it can be unit tested without spinning up a request.

import { COUNCIL_TYPES } from "./council";
import type { CouncilType } from "./types";

const VALID_TYPES = new Set<string>(COUNCIL_TYPES.map((t) => t.value));

export const MAX_QUESTION_LENGTH = 4000;

export type CouncilInputResult =
  | { ok: true; question: string; councilType: CouncilType }
  | { ok: false; error: string };

/** Validates and normalizes a council request body. */
export function validateCouncilInput(body: unknown): CouncilInputResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "A request body is required." };
  }

  const { question, councilType } = body as {
    question?: unknown;
    councilType?: unknown;
  };

  const trimmed = typeof question === "string" ? question.trim() : "";
  if (!trimmed) {
    return { ok: false, error: "A business question is required." };
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    return {
      ok: false,
      error: `Question is too long (max ${MAX_QUESTION_LENGTH} characters).`,
    };
  }
  if (typeof councilType !== "string" || !VALID_TYPES.has(councilType)) {
    return { ok: false, error: "A valid council type is required." };
  }

  return { ok: true, question: trimmed, councilType: councilType as CouncilType };
}
