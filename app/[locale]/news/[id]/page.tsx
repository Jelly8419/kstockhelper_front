import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/api/news";
import { NewsDetailGate } from "@/components/news/NewsDetailGate";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { resolveContentLocale } from "@/lib/i18n/normalize";
import { localizedAlternates } from "@/lib/i18n/seo";
import { Link } from "@/lib/i18n/navigation";

// Real-time content — always fetch fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  return {
    alternates: localizedAlternates(`/news/${params.id}`, params.locale),
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const contentLocale = resolveContentLocale(params.locale);
  const item = await getNewsById(params.id, contentLocale);
  if (!item) notFound();

  const { t } = await getAppTranslations();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        {t("common.back")}
      </Link>
      <NewsDetailGate item={item} />
    </div>
  );
}
