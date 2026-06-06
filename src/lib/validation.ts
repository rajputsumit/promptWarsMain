import {
  EXAM_OPTIONS,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  TRIGGER_OPTIONS,
  type ExamType,
  type Mood,
  type PhysicalSymptom,
  type Trigger,
} from "@/lib/types";

/**
 * Pure input-validation helpers shared by the server actions and API routes.
 *
 * Keeping these side-effect-free (no DB, no `next/*` imports) means the security
 * boundary — "never trust client input" — is small, readable, and unit-tested in
 * isolation, instead of being buried inside server actions that can't be imported
 * into the test runner.
 */

const VALID_EXAMS = new Set<ExamType>(EXAM_OPTIONS.map((e) => e.value));
const VALID_MOODS = new Set<Mood>(MOOD_OPTIONS);
const VALID_SYMPTOMS = new Set<PhysicalSymptom>(
  SYMPTOM_OPTIONS.map((s) => s.value)
);
const VALID_TRIGGERS = new Set<Trigger>(TRIGGER_OPTIONS.map((t) => t.value));

/** Keep only known-good, de-duplicated values from a client-supplied array. */
export function sanitizeEnum<T>(values: unknown, allowed: Set<T>): T[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<T>();
  for (const v of values) {
    if (allowed.has(v as T)) seen.add(v as T);
  }
  return [...seen];
}

export const sanitizeExams = (v: unknown) => sanitizeEnum<ExamType>(v, VALID_EXAMS);
export const sanitizeMoods = (v: unknown) => sanitizeEnum<Mood>(v, VALID_MOODS);
export const sanitizeSymptoms = (v: unknown) =>
  sanitizeEnum<PhysicalSymptom>(v, VALID_SYMPTOMS);
export const sanitizeTriggers = (v: unknown) =>
  sanitizeEnum<Trigger>(v, VALID_TRIGGERS);

/** Mood/energy rating is always an integer in [1, 5]; defaults to 3 (neutral). */
export function clampIntensity(value: unknown): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, n));
}

/** Hours slept, in [0, 24]; null when unknown or invalid. */
export function clampSleepHours(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 24) return null;
  return n;
}

/** Age, in [10, 99]; null when unknown or out of range. */
export function clampAge(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 10 || n > 99) return null;
  return n;
}

/** Trim a free-text name to a sane length; null when empty. */
export function cleanName(value: unknown, max = 80): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

/** Trim free-text reflection to the DB limit; null when empty. */
export function cleanReflection(value: unknown, max = 2000): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}
