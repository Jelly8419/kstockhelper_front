import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-container flex-col gap-3 px-4 py-8 sm:px-6">
        <p className="text-sm font-semibold text-foreground">K-Stock Helper</p>
        <p className="text-xs text-muted">
          Korean stock news & market data for global investors.
        </p>

        <nav className="mt-1 flex gap-4 text-xs">
          <Link href="/privacy" className="text-muted hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-muted hover:text-foreground">
            Terms of Service
          </Link>
        </nav>

        <p className="mt-2 text-xs text-muted">
          © {new Date().getFullYear()} kstockhelper.io
        </p>
      </div>
    </footer>
  );
}
