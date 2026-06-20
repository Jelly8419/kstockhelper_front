import { Link } from "@/lib/i18n/navigation";
import { getAppTranslations } from "@/lib/i18n/getTranslations";

export const metadata = { title: "Not available - K-Stock Helper" };

/**
 * Region-blocked notice. KR users (no Premium path — see middleware/isKrBlocked)
 * are redirected here when they hit /price-gap, /subscription, or /guide. Static
 * server component; reuses the existing restricted-premium copy.
 */
export default async function RegionBlockedPage() {
  const { t } = await getAppTranslations();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {t("restrictedPremium.title")}
      </h1>
      <p className="text-sm text-muted">{t("restrictedPremium.body")}</p>
      <Link href="/" className="mt-2 text-sm text-brand hover:underline">
        {t("common.backToHome")}
      </Link>
    </div>
  );
}
