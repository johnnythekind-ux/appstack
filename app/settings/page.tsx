"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { User } from "@supabase/supabase-js";

import Page from "../components/Page";
import Card from "../components/Card";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (error || !user) {
        toast.error("Account information could not be loaded.");
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const accountCreated = user?.created_at
    ? new Date(user.created_at).toLocaleString()
    : "Not available";

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : "Not available";

  return (
    <Page
      title="Settings"
      description="Manage authenticated account information and review the configuration areas that will build on AppStack identity."
    >
      <Card
        title="Account & Access"
        className="mt-10"
      >
        <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Authenticated Account
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Your AppStack identity is active.
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            Authentication now establishes the user boundary for protected
            routes, session persistence, and user-scoped workspace data.
            Settings can build on that identity instead of presenting account
            configuration as a future placeholder.
          </p>
        </div>
      </Card>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Profile
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Account Information
          </h2>

          {loading ? (
            <p className="mt-4 text-sm text-slate-400">
              Loading account information...
            </p>
          ) : user ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-slate-200">
                  {user.email || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User ID
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-400">
                  {user.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account Created
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {accountCreated}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Last Sign In
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {lastSignIn}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-rose-300">
              No authenticated account is available.
            </p>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Security
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Security & Access
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Route protection and authenticated session handling are active.
            Supabase Auth establishes identity, while RLS restricts workspace
            records to the signed-in user.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-200">
                Protected routes
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Active
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-200">
                User-scoped workspace data
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Active through RLS
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-200">
                Multi-factor authentication
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Future capability
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Preferences
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Workspace Preferences
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Identity is now established, but application preferences have not
            yet been persisted as user settings.
          </p>

          <div className="mt-5 rounded-lg border border-slate-800 p-4">
            <p className="text-sm font-semibold text-slate-200">
              Planned preference areas
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Dashboard defaults, notifications, AI behavior, appearance, and
              connected-service preferences will be added after the account
              settings data model is defined.
            </p>
          </div>
        </Card>
      </section>

      <Card
        title="How this fits AppStack"
        className="mt-8"
      >
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Settings is the account-configuration surface that sits on top of
          AppStack authentication. It now reflects real identity and security
          state while clearly separating implemented account behavior from
          future preference and integration work.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              1. Identity
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Supabase Auth establishes the signed-in user and persistent session.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              2. Route protection
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Protected application routes require a valid authenticated session.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              3. Data ownership
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Workspace records are user-owned and isolated with Row Level Security.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-sm font-semibold text-white">
              4. Configuration layer
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Future preferences, security options, and integrations can build on the same identity boundary.
            </p>
          </div>
        </div>
      </Card>

      <Card
        title="Future Configuration Areas"
        className="mt-8"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 p-5">
            <h3 className="font-semibold">
              AI Preferences
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Configure AI assistance, recommendation behavior, automation preferences,
              and intelligence settings.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <h3 className="font-semibold">
              Notifications
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Choose how AppStack communicates important events, completed jobs,
              and platform activity.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <h3 className="font-semibold">
              Appearance
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Customize themes, layout density, and future accessibility options.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <h3 className="font-semibold">
              Connected Services
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage future integrations with third-party services, APIs,
              and external platforms.
            </p>
          </div>
        </div>
      </Card>
    </Page>
  );
}
