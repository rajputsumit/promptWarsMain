import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMeditation } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { theme?: string; minutes?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const theme = (body.theme ?? "Grounding Breath").toString().slice(0, 120);
  const minutes = Math.min(30, Math.max(2, Math.round(Number(body.minutes) || 5)));

  const script = await generateMeditation(theme, minutes);
  return NextResponse.json({ script });
}
