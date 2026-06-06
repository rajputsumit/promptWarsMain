import { describe, expect, it } from "vitest";
import {
  CRISIS_RESPONSE,
  generateChatReply,
  generateInsight,
  generateMeditation,
  isCrisis,
} from "./ai";
import { computeWellness } from "./wellness";

/**
 * These tests run with no ANTHROPIC_API_KEY, so they exercise the deterministic
 * fallback paths — the behaviour that must hold even when the model is offline.
 * Crisis handling is safety-critical and is verified independently of the model.
 */

describe("isCrisis", () => {
  it("flags explicit self-harm language", () => {
    expect(isCrisis("I want to kill myself")).toBe(true);
    expect(isCrisis("sometimes I feel like I don't want to live")).toBe(true);
    expect(isCrisis("I'm suicidal")).toBe(true);
  });

  it("does not flag ordinary exam stress", () => {
    expect(isCrisis("I'm so stressed about NEET, I could die of boredom")).toBe(
      false
    );
    expect(isCrisis("this syllabus is killing my free time")).toBe(false);
  });
});

describe("generateChatReply (offline)", () => {
  it("always returns the crisis resources for crisis input", async () => {
    const reply = await generateChatReply(
      [{ role: "user", content: "I don't want to live anymore" }],
      {}
    );
    expect(reply).toBe(CRISIS_RESPONSE);
    expect(reply).toContain("14416");
  });

  it("returns a non-empty, supportive reply for normal input", async () => {
    const reply = await generateChatReply(
      [{ role: "user", content: "I can't sleep before my exam" }],
      { name: "Asha" }
    );
    expect(reply.length).toBeGreaterThan(20);
  });
});

describe("generateMeditation (offline)", () => {
  it("returns a usable script with steps", async () => {
    const script = await generateMeditation("Box breathing", 5);
    expect(script.title).toBeTruthy();
    expect(script.steps.length).toBeGreaterThan(0);
    expect(script.steps.every((s) => s.seconds > 0)).toBe(true);
  });
});

describe("generateInsight (offline)", () => {
  it("returns an insight string even with no logs", async () => {
    const snapshot = computeWellness([]);
    const insight = await generateInsight(snapshot, [], {
      full_name: "Asha",
      exams: ["NEET"],
    });
    expect(typeof insight).toBe("string");
    expect(insight.length).toBeGreaterThan(10);
  });
});
