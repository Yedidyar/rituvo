import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Locale } from "./config";
import {
  LOCALE_STORAGE_KEY,
  defaultLocale,
  getDirection,
  isLocale,
} from "./config";
import { getMessages } from "./messages";
import type { TranslationKey } from "./translate";
import { createTranslator } from "./translate";

type LocaleContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  translate: (
    key: TranslationKey,
    values?: Record<string, string | number>,
  ) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }

    return resolveInitialLocale();
  });

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Storage may be unavailable in restricted contexts.
    }
    applyDocumentLocale(nextLocale);
  }, []);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const messages = getMessages(locale);
    return {
      locale,
      direction: getDirection(locale),
      setLocale,
      translate: createTranslator(messages),
    };
  }, [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

export function useTranslation() {
  const { translate, locale, direction, setLocale } = useLocale();
  return { translate, locale, direction, setLocale };
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return defaultLocale;
  }

  const preferred = navigator.languages?.[0] ?? navigator.language;
  if (!preferred) {
    return defaultLocale;
  }

  const normalized = preferred.toLowerCase();
  if (normalized.startsWith("he")) {
    return "he";
  }

  return defaultLocale;
}

function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored && isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? detectBrowserLocale();
}

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);
}
