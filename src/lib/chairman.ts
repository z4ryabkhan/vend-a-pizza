// The Chairman model. It receives all four seat responses and synthesizes a
// single structured verdict. We ask for strict JSON and defensively parse it.

import { chatCompletion } from "./openrouter";
import { CHAIRMAN_MODEL } from "./council";
import type {
  ChairmanVerdict,
  FinalDecision,
  SeatResponse,
} from "./types";

const CHAIRMAN_SYSTEM = `You are the Chairman of a founder advisory council.
Four advisors — a Strategist, a Risk Analyst, a Researcher, and a Technical
Builder — have each given their independent view on the founder's question.

Your job is to synthesize their input into ONE decisive verdict. Weigh the
perspectives, resolve disagreements, and be honest. Do not simply average the
opinions; make a real judgment call.

Respond with a single JSON object and nothing else, using exactly this shape:
{
  "executiveSummary": string,        // 2-4 sentence overview
  "bestRecommendation": string,      // the single clearest recommended path
  "keyRisks": string[],              // 3-6 most important risks
  "financialConsiderations": string[], // 3-6 financial points (costs, runway, unit economics, funding)
  "actionPlan": string[],            // 4-8 concrete, ordered next steps
  "confidenceScore": number,         // integer 0-100, your confidence in the recommendation
  "finalDecision": "Proceed" | "Pause" | "Reject"
}

Rules:
- "confidenceScore" must be an integer between 0 and 100.
- "finalDecision" must be exactly one of "Proceed", "Pause", or "Reject".
- Arrays must contain plain strings, no nested objects.
- Output valid JSON only. No markdown, no code fences, no commentary.`;

function buildChairmanUser(
  question: string,
  councilTypeLabel: string,
  responses: SeatResponse[]
): string {
  const advisorBlocks = responses
    .map((r) => {
      const body = r.error
        ? `(This advisor was unavailable: ${r.error})`
        : r.content;
      return `### ${r.role} (model: ${r.model})\n${body}`;
    })
    .join("\n\n");

  return (
    `Council session type: ${councilTypeLabel}\n\n` +
    `Founder's question:\n"""${question}"""\n\n` +
    `Advisor responses:\n\n${advisorBlocks}\n\n` +
    `Now produce your Chairman verdict as JSON.`
  );
}

const VALID_DECISIONS: FinalDecision[] = ["Proceed", "Pause", "Reject"];

/** Pulls the first balanced JSON object out of a string. Exported for tests. */
export function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in Chairman response.");
  }
  return candidate.slice(start, end + 1);
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v) => v !== null && v !== undefined)
      .map((v) => (typeof v === "string" ? v : String(v)))
      .filter((v) => v.trim().length > 0);
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export function normalizeVerdict(
  raw: Record<string, unknown>
): ChairmanVerdict {
  let score = Number(raw.confidenceScore);
  if (!Number.isFinite(score)) score = 50;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const decisionRaw = String(raw.finalDecision ?? "").trim();
  const decision =
    VALID_DECISIONS.find(
      (d) => d.toLowerCase() === decisionRaw.toLowerCase()
    ) ?? "Pause";

  return {
    executiveSummary:
      typeof raw.executiveSummary === "string"
        ? raw.executiveSummary
        : "No summary was produced.",
    bestRecommendation:
      typeof raw.bestRecommendation === "string"
        ? raw.bestRecommendation
        : "No recommendation was produced.",
    keyRisks: asStringArray(raw.keyRisks),
    financialConsiderations: asStringArray(raw.financialConsiderations),
    actionPlan: asStringArray(raw.actionPlan),
    confidenceScore: score,
    finalDecision: decision,
  };
}

/**
 * Parses raw Chairman model output into a structured, validated verdict.
 * Pure and side-effect free so it can be unit tested directly.
 */
export function parseChairmanVerdict(content: string): ChairmanVerdict {
  const parsed = JSON.parse(extractJson(content)) as Record<string, unknown>;
  return normalizeVerdict(parsed);
}

/** Runs the Chairman synthesis step and returns a structured verdict. */
export async function runChairman(
  question: string,
  councilTypeLabel: string,
  responses: SeatResponse[],
  signal?: AbortSignal
): Promise<ChairmanVerdict> {
  const content = await chatCompletion({
    model: CHAIRMAN_MODEL,
    temperature: 0.4,
    maxTokens: 1800,
    responseFormatJson: true,
    signal,
    messages: [
      { role: "system", content: CHAIRMAN_SYSTEM },
      {
        role: "user",
        content: buildChairmanUser(question, councilTypeLabel, responses),
      },
    ],
  });

  return parseChairmanVerdict(content);
}
