import { describe, expect, it } from "vitest";
import {
  computeWellness,
  computeBreakdown,
  correlationInsight,
  moodTrend,
  recentLogs,
} from "./wellness";
import type { MoodLog } from "./types";

let idc = 0;
function log(partial: Partial<MoodLog>): MoodLog {
  return {
    id: `log-${idc++}`,
    user_id: "u1",
    intensity: 3,
    moods: [],
    symptoms: [],
    triggers: [],
    sleep_hours: null,
    reflection: null,
    created_at: new Date().toISOString(),
    ...partial,
  };
}

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

describe("computeWellness", () => {
  it("returns sensible defaults for a brand-new user with no logs", () => {
    const s = computeWellness([]);
    expect(s.score).toBeGreaterThan(0);
    expect(s.score).toBeLessThanOrEqual(100);
    expect(s.label).toBeTruthy();
    expect(s.breakdown.focus).toBeGreaterThan(0);
  });

  it("scores a calm, well-rested student higher than a depleted one", () => {
    const calm = computeWellness([
      log({ moods: ["Calm", "Hopeful"], intensity: 5, sleep_hours: 8 }),
      log({ moods: ["Quiet"], intensity: 4, sleep_hours: 7.5 }),
    ]);
    const depleted = computeWellness([
      log({ moods: ["Burnout", "Overwhelmed"], intensity: 1, sleep_hours: 4, symptoms: ["Lack of sleep", "Restlessness"] }),
      log({ moods: ["Anxious"], intensity: 1, sleep_hours: 3.5, symptoms: ["Lack of sleep"] }),
    ]);
    expect(calm.score).toBeGreaterThan(depleted.score);
  });

  it("keeps every breakdown metric within 0-100", () => {
    const b = computeBreakdown([
      log({ moods: ["Anxious", "Burnout", "Overwhelmed"], intensity: 1, sleep_hours: 0 }),
    ]);
    for (const v of Object.values(b)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});

describe("recentLogs", () => {
  it("only keeps logs inside the window and sorts newest first", () => {
    const logs = [
      log({ created_at: daysAgo(1) }),
      log({ created_at: daysAgo(20) }),
      log({ created_at: daysAgo(3) }),
    ];
    const r = recentLogs(logs, 7);
    expect(r).toHaveLength(2);
    expect(new Date(r[0].created_at).getTime()).toBeGreaterThan(
      new Date(r[1].created_at).getTime()
    );
  });
});

describe("correlationInsight", () => {
  it("returns null when there is not enough data", () => {
    expect(correlationInsight([log({})])).toBeNull();
  });

  it("surfaces the anxiety/low-sleep link students asked for", () => {
    const logs = [
      log({ moods: ["Anxious"], sleep_hours: 4, created_at: daysAgo(1) }),
      log({ moods: ["Overwhelmed"], sleep_hours: 5, created_at: daysAgo(2) }),
      log({ moods: ["Quiet"], sleep_hours: 8, created_at: daysAgo(3) }),
    ];
    const insight = correlationInsight(logs);
    expect(insight).toMatch(/sleep|rest/i);
  });
});

describe("moodTrend", () => {
  it("detects an improving trend", () => {
    const logs = [
      log({ intensity: 5, created_at: daysAgo(1) }),
      log({ intensity: 5, created_at: daysAgo(2) }),
      log({ intensity: 2, created_at: daysAgo(8) }),
      log({ intensity: 1, created_at: daysAgo(9) }),
    ];
    expect(moodTrend(logs)).toBe("up");
  });
});
