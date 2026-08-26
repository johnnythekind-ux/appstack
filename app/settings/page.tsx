"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { User } from "@supabase/supabase-js";

import Page from "../components/Page";
import Card from "../components/Card";
import Button from "../components/Button";
import { supabase } from "../../lib/supabase";

type ThemePreference = "system" | "light" | "dark";

type Profile = {
  id: string;
  display_name: string | null;
};

type UserSettings = {
  user_id: string;
  theme: ThemePreference;
  notifications_enabled: boolean;
  ai_assistance_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiAssistanceEnabled, setAiAssistanceEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  async function loadAccountData(authUser: User) {
    const [profileResult, settingsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", authUser.id)
        .maybeSingle(),
      supabase
        .from("user_settings")
        .select(
          "user_id, theme, notifications_enabled, ai_assistance_enabled, created_at, updated_at"
        )
        .eq("user_id", authUser.id)
        .maybeSingle(),
    ]);

    if (profileResult.error) {
      console.error("Profile load error:", profileResult.error);
      toast.error("Profile information could not be loaded.");
    }

    if (settingsResult.error) {
      console.error("Settings load error:", settingsResult.error);
      toast.error("User preferences could not be loaded.");
    }

    const loadedProfile = profileResult.data ?? null;
    const loadedSettings = settingsResult.data as UserSettings | null;

    setProfile(loadedProfile);
    setDisplayName(loadedProfile?.display_name ?? "");

    setSettings(loadedSettings);
    setTheme(loadedSettings?.theme ?? "system");
    setNotificationsEnabled(loadedSettings?.notifications_enabled ?? true);
    setAiAssistanceEnabled(loadedSettings?.ai_assistance_enabled ?? true);
  }

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (!mounted) return;

  const user =
    session?.user ?? null;

  if (error || !user) {
    toast.error(
      "Account information could not be loaded."
    );

    setUser(null);
    setProfile(null);
    setSettings(null);
    setLoading(false);
    return;
  }

  setUser(user);

  await loadAccountData(user);

  if (mounted) {
    setLoading(false);
  }
}

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setSettings(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      await loadAccountData(nextUser);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const accountCreated = useMemo(
    () =>
      user?.created_at
        ? new Date(user.created_at).toLocaleString()
        : "Not available",
    [user?.created_at]
  );

  const lastSignIn = useMemo(
    () =>
      user?.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleString()
        : "Not available",
    [user?.last_sign_in_at]
  );

  async function saveProfile() {
    if (!user) {
      toast.error("You must be signed in to update your profile.");
      return;
    }

    setSavingProfile(true);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id, display_name")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      toast.error("Profile could not be updated.");
      setSavingProfile(false);
      return;
    }

    setProfile(data);
    setDisplayName(data.display_name ?? "");
    setSavingProfile(false);
    toast.success("Profile updated.");
  }

  async function savePreferences() {
    if (!user) {
      toast.error("You must be signed in to update preferences.");
      return;
    }

    setSavingSettings(true);

    const { data, error } = await supabase
      .from("user_settings")
      .update({
        theme,
        notifications_enabled: notificationsEnabled,
        ai_assistance_enabled: aiAssistanceEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select(
        "user_id, theme, notifications_enabled, ai_assistance_enabled, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Preference update error:", error);
      toast.error("Preferences could not be saved.");
      setSavingSettings(false);
      return;
    }

    setSettings(data as UserSettings);

window.localStorage.setItem(
  "appstack-theme-preference",
  theme
);

window.dispatchEvent(
  new CustomEvent("appstack-theme-preference", {
    detail: theme,
  })
);

    setSavingSettings(false);
    toast.success("Preferences saved.");
  }

  return (
    <Page
      title="Settings"
      description="Manage your AppStack profile, account identity, and persisted user preferences."
    >
      <Card title="Account & Access" className="mt-10">
        <div className="rounded-xl border border-accent bg-accent-soft p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Authenticated Account
          </p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            Your AppStack identity is active.
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted">
            Supabase Auth establishes identity and session state, while AppStack
            stores profile information and user preferences in protected,
            user-scoped application tables.
          </p>
        </div>
      </Card>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Profile
          </p>
          <h2 className="mt-3 text-xl font-bold">Account Information</h2>

          {loading ? (
            <p className="mt-4 text-sm text-muted">
              Loading account information...
            </p>
          ) : user ? (
            <div className="mt-5 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
                  placeholder="Your name"
                />
                <Button
                  onClick={saveProfile}
                  className="mt-3"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </Button>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-muted">
                  {user.email || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  Account Created
                </p>
                <p className="mt-1 text-sm text-muted">{accountCreated}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  Last Sign In
                </p>
                <p className="mt-1 text-sm text-muted">{lastSignIn}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-danger">
              No authenticated account is available.
            </p>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Security
          </p>
          <h2 className="mt-3 text-xl font-bold">Security & Access</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Route protection and authenticated session handling are active.
            Supabase Auth establishes identity, while RLS isolates application
            records to the signed-in user.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm font-semibold text-foreground">
                Protected routes
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-600">Active</p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm font-semibold text-foreground">
                User-scoped workspace data
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-600">
                Active through RLS
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm font-semibold text-foreground">
                Profile & settings ownership
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-600">
                Active through RLS
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm font-semibold text-foreground">
                Multi-factor authentication
              </p>
              <p className="mt-1 text-sm text-subtle">Future capability</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Preferences
          </p>
          <h2 className="mt-3 text-xl font-bold">Workspace Preferences</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            These preferences are persisted in your user-scoped settings record
            and remain separate from authentication identity.
          </p>

          {loading ? (
            <p className="mt-5 text-sm text-muted">
              Loading preferences...
            </p>
          ) : settings ? (
            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Appearance
                </label>
                <select
                  value={theme}
                  onChange={(event) =>
                    setTheme(event.target.value as ThemePreference)
                  }
                  className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
                >
                  <option value="system">Follow system</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface-muted p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Notifications
                  </p>
                  <p className="mt-1 text-sm leading-6 text-subtle">
                    Allow AppStack to surface important workflow and platform
                    notifications.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(event) =>
                    setNotificationsEnabled(event.target.checked)
                  }
                  className="mt-1 h-4 w-4"
                />
              </label>

              <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface-muted p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    AI Assistance
                  </p>
                  <p className="mt-1 text-sm leading-6 text-subtle">
                    Allow advisory AI features to be enabled for this account.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiAssistanceEnabled}
                  onChange={(event) =>
                    setAiAssistanceEnabled(event.target.checked)
                  }
                  className="mt-1 h-4 w-4"
                />
              </label>

              <Button onClick={savePreferences} disabled={savingSettings}>
                {savingSettings ? "Saving Preferences..." : "Save Preferences"}
              </Button>
            </div>
          ) : (
            <p className="mt-5 text-sm text-danger">
              No user settings record is available.
            </p>
          )}
        </Card>
      </section>

      <Card title="How this fits AppStack" className="mt-8">
        <p className="max-w-3xl text-sm leading-6 text-muted">
          Settings is the account-configuration surface layered on top of
          AppStack authentication. Identity remains in Supabase Auth, profile
          data lives in the public profiles table, and application preferences
          live in a separate user_settings table protected by Row Level
          Security.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">1. Identity</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Supabase Auth establishes the signed-in user and persistent
              session.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">2. Profile</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              App-facing profile information is stored separately from the Auth
              schema.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">3. Preferences</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Theme, notifications, and AI-assistance preferences are persisted
              per user.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">4. Ownership</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              RLS ensures profile, settings, workspace, and event records stay
              inside the authenticated user boundary.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Future Configuration Areas" className="mt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-muted p-5">
            <h3 className="font-semibold">Notification Channels</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Add delivery-channel controls, digest behavior, and event-level
              preferences when outbound notifications are implemented.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-5">
            <h3 className="font-semibold">AI Behavior</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Expand beyond the current account-level AI toggle into advisory
              style, recommendation, and automation preferences.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-5">
            <h3 className="font-semibold">Accessibility & Density</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Add layout density, accessibility, and display controls alongside
              persisted theme preferences.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-5">
            <h3 className="font-semibold">Connected Services</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Manage future integrations with third-party services, APIs, and
              external platforms without mixing integration state into profile
              identity.
            </p>
          </div>
        </div>
      </Card>
    </Page>
  );
}
