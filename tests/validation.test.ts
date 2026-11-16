import { describe, it, expect } from "vitest";
import {
  validateCouncilInput,
  MAX_QUESTION_LENGTH,
} from "@/lib/validation";

describe("validateCouncilInput", () => {
  it("accepts a valid body and trims the question", () => {
    const result = validateCouncilInput({
      question: "  Should we expand?  ",
      councilType: "carwash",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.question).toBe("Should we expand?");
      expect(result.councilType).toBe("carwash");
    }
  });

  it("rejects a non-object body", () => {
    expect(validateCouncilInput(null).ok).toBe(false);
    expect(validateCouncilInput("hi").ok).toBe(false);
  });

  it("rejects an empty or whitespace question", () => {
    expect(
      validateCouncilInput({ question: "   ", councilType: "digital" }).ok
    ).toBe(false);
    expect(validateCouncilInput({ councilType: "digital" }).ok).toBe(false);
  });

  it("rejects an over-long question", () => {
    const result = validateCouncilInput({
      question: "x".repeat(MAX_QUESTION_LENGTH + 1),
      councilType: "digital",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown council type", () => {
    expect(
      validateCouncilInput({ question: "ok", councilType: "bogus" }).ok
    ).toBe(false);
    expect(validateCouncilInput({ question: "ok" }).ok).toBe(false);
  });
});
