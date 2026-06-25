import Link from "next/link";

export default function AppNav() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          AppStack
        </Link>

        <div className="flex gap-4 text-sm text-slate-300">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/workspace">Workspace</Link>
          <Link href="/deal-analyzer">Deal Analyzer</Link>
          <Link href="/reportforge">ReportForge</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/billing">Billing</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </div>
    </nav>
  );
}