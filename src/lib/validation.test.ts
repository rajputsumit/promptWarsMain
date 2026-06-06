import { describe, expect, it } from "vitest";
import {
  clampAge,
  clampIntensity,
  clampSleepHours,
  cleanName,
  cleanReflection,
  sanitizeEnum,
  sanitizeExams,
  sanitizeMoods,
} from "./validation";

describe("sanitizeEnum", () => {
  const allowed = new Set(["a", "b", "c"]);

  it("keeps only allowed values", () => {
    expect(sanitizeEnum(["a", "x", "b", "evil"], allowed)).toEqual(["a", "b"]);
  });

  it("de-duplicates", () => {
    expect(sanitizeEnum(["a", "a", "b", "b"], allowed)).toEqual(["a", "b"]);
  });

  it("rejects non-arrays and injection-shaped payloads", () => {
    expect(sanitizeEnum("a", allowed)).toEqual([]);
    expect(sanitizeEnum(null, allowed)).toEqual([]);
    expect(sanitizeEnum({ length: 1, 0: "a" }, allowed)).toEqual([]);
    expect(sanitizeEnum([{ toString: () => "a" }], allowed)).toEqual([]);
  });
});

describe("domain sanitizers", () => {
  it("only allows known exams and moods", () => {
    expect(sanitizeExams(["NEET", "HOGWARTS", "JEE"])).toEqual(["NEET", "JEE"]);
    expect(sanitizeMoods(["Anxious", "Ecstatic"])).toEqual(["Anxious"]);
  });
});

describe("clampIntensity", () => {
  it("clamps to [1,5] and rounds", () => {
    expect(clampIntensity(0)).toBe(1);
    expect(clampIntensity(9)).toBe(5);
    expect(clampIntensity(3.4)).toBe(3);
  });
  it("defaults to 3 for garbage", () => {
    expect(clampIntensity("abc")).toBe(3);
    expect(clampIntensity(undefined)).toBe(3);
    expect(clampIntensity(NaN)).toBe(3);
  });
});

describe("clampSleepHours", () => {
  it("accepts valid hours including decimals", () => {
    expect(clampSleepHours(7.5)).toBe(7.5);
    expect(clampSleepHours("8")).toBe(8);
    expect(clampSleepHours(0)).toBe(0);
  });
  it("rejects out-of-range and empty", () => {
    expect(clampSleepHours(-1)).toBeNull();
    expect(clampSleepHours(25)).toBeNull();
    expect(clampSleepHours("")).toBeNull();
    expect(clampSleepHours(null)).toBeNull();
  });
});

describe("clampAge", () => {
  it("accepts a plausible student age", () => {
    expect(clampAge(17)).toBe(17);
    expect(clampAge("21")).toBe(21);
  });
  it("rejects implausible values", () => {
    expect(clampAge(5)).toBeNull();
    expect(clampAge(120)).toBeNull();
    expect(clampAge("")).toBeNull();
  });
});

describe("text cleaners", () => {
  it("trims and caps name length", () => {
    expect(cleanName("  Asha  ")).toBe("Asha");
    expect(cleanName("a".repeat(200))?.length).toBe(80);
    expect(cleanName("   ")).toBeNull();
    expect(cleanName(42)).toBeNull();
  });

  it("caps reflection at the DB limit", () => {
    expect(cleanReflection("x".repeat(5000))?.length).toBe(2000);
    expect(cleanReflection("")).toBeNull();
  });
});
