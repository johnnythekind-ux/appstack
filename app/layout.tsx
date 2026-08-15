import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import AppNav from "./components/AppNav";
import ThemeProvider from "./components/ThemeProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AppStack",
    template: "%s | AppStack",
  },
  description:
    "A modern SaaS architecture demonstration built around authenticated, user-scoped workflows, reporting, jobs, and platform intelligence.",
};

/*
 * Runs before React hydrates.
 *
 * The user's last-known theme preference is cached in localStorage so the
 * browser can apply the correct theme before the first visible paint.
 *
 * Supabase remains the authoritative persisted account preference.
 * ThemeProvider reconciles this cached value with Supabase after hydration.
 */
const themeBootstrapScript = `
(function () {
  try {
    var preference = localStorage.getItem("appstack-theme-preference");

    if (
      preference !== "light" &&
      preference !== "dark" &&
      preference !== "system"
    ) {
      preference = "system";
    }

    var resolvedTheme = preference;

    if (preference === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch (error) {
    var fallbackTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    document.documentElement.dataset.theme = fallbackTheme;
    document.documentElement.style.colorScheme = fallbackTheme;
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
      </head>

      <body className="min-h-full">
        <ThemeProvider>
          <AppNav />
          <Toaster position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}