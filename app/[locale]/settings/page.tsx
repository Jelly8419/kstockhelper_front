import { SettingsClient } from "@/components/settings/SettingsClient";
import { getAppTranslations } from "@/lib/i18n/getTranslations";

export const metadata = { title: "Settings - K-Stock Helper" };

export default async function SettingsPage() {
  const { t } = await getAppTranslations();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        {t("settings.heading")}
      </h1>
      <SettingsClient />
    </div>
  );
}
