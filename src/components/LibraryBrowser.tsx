"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { MeditationPlayer } from "@/components/MeditationPlayer";
import { clsx } from "@/lib/clsx";
import {
  LIBRARY_CATEGORIES,
  LIBRARY_ITEMS,
  type LibraryCategory,
  type LibraryItem,
} from "@/lib/content";

export function LibraryBrowser({ initialOpenId }: { initialOpenId?: string }) {
  const [category, setCategory] = useState<LibraryCategory>("Guided Meditation");
  const [active, setActive] = useState<LibraryItem | null>(
    initialOpenId
      ? LIBRARY_ITEMS.find((i) => i.id === initialOpenId) ?? null
      : null
  );

  const items = LIBRARY_ITEMS.filter((i) => i.category === category);
  const featured = items.find((i) => i.featured) ?? items[0];
  const rest = items.filter((i) => i.id !== featured?.id);

  function open(item: LibraryItem) {
    if (item.meditationTheme) setActive(item);
  }

  return (
    <div className="flex">
      {/* Category rail (desktop) */}
      <aside className="sticky top-[80px] hidden h-[calc(100vh-80px)] w-60 shrink-0 flex-col gap-2 p-gutter lg:flex">
        <div className="mb-6 px-2 pt-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Categories</h2>
        </div>
        {LIBRARY_CATEGORIES.map(({ value, icon }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            aria-pressed={category === value}
            className={clsx(
              "flex items-center gap-3 rounded-full px-4 py-3 text-left font-label-md text-label-md transition-all duration-300",
              category === value
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:translate-x-1 hover:bg-surface-variant/50"
            )}
          >
            <Icon name={icon} filled={category === value} />
            {value}
          </button>
        ))}
      </aside>

      <div className="min-w-0 flex-1 px-container-padding py-8 md:py-12">
        <header className="mb-section-gap max-w-2xl">
          <h1 className="mb-4 font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
            Find your center.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Audio guides and exercises designed to reduce academic anxiety and
            restore focus.
          </p>
        </header>

        {/* Mobile category chips */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2 lg:hidden">
          {LIBRARY_CATEGORIES.map(({ value }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={clsx(
                "whitespace-nowrap rounded-full px-5 py-2 font-label-md text-label-md transition-colors",
                category === value
                  ? "bg-primary-container text-on-primary-container shadow-sm"
                  : "border border-outline-variant/20 bg-surface-container text-on-surface-variant"
              )}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-6 md:grid-cols-12">
          {/* Featured */}
          {featured && (
            <article className="group relative col-span-1 flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[2rem] border border-surface-container-highest/50 bg-gradient-to-br from-primary/80 to-secondary/70 shadow-[0_8px_32px_rgba(232,146,109,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(232,146,109,0.15)] md:col-span-8">
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent" />
              <div className="relative z-10 flex flex-col gap-4 p-8">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-primary/30 bg-primary/20 px-3 py-1 font-label-md text-[12px] uppercase tracking-wider text-primary-fixed backdrop-blur-md">
                    {featured.tag}
                  </span>
                  <span className="flex items-center gap-1 font-body-md text-sm text-surface-bright/90">
                    <Icon name="schedule" className="text-[16px]" /> {featured.durationLabel}
                  </span>
                </div>
                <h3 className="mt-2 font-headline-md text-headline-md text-surface-bright">
                  {featured.title}
                </h3>
                <p className="max-w-lg font-body-md text-surface-variant">
                  {featured.description}
                </p>
                <button
                  onClick={() => open(featured)}
                  aria-label={`Start ${featured.title}`}
                  className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(232,146,109,0.4)] transition-transform hover:scale-105"
                >
                  <Icon name="play_arrow" filled className="ml-1 text-3xl" />
                </button>
              </div>
            </article>
          )}

          {rest.map((item, i) => (
            <article
              key={item.id}
              className={clsx(
                "group flex flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-surface-container-low/80 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                i === 0 ? "md:col-span-4" : "md:col-span-6"
              )}
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-secondary-fixed/40 to-primary-fixed/20">
                <Icon
                  name={item.icon ?? "self_care"}
                  className="text-[64px] text-primary/40 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <span className="w-max rounded-full bg-primary/10 px-3 py-1 font-label-md text-[12px] uppercase tracking-wider text-primary">
                  {item.tag}
                </span>
                <h3 className="font-headline-md text-[20px] leading-tight text-on-surface">
                  {item.title}
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-medium text-sm text-on-surface-variant">
                    {item.durationLabel}
                  </span>
                  {item.meditationTheme ? (
                    <button
                      onClick={() => open(item)}
                      aria-label={`Start ${item.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-surface text-primary shadow-sm transition-colors hover:bg-primary-container hover:text-on-primary-container"
                    >
                      <Icon name="play_arrow" filled />
                    </button>
                  ) : (
                    <Icon name="menu_book" className="text-primary/40" />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {active && active.meditationTheme && (
        <MeditationPlayer
          theme={active.meditationTheme}
          minutes={active.meditationMinutes ?? 5}
          title={active.title}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
