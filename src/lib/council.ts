// Council configuration: the seats, their models, and the prompts that
// define each role. Models can be overridden via environment variables so
// the same code works across plan tiers without edits.

import type { CouncilTypeOption, SeatId } from "./types";

export interface SeatConfig {
  id: SeatId;
  role: string;
  /** OpenRouter model slug. */
  model: string;
  /** System prompt establishing the seat's perspective. */
  system: string;
}

const DEFAULT_MODELS = {
  strategist: "openai/gpt-4o",
  risk: "anthropic/claude-3.5-sonnet",
  researcher: "google/gemini-pro-1.5",
  builder: "deepseek/deepseek-chat",
  chairman: "openai/gpt-4o",
} as const;

export const CHAIRMAN_MODEL =
  process.env.COUNCIL_MODEL_CHAIRMAN || DEFAULT_MODELS.chairman;

export const COUNCIL_SEATS: SeatConfig[] = [
  {
    id: "strategist",
    role: "Strategist",
    model: process.env.COUNCIL_MODEL_STRATEGIST || DEFAULT_MODELS.strategist,
    system:
      "You are the Strategist on a founder advisory council. Think like a " +
      "seasoned business strategist and former operator. Focus on market " +
      "positioning, competitive advantage, business model, go-to-market, and " +
      "long-term strategic fit. Be decisive and concrete. Give your honest " +
      "strategic read in 4-8 tight paragraphs or bullet points.",
  },
  {
    id: "risk",
    role: "Risk Analyst",
    model: process.env.COUNCIL_MODEL_RISK || DEFAULT_MODELS.risk,
    system:
      "You are the Risk Analyst on a founder advisory council. Your job is to " +
      "stress-test the idea. Identify legal, financial, operational, market, " +
      "and execution risks, plus failure modes and hidden assumptions. Rank " +
      "risks by severity and likelihood, and suggest mitigations. Be rigorous " +
      "but fair — do not invent risks that don't apply.",
  },
  {
    id: "researcher",
    role: "Researcher",
    model: process.env.COUNCIL_MODEL_RESEARCHER || DEFAULT_MODELS.researcher,
    system:
      "You are the Researcher on a founder advisory council. Provide relevant " +
      "market context, comparable companies, industry benchmarks, customer " +
      "segments, and data points that inform the decision. Be explicit about " +
      "what is well-established versus uncertain, and flag where the founder " +
      "should validate with primary research.",
  },
  {
    id: "builder",
    role: "Technical Builder",
    model: process.env.COUNCIL_MODEL_BUILDER || DEFAULT_MODELS.builder,
    system:
      "You are the Technical Builder on a founder advisory council. Assess " +
      "what it takes to actually build and ship this. Cover technical " +
      "architecture, required stack, build-vs-buy choices, MVP scope, team " +
      "and skill needs, timelines, and technical risks. Be pragmatic and " +
      "implementation-focused.",
  },
];

export const COUNCIL_TYPES: CouncilTypeOption[] = [
  {
    value: "startup",
    label: "Startup Validation",
    description: "Pressure-test a new idea or company before you commit.",
  },
  {
    value: "growth",
    label: "Growth & Scaling",
    description: "Decisions about scaling, expansion, and new channels.",
  },
  {
    value: "fundraising",
    label: "Fundraising",
    description: "Raise strategy, valuation, timing, and investor fit.",
  },
  {
    value: "product",
    label: "Product Strategy",
    description: "Roadmap, positioning, and what to build next.",
  },
  {
    value: "general",
    label: "General Advisory",
    description: "Any other strategic business question.",
  },
];

export function councilTypeLabel(value: string): string {
  return COUNCIL_TYPES.find((t) => t.value === value)?.label ?? value;
}

/** Builds the per-seat user prompt for a given question + council type. */
export function buildSeatPrompt(
  question: string,
  councilTypeLabelText: string
): string {
  return (
    `Council session type: ${councilTypeLabelText}\n\n` +
    `The founder asks:\n"""${question}"""\n\n` +
    `Respond from your seat's perspective only. Be specific, actionable, and ` +
    `honest. Do not hedge unnecessarily.`
  );
}
