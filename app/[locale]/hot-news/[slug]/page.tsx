import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHotNewsBySeqId } from "@/lib/api/hotNews";
import { HotNewsDetailGate } from "@/components/hotNews/HotNewsDetailGate";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { resolveContentLocale } from "@/lib/i18n/normalize";
import { parseDetailParam } from "@/lib/utils/slug";
import { Link } from "@/lib/i18n/navigation";

// Real-time content — always fetch fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const seqId = parseDetailParam(params.slug);
  const contentLocale = resolveContentLocale(params.locale);
  const item = await getHotNewsBySeqId(seqId, contentLocale);
  if (!item) return {};
  return { title: item.title };
}

export default async function HotNewsDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  // The route param is `{seqId}-{slug}`; the seqId is the routing key.
  const seqId = parseDetailParam(params.slug);
  const contentLocale = resolveContentLocale(params.locale);
  const item = await getHotNewsBySeqId(seqId, contentLocale);
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
      <HotNewsDetailGate item={item} />
    </div>
  );
}
