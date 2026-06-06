import Link from "next/link";
import { Icon } from "@/components/Icon";
import { WellnessGauge } from "@/components/WellnessGauge";
import { InsightCard } from "@/components/InsightCard";
import { getDashboardData, firstName } from "@/lib/data";
import { computeWellness, moodTrend } from "@/lib/wellness";
import { clsx } from "@/lib/clsx";

export const metadata = { title: "Dashboard — ZenSpace" };

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const METRICS = [
  { key: "focus", label: "Focus & Clarity", icon: "visibility", color: "primary" },
  { key: "emotionalBalance", label: "Emotional Balance", icon: "balance", color: "secondary" },
  { key: "sleepQuality", label: "Sleep Quality", icon: "bedtime", color: "tertiary" },
  { key: "resilience", label: "Resilience", icon: "eco", color: "outline" },
] as const;

const BAR_COLOR: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  outline: "bg-outline",
};
const ICON_COLOR: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  outline: "text-outline",
};

export default async function DashboardPage() {
  const { profile, logs } = await getDashboardData();
  const snapshot = computeWellness(logs);
  const trend = moodTrend(logs);
  const name = firstName(profile);
  const hasData = logs.length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-section-gap px-container-padding py-section-gap">
      {/* Greeting */}
      <section className="mb-4 flex animate-fade-up flex-col items-center text-center sm:items-start sm:text-left">
        <h1 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile capitalize text-on-surface md:font-headline-lg md:text-headline-lg">
          {greeting()}, {name}.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Take a deep breath. Today is a fresh start.
        </p>
      </section>

      {!hasData && (
        <Link
          href="/check-in"
          className="ambient-glow flex animate-fade-up items-center justify-between gap-4 rounded-lg bg-gradient-to-r from-secondary-container to-primary-container p-6 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <h2 className="font-headline-md text-headline-md text-on-primary-container">
              Let&apos;s begin with a check-in
            </h2>
            <p className="font-body-md text-body-md text-on-primary-container/80">
              Log how you feel and your dashboard will come alive.
            </p>
          </div>
          <Icon name="arrow_forward" className="text-on-primary-container" />
        </Link>
      )}

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        {/* Score */}
        <div className="ambient-glow glass-card relative flex animate-fade-up flex-col items-center justify-center overflow-hidden rounded-[2rem] p-8 md:col-span-5">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-container/10 blur-xl" />
          <h2 className="mb-8 text-center font-headline-md text-headline-md text-on-surface">
            Overall Wellness
          </h2>
          <WellnessGauge score={snapshot.score} label={snapshot.label} />
          <p className="px-4 text-center font-body-md text-body-md text-on-surface-variant">
            {snapshot.summary}
          </p>
          {hasData && (
            <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 font-label-md text-xs text-on-surface-variant">
              <Icon
                name={trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "trending_flat"}
                className="text-[16px]"
              />
              {trend === "up" ? "Trending brighter" : trend === "down" ? "Be extra gentle" : "Holding steady"}
            </span>
          )}
        </div>

        {/* Insight + breakdown */}
        <div className="flex flex-col gap-gutter md:col-span-7">
          <InsightCard />

          <div className="grid flex-grow grid-cols-2 gap-gutter">
            {METRICS.map((m) => {
              const value = snapshot.breakdown[m.key];
              return (
                <div
                  key={m.key}
                  className="glass-card flex animate-fade-up flex-col justify-between rounded-[1.5rem] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Icon name={m.icon} className={ICON_COLOR[m.color]} />
                    <span className="font-label-md text-label-md text-on-surface">
                      {value}/100
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-label-md text-label-md text-on-surface">
                      {m.label}
                    </h3>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                      <div
                        className={clsx("h-full rounded-full transition-all duration-1000", BAR_COLOR[m.color])}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily practice */}
      <section className="mt-12 animate-fade-up">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Your Daily Practice</h2>
          <Link href="/library" className="font-label-md text-label-md text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2">
          <PracticeCard
            href="/library/morning-grounding"
            duration="10 Min"
            title="Morning Grounding"
            gradient="from-primary-fixed/60 to-secondary-fixed/40"
          />
          <PracticeCard
            href="/library/box-breathing"
            duration="5 Min"
            title="Box Breathing"
            gradient="from-secondary-fixed/50 to-tertiary-fixed/40"
          />
        </div>
      </section>
    </div>
  );
}

function PracticeCard({
  href,
  duration,
  title,
  gradient,
}: {
  href: string;
  duration: string;
  title: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="group relative h-48 cursor-pointer overflow-hidden rounded-[2rem] shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <div className={clsx("absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105", gradient)} />
      <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/30 to-transparent" />
      <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-6">
        <div>
          <span className="mb-2 inline-block rounded-full bg-surface/60 px-3 py-1 font-label-md text-xs text-on-surface backdrop-blur-md">
            {duration}
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition-transform duration-300 group-hover:scale-110">
          <Icon name="play_arrow" filled />
        </div>
      </div>
    </Link>
  );
}
