import { describe, it, expect } from "vitest";
import {
  COUNCIL_SEATS,
  COUNCIL_TYPES,
  buildSeatPrompt,
  councilTypeLabel,
} from "@/lib/council";

describe("council config", () => {
  it("defines exactly four advisor seats", () => {
    expect(COUNCIL_SEATS).toHaveLength(4);
    const ids = COUNCIL_SEATS.map((s) => s.id).sort();
    expect(ids).toEqual(["builder", "researcher", "risk", "strategist"]);
  });

  it("gives every seat a model and system prompt", () => {
    for (const seat of COUNCIL_SEATS) {
      expect(seat.model).toBeTruthy();
      expect(seat.system.length).toBeGreaterThan(20);
    }
  });

  it("maps known council types to labels and echoes unknown ones", () => {
    expect(councilTypeLabel(COUNCIL_TYPES[0].value)).toBe(COUNCIL_TYPES[0].label);
    expect(councilTypeLabel("mystery")).toBe("mystery");
  });

  it("embeds the question and type into the seat prompt", () => {
    const prompt = buildSeatPrompt("Expand to EU?", "Growth & Scaling");
    expect(prompt).toContain("Expand to EU?");
    expect(prompt).toContain("Growth & Scaling");
  });
});
