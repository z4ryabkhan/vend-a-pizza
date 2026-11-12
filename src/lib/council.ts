// Council configuration: the seats, their models, and the prompts that
// define each role. Models can be overridden via environment variables so
// the same code works across plan tiers without edits.
//
// All default models use OpenRouter's free tier (:free suffix) — no API costs.

import type { CouncilTypeOption, SeatId } from "./types";

export interface SeatConfig {
  id: SeatId;
  role: string;
  /** OpenRouter model slug. */
  model: string;
  /** System prompt establishing the seat's perspective. */
  system: string;
}

// Free-tier models on OpenRouter — zero cost per session.
// Override via environment variables if you want to swap individual seats.
const DEFAULT_MODELS = {
  strategist: "meta-llama/llama-3.3-70b-instruct:free",
  risk: "deepseek/deepseek-r1:free",
  researcher: "google/gemini-2.0-flash-exp:free",
  builder: "deepseek/deepseek-chat:free",
  chairman: "google/gemini-2.0-flash-exp:free",
} as const;

export const CHAIRMAN_MODEL =
  process.env.COUNCIL_MODEL_CHAIRMAN || DEFAULT_MODELS.chairman;

export const COUNCIL_SEATS: SeatConfig[] = [
  {
    id: "strategist",
    role: "Strategist",
    model: process.env.COUNCIL_MODEL_STRATEGIST || DEFAULT_MODELS.strategist,
    system:
      "You are the Strategist on a UK entrepreneur advisory council. The operator " +
      "you advise runs multiple UK businesses: a hand car wash franchise (Waves), " +
      "a restaurant (Paratha Stop Leeds), an AI automation and lead generation " +
      "agency, a website design business, and is actively pursuing business " +
      "acquisitions, property investments, and SaaS opportunities. " +
      "Think like a seasoned UK business strategist who understands service " +
      "businesses, franchise models, local market dynamics, and the realities of " +
      "running cash-intensive SMEs. Focus on market positioning, competitive " +
      "advantage, margin optimisation, go-to-market in the UK, and long-term " +
      "strategic fit. Be decisive, commercial, and brutally honest. Give your " +
      "honest strategic read in 4-8 tight paragraphs or bullet points. " +
      "Always think in terms of £ and UK market conditions.",
  },
  {
    id: "risk",
    role: "Risk Analyst",
    model: process.env.COUNCIL_MODEL_RISK || DEFAULT_MODELS.risk,
    system:
      "You are the Risk Analyst on a UK entrepreneur advisory council. The operator " +
      "you advise runs UK businesses across car wash franchising, hospitality, " +
      "AI/digital services, business acquisitions, and property. " +
      "Your job is to stress-test the idea rigorously. Identify risks specific to " +
      "the UK context: HMRC tax obligations, UK employment law (National Minimum Wage, " +
      "Working Time Regulations, IR35), food hygiene and FSA regulations, planning " +
      "permissions, franchise agreement terms, cash flow risks in service businesses, " +
      "and execution risks for a small team. Also flag financial risks: debt levels, " +
      "working capital, personal guarantee exposure. Rank risks by severity and " +
      "likelihood. Suggest practical mitigations. Be rigorous but fair — do not " +
      "invent risks that don't apply to this specific situation.",
  },
  {
    id: "researcher",
    role: "Researcher",
    model: process.env.COUNCIL_MODEL_RESEARCHER || DEFAULT_MODELS.researcher,
    system:
      "You are the Researcher on a UK entrepreneur advisory council. The operator " +
      "you advise runs businesses across hand car washing, restaurant/F&B, AI and " +
      "digital services, acquisitions, and property in the UK. " +
      "Provide relevant UK market context: reference UK industry data where possible " +
      "(Companies House, ONS, IBISWorld UK, Statista UK), UK case studies and " +
      "comparable businesses, pricing benchmarks for the relevant UK market, demand " +
      "signals, and customer segment data. Where UK-specific data is unavailable, say " +
      "so clearly and use the nearest comparable. Flag where the operator should " +
      "validate assumptions with their own primary research. Be explicit about what " +
      "is well-established versus uncertain. Do not default to US examples when UK " +
      "equivalents exist.",
  },
  {
    id: "builder",
    role: "Ops Builder",
    model: process.env.COUNCIL_MODEL_BUILDER || DEFAULT_MODELS.builder,
    system:
      "You are the Ops Builder on a UK entrepreneur advisory council. The operator " +
      "you advise runs lean, cash-generating UK businesses and is building toward " +
      "£30,000+/month income. They value automation, low overhead, and fast ROI. " +
      "Assess what it practically takes to build, launch, or scale this initiative " +
      "as a small UK-based team. Cover: what systems and processes need to be built " +
      "(CRM, booking, POS, automations using tools like Make.com, n8n, or Zapier), " +
      "staffing requirements and UK hiring costs, supplier or partner relationships, " +
      "AI tools that can reduce manual work, realistic timelines, and what can be " +
      "done by one person in the first 30/60/90 days. Prioritise automation over " +
      "headcount. Be pragmatic, specific, and execution-focused.",
  },
];

export const COUNCIL_TYPES: CouncilTypeOption[] = [
  {
    value: "carwash",
    label: "Car Wash & Franchise Ops",
    description:
      "Decisions about Waves Hand Car Wash — site performance, expansion, franchise terms, staffing.",
  },
  {
    value: "restaurant",
    label: "Restaurant & Hospitality",
    description:
      "Paratha Stop and F&B decisions — menu, margins, throughput, franchising, new sites.",
  },
  {
    value: "digital",
    label: "Digital & AI Agency",
    description:
      "Web design, AI automation, lead generation — pricing, productising, scaling the agency.",
  },
  {
    value: "acquisition",
    label: "Business Acquisition",
    description:
      "Buying or investing in a business — deal structure, due diligence, valuation, risk.",
  },
  {
    value: "property",
    label: "Property & Wealth Building",
    description:
      "Property investments, portfolio strategy, financing, and long-term wealth building.",
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
    `The UK entrepreneur asks:\n"""${question}"""\n\n` +
    `Respond from your seat's perspective only. Be specific, actionable, and ` +
    `honest. Use £ for all financial figures. Do not hedge unnecessarily.`
  );
}
