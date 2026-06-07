import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = { title: "Settings - K-Stock Helper" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-foreground">Settings</h1>
      <SettingsClient />
    </div>
  );
}
