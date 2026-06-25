import Link from "next/link";
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold mb-4">
          AppStack
        </h1>

        <p className="text-slate-400 text-xl mb-12">
          Modular SaaS Platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <Link href="/deal-analyzer">
  <div className="border border-slate-800 rounded-xl p-6 hover:border-slate-500 transition">
    <h2 className="text-xl font-semibold mb-2">
      Deal Analyzer
    </h2>
    <p className="text-slate-400">
      Analyze investment opportunities.
    </p>
  </div>
</Link>

          <Link href="/reportforge">
  <div className="border border-slate-800 rounded-xl p-6 hover:border-slate-500 transition">
    <h2 className="text-xl font-semibold mb-2">
      ReportForge
    </h2>
    <p className="text-slate-400">
      Generate investor reports.
    </p>
  </div>
</Link>

          <Link href="/jobs">
  <div className="border border-slate-800 rounded-xl p-6 hover:border-slate-500 transition">
    <h2 className="text-xl font-semibold mb-2">
      QueuePilot
    </h2>
    <p className="text-slate-400">
      Async processing engine.
    </p>
  </div>
</Link>

          <Link href="/workspace">
  <div className="border border-slate-800 rounded-xl p-6 hover:border-slate-500 transition">
    <h2 className="text-xl font-semibold mb-2">
      Workspace
    </h2>
    <p className="text-slate-400">
      Shared storage layer.
    </p>
  </div>
</Link>

          <Link href="/billing">
  <div className="border border-slate-800 rounded-xl p-6 hover:border-slate-500 transition">
    <h2 className="text-xl font-semibold mb-2">
      Billing
    </h2>
    <p className="text-slate-400">
      Subscription management.
    </p>
  </div>
</Link>

        </div>
      </div>
    </main>
  );
}