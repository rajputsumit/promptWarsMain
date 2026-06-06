"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

/**
 * Fetches the personalised insight client-side so the dashboard paints instantly
 * and the (potentially slower) AI call streams in without blocking first render.
 */
export function InsightCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/insight", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (active) setInsight(d.insight ?? null);
      })
      .catch(() => {
        if (active)
          setInsight(
            "Your check-ins are building a clearer picture of what helps you feel steady. Keep showing up gently."
          );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="glass-card animate-fade-up rounded-[1.5rem] p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container">
          <Icon name="psychiatry" filled className="text-on-secondary-container" />
        </div>
        <div className="min-w-0">
          <h3 className="mb-2 font-label-md text-label-md uppercase tracking-widest text-on-surface">
            Personal Insight
          </h3>
          {loading ? (
            <div className="space-y-2" aria-hidden>
              <div className="h-3 w-full animate-pulse rounded-full bg-surface-variant" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-surface-variant" />
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant">{insight}</p>
          )}
        </div>
      </div>
    </div>
  );
}
