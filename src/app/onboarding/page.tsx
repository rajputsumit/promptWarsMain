import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata = { title: "Set up your sanctuary — ZenSpace" };

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.onboarded) redirect("/dashboard");

  return (
    <OnboardingFlow
      initialName={profile.full_name ?? ""}
      initialAge={profile.age}
      initialExams={profile.exams ?? []}
    />
  );
}
