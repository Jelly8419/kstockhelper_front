"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { RealEstateChannel } from "@/lib/constants/realEstate";

/**
 * Mobile contact modal for a messaging channel (k-property mobile revisions).
 *  - WhatsApp (`modal: "link"`) → QR + a "Message us on WhatsApp" button (wa.me).
 *  - WeChat/LINE (`modal: "copy"`) → QR + ID + a Copy button; copying reports
 *    success/failure to the parent via `onToast` so it can show a toast.
 */
export function ChannelModal({
  channel,
  open,
  onClose,
  onToast,
}: {
  channel: RealEstateChannel;
  open: boolean;
  onClose: () => void;
  /** Called after a copy attempt with the localized toast message. */
  onToast: (message: string) => void;
}) {
  const { t } = useTranslation();
  const label = t(`realEstate.channels.${channel.key}`);

  const description =
    channel.modal === "link"
      ? t("realEstate.channels.modal.whatsappDescription")
      : t("realEstate.channels.modal.addFriendDescription");

  const helper =
    channel.key === "wechat"
      ? t("realEstate.channels.modal.wechatHelper")
      : channel.key === "line"
        ? t("realEstate.channels.modal.lineHelper")
        : "";

  const handleCopy = async () => {
    if (!channel.id) return;
    try {
      await navigator.clipboard.writeText(channel.id);
      onToast(t("realEstate.channels.toast.copySuccess"));
    } catch {
      onToast(t("realEstate.channels.toast.copyError"));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={label}>
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm text-muted">{description}</p>

        {channel.qr && (
          <span className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg bg-white">
            <Image
              src={channel.qr}
              alt={`${label} QR`}
              width={160}
              height={160}
              className="h-full w-full object-contain"
            />
          </span>
        )}

        {/* WhatsApp — message button (wa.me link) */}
        {channel.modal === "link" && channel.waLink && (
          <a
            href={channel.waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="primary" className="w-full">
              {t("realEstate.channels.modal.whatsappButton")}
            </Button>
          </a>
        )}

        {/* WeChat / LINE — ID + copy button + helper */}
        {channel.modal === "copy" && channel.id && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">{channel.id}</span>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {t("realEstate.channels.modal.copyButton")}
              </Button>
            </div>
            <p className="text-center text-xs text-muted">{helper}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
