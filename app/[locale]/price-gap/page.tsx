import type { Metadata } from "next";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { PriceGapGate } from "@/components/priceGap/PriceGapGate";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAppTranslations();
  return { title: `${t("priceGap.title")} | K-Stock Helper` };
}

export default function PriceGapPage() {
  return (
    <main className="mx-auto w-full max-w-container px-4 py-6 sm:px-6">
      <PriceGapGate />
    </main>
  );
}
