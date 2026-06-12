import type { Metadata } from "next";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { GuideClient } from "@/components/guide/GuideClient";
import { getGuideContent } from "@/components/guide/guideContent";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getAppTranslations();
  const title = getGuideContent(locale).page.title;
  return { title: `${title} | K-Stock Helper` };
}

export default function GuidePage() {
  return <GuideClient />;
}
