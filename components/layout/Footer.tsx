export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-container flex-col gap-2 px-4 py-8 sm:px-6">
        <p className="text-sm font-semibold text-foreground">K-Stock Helper</p>
        <p className="text-xs text-muted">
          Korean stock news & market data for global investors.
        </p>
        {/* TODO: legal notices, links (after backend integration) */}
        <p className="mt-2 text-xs text-muted">
          © {new Date().getFullYear()} kstockhelper.io
        </p>
      </div>
    </footer>
  );
}
