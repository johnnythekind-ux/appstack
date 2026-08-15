"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] =
    useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted && session) {
        router.replace("/dashboard");
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session) {
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Account created. Check your email to confirm your account."
      );

      setMode("login");
      return;
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in successfully.");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <section className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            AppStack
          </p>

          <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-tight">
            Modern SaaS architecture, demonstrated through one connected
            application.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Sign in to continue into a protected workspace where identity,
            user-scoped data, deterministic workflows, reporting, execution,
            and platform intelligence work together as one system.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">
            {[
              [
                "Protected access",
                "Authenticated sessions and guarded application routes.",
              ],
              [
                "User-scoped data",
                "Workspace records are isolated with Supabase RLS.",
              ],
              [
                "Connected workflow",
                "Analysis, reporting, jobs, and intelligence share persisted state.",
              ],
              [
                "SaaS foundation",
                "Identity now anchors future settings, billing, and entitlements.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-surface-muted p-5"
              >
                <p className="text-sm font-semibold text-foreground">
                  {title}
                </p>

                <p className="mt-2 text-sm leading-6 text-muted">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/10 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {mode === "login" ? "Secure access" : "Create account"}
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {mode === "login"
                ? "Welcome back"
                : "Create your AppStack account"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted">
              {mode === "login"
                ? "Sign in to continue into your protected AppStack workspace."
                : "Create an account to establish identity, protected access, and user-scoped workspace data."}
            </p>

            <div className="mt-8">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                className="mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? mode === "login"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() =>
                setMode((current) =>
                  current === "login"
                    ? "signup"
                    : "login"
                )
              }
              className="mt-5 w-full text-sm font-medium text-muted transition hover:text-foreground"
            >
              {mode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
