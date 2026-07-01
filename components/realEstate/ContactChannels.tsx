"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { Button } from "@/components/ui/Button";
import { ChannelModal } from "@/components/realEstate/ChannelModal";
import { Toast } from "@/components/realEstate/Toast";
import {
  REAL_ESTATE_CONTACT_CHANNELS,
  REAL_ESTATE_SUPPORT_EMAIL,
  type RealEstateChannel,
} from "@/lib/constants/realEstate";

/**
 * Section where the channel buttons are rendered — logged as the `section`
 * property on the click event (event-log PRD §5.2/§5.3):
 *  - `have_questions`       → Real Estate home "Have questions?" block
 *  - `need_faster_response` → request page "Need a faster response?" block
 */
export type ContactChannelSection = "have_questions" | "need_faster_response";

/**
 * Direct-contact channels.
 *  - Desktop (sm+): AS-IS — QR cards for WhatsApp/WeChat/LINE (+ Email card).
 *  - Mobile (<sm): tappable channel buttons that open a modal (QR + message/copy
 *    action); Email is shown as a plain address at the bottom (k-property mobile
 *    revisions). Each channel interaction logs `real_estate_contact_channel_clicked`.
 */
export function ContactChannels({ section }: { section: ContactChannelSection }) {
  const { t } = useTranslation();
  const track = useTrackEvent();
  const [activeModal, setActiveModal] = useState<RealEstateChannel | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const logClick = (key: string) =>
    track("real_estate_contact_channel_clicked", { section, channel: key });

  const messagingChannels = REAL_ESTATE_CONTACT_CHANNELS.filter(
    (c) => c.modal !== "none"
  );

  return (
    <>
      {/* Desktop (sm+): AS-IS QR cards (all channels incl. Email) */}
      <div className="hidden w-full grid-cols-2 gap-4 sm:grid lg:grid-cols-4">
        {REAL_ESTATE_CONTACT_CHANNELS.map((channel) => {
          const label = t(`realEstate.channels.${channel.key}`);

          if (channel.key === "email" && channel.href) {
            return (
              <a
                key={channel.key}
                href={channel.href}
                onClick={() => logClick(channel.key)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
              >
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="break-all text-xs text-muted">
                  {REAL_ESTATE_SUPPORT_EMAIL}
                </span>
              </a>
            );
          }

          return (
            <div
              key={channel.key}
              onClick={() => logClick(channel.key)}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
            >
              <span className="text-sm font-semibold text-foreground">{label}</span>
              {channel.qr && (
                <span className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <Image
                    src={channel.qr}
                    alt={`${label} QR`}
                    width={128}
                    height={128}
                    className="h-full w-full object-contain"
                  />
                </span>
              )}
              {channel.id && (
                <span className="text-xs text-muted">
                  {"ID: "}
                  <span className="text-foreground">{channel.id}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile (<sm): channel buttons → modal, then Email address */}
      <div className="flex w-full flex-col gap-3 sm:hidden">
        <div className="grid grid-cols-1 gap-2">
          {messagingChannels.map((channel) => {
            const label = t(`realEstate.channels.${channel.key}`);
            return (
              <Button
                key={channel.key}
                variant="secondary"
                className="w-full"
                onClick={() => {
                  logClick(channel.key);
                  setActiveModal(channel);
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>
        <a
          href={`mailto:${REAL_ESTATE_SUPPORT_EMAIL}`}
          onClick={() => logClick("email")}
          className="text-center text-sm text-muted"
        >
          {t("realEstate.channels.email")}: {REAL_ESTATE_SUPPORT_EMAIL}
        </a>
      </div>

      {activeModal && (
        <ChannelModal
          channel={activeModal}
          open={activeModal !== null}
          onClose={() => setActiveModal(null)}
          onToast={setToast}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
