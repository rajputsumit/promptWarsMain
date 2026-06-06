"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CheckInForm } from "@/components/CheckInForm";
import { Icon } from "@/components/Icon";
import { clsx } from "@/lib/clsx";
import { completeOnboarding } from "@/app/actions";
import { EXAM_OPTIONS, type ExamType } from "@/lib/types";

export function OnboardingFlow({
  initialName,
  initialAge,
  initialExams,
}: {
  initialName: string;
  initialAge: number | null;
  initialExams: ExamType[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState<string>(initialAge?.toString() ?? "");
  const [exams, setExams] = useState<ExamType[]>(initialExams);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitStep1() {
    if (!name.trim()) {
      setError("Please tell us what to call you.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await completeOnboarding({
        fullName: name,
        age: age === "" ? null : Number(age),
        exams,
      });
      if (res.ok) setStep(2);
      else setError(res.error ?? "Something went wrong. Please try again.");
    });
  }

  return (
    <main className="relative flex min-h-screen items-start justify-center p-container-padding py-section-gap">
      <AmbientBackground />

      {/* Progress bar */}
      <div className="fixed left-0 top-0 z-50 h-2 w-full bg-surface-container-high">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-secondary-container to-primary-container transition-all duration-1000 ease-out"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-section-gap pb-24">
        {step === 1 ? (
          <>
            <header className="space-y-base text-center">
              <Icon name="spa" filled className="mb-2 text-4xl text-primary" />
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
                Welcome to ZenSpace
              </h1>
              <p className="mx-auto max-w-lg font-body-lg text-body-lg text-on-surface-variant">
                Take a deep breath. Let&apos;s create your personal sanctuary for
                focused study and calm.
              </p>
            </header>

            <div className="glass-card-strong flex flex-col gap-8 rounded-xl p-8 md:p-12">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 ml-1 block font-label-md text-label-md text-on-surface"
                  >
                    What should we call you?
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="input-soft w-full rounded-full px-6 py-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="age"
                    className="mb-2 ml-1 block font-label-md text-label-md text-on-surface"
                  >
                    Your age <span className="font-normal text-on-surface-variant/60">(optional)</span>
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={10}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 18"
                    className="input-soft w-full rounded-full px-6 py-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              <hr className="border-outline-variant/30" />

              <div className="space-y-4">
                <div className="mb-4">
                  <p className="ml-1 block font-label-md text-label-md text-on-surface">
                    What are you preparing for?
                  </p>
                  <p className="ml-1 font-body-md text-sm text-on-surface-variant">
                    Select all that apply. This helps us tailor your environment.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {EXAM_OPTIONS.map(({ value, label }) => {
                    const active = exams.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setExams((e) =>
                            e.includes(value)
                              ? e.filter((x) => x !== value)
                              : [...e, value]
                          )
                        }
                        className={clsx(
                          "rounded-full px-6 py-3 font-body-md text-body-md transition-all duration-200",
                          active
                            ? "scale-[0.98] border border-primary-container bg-primary-container text-on-primary-container"
                            : "border border-outline-variant bg-white/50 text-on-surface hover:bg-surface-variant"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p role="alert" className="text-center font-body-md text-sm text-error">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={submitStep1}
                disabled={pending}
                className="group relative mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary-container to-primary-container px-8 py-5 font-label-md text-label-md text-on-primary-container shadow-[0_8px_32px_rgba(232,146,109,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,146,109,0.3)] disabled:cursor-wait disabled:opacity-70"
              >
                <span>{pending ? "Creating your space…" : "Continue to your sanctuary"}</span>
                <Icon
                  name="arrow_forward"
                  className="text-[20px] transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
            <p className="text-center font-body-md text-body-md text-on-surface-variant/60">
              Step 1 of 2
            </p>
          </>
        ) : (
          <>
            <header className="space-y-base text-center md:text-left">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
                How is your mind sitting today?
              </h1>
              <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
                Take a deep breath. Let&apos;s gently unpack what you&apos;re
                carrying right now. There are no wrong answers here.
              </p>
            </header>

            <CheckInForm
              submitLabel="Continue finding calm"
              onSaved={() => router.push("/dashboard")}
            />

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mx-auto font-label-md text-label-md text-on-surface-variant underline-offset-4 hover:underline"
            >
              Skip for now
            </button>
            <p className="text-center font-body-md text-body-md text-on-surface-variant/60">
              Step 2 of 2
            </p>
          </>
        )}
      </div>
    </main>
  );
}
