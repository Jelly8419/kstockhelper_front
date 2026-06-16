"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/lib/i18n/navigation";
import type {
  AveragePeriod,
  Exchange,
  StockCode,
  PriceGapLatest,
} from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PipContent } from "./PipContent";

/**
 * PIP control (PRD §15). Premium-only.
 *  - premium + supported browser → opens a Document Picture-in-Picture window
 *    that renders {@link PipContent} (summary table + mini chart) via a portal.
 *  - premium + unsupported browser → disabled with a hint.
 *  - free → locked; clicking explains it's premium-only and routes to /guide.
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
  tier: "free" | "premium";
  /** Reserved for future use (table reads its own realtime poll). */
  data: PriceGapLatest | null;
  exchange: Exchange;
  stock: StockCode;
  period: AveragePeriod;
  showAvg: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
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

  if (tier === "free") {
    return (
      <>
        <Button variant="secondary" size="sm" onClick={() => setLockedOpen(true)}>
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
            <Button onClick={() => router.push("/guide")}>
              {t("priceGap.delay.cta")}
            </Button>
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
        {t("priceGap.pip.button")}
      </Button>
    );
  }

  const openPip = async () => {
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

  return (
    <>
      <Button variant="secondary" size="sm" onClick={openPip}>
        {t("priceGap.pip.button")}
      </Button>
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
