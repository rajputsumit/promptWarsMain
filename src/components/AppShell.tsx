"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { AmbientBackground } from "@/components/AmbientBackground";
import { clsx } from "@/lib/clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/check-in", label: "Daily Check-in", icon: "favorite" },
  { href: "/companion", label: "Companion", icon: "forum" },
  { href: "/library", label: "Support Library", icon: "self_care" },
];

const TOP_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/library", label: "Support Library" },
];

export function AppShell({
  children,
  name,
  avatarUrl,
}: {
  children: React.ReactNode;
  name: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <AmbientBackground />

      {/* Top app bar */}
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/70 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-container-padding py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-headline-md text-headline-md tracking-tight text-primary"
            >
              ZenSpace
            </Link>
            <nav className="hidden gap-6 md:flex">
              {TOP_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "pb-1 transition-colors duration-300 hover:text-primary-container",
                    isActive(item.href)
                      ? "border-b-2 border-primary font-bold text-primary"
                      : "font-medium text-on-surface-variant"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/companion"
              aria-label="Talk to your companion"
              className="rounded-full p-2 text-on-surface-variant transition-all duration-300 hover:scale-95 hover:text-primary-container active:scale-90"
            >
              <Icon name="forum" />
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                aria-label="Sign out"
                className="rounded-full p-2 text-on-surface-variant transition-all duration-300 hover:scale-95 hover:text-primary-container active:scale-90"
              >
                <Icon name="logout" />
              </button>
            </form>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant/50 bg-surface-container">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={`${name}'s avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {/* Side nav (desktop) */}
        <aside className="sticky top-[80px] hidden h-[calc(100vh-80px)] w-64 flex-col gap-base rounded-r-lg bg-surface-container-low/80 p-gutter shadow-md backdrop-blur-xl lg:flex">
          <div className="mb-8 px-4 pt-4">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Your sanctuary
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A calm place to return to
            </p>
          </div>
          <nav className="flex flex-grow flex-col gap-2" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-3 rounded-full px-4 py-3 transition-all duration-300",
                  isActive(item.href)
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:translate-x-1 hover:bg-surface-variant/50"
                )}
              >
                <Icon name={item.icon} filled={isActive(item.href)} />
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mb-4 mt-auto">
            <Link
              href="/check-in"
              className="block w-full rounded-full bg-gradient-to-r from-primary to-primary-container px-4 py-3 text-center font-label-md text-label-md text-on-primary shadow-sm transition-opacity hover:opacity-90"
            >
              Start Daily Practice
            </Link>
          </div>
        </aside>

        <main className="w-full flex-grow">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="sticky bottom-0 z-50 flex justify-around border-t border-outline-variant/30 bg-surface/80 px-2 py-2 backdrop-blur-md lg:hidden"
        aria-label="Primary mobile"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 rounded-DEFAULT py-1 transition-colors",
              isActive(item.href) ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <Icon name={item.icon} filled={isActive(item.href)} className="text-[22px]" />
            <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-section-gap flex w-full flex-col items-center border-t border-surface-container-low bg-surface-container-lowest px-container-padding py-section-gap text-center">
      <div className="mb-4 font-headline-md text-headline-md text-primary">ZenSpace</div>
      <p className="mb-6 font-body-md text-body-md italic text-secondary">
        &ldquo;Breathe deeply. You are doing enough.&rdquo;
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <Link href="/library" className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary">
          Support Library
        </Link>
        <Link href="/companion" className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary">
          Companion
        </Link>
        <a
          href="tel:14416"
          className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
        >
          Emergency: Tele-MANAS 14416
        </a>
      </div>
    </footer>
  );
}
