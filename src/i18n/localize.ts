import type { LocalizedText } from "@/types/product";
import { languageName, type Locale } from "./config";

/**
 * Picks the current language out of backend data, falling back to English
 * — the same fallbacks the RN app uses. Client-safe (no hooks / cookies).
 */

/** `{ en, hi, ... }` objects (search + product-detail payloads, tags). */
export function pickText(text: LocalizedText | undefined | null, locale: Locale): string {
  if (!text) return "";
  return text[locale]?.trim() || text.en || "";
}

/**
 * Flat per-language fields on v2 feeds. `style` is the naming the backend
 * uses for that field:
 *  - "suffix": productName -> productNameHindi (products, crops)
 *  - "prefix": name        -> hindiName        (categories)
 */
export function pickField(
  obj: object,
  base: string,
  locale: Locale,
  style: "suffix" | "prefix" = "suffix",
): string {
  const record = obj as Record<string, unknown>;
  const fallback = typeof record[base] === "string" ? (record[base] as string) : "";
  if (locale === "en") return fallback;
  const name = languageName(locale);
  const key =
    style === "suffix"
      ? `${base}${name}`
      : `${name.toLowerCase()}${base.charAt(0).toUpperCase()}${base.slice(1)}`;
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}
