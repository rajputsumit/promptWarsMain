# ZenSpace — Serene Scholar Wellness

A calm, private sanctuary that helps students monitor and improve their mental
well-being during board exams, competitive entrance tests (NEET, JEE, UPSC, CAT,
GATE) and result seasons.

Students track their mood, name their stress triggers, reflect, and receive
gentle, personalised wellness support — without leaderboards, streaks, or any of
the comparison pressure that fuels exam-season anxiety.

Built to the Google Stitch **"Serene Scholar Wellness"** design ("Zen Orange":
warm terracotta, soft peach, sage mist, glassmorphism, Outfit type).

---

## What it does

| Area | Detail |
| --- | --- |
| **Daily check-in** | Energy slider, mood chips, physical sensations, stress triggers, hours slept, and a private space to vent. |
| **Wellness dashboard** | A deterministic 0–100 wellness score with a Focus / Emotional Balance / Sleep / Resilience breakdown. |
| **Personal insight** | Surfaces real patterns ("you logged anxious 4× this week — 3 on low-sleep days") — rule-based, optionally enriched by Claude. |
| **Support Library** | Guided meditations, mindful exercises and exam-strategy reads, with a full-screen breathing player. |
| **Serene, the AI companion** | A warm, judgment-free chat for venting, reframing and grounding — with built-in crisis detection that routes to India's Tele-MANAS / KIRAN helplines. |

Research grounding (Reddit + reporting on NEET/JEE/UPSC stress) shaped the
product: focus on **trigger correlation**, **anonymity/safety**, and **avoiding
peer-comparison mechanics**.

## Tech

- **Next.js 14** (App Router, TypeScript) — Vercel-native
- **Tailwind CSS** — design tokens ported 1:1 from the Stitch design system
- **Supabase** — Google OAuth + Postgres, Row-Level Security on every table
- **Anthropic Claude (Haiku)** — insights, companion chat, guided meditations,
  with hand-written deterministic fallbacks so the app works with **no API key**
- **Vitest** — 25 unit tests across the wellness engine, input validation, and
  AI safety fallbacks (including crisis detection)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run dev                  # http://localhost:3000
```

### 1. Supabase (required for login + saving data)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query →** paste [`supabase/schema.sql`](supabase/schema.sql) and run it.
   This creates `profiles` + `mood_logs` with RLS policies and a signup trigger.
3. **Authentication → Providers → Google →** enable it and paste your Google
   OAuth client ID/secret ([Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
   Set the authorised redirect URL to:
   `https://<your-project>.supabase.co/auth/v1/callback`
4. **Project Settings → API →** copy the Project URL and `anon` public key into
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

> Without Supabase the app still renders every screen, but sign-in is disabled
> and nothing persists — useful for a quick visual preview only.

### 2. Anthropic (optional)

Add `ANTHROPIC_API_KEY` to power AI insights, the companion, and AI-authored
meditations. Leave it blank and the app uses built-in rule-based support instead.

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run test       # unit tests for the wellness engine (Vitest)
npm run typecheck  # tsc --noEmit
```

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel (framework auto-detected).
2. Add the same env vars in **Project → Settings → Environment Variables**.
3. Add your production callback URL to Supabase Auth and to the Google OAuth
   client (`https://<your-domain>/auth/callback`).

## Design & safety notes

- **Accessibility**: semantic landmarks, ARIA labels/`aria-pressed`, keyboard
  navigation, visible focus, and full `prefers-reduced-motion` support — the
  calm animations turn off for users who need them to.
- **Security**: RLS isolates every user's data at the database; all server
  actions and API routes re-check the session and sanitise/clamp input before it
  reaches the DB or the model; secrets stay server-side only.
- **Safety**: the AI is scoped as a companion, never a clinician, and crisis
  language always surfaces real helplines regardless of the model's output.

## Project structure

```
src/
  app/
    (app)/            authenticated shell + dashboard, check-in, library, companion
    api/              insight · chat · meditation route handlers
    auth/             OAuth callback + sign-out
    login/  onboarding/
    actions.ts        validated server actions (onboarding, mood check)
  components/         AppShell, CheckInForm, MeditationPlayer, gauges, etc.
  lib/
    wellness.ts       pure, tested scoring + insight engine
    validation.ts     pure input sanitisation shared by actions/routes
    ai.ts             Claude integration with deterministic fallbacks
    supabase/         browser · server · middleware clients
    *.test.ts         Vitest suites (wellness · validation · ai)
supabase/schema.sql   database + RLS + signup trigger
```

## Testing

```bash
npm run test
```

Business logic is deliberately isolated into pure modules (`wellness.ts`,
`validation.ts`, and the offline branches of `ai.ts`) so it can be tested
without a database, network, or browser. Coverage focuses on the parts where
correctness matters most: the scoring maths, the "never trust client input"
boundary, and crisis detection in the AI companion.
