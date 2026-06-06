import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getMoodLogs } from "@/lib/data";
import { generateChatReply } from "@/lib/ai";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_LEN = 2000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  // Validate + clamp the incoming transcript before it reaches the model.
  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }
  const messages: ChatMessage[] = body.messages
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as ChatMessage).role !== undefined &&
        ((m as ChatMessage).role === "user" ||
          (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string"
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "last message must be from user" }, { status: 400 });
  }

  const [profile, logs] = await Promise.all([getProfile(), getMoodLogs(5)]);
  const recentMood = logs[0]?.moods?.join(", ");

  const reply = await generateChatReply(messages, {
    name: profile?.full_name,
    exams: profile?.exams,
    recentMood,
  });

  return NextResponse.json({ reply });
}
