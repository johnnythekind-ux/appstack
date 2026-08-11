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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthReady(true);
      }
    });

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
    <nav className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-wide transition hover:text-blue-400"
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
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {authReady && (
            <>
              <div className="mx-1 hidden h-6 w-px bg-slate-700 lg:block" />

              {user ? (
                <>
                  <div className="hidden max-w-48 truncate px-2 text-slate-400 xl:block">
                    {user.user_metadata?.full_name || user.email}
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 transition hover:bg-slate-900 hover:text-white"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={`rounded-lg px-3 py-2 transition ${
                    pathname === "/login"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
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