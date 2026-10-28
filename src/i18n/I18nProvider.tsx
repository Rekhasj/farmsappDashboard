"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { createTranslator, type Dictionary, type TFunction } from "./translate";

const I18nContext = createContext<{ locale: Locale; t: TFunction } | null>(null);

/** Hands the server-chosen language + dictionary to Client Components (mounted in the root layout). */
export default function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: createTranslator(dictionary) }), [locale, dictionary]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT/useLocale must be used inside <I18nProvider>");
  return ctx;
}

/** `t()` for Client Components. Server Components use `getT()` from i18n/server instead. */
export const useT = () => useI18n().t;
export const useLocale = () => useI18n().locale;
