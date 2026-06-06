import type {
  Mood,
  MoodLog,
  WellnessBreakdown,
  WellnessSnapshot,
} from "@/lib/types";

/**
 * Pure, deterministic wellness analytics.
 *
 * Everything here is a side-effect-free function of the user's mood logs, which
 * makes the whole module trivially unit-testable and cheap to run on the server
 * for every dashboard render. The AI layer (see lib/ai.ts) only *narrates* these
 * numbers — it never invents the score — so insights stay grounded and safe.
 */

/** Heavier weight = a more depleting mood. Used to derive emotional balance. */
const MOOD_WEIGHT: Record<Mood, number> = {
  Anxious: -2,
  Burnout: -2.5,
  "Self-doubt": -2,
  Overwhelmed: -2.5,
  Numb: -1.5,
  Quiet: 0,
  Hopeful: 2,
  Calm: 2.5,
};

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(n)));

const avg = (xs: number[]) =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

/** Logs from roughly the last `days` days, newest first. */
export function recentLogs(logs: MoodLog[], days = 7): MoodLog[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return logs
    .filter((l) => new Date(l.created_at).getTime() >= cutoff)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

function focusScore(logs: MoodLog[]): number {
  if (logs.length === 0) return 70;
  // Restlessness and racing moods erode focus; quiet/calm restore it.
  const penalty = avg(
    logs.map((l) => {
      let p = 0;
      if (l.symptoms.includes("Restlessness")) p += 20;
      if (l.moods.includes("Overwhelmed")) p += 15;
      if (l.moods.includes("Anxious")) p += 10;
      if (l.moods.includes("Calm") || l.moods.includes("Quiet")) p -= 10;
      return p;
    })
  );
  return clamp(85 - penalty);
}

function emotionalBalanceScore(logs: MoodLog[]): number {
  if (logs.length === 0) return 65;
  const moodEnergy = avg(
    logs.map((l) => avg(l.moods.map((m) => MOOD_WEIGHT[m] ?? 0)))
  );
  const intensity = avg(logs.map((l) => l.intensity)); // 1..5
  // Map moodEnergy (~ -2.5..2.5) and intensity (1..5) onto 0..100.
  return clamp(50 + moodEnergy * 12 + (intensity - 3) * 8);
}

function sleepScore(logs: MoodLog[]): number {
  const withSleep = logs.filter((l) => l.sleep_hours != null);
  if (withSleep.length === 0) {
    // Fall back to the self-reported "lack of sleep" symptom signal.
    if (logs.length === 0) return 72;
    const flagged = logs.filter((l) =>
      l.symptoms.includes("Lack of sleep")
    ).length;
    return clamp(85 - (flagged / logs.length) * 45);
  }
  const hours = avg(withSleep.map((l) => l.sleep_hours as number));
  // 8h ≈ 95, 6h ≈ 70, 4h ≈ 45.
  return clamp((hours / 8) * 95);
}

function resilienceScore(logs: MoodLog[]): number {
  if (logs.length === 0) return 60;
  // Consistency of check-ins + presence of recovery moods = resilience.
  const recovery = avg(
    logs.map((l) =>
      l.moods.some((m) => m === "Hopeful" || m === "Calm" || m === "Quiet")
        ? 1
        : 0
    )
  );
  const consistency = Math.min(logs.length, 7) / 7; // up to 1
  return clamp(40 + recovery * 35 + consistency * 25);
}

export function computeBreakdown(logs: MoodLog[]): WellnessBreakdown {
  const r = recentLogs(logs);
  return {
    focus: focusScore(r),
    emotionalBalance: emotionalBalanceScore(r),
    sleepQuality: sleepScore(r),
    resilience: resilienceScore(r),
  };
}

function labelFor(score: number): string {
  if (score >= 80) return "Thriving";
  if (score >= 65) return "Balanced";
  if (score >= 45) return "Tender";
  return "Depleted";
}

function summaryFor(score: number): string {
  if (score >= 80)
    return "You're in a strong, steady place. Keep protecting what's working.";
  if (score >= 65)
    return "Your energy is stabilizing. A gentle day ahead is recommended.";
  if (score >= 45)
    return "You're carrying a lot right now. Small, kind steps count today.";
  return "This is a heavy stretch. Rest is productive — be gentle with yourself.";
}

export function computeWellness(logs: MoodLog[]): WellnessSnapshot {
  const breakdown = computeBreakdown(logs);
  const score = clamp(
    breakdown.focus * 0.25 +
      breakdown.emotionalBalance * 0.35 +
      breakdown.sleepQuality * 0.2 +
      breakdown.resilience * 0.2
  );
  return {
    score,
    label: labelFor(score),
    summary: summaryFor(score),
    breakdown,
  };
}

/**
 * Rule-based trigger correlation — the "you logged anxious 4× this week, 3 of
 * those after <6h sleep" style insight students specifically asked for on
 * Reddit. Returns a short, plain-language sentence, or null if data is thin.
 */
export function correlationInsight(logs: MoodLog[]): string | null {
  const r = recentLogs(logs, 14);
  if (r.length < 3) return null;

  const anxious = r.filter(
    (l) => l.moods.includes("Anxious") || l.moods.includes("Overwhelmed")
  );
  if (anxious.length >= 2) {
    const lowSleep = anxious.filter(
      (l) =>
        (l.sleep_hours != null && l.sleep_hours < 6) ||
        l.symptoms.includes("Lack of sleep")
    ).length;
    if (lowSleep >= 2 && lowSleep / anxious.length >= 0.5) {
      return `You logged anxious or overwhelmed ${anxious.length} times recently — ${lowSleep} of those came on low-sleep days. Your calm may depend on rest more than study hours.`;
    }
  }

  // Most frequent trigger across the window.
  const counts = new Map<string, number>();
  r.forEach((l) => l.triggers.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 2) {
    return `"${top[0]}" has come up in ${top[1]} of your recent check-ins. Naming it is the first step — today's a good day to build a buffer against it.`;
  }
  return null;
}

/** Simple weekly trend used for the dashboard mini-summary. */
export function moodTrend(logs: MoodLog[]): "up" | "down" | "steady" {
  const r = recentLogs(logs, 14);
  if (r.length < 4) return "steady";
  const mid = Math.floor(r.length / 2);
  const newer = avg(r.slice(0, mid).map((l) => l.intensity));
  const older = avg(r.slice(mid).map((l) => l.intensity));
  if (newer - older > 0.4) return "up";
  if (older - newer > 0.4) return "down";
  return "steady";
}
