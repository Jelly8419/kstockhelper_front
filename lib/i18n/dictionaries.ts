import type { SupportedLocale } from "./config";
import { DEFAULT_LOCALE } from "./config";

import en from "@/locales/en.json";
import vi from "@/locales/vi.json";
import ptBR from "@/locales/pt-BR.json";
import es from "@/locales/es.json";
import id from "@/locales/id.json";
import hi from "@/locales/hi.json";
import ur from "@/locales/ur.json";
import ru from "@/locales/ru.json";
import uk from "@/locales/uk.json";
import zhTW from "@/locales/zh-TW.json";

/** A translation dictionary is an arbitrarily-nested map of string leaves. */
export type Dictionary = { [key: string]: string | Dictionary };

/**
 * `en` is the canonical, fully-populated dictionary. Its shape is the contract
 * every other locale follows (other files carry the same keys with possibly
 * empty values that fall back to `en` at lookup time).
 */
export type Messages = typeof en;

const DICTIONARIES: Record<SupportedLocale, Dictionary> = {
  en,
  vi,
  "pt-BR": ptBR,
  es,
  id,
  hi,
  ur,
  ru,
  uk,
  "zh-TW": zhTW,
};

/** The English dictionary used as the universal fallback (PRD §6.1, §10.4). */
export const EN_DICTIONARY: Dictionary = en;

/** Get the dictionary for a locale (falls back to `en` for safety). */
export function getDictionary(locale: SupportedLocale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}
