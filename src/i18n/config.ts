/**
 * Client-safe language config. Same five languages as the RN app
 * (src/i18n.js + the `languages` list in redux/Slice.js). Codes match the
 * keys of LocalizedText ({ en, hi, kn, mr, te }) returned by the backend.
 */
export const LOCALES = ["en", "hi", "kn", "mr", "te"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie holding the chosen language — read on the server so pages render in it. */
export const LOCALE_COOKIE = "fa_lang";

/**
 * `name` is the RN app's language value ("Hindi", ...) — the backend's
 * flat localized fields are named after it (productNameHindi, hindiName).
 * `short` is the glyph shown on the header switcher, as in LanguageSwitcher.jsx.
 */
export const LANGUAGES: { code: Locale; label: string; name: string; short: string }[] = [
  { code: "en", label: "English", name: "English", short: "EN" },
  { code: "hi", label: "हिंदी", name: "Hindi", short: "हि" },
  { code: "kn", label: "ಕನ್ನಡ", name: "Kannada", short: "ಕ" },
  { code: "mr", label: "मराठी", name: "Marathi", short: "म" },
  { code: "te", label: "తెలుగు", name: "Telugu", short: "తె" },
];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const languageName = (locale: Locale) => LANGUAGES.find((l) => l.code === locale)!.name;
