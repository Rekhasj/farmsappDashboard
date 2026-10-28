import type en from "./dictionaries/en.json";

export type Dictionary = typeof en;
export type TranslationKey = keyof Dictionary;
export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/** i18next-style `{{name}}` interpolation over a flat dictionary. */
export function createTranslator(dict: Dictionary): TFunction {
  return (key, vars) => {
    const text = dict[key] ?? key;
    return vars ? text.replace(/\{\{(\w+)\}\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text;
  };
}
