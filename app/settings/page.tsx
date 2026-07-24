import Page from "../components/Page";
import Card from "../components/Card";

export default function SettingsPage() {
  return (
    <Page
      title="Settings"
      description="Manage AppStack preferences and configuration."
    >
      <Card title="Settings">
        <p className="text-sm leading-6 text-slate-400">
          Settings controls will be added in a future phase.
        </p>
      </Card>
    </Page>
  );
}