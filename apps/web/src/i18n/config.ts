export const locales = ["en", "he"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  he: "עברית",
};

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  he: "rtl",
};

export const LOCALE_STORAGE_KEY = "rituvo-locale";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return localeDirection[locale];
}
