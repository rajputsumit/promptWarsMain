"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

const VALID_EXAMS = new Set(EXAM_OPTIONS.map((e) => e.value));
const VALID_MOODS = new Set(MOOD_OPTIONS);
const VALID_SYMPTOMS = new Set(SYMPTOM_OPTIONS.map((s) => s.value));
const VALID_TRIGGERS = new Set(TRIGGER_OPTIONS.map((t) => t.value));

/** Keep only known-good values — never trust client-submitted arrays. */
function sanitize<T>(values: unknown, allowed: Set<T>): T[] {
  if (!Array.isArray(values)) return [];
  return values.filter((v): v is T => allowed.has(v as T));
}

export interface OnboardingInput {
  fullName: string;
  age: number | null;
  exams: ExamType[];
}

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = input.fullName?.trim().slice(0, 80) || null;
  const age =
    typeof input.age === "number" && input.age >= 10 && input.age <= 99
      ? input.age
      : null;
  const exams = sanitize<ExamType>(input.exams, VALID_EXAMS);

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    age,
    exams,
    onboarded: true,
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true as const };
}

export interface MoodCheckInput {
  intensity: number;
  moods: Mood[];
  symptoms: PhysicalSymptom[];
  triggers: Trigger[];
  sleepHours: number | null;
  reflection: string;
}

export async function saveMoodCheck(input: MoodCheckInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const intensity = Math.min(5, Math.max(1, Math.round(input.intensity || 3)));
  const sleep =
    typeof input.sleepHours === "number" &&
    input.sleepHours >= 0 &&
    input.sleepHours <= 24
      ? input.sleepHours
      : null;

  const { error } = await supabase.from("mood_logs").insert({
    user_id: user.id,
    intensity,
    moods: sanitize<Mood>(input.moods, VALID_MOODS),
    symptoms: sanitize<PhysicalSymptom>(input.symptoms, VALID_SYMPTOMS),
    triggers: sanitize<Trigger>(input.triggers, VALID_TRIGGERS),
    sleep_hours: sleep,
    reflection: (input.reflection ?? "").trim().slice(0, 2000) || null,
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true as const };
}
