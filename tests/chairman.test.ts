import { describe, it, expect } from "vitest";
import {
  extractJson,
  normalizeVerdict,
  parseChairmanVerdict,
} from "@/lib/chairman";

describe("extractJson", () => {
  it("returns the object from plain JSON", () => {
    expect(extractJson('{"a":1}')).toBe('{"a":1}');
  });

  it("strips ```json code fences", () => {
    const text = '```json\n{"a":1}\n```';
    expect(JSON.parse(extractJson(text))).toEqual({ a: 1 });
  });

  it("ignores surrounding prose", () => {
    const text = 'Here is your verdict: {"a":1,"b":2} — hope it helps!';
    expect(JSON.parse(extractJson(text))).toEqual({ a: 1, b: 2 });
  });

  it("throws when no object is present", () => {
    expect(() => extractJson("no json here")).toThrow();
  });
});

describe("normalizeVerdict", () => {
  it("clamps confidence into 0-100 and rounds", () => {
    expect(normalizeVerdict({ confidenceScore: 150 }).confidenceScore).toBe(100);
    expect(normalizeVerdict({ confidenceScore: -5 }).confidenceScore).toBe(0);
    expect(normalizeVerdict({ confidenceScore: 73.6 }).confidenceScore).toBe(74);
  });

  it("defaults invalid confidence to 50", () => {
    expect(normalizeVerdict({ confidenceScore: "nope" }).confidenceScore).toBe(
      50
    );
    expect(normalizeVerdict({}).confidenceScore).toBe(50);
  });

  it("normalizes the decision case-insensitively", () => {
    expect(normalizeVerdict({ finalDecision: "proceed" }).finalDecision).toBe(
      "Proceed"
    );
    expect(normalizeVerdict({ finalDecision: "REJECT" }).finalDecision).toBe(
      "Reject"
    );
  });

  it("falls back to Pause for unknown decisions", () => {
    expect(normalizeVerdict({ finalDecision: "maybe" }).finalDecision).toBe(
      "Pause"
    );
    expect(normalizeVerdict({}).finalDecision).toBe("Pause");
  });

  it("coerces array fields to string arrays", () => {
    const v = normalizeVerdict({
      keyRisks: ["a", 2, null],
      financialConsiderations: "single point",
      actionPlan: [],
    });
    expect(v.keyRisks).toEqual(["a", "2"]);
    expect(v.financialConsiderations).toEqual(["single point"]);
    expect(v.actionPlan).toEqual([]);
  });

  it("supplies fallbacks for missing text fields", () => {
    const v = normalizeVerdict({});
    expect(v.executiveSummary).toBeTruthy();
    expect(v.bestRecommendation).toBeTruthy();
  });
});

describe("parseChairmanVerdict", () => {
  it("parses a realistic fenced response end to end", () => {
    const raw = [
      "```json",
      JSON.stringify({
        executiveSummary: "Looks promising.",
        bestRecommendation: "Ship an MVP.",
        keyRisks: ["churn", "burn"],
        financialConsiderations: ["12mo runway"],
        actionPlan: ["interview users", "build MVP"],
        confidenceScore: 82,
        finalDecision: "Proceed",
      }),
      "```",
    ].join("\n");

    const v = parseChairmanVerdict(raw);
    expect(v.finalDecision).toBe("Proceed");
    expect(v.confidenceScore).toBe(82);
    expect(v.keyRisks).toHaveLength(2);
    expect(v.actionPlan[0]).toBe("interview users");
  });
});
