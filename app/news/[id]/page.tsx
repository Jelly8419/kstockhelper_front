import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsById } from "@/lib/api/news";
import { NewsDetailGate } from "@/components/news/NewsDetailGate";
import { getTranslations } from "@/lib/i18n/getTranslations";

// Real-time content — always fetch fresh.
export const dynamic = "force-dynamic";

export default async function NewsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getNewsById(params.id);
  if (!item) notFound();

  const { t } = getTranslations();

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
