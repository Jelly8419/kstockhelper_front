"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/lib/i18n/navigation";
import type { UserTier } from "@/types/user";
import type {
  AveragePeriod,
  Exchange,
  StockCode,
  PriceGapLatest,
} from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useRestrictedRegion } from "@/lib/hooks/useRestrictedRegion";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PipContent } from "./PipContent";

/**
 * Picture-in-Picture glyph: a screen frame with an arrow. When `active` the
 * arrow points inward (↘, "popped into" the mini window); otherwise it points
 * outward (↖, "pop out"). Inherits `currentColor` so the button controls color.
 */
function PipIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      {active ? (
        <>
          <path d="M16 14v-3h-3" />
          <path d="M16 11l-4 4" />
        </>
      ) : (
        <>
          <path d="M8 10v3h3" />
          <path d="M8 13l4-4" />
        </>
      )}
    </svg>
  );
}

/**
 * PIP control (PRD §15). Premium-only.
 *  - premium + supported browser → opens a Document Picture-in-Picture window
 *    that renders {@link PipContent} (summary table + mini chart) via a portal.
 *  - premium + unsupported browser → disabled with a hint.
 *  - guest/free → locked; clicking explains it's premium-only. The modal CTA
 *    branches: guest → login (/login), free+restricted → /subscription,
 *    free+allowed → /guide.
 *
 * Document PiP is Chromium-desktop only (Chrome/Edge); Safari/Firefox lack it.
 * Because the PiP window is a separate document, we copy the page's stylesheets
 * into it so Tailwind classes apply, then portal the React subtree into its body.
 */
export function PipButton({
  tier,
  exchange,
  stock,
  period,
  showAvg,
}: {
  tier: UserTier;
  /** Reserved for future use (table reads its own realtime poll). */
  data: PriceGapLatest | null;
  exchange: Exchange;
  stock: StockCode;
  period: AveragePeriod;
  showAvg: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const restricted = useRestrictedRegion();
  const track = useTrackEvent();
  const [lockedOpen, setLockedOpen] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  // Resolve support after mount: it must match between SSR and the first client
  // render (both false), then update so the button enables on Chromium.
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("documentPictureInPicture" in window);
  }, []);

  // Clean up the portal state when the PiP window is closed (by the user or us).
  useEffect(() => {
    if (!pipWindow) return;
    const onClose = () => setPipWindow(null);
    pipWindow.addEventListener("pagehide", onClose);
    return () => pipWindow.removeEventListener("pagehide", onClose);
  }, [pipWindow]);

  // Close the PiP window if this component unmounts (e.g. tier change/navigation).
  useEffect(() => {
    return () => {
      pipWindow?.close();
    };
  }, [pipWindow]);

  if (tier !== "premium") {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            track("gap_pip_clicked", {
              tier,
              locked: true,
              selected_stock: stock,
              selected_exchange: exchange,
              avg_period: period,
            });
            setLockedOpen(true);
          }}
        >
          <PipIcon />
          🔒 {t("priceGap.pip.button")}
        </Button>
        <Modal
          open={lockedOpen}
          onClose={() => setLockedOpen(false)}
          title={t("priceGap.pip.premiumOnly")}
        >
          <p className="text-sm text-muted">{t("priceGap.pip.premiumHint")}</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setLockedOpen(false)}>
              {t("common.close")}
            </Button>
            {/* CTA branches by tier/region:
                - guest            → log in first (/login)
                - free + restricted → PayPal subscription (/subscription)
                - free + allowed    → exchange/UID guide (/guide) */}
            {tier === "guest" ? (
              <Button
                onClick={() => {
                  track("login_required_modal_login_clicked", {
                    trigger_page: "gap_monitor",
                    auth_method: "email",
                  });
                  router.push("/login");
                }}
              >
                {t("priceGap.guest.loginCta")}
              </Button>
            ) : restricted ? (
              <Button onClick={() => router.push("/subscription")}>
                {t("subscription.modal.cta")}
              </Button>
            ) : (
              <Button onClick={() => router.push("/guide")}>
                {t("priceGap.delay.cta")}
              </Button>
            )}
          </div>
        </Modal>
      </>
    );
  }

  if (!supported) {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        title={t("priceGap.pip.unsupported")}
      >
        <PipIcon />
        {t("priceGap.pip.button")}
      </Button>
    );
  }

  const openPip = async () => {
    track("gap_pip_clicked", {
      tier,
      locked: false,
      selected_stock: stock,
      selected_exchange: exchange,
      avg_period: period,
    });
    if (pipWindow) {
      pipWindow.focus();
      return;
    }
    try {
      // @ts-expect-error documentPictureInPicture is not yet in lib.dom types.
      const win: Window = await window.documentPictureInPicture.requestWindow({
        width: 520,
        height: 460,
      });
      copyStyles(win);
      win.document.title = "Price Gap Monitor";
      win.document.documentElement.classList.add("dark");
      win.document.body.style.margin = "0";
      win.document.body.style.height = "100vh";
      setPipWindow(win);
    } catch {
      // User dismissed or the request failed — no-op.
    }
  };

  const active = pipWindow != null;
  return (
    <>
      <button
        type="button"
        onClick={openPip}
        aria-pressed={active}
        className={`inline-flex h-8 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
          active
            ? "bg-brand text-white hover:bg-brand-hover"
            : "border border-border bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        <span className={active ? "text-white" : "text-brand"}>
          <PipIcon active={active} />
        </span>
        {t("priceGap.pip.button")}
      </button>
      {pipWindow &&
        createPortal(
          <PipContent
            exchange={exchange}
            stock={stock}
            period={period}
            showAvg={showAvg}
          />,
          pipWindow.document.body
        )}
    </>
  );
}

/** Copy the main document's stylesheets into the PiP window so Tailwind applies. */
function copyStyles(win: Window) {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules)
        .map((r) => r.cssText)
        .join("");
      const style = win.document.createElement("style");
      style.textContent = rules;
      win.document.head.appendChild(style);
    } catch {
      // Cross-origin stylesheet — fall back to linking it.
      if (sheet.href) {
        const link = win.document.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        win.document.head.appendChild(link);
      }
    }
  }
}
