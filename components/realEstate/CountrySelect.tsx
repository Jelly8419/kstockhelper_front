"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES } from "@/lib/constants/countries";

/**
 * Searchable country dropdown for the request form (k-property revisions §5).
 *
 * Closed: looks like a normal select showing the chosen country (or placeholder).
 * Open: a search input (auto-focused) above a scrollable, alphabetically-sorted
 * list; typing filters by case-insensitive, whitespace-trimmed substring match
 * (`aus` → Australia, Austria). Selecting fills the field and closes; an empty
 * result shows `emptyLabel`. Closes on outside click / Escape.
 *
 * Value is the ISO alpha-2 code (stored); the label shows the country name.
 */
export function CountrySelect({
  value,
  onChange,
  placeholder,
  emptyLabel,
  error,
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  emptyLabel: string;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Alphabetical by name (PRD: alphabetical default). COUNTRIES is already
  // sorted, but sort defensively so the contract doesn't depend on data order.
  const sorted = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, sorted]);

  const selectedName = value
    ? COUNTRIES.find((c) => c.code === value)?.name ?? ""
    : "";

  // Focus the search input when the dropdown opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger (closed-state select look) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 w-full items-center justify-between rounded-lg border bg-surface px-3 text-sm outline-none transition-colors focus:border-brand ${
          error ? "border-down" : "border-border"
        }`}
      >
        <span className={selectedName ? "text-foreground" : "text-muted"}>
          {selectedName || placeholder}
        </span>
        <span className="text-muted" aria-hidden="true">
          {"▾"}
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-brand"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">{emptyLabel}</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => select(c.code)}
                    className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover ${
                      c.code === value
                        ? "bg-surface-hover font-medium text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
