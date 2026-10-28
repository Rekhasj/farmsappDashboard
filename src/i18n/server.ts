import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { createTranslator, type Dictionary } from "./translate";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  hi: () => import("./dictionaries/hi.json").then((m) => m.default),
  kn: () => import("./dictionaries/kn.json").then((m) => m.default),
  mr: () => import("./dictionaries/mr.json").then((m) => m.default),
  te: () => import("./dictionaries/te.json").then((m) => m.default),
};

/** SERVER-ONLY. The language the farmer picked in the header switcher (cookie), else English. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

export const getDictionary = (locale: Locale) => dictionaries[locale]();

/** SERVER-ONLY. `t()` for the current request's language — use in Server Components. */
export const getT = cache(async () => createTranslator(await getDictionary(await getLocale())));
