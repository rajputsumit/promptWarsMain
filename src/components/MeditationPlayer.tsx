"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { clsx } from "@/lib/clsx";

interface MeditationScript {
  title: string;
  intro: string;
  steps: { label: string; text: string; seconds: number }[];
  outro: string;
}

/**
 * A calm, full-screen guided session. Pulls an AI-authored (or offline) script,
 * then walks the user through it step-by-step with a slow breathing animation
 * and a gentle auto-advancing timer that can be paused at any time.
 */
export function MeditationPlayer({
  theme,
  minutes,
  title,
  onClose,
}: {
  theme: string;
  minutes: number;
  title: string;
  onClose: () => void;
}) {
  const [script, setScript] = useState<MeditationScript | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(-1); // -1 = intro, steps.length = outro
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/meditation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme, minutes }),
    })
      .then((r) => r.json())
      .then((d) => active && setScript(d.script))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [theme, minutes]);

  // Close on Escape — keyboard accessibility for the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Step countdown.
  useEffect(() => {
    if (!playing || index < 0 || !script || index >= script.steps.length) return;
    timer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setIndex((i) => i + 1);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, index, script]);

  // Seed each step's duration.
  useEffect(() => {
    if (script && index >= 0 && index < script.steps.length) {
      setRemaining(script.steps[index].seconds);
    }
  }, [index, script]);

  function start() {
    setIndex(0);
    setPlaying(true);
  }

  const isIntro = index < 0;
  const isOutro = script ? index >= script.steps.length : false;
  const current = script && !isIntro && !isOutro ? script.steps[index] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Guided session: ${title}`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface/95 p-container-padding backdrop-blur-xl"
    >
      <button
        onClick={onClose}
        aria-label="Close session"
        className="absolute right-6 top-6 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
      >
        <Icon name="close" />
      </button>

      {/* Breathing orb */}
      <div className="relative mb-10 flex h-56 w-56 items-center justify-center">
        <div
          className={clsx(
            "absolute h-full w-full rounded-full bg-gradient-to-br from-primary-fixed to-secondary-fixed opacity-60 blur-xl",
            playing && !isOutro && "animate-breathe-pulse"
          )}
        />
        <div
          className={clsx(
            "absolute h-40 w-40 rounded-full bg-primary-container/40",
            playing && !isOutro && "animate-breathe-pulse"
          )}
          style={{ animationDelay: "-1s" }}
        />
        <div className="z-10 text-center">
          {current ? (
            <>
              <p className="font-label-md text-label-md uppercase tracking-widest text-primary">
                {current.label}
              </p>
              <p className="font-headline-lg text-[40px] text-on-surface">{remaining}</p>
            </>
          ) : (
            <Icon name="self_care" filled className="text-5xl text-primary" />
          )}
        </div>
      </div>

      {/* Text */}
      <div className="max-w-md text-center">
        <h2 className="mb-4 font-headline-md text-headline-md text-on-surface">
          {script?.title ?? title}
        </h2>
        {loading ? (
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Preparing a calm space for you…
          </p>
        ) : isIntro ? (
          <p className="font-body-lg text-body-lg text-on-surface-variant">{script?.intro}</p>
        ) : isOutro ? (
          <p className="font-body-lg text-body-lg text-on-surface-variant">{script?.outro}</p>
        ) : (
          <p className="font-body-lg text-body-lg text-on-surface-variant">{current?.text}</p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center gap-4">
        {!loading && isIntro && (
          <button
            onClick={start}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-label-md text-label-md text-on-primary shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            <Icon name="play_arrow" filled /> Begin
          </button>
        )}
        {!isIntro && !isOutro && (
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Resume"}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-105"
          >
            <Icon name={playing ? "pause" : "play_arrow"} filled className="text-3xl" />
          </button>
        )}
        {isOutro && (
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-label-md text-label-md text-on-primary shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            <Icon name="check" /> Done
          </button>
        )}
      </div>

      {script && !isIntro && (
        <p className="mt-6 font-label-md text-label-md text-on-surface-variant/60">
          {Math.min(index + 1, script.steps.length)} / {script.steps.length}
        </p>
      )}
    </div>
  );
}
