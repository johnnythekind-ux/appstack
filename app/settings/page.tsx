import Page from "../components/Page";
import Card from "../components/Card";

export default function SettingsPage() {
  return (
    <Page
      title="Settings"
      description="Manage your AppStack preferences, account configuration, and future platform options."
    >
      <Card
        title="Platform Configuration"
        className="mt-10"
      >
        <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Configuration Center
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Personal settings will become available after authentication.
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            AppStack will centralize user preferences, AI behavior,
            notifications, appearance, security, and account settings in
            one location after user accounts are enabled.
          </p>
        </div>
      </Card>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Profile
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Account Information
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Manage your profile, organization, and account details.
          </p>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Coming after authentication
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Preferences
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Workspace Preferences
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Configure dashboard behavior, default views, notifications,
            and application preferences.
          </p>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Coming in a future phase
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Security
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Security & Access
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Manage passwords, multi-factor authentication, sessions,
            and account security.
          </p>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Requires authentication
          </p>
        </Card>
      </section>

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
              Configure AI assistance, recommendation behavior,
              automation preferences, and intelligence settings.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <h3 className="font-semibold">
              Notifications
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Choose how AppStack communicates important events,
              completed jobs, and platform activity.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <h3 className="font-semibold">
              Appearance
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Customize themes, layout density, and future accessibility
              options.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <h3 className="font-semibold">
              Connected Services
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage future integrations with third-party services,
              APIs, and external platforms.
            </p>
          </div>
        </div>
      </Card>
    </Page>
  );
}