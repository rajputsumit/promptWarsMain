/**
 * Centralised, validated access to environment configuration.
 * Nothing here throws at import time — that keeps the build green and lets the
 * UI degrade gracefully (e.g. show a setup notice) when a key is missing.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/** Server-only secrets — never reference these from a client component. */
export const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "";
export const isAiConfigured = anthropicApiKey.length > 0;

/** Site origin used to build OAuth redirect URLs. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
