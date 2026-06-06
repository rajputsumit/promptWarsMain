"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { clsx } from "@/lib/clsx";
import { saveMoodCheck } from "@/app/actions";
import {
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  TRIGGER_OPTIONS,
  type Mood,
  type PhysicalSymptom,
  type Trigger,
} from "@/lib/types";

const INTENSITY_LABELS = ["Very low", "Low", "Okay", "Good", "Bright"];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function CheckInForm({
  submitLabel,
  onSaved,
}: {
  submitLabel: string;
  onSaved: () => void;
}) {
  const [intensity, setIntensity] = useState(3);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [symptoms, setSymptoms] = useState<PhysicalSymptom[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [sleep, setSleep] = useState<string>("");
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveMoodCheck({
        intensity,
        moods,
        symptoms,
        triggers,
        sleepHours: sleep === "" ? null : Number(sleep),
        reflection,
      });
      if (res.ok) onSaved();
      else setError(res.error ?? "Something went wrong. Please try again.");
    });
  }

  return (
    <div className="flex flex-col gap-section-gap">
      {/* Energy slider */}
      <section>
        <h2 className="mb-6 flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="wb_sunny" filled className="text-secondary" />
          How&apos;s your energy?
        </h2>
        <div className="glass-card rounded-lg p-6">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            aria-label="Energy level"
            aria-valuetext={INTENSITY_LABELS[intensity - 1]}
            className="zen-range w-full"
          />
          <div className="mt-3 flex justify-between font-label-md text-label-md text-on-surface-variant">
            {INTENSITY_LABELS.map((label, i) => (
              <span
                key={label}
                className={clsx(
                  "transition-colors",
                  i + 1 === intensity && "font-bold text-primary"
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mood chips */}
      <section>
        <h2 className="mb-6 flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="mood" filled className="text-secondary" />
          Current mood
        </h2>
        <div className="flex flex-wrap gap-3">
          {MOOD_OPTIONS.map((mood) => {
            const active = moods.includes(mood);
            return (
              <button
                key={mood}
                type="button"
                aria-pressed={active}
                onClick={() => setMoods((m) => toggle(m, mood))}
                className={clsx(
                  "rounded-full px-6 py-3 font-label-md text-label-md transition-all duration-200",
                  active
                    ? "scale-[0.96] border-2 border-primary/20 bg-primary-container text-on-primary-container shadow-md shadow-primary/10"
                    : "border border-outline-variant/30 bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:shadow-sm"
                )}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </section>

      {/* Physical sensations */}
      <section>
        <h2 className="mb-6 flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="vital_signs" filled className="text-secondary" />
          Physical sensations
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SYMPTOM_OPTIONS.map(({ value, icon }) => {
            const active = symptoms.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setSymptoms((s) => toggle(s, value))}
                className={clsx(
                  "group flex h-32 flex-col items-center justify-center gap-3 rounded-DEFAULT border p-4 shadow-sm backdrop-blur-md transition-all",
                  active
                    ? "scale-[0.97] border-2 border-primary/20 bg-primary-container/90 text-on-primary-container"
                    : "border-white/40 bg-surface-container-low/60 text-on-surface-variant hover:bg-surface-container-high/80"
                )}
              >
                <Icon
                  name={icon}
                  className="text-[32px] transition-transform duration-300 group-hover:scale-110"
                />
                <span className="font-label-md text-label-md text-center">{value}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Triggers */}
      <section>
        <h2 className="mb-6 flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="warning" filled className="text-secondary" />
          What&apos;s weighing on you?
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TRIGGER_OPTIONS.map(({ value, icon, hint, wide }) => {
            const active = triggers.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setTriggers((t) => toggle(t, value))}
                className={clsx(
                  "flex items-start gap-4 rounded-lg border p-5 text-left transition-all",
                  wide && "md:col-span-2",
                  active
                    ? "border-2 border-primary/30 bg-primary-container/20"
                    : "border border-transparent bg-surface-container hover:border-outline-variant/30"
                )}
              >
                <div
                  className={clsx(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                    active ? "bg-primary-container shadow-sm" : "bg-secondary-container/50"
                  )}
                >
                  <Icon name={icon} className="text-on-secondary-container" />
                </div>
                <div>
                  <h3 className="mb-1 font-label-md text-label-md text-on-surface">{value}</h3>
                  <p className="font-body-md text-[14px] text-on-surface-variant">{hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sleep + reflection */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <label
            htmlFor="sleep"
            className="mb-2 ml-1 flex items-center gap-2 font-label-md text-label-md text-on-surface"
          >
            <Icon name="bedtime" className="text-secondary" /> Hours slept
          </label>
          <input
            id="sleep"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            placeholder="e.g. 7"
            className="input-soft w-full rounded-full px-6 py-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="reflection"
            className="mb-2 ml-1 flex items-center gap-2 font-label-md text-label-md text-on-surface"
          >
            <Icon name="edit_note" className="text-secondary" /> A space to vent
            <span className="font-normal text-on-surface-variant/60">(optional)</span>
          </label>
          <textarea
            id="reflection"
            rows={3}
            value={reflection}
            maxLength={2000}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="I'm feeling really stressed about…"
            className="w-full resize-none rounded-lg border-transparent bg-surface-container-highest/50 p-5 font-body-md text-body-md text-on-surface transition-all duration-300 placeholder:text-on-surface-variant/50 focus:border-transparent focus:bg-surface focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </section>

      {error && (
        <p role="alert" className="text-center font-body-md text-sm text-error">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="group mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-label-md text-label-md text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Saving…" : submitLabel}
        <Icon
          name="arrow_forward"
          className="text-[20px] transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}
