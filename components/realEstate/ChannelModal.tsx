"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChannelIcon } from "@/components/realEstate/ChannelIcon";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { RealEstateChannel } from "@/lib/constants/realEstate";

/**
 * QR/ID modal for a friend-add channel (WeChat / LINE) on mobile
 * (k-property mobile revisions). Shows a close (X) button, the brand icon, a
 * description, the QR image, and an "<Label> ID  <id>  Copy" row; copying
 * reports success/failure to the parent via `onToast`. WhatsApp does NOT use
 * this modal — its icon links straight to the chat.
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
  const description = t("realEstate.channels.modal.addFriendDescription");
  const helper =
    channel.key === "wechat"
      ? t("realEstate.channels.modal.wechatHelper")
      : t("realEstate.channels.modal.lineHelper");

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
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        {/* Close (X) button — top-right */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Brand icon + label */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <ChannelIcon channel={channel.key} size={40} />
          <h2 className="text-lg font-semibold text-foreground">{label}</h2>
        </div>

        <p className="text-center text-sm text-muted">{description}</p>

        {channel.qr && (
          <span className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-lg bg-white">
            <Image
              src={channel.qr}
              alt={`${label} QR`}
              width={176}
              height={176}
              className="h-full w-full object-contain"
            />
          </span>
        )}

        {/* ID row: "<Label> ID   <id>   Copy" */}
        {channel.id && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-xs text-muted">
                {label}
                {/* eslint-disable-next-line i18next/no-literal-string */}
                {" ID"}
              </span>
              <span className="flex-1 text-center text-sm text-foreground">
                {channel.id}
              </span>
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
