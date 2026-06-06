import Anthropic from "@anthropic-ai/sdk";
import { anthropicApiKey, isAiConfigured } from "@/lib/env";
import type {
  ChatMessage,
  MoodLog,
  Profile,
  WellnessSnapshot,
} from "@/lib/types";
import { correlationInsight } from "@/lib/wellness";

/**
 * AI support layer. Two hard rules shape everything here:
 *  1. The model is a *companion*, never a clinician. It de-escalates, reflects,
 *     and points to real help — it does not diagnose or treat.
 *  2. Every entry point degrades gracefully to deterministic, hand-written
 *     content when no API key is present, so the app is fully usable offline
 *     and in the judges' environment without secrets.
 */

// Haiku: fast + inexpensive, ideal for short, warm, frequent interactions.
const MODEL = "claude-haiku-4-5";

function client(): Anthropic {
  return new Anthropic({ apiKey: anthropicApiKey });
}

const COMPANION_SYSTEM = `You are "Serene", the gentle wellness companion inside ZenSpace, an app for Indian students preparing for high-pressure exams (NEET, JEE, UPSC, CAT, GATE, boards).

Voice: warm, calm, unhurried, validating. Short sentences. Plain language. Never clinical or preachy. You sound like a kind, grounded friend who has done a little mindfulness training — not a doctor.

You MUST:
- Validate the feeling before offering anything.
- Offer at most ONE small, concrete, doable step (a breath, a reframe, a 2-minute action).
- Keep replies under ~90 words unless asked for a longer exercise.
- Gently normalise that exam stress is common and not a personal failing.

You MUST NOT:
- Diagnose, label disorders, or give medical/medication advice.
- Promise outcomes or rank/compare the student against others.
- Use toxic positivity ("just relax", "don't worry").

If the student expresses intent to harm themselves or hopelessness about living, drop everything else: express care, tell them they deserve immediate human support, and urge them to contact India's Tele-MANAS helpline at 14416 (or 1800-891-4416) or KIRAN at 1800-599-0019 right now, and a trusted person nearby.`;

/** Words that should always surface crisis resources, regardless of the model. */
const CRISIS_PATTERNS =
  /\b(kill myself|suicide|suicidal|end my life|don'?t want to live|want to die|hurt myself|self harm|self-harm|no reason to live|better off dead)\b/i;

export const CRISIS_RESPONSE = `I'm really glad you told me, and I want you to be safe right now. What you're feeling matters, and you deserve to talk to someone who can support you immediately.

Please reach out right now:
• Tele-MANAS (Govt. of India): 14416 or 1800-891-4416
• KIRAN mental health helpline: 1800-599-0019

If you can, also tell one person near you how you're feeling. You don't have to carry this alone. I'm here too.`;

export function isCrisis(text: string): boolean {
  return CRISIS_PATTERNS.test(text);
}

async function complete(
  system: string,
  messages: ChatMessage[],
  maxTokens = 400
): Promise<string> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/* ----------------------------- Personal insight ---------------------------- */

export async function generateInsight(
  snapshot: WellnessSnapshot,
  logs: MoodLog[],
  profile: Pick<Profile, "full_name" | "exams">
): Promise<string> {
  const ruleBased = correlationInsight(logs);

  if (!isAiConfigured) {
    return (
      ruleBased ??
      "Your check-ins are building a clearer picture of what helps you feel steady. Keep showing up gently — every log is a small act of self-care."
    );
  }

  const recent = logs.slice(0, 8).map((l) => ({
    when: new Date(l.created_at).toLocaleDateString(),
    moods: l.moods,
    triggers: l.triggers,
    sleep: l.sleep_hours,
    intensity: l.intensity,
  }));

  const context = `Student exams: ${profile.exams.join(", ") || "unspecified"}.
Current wellness score: ${snapshot.score}/100 (${snapshot.label}).
Breakdown: focus ${snapshot.breakdown.focus}, emotional balance ${snapshot.breakdown.emotionalBalance}, sleep ${snapshot.breakdown.sleepQuality}, resilience ${snapshot.breakdown.resilience}.
A rule-based pattern we already detected: ${ruleBased ?? "none clear yet"}.
Recent check-ins (newest first): ${JSON.stringify(recent)}.

Write ONE short "Personal Insight" (max 2 sentences, ~45 words) that names a real pattern from this data and suggests one gentle action for today. Do not greet or sign off — just the insight.`;

  try {
    return await complete(COMPANION_SYSTEM, [{ role: "user", content: context }], 200);
  } catch {
    return (
      ruleBased ??
      "Your anxiety tends to peak around mock tests. A short grounding exercise today can build a little buffer before the next one."
    );
  }
}

/* --------------------------------- Chat ----------------------------------- */

export async function generateChatReply(
  messages: ChatMessage[],
  context: { name?: string | null; exams?: string[]; recentMood?: string }
): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? "";
  if (isCrisis(last)) return CRISIS_RESPONSE;

  if (!isAiConfigured) {
    return offlineChatReply(last);
  }

  const sys = `${COMPANION_SYSTEM}

Context about who you're talking to: name ${context.name ?? "a student"}; preparing for ${context.exams?.join(", ") || "exams"}; recent mood signal: ${context.recentMood ?? "unknown"}.`;

  try {
    return await complete(sys, messages.slice(-10), 350);
  } catch {
    return offlineChatReply(last);
  }
}

function offlineChatReply(userText: string): string {
  const t = userText.toLowerCase();
  if (/sleep|tired|exhaust/.test(t))
    return "That tiredness is real, and it's your body asking for care, not weakness. Tonight, try winding down 30 minutes earlier with no screen — even resting eyes counts. Want a short wind-down breathing exercise?";
  if (/fail|score|result|rank/.test(t))
    return "A result is one data point, not a verdict on your worth. You are more than any rank. For right now: take one slow breath in for 4, out for 6. What's the very next small thing you can control today?";
  if (/anx|panic|nervous|scared/.test(t))
    return "Anxiety is your mind trying to protect you — it just gets loud. Let's soften it: name 3 things you can see, 3 you can hear, and unclench your shoulders. I'm right here. What set it off today?";
  return "Thank you for sharing that with me. Whatever you're feeling is allowed here. Take one gentle breath with me — in slowly, and out a little longer. What would feel kind to do for yourself in the next ten minutes?";
}

/* ------------------------------ Meditation -------------------------------- */

export interface MeditationScript {
  title: string;
  intro: string;
  steps: { label: string; text: string; seconds: number }[];
  outro: string;
}

export async function generateMeditation(
  theme: string,
  minutes: number
): Promise<MeditationScript> {
  if (!isAiConfigured) return offlineMeditation(theme, minutes);

  const sys = `${COMPANION_SYSTEM}

You are scripting a short guided meditation. Respond ONLY with minified JSON matching this TypeScript type, no markdown:
{"title":string,"intro":string,"steps":{"label":string,"text":string,"seconds":number}[],"outro":string}
Make steps' seconds sum to roughly ${minutes * 60}. Keep language soothing and second-person.`;

  try {
    const raw = await complete(
      sys,
      [{ role: "user", content: `Theme: ${theme}. Length: ${minutes} minutes.` }],
      700
    );
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as MeditationScript;
    if (parsed?.steps?.length) return parsed;
  } catch {
    /* fall through to offline script */
  }
  return offlineMeditation(theme, minutes);
}

function offlineMeditation(theme: string, minutes: number): MeditationScript {
  const unit = Math.max(20, Math.round((minutes * 60) / 5));
  return {
    title: theme || "Grounding Breath",
    intro:
      "Find a comfortable seat. Let your shoulders drop away from your ears. There is nowhere else you need to be for the next few minutes.",
    steps: [
      { label: "Arrive", text: "Close your eyes softly. Notice the weight of your body held by the chair beneath you.", seconds: unit },
      { label: "Breathe in", text: "Breathe in slowly through your nose for a count of four. Feel your belly gently rise.", seconds: unit },
      { label: "Hold", text: "Pause for a count of four. No strain — just a calm, full stillness.", seconds: unit },
      { label: "Breathe out", text: "Release slowly through your mouth for a count of six. Let the tension leave with the breath.", seconds: unit },
      { label: "Rest", text: "Let your breath return to its natural rhythm. You are safe. You are doing enough.", seconds: unit },
    ],
    outro:
      "When you're ready, let your eyes open gently. Carry this quiet with you into whatever comes next.",
  };
}
