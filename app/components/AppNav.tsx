"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workspace", label: "Workspace" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/deal-analyzer", label: "Deal Analyzer" },
  { href: "/reportforge", label: "ReportForge" },
  { href: "/jobs", label: "Jobs" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setAuthReady(true);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setAuthReady(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (pathname === "/login") {
    return null;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-border bg-surface text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-wide transition hover:text-accent"
        >
          AppStack
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {authReady && (
            <>
              <div className="mx-1 hidden h-6 w-px bg-border-strong lg:block" />

              {user ? (
                <>
                  <div className="hidden max-w-48 truncate px-2 text-subtle xl:block">
                    {user.user_metadata?.full_name ||
                      user.email}
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg border border-border-strong px-3 py-2 text-muted transition hover:bg-surface-muted hover:text-foreground"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg border border-border-strong px-3 py-2 text-muted transition hover:bg-surface-muted hover:text-foreground"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
