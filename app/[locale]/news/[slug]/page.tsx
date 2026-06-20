import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsBySeqId } from "@/lib/api/news";
import { NewsDetailGate } from "@/components/news/NewsDetailGate";
import { NewsJsonLd } from "@/components/news/NewsJsonLd";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { resolveContentLocale } from "@/lib/i18n/normalize";
import { buildDetailMetadata } from "@/lib/seo/detailMeta";
import { buildDetailPath, parseDetailParam } from "@/lib/utils/slug";
import { redirect, Link } from "@/lib/i18n/navigation";

// Real-time content — always fetch fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const seqId = parseDetailParam(params.slug);
  const contentLocale = resolveContentLocale(params.locale);
  const item = await getNewsBySeqId(seqId, contentLocale);
  if (!item || item.category !== "news") return {};

  const { t } = await getAppTranslations();
  return buildDetailMetadata(item, params.locale, t);
}

export default async function NewsDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  // The route param is `{seqId}-{slug}`; the seqId is the routing key (slug decorative).
  const seqId = parseDetailParam(params.slug);
  const contentLocale = resolveContentLocale(params.locale);
  const item = await getNewsBySeqId(seqId, contentLocale);
  if (!item) notFound();
  // A disclosure seqId under /news/ (or a mistyped path): redirect to the correct
  // segment (PRD §11) instead of 404. `redirect` keeps the active locale prefix.
  if (item.category !== "news") {
    redirect({
      href: buildDetailPath(item.category, item.seqId, item.slug, item.title),
      locale: params.locale,
    });
  }

  const { t } = await getAppTranslations();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        {t("common.back")}
      </Link>
      <NewsJsonLd item={item} locale={params.locale} />
      <NewsDetailGate item={item} />
    </div>
  );
}
