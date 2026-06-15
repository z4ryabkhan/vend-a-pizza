import { describe, it, expect } from "vitest";
import { sessionToMarkdown } from "@/lib/markdown";
import type { CouncilSession } from "@/lib/types";

const session: CouncilSession = {
  id: "abc-123",
  question: "Should we launch in Q3?",
  council_type: "startup",
  created_at: "2026-06-15T10:00:00.000Z",
  model_responses: [
    {
      seat: "strategist",
      role: "Strategist",
      model: "openai/gpt-4o",
      content: "Strong market timing.",
    },
    {
      seat: "risk",
      role: "Risk Analyst",
      model: "anthropic/claude-3.5-sonnet",
      content: "",
      error: "rate limited",
    },
  ],
  chairman_response: {
    executiveSummary: "Go for it.",
    bestRecommendation: "Launch a beta.",
    keyRisks: ["competition"],
    financialConsiderations: ["runway is tight"],
    actionPlan: ["finalize pricing", "open beta"],
    confidenceScore: 77,
    finalDecision: "Proceed",
  },
};

describe("sessionToMarkdown", () => {
  it("includes the question, decision, and confidence", () => {
    const md = sessionToMarkdown(session);
    expect(md).toContain("Should we launch in Q3?");
    expect(md).toContain("Final decision: Proceed");
    expect(md).toContain("77/100");
  });

  it("renders risks as bullets and the action plan as a numbered list", () => {
    const md = sessionToMarkdown(session);
    expect(md).toContain("- competition");
    expect(md).toContain("1. finalize pricing");
    expect(md).toContain("2. open beta");
  });

  it("notes unavailable advisors", () => {
    const md = sessionToMarkdown(session);
    expect(md).toContain("Strong market timing.");
    expect(md).toContain("Unavailable: rate limited");
  });
});
