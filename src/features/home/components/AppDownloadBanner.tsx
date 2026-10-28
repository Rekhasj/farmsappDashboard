"use client";

import { useState } from "react";
import { IconDownload } from "@/components/ui/icons";
import { useT } from "@/i18n/I18nProvider";

function LeafBadge() {
  // Placeholder brand mark — swap for the exact app icon export.
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6">
      <circle cx="12" cy="12" r="10" fill="#EAF7E6" />
      <path
        d="M8 14c0-3.3 2.7-6 6-6h2v2c0 3.3-2.7 6-6 6H8v-2Z"
        fill="#2E7D4F"
      />
      <path d="M8 16c1.5-3 4-5 8-6" stroke="#C8322A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-3">
      <path d="M1 1l10 10M11 1L1 11" stroke="#66574B" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Dismissible strip at the very top of the home page.
 * Ported from Figma node 11080:3248 ("Frame 1171277542").
 * CSV component #20 — AppDownloadBanner.
 */
export default function AppDownloadBanner() {
  const t = useT();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 md:hidden bg-linear-to-r from-[#ebf6e8] via-[#daf0dd] to-[#cbebe2] px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <LeafBadge />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-bold text-[#2f2821]">
            {t("home.offerTitle")}
          </p>
          <p className="text-[11px] text-[#607558]">
            {t("home.offerSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="flex items-center gap-1 rounded-sm bg-[#2e5b3a] px-3 py-2 text-xs font-bold text-white whitespace-nowrap"
        >
          <IconDownload className="size-2.5" />
          {t("home.downloadApp")}
        </button>
        <button
          type="button"
          aria-label={t("common.dismiss")}
          onClick={() => setDismissed(true)}
          className="flex size-5 items-center justify-center text-[#66574b]"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
