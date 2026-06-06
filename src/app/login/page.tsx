import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Icon } from "@/components/Icon";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "Welcome — ZenSpace" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-container-padding py-section-gap">
      <AmbientBackground />

      <div className="relative flex w-full max-w-md flex-col gap-section-gap">
        <div className="relative z-10 space-y-base text-center">
          <span
            className="material-symbols-outlined icon-fill mb-2 text-4xl text-primary"
            aria-hidden
          >
            spa
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
            Welcome to ZenSpace
          </h1>
          <p className="mx-auto max-w-sm font-body-lg text-body-lg text-on-surface-variant">
            Your calm sanctuary for focused study. Track your mood, understand
            your stress, and breathe through exam season.
          </p>
        </div>

        <div className="glass-card-strong relative z-10 flex flex-col gap-6 rounded-xl p-8 md:p-10">
          {searchParams?.error && (
            <p
              role="alert"
              className="rounded-DEFAULT bg-error-container px-4 py-3 text-center font-body-md text-sm text-on-error-container"
            >
              Sign-in didn&apos;t complete. Please try again.
            </p>
          )}

          {isSupabaseConfigured ? (
            <GoogleSignIn />
          ) : (
            <div className="rounded-DEFAULT bg-surface-container px-4 py-4 text-center font-body-md text-sm text-on-surface-variant">
              <Icon name="info" className="mb-1 block text-primary" />
              Supabase isn&apos;t configured yet. Add your keys to{" "}
              <code className="rounded bg-surface-variant px-1">.env.local</code>{" "}
              to enable Google sign-in.
            </div>
          )}

          <p className="text-center font-body-md text-xs text-on-surface-variant/70">
            By continuing you agree to be kind to yourself. We never share your
            reflections — your data is yours alone.
          </p>
        </div>

        <p className="relative z-10 text-center font-body-md text-sm text-on-surface-variant/60">
          In crisis? Call{" "}
          <Link href="tel:14416" className="font-semibold text-primary">
            Tele-MANAS 14416
          </Link>
        </p>
      </div>
    </main>
  );
}
