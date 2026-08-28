"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type ThemePreference = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "appstack-theme-preference";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(
  preference: ThemePreference
): ResolvedTheme {
  return preference === "system"
    ? getSystemTheme()
    : preference;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(
    THEME_STORAGE_KEY
  );

  if (
    stored === "light" ||
    stored === "dark" ||
    stored === "system"
  ) {
    return stored;
  }

  return "system";
}

function storePreference(
  preference: ThemePreference
) {
  window.localStorage.setItem(
    THEME_STORAGE_KEY,
    preference
  );
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreference] =
    useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;

    async function loadThemePreference() {
      const storedPreference =
        getStoredPreference();

      // Apply the locally remembered preference immediately.
      setPreference(storedPreference);
      applyTheme(resolveTheme(storedPreference));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      const user = session?.user ?? null;

      // Signed-out users keep the most recently selected theme.
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("theme")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Theme preference load error:",
          error
        );
        return;
      }

      const nextPreference =
        (data?.theme as ThemePreference | undefined) ??
        storedPreference;

      storePreference(nextPreference);
      setPreference(nextPreference);
      applyTheme(resolveTheme(nextPreference));
    }

    loadThemePreference();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const storedPreference =
          getStoredPreference();

        // If the user just signed out, preserve the
        // theme that was already selected.
        if (!session?.user) {
          setPreference(storedPreference);
          applyTheme(
            resolveTheme(storedPreference)
          );
          return;
        }

        loadThemePreference();
      }
    );

    function handlePreferenceUpdated(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<ThemePreference>;

      const nextPreference =
        customEvent.detail ?? "system";

      storePreference(nextPreference);
      setPreference(nextPreference);
      applyTheme(resolveTheme(nextPreference));
    }

    window.addEventListener(
      "appstack-theme-preference",
      handlePreferenceUpdated as EventListener
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();

      window.removeEventListener(
        "appstack-theme-preference",
        handlePreferenceUpdated as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (preference !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const applySystemTheme = () => {
      applyTheme(getSystemTheme());
    };

    mediaQuery.addEventListener(
      "change",
      applySystemTheme
    );

    applySystemTheme();

    return () => {
      mediaQuery.removeEventListener(
        "change",
        applySystemTheme
      );
    };
  }, [preference]);

  return <>{children}</>;
}