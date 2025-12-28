import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "sr", "sr-Cyrl", "bg", "is"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  sr: "Srpski",
  "sr-Cyrl": "Српски",
  bg: "Български",
  is: "Íslenska",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  sr: "🇷🇸",
  "sr-Cyrl": "🇷🇸",
  bg: "🇧🇬",
  is: "🇮🇸",
};

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale: Locale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : "en";

  return {
    locale: resolvedLocale,
    timeZone: "UTC",
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
