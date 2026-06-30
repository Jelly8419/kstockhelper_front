"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import {
  REAL_ESTATE_CONTACT_CHANNELS,
  REAL_ESTATE_SUPPORT_EMAIL,
} from "@/lib/constants/realEstate";

/**
 * Section where the channel buttons are rendered — logged as the `section`
 * property on the click event (event-log PRD §5.2/§5.3):
 *  - `have_questions`       → Real Estate home "Have questions?" block
 *  - `need_faster_response` → request page "Need a faster response?" block
 */
export type ContactChannelSection = "have_questions" | "need_faster_response";

/**
 * Direct-contact channels (k-property revisions §2). Messaging channels
 * (WhatsApp / WeChat / LINE) render as QR codes; WeChat and LINE show a friend-add
 * ID under the QR. Email is a mailto link. Telegram was removed. Each card logs
 * `real_estate_contact_channel_clicked` with `section` + `channel`.
 */
export function ContactChannels({ section }: { section: ContactChannelSection }) {
  const { t } = useTranslation();
  const track = useTrackEvent();

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {REAL_ESTATE_CONTACT_CHANNELS.map((channel) => {
        const label = t(`realEstate.channels.${channel.key}`);
        const logClick = () =>
          track("real_estate_contact_channel_clicked", {
            section,
            channel: channel.key,
          });

        // Email — simple mailto card (no QR).
        if (channel.key === "email" && channel.href) {
          return (
            <a
              key={channel.key}
              href={channel.href}
              onClick={logClick}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
            >
              <span className="text-sm font-semibold text-foreground">{label}</span>
              <span className="break-all text-xs text-muted">
                {REAL_ESTATE_SUPPORT_EMAIL}
              </span>
            </a>
          );
        }

        // Messaging channels — QR card (+ friend-add ID for WeChat/LINE).
        return (
          <div
            key={channel.key}
            onClick={logClick}
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
  );
}
