"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type ThemePreference = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

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

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreference] =
    useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;
    let mediaQuery: MediaQueryList | null = null;

    async function loadThemePreference() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (!user) {
        const fallback = getSystemTheme();
        applyTheme(fallback);
        setPreference("system");
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
        console.error("Theme preference load error:", error);
      }

      const nextPreference =
        (data?.theme as ThemePreference | undefined) ??
        "system";

      setPreference(nextPreference);
      applyTheme(resolveTheme(nextPreference));
    }

    loadThemePreference();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadThemePreference();
    });

    function handlePreferenceUpdated(event: Event) {
      const customEvent =
        event as CustomEvent<ThemePreference>;

      const nextPreference =
        customEvent.detail ?? "system";

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

      if (mediaQuery) {
        mediaQuery.removeEventListener(
          "change",
          loadThemePreference
        );
      }
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
