import type { Metadata } from "next";
import { LegalContent } from "@/components/legal/LegalContent";
import { PRIVACY_POLICY } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How KstockHelper collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">
        {PRIVACY_POLICY.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Last Updated: {PRIVACY_POLICY.lastUpdated}
      </p>
      <div className="mt-8">
        <LegalContent document={PRIVACY_POLICY} />
      </div>
    </div>
  );
}
