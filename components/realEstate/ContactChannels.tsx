"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import {
  REAL_ESTATE_CHANNELS,
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
 * Direct-contact channel buttons (WhatsApp / WeChat / LINE / Telegram / Email),
 * shared by the Real Estate home ("Have questions?") and the request page
 * ("Need a faster response?"). Channel hrefs come from config; an unconfigured
 * channel renders disabled rather than linking to a dead target (PRD §8-7/§9).
 * Each click logs `real_estate_contact_channel_clicked` with `section` + `channel`.
 */
export function ContactChannels({ section }: { section: ContactChannelSection }) {
  const { t } = useTranslation();
  const track = useTrackEvent();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
        {REAL_ESTATE_CHANNELS.map((channel) => {
          const label = t(`realEstate.channels.${channel.key}`);
          const disabled = channel.href === "";
          const base =
            "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors";

          if (disabled) {
            return (
              <span
                key={channel.key}
                className={`${base} cursor-not-allowed bg-surface text-muted opacity-60`}
                aria-disabled="true"
              >
                {label}
              </span>
            );
          }

          return (
            <a
              key={channel.key}
              href={channel.href}
              target={channel.external ? "_blank" : undefined}
              rel={channel.external ? "noopener noreferrer" : undefined}
              onClick={() =>
                track("real_estate_contact_channel_clicked", {
                  section,
                  channel: channel.key,
                })
              }
              className={`${base} bg-surface text-foreground hover:bg-surface-hover`}
            >
              {label}
            </a>
          );
        })}
      </div>
      <p className="text-xs text-muted">{REAL_ESTATE_SUPPORT_EMAIL}</p>
    </div>
  );
}
