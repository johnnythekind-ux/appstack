"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase";

type ThemePreference =
  | "system"
  | "light"
  | "dark";

type ResolvedTheme =
  | "light"
  | "dark";

const THEME_STORAGE_KEY =
  "appstack-theme-preference";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
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

function applyTheme(
  theme: ResolvedTheme
) {
  document.documentElement.dataset.theme =
    theme;

  document.documentElement.style.colorScheme =
    theme;
}

function isThemePreference(
  value: string | null
): value is ThemePreference {
  return (
    value === "system" ||
    value === "light" ||
    value === "dark"
  );
}

function getCachedPreference():
  ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const cachedPreference =
    window.localStorage.getItem(
      THEME_STORAGE_KEY
    );

  return isThemePreference(
    cachedPreference
  )
    ? cachedPreference
    : "system";
}

function cachePreference(
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
  const [
    preference,
    setPreference,
  ] = useState<ThemePreference>(
    () => getCachedPreference()
  );

  useEffect(() => {
    let mounted = true;

    async function loadThemePreference(
      user: User | null
    ) {
      if (!mounted) {
        return;
      }

      if (!user) {
        const cachedPreference =
          getCachedPreference();

        setPreference(
          cachedPreference
        );

        applyTheme(
          resolveTheme(
            cachedPreference
          )
        );

        return;
      }

      const {
        data,
        error,
      } = await supabase
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
  {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  }
);

        const cachedPreference =
          getCachedPreference();

        setPreference(
          cachedPreference
        );

        applyTheme(
          resolveTheme(
            cachedPreference
          )
        );

        return;
      }

      const nextPreference =
        isThemePreference(
          data?.theme
        )
          ? data.theme
          : "system";

      cachePreference(
        nextPreference
      );

      setPreference(
        nextPreference
      );

      applyTheme(
        resolveTheme(
          nextPreference
        )
      );
    }

    async function initializeTheme() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      await loadThemePreference(
        session?.user ?? null
      );
    }

    initializeTheme();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          void loadThemePreference(
            session?.user ?? null
          );
        }
      );

    const handlePreferenceUpdated:
      EventListener = (event) => {
        const customEvent =
          event as CustomEvent<ThemePreference>;

        const nextPreference =
          isThemePreference(
            customEvent.detail
          )
            ? customEvent.detail
            : "system";

        cachePreference(
          nextPreference
        );

        setPreference(
          nextPreference
        );

        applyTheme(
          resolveTheme(
            nextPreference
          )
        );
      };

    window.addEventListener(
      "appstack-theme-preference",
      handlePreferenceUpdated
    );

    return () => {
      mounted = false;

      subscription.unsubscribe();

      window.removeEventListener(
        "appstack-theme-preference",
        handlePreferenceUpdated
      );
    };
  }, []);

  useEffect(() => {
    if (
      preference !== "system"
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const applySystemTheme = () => {
      applyTheme(
        getSystemTheme()
      );
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