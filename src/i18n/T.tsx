"use client";

import { useT } from "./I18nProvider";
import type { TranslationKey } from "./translate";

/**
 * Translated text for components that are neither async Server Components
 * nor client components — e.g. the loading.tsx skeletons, which should stay
 * static (no cookies() read) so they paint instantly.
 */
export default function T({ k, vars }: { k: TranslationKey; vars?: Record<string, string | number> }) {
  return <>{useT()(k, vars)}</>;
}
