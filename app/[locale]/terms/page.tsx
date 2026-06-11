import type { Metadata } from "next";
import { LegalContent } from "@/components/legal/LegalContent";
import { TERMS_OF_SERVICE } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of KstockHelper.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">
        {TERMS_OF_SERVICE.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Last Updated: {TERMS_OF_SERVICE.lastUpdated}
      </p>
      <div className="mt-8">
        <LegalContent document={TERMS_OF_SERVICE} />
      </div>
    </div>
  );
}
