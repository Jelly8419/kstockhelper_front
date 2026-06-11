import Link from "next/link";
import { getTranslations } from "@/lib/i18n/getTranslations";

export function Footer() {
  const { t } = getTranslations();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-container flex-col gap-3 px-4 py-8 sm:px-6">
        {/* Brand name — not translated. */}
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <p className="text-sm font-semibold text-foreground">K-Stock Helper</p>
        <p className="text-xs text-muted">{t("footer.tagline")}</p>

        <nav className="mt-1 flex gap-4 text-xs">
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground"
          >
            {t("footer.privacy")}
          </Link>
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground"
          >
            {t("footer.terms")}
          </Link>
        </nav>

        <p className="mt-2 text-xs text-muted">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
