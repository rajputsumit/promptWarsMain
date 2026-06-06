"use client";

import { useRouter } from "next/navigation";
import { CheckInForm } from "@/components/CheckInForm";

export default function CheckInPage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-3xl px-container-padding py-section-gap pb-24">
      <header className="mb-section-gap space-y-base text-center md:text-left">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
          How is your mind sitting today?
        </h1>
        <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
          Take a deep breath. Let&apos;s gently unpack what you&apos;re carrying
          right now. There are no wrong answers here.
        </p>
      </header>

      <CheckInForm
        submitLabel="Save today's check-in"
        onSaved={() => router.push("/dashboard")}
      />
    </div>
  );
}
