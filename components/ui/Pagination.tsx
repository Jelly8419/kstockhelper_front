"use client";

interface Props {
  /** 0-based current page. */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  onChange: (page: number) => void;
  /**
   * Optional aria labels. Defaults to English so this primitive works outside a
   * next-intl provider too (e.g. the admin console, which is not under the
   * `[locale]` segment). i18n callers pass translated labels.
   */
  labels?: {
    aria?: string;
    previous?: string;
    next?: string;
  };
}

/** Build a windowed list of page numbers (0-based) with ellipsis gaps (-1). */
function buildPages(page: number, totalPages: number): number[] {
  const window = 2; // pages on each side of current
  const pages: number[] = [];
  const push = (p: number) => {
    if (p >= 0 && p < totalPages && !pages.includes(p)) pages.push(p);
  };

  push(0);
  for (let p = page - window; p <= page + window; p++) push(p);
  push(totalPages - 1);

  pages.sort((a, b) => a - b);

  // Insert -1 markers for gaps.
  const withGaps: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) withGaps.push(-1);
    withGaps.push(pages[i]);
  }
  return withGaps;
}

export function Pagination({ page, totalPages, onChange, labels }: Props) {
  if (totalPages <= 1) return null;

  const ariaLabel = labels?.aria ?? "Pagination";
  const prevLabel = labels?.previous ?? "Previous page";
  const nextLabel = labels?.next ?? "Next page";

  const pages = buildPages(page, totalPages);
  const btn =
    "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label={prevLabel}
        className={`${btn} border border-border bg-surface text-muted hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40`}
      >
        «
      </button>

      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${
              p === page
                ? "bg-brand text-white"
                : "border border-border bg-surface text-muted hover:bg-surface-hover"
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label={nextLabel}
        className={`${btn} border border-border bg-surface text-muted hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40`}
      >
        »
      </button>
    </nav>
  );
}
