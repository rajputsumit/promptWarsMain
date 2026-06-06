import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { MoodLog, Profile } from "@/lib/types";

/** Returns the signed-in user or redirects to /login. Use in protected pages. */
export async function requireUser() {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { user, supabase };
}

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;

  // The signup trigger normally creates this row; create a fallback just in case.
  const fallback = {
    id: user.id,
    full_name:
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??
      null,
  };
  const { data: created } = await supabase
    .from("profiles")
    .upsert(fallback)
    .select("*")
    .maybeSingle();

  return (created as Profile) ?? null;
}

export async function getMoodLogs(limit = 60): Promise<MoodLog[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as MoodLog[]) ?? [];
}

/** Best-effort first name for greetings. */
export function firstName(profile: Profile | null): string {
  const name = profile?.full_name?.trim();
  if (!name) return "friend";
  return name.split(/\s+/)[0];
}
