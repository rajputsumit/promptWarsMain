"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  cleanName,
  cleanReflection,
  clampAge,
  clampIntensity,
  clampSleepHours,
  sanitizeExams,
  sanitizeMoods,
  sanitizeSymptoms,
  sanitizeTriggers,
} from "@/lib/validation";
import type { ExamType, Mood, PhysicalSymptom, Trigger } from "@/lib/types";

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

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: cleanName(input.fullName),
    age: clampAge(input.age),
    exams: sanitizeExams(input.exams),
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

  const { error } = await supabase.from("mood_logs").insert({
    user_id: user.id,
    intensity: clampIntensity(input.intensity),
    moods: sanitizeMoods(input.moods),
    symptoms: sanitizeSymptoms(input.symptoms),
    triggers: sanitizeTriggers(input.triggers),
    sleep_hours: clampSleepHours(input.sleepHours),
    reflection: cleanReflection(input.reflection),
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true as const };
}
