"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { setLocale } from "@/i18n/actions";
import { LANGUAGES, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { clearSidebarCache } from "@/lib/sidebar-cache";

/**
 * Header language pill + dropdown (RN LanguageSwitcher + LanguageSelectionModal).
 * Picking a language stores it in a cookie (setLocale Server Action), which
 * re-renders the page, so both UI text and backend product names switch over.
 */
export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(code: Locale) {
    setOpen(false);
    if (code === locale) return;
    clearSidebarCache(); // cached crop/category labels are in the old language
    startTransition(() => setLocale(code));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("common.language")}: ${current.label}`}
        className={`flex h-9 items-center gap-1 rounded-full bg-white/10 px-2.5 text-xs font-bold text-white ${pending ? "opacity-60" : ""}`}
      >
        {current.short}
        <IconChevronDown className="size-4" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("common.chooseLanguage")}
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-[10px] border border-[#eee] bg-white py-1 shadow-lg"
        >
          {LANGUAGES.map((lang) => {
            const selected = lang.code === locale;
            return (
              <li key={lang.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  lang={lang.code}
                  onClick={() => choose(lang.code)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] hover:bg-[#f6faf6] ${
                    selected ? "font-bold text-[#1f4529]" : "font-medium text-[#202020]"
                  }`}
                >
                  {lang.label}
                  {selected && <span aria-hidden className="size-2 rounded-full bg-[#1f4529]" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
