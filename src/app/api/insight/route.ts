import { NextResponse } from "next/server";
import { getProfile, getMoodLogs } from "@/lib/data";
import { computeWellness } from "@/lib/wellness";
import { generateInsight } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST() {
  const [profile, logs] = await Promise.all([getProfile(), getMoodLogs()]);
  if (!profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const snapshot = computeWellness(logs);
  const insight = await generateInsight(snapshot, logs, {
    full_name: profile.full_name,
    exams: profile.exams,
  });

  return NextResponse.json({ insight });
}
