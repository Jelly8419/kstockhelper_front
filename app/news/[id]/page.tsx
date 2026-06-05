import { notFound } from "next/navigation";
import Link from "next/link";
import { getMockNewsById } from "@/lib/mock/newsData";
import { NewsDetailGate } from "@/components/news/NewsDetailGate";

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const item = getMockNewsById(params.id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← Back
      </Link>
      <NewsDetailGate item={item} />
    </div>
  );
}
