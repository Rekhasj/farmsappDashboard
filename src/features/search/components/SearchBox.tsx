"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSearch } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useT } from "@/i18n/I18nProvider";
import { useSearchPreQuery } from "../hooks/useSearchPreQuery";
import { useSearchSuggestions } from "../hooks/useSearchSuggestions";

/**
 * Header search box — ported from the RN app's Search screen.
 *  - focused + empty  -> recent searches (with Clear all) and trending
 *  - typing           -> debounced product / phrase suggestions
 *  - Enter / "Search for ..." -> /search?q=... (full results page)
 * Product suggestions and trending items with a product id open that
 * product's page directly; plain phrases run a full search.
 */
export default function SearchBox({
  initialQuery = "",
  placeholder,
}: {
  initialQuery?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);

  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, 300);
  const { suggestions, loading } = useSearchSuggestions(debounced);
  const pre = useSearchPreQuery(open && !trimmed);

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function submit(text: string) {
    const value = text.trim();
    if (!value) return;
    setQuery(value);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  // Suggestions are for the debounced text — hide them while the user is still typing.
  const suggestionsFresh = debounced === trimmed;
  const showSuggestions = !!trimmed;

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex h-11 items-center gap-2 rounded-lg bg-white px-3"
      >
        <IconSearch className="size-4 shrink-0 text-[#b8b8b8]" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? t("search.placeholder")}
          aria-label={t("search.label")}
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[#202020] outline-none placeholder:text-[#b8b8b8] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label={t("search.clear")}
            onClick={() => {
              setQuery("");
              setOpen(true);
            }}
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-lg leading-none text-[#8a8a8a] hover:bg-[#f2f2f2]"
          >
            ×
          </button>
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-[10px] border border-[#eee] bg-white py-2 shadow-lg">
          {showSuggestions ? (
            <>
              {loading || !suggestionsFresh ? (
                <p className="px-4 py-3 text-xs text-[#8a8a8a]">{t("search.searching")}</p>
              ) : suggestions.length === 0 ? (
                <p className="px-4 py-3 text-xs text-[#8a8a8a]">{t("search.noSuggestions", { q: trimmed })}</p>
              ) : (
                <ul>
                  {suggestions.map((s, i) => (
                    <li key={`${s.productId ?? "q"}-${i}`}>
                      {s.productId ? (
                        <Link
                          href={`/products/${s.productId}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-[#f6faf6]"
                        >
                          <SuggestionImage url={s.imageUrl} alt={s.text} />
                          <span className="line-clamp-2 text-[13px] font-semibold text-[#202020]">{s.text}</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => submit(s.text)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#f6faf6]"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#f0f0f0]">
                            <IconSearch className="size-3.5 text-[#8a8a8a]" />
                          </span>
                          <span className="line-clamp-2 text-[13px] font-semibold text-[#202020]">{s.text}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => submit(query)}
                className="mt-1 flex w-full items-center gap-2 border-t border-[#f0f0f0] px-4 py-2.5 text-left text-[13px] font-bold text-[#1f4529] hover:bg-[#f6faf6]"
              >
                <IconSearch className="size-3.5" />
                {t("search.searchFor", { q: trimmed })}
              </button>
            </>
          ) : (
            <IdlePanel pre={pre} onPick={submit} onNavigate={() => setOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionImage({ url, alt }: { url: string | null; alt: string }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f8f8f8]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="size-full object-contain" loading="lazy" />
      ) : null}
    </span>
  );
}

function IdlePanel({
  pre,
  onPick,
  onNavigate,
}: {
  pre: ReturnType<typeof useSearchPreQuery>;
  onPick: (text: string) => void;
  onNavigate: () => void;
}) {
  const t = useT();
  if (pre.loading) return <p className="px-4 py-3 text-xs text-[#8a8a8a]">{t("common.loading")}</p>;

  if (pre.recent.length === 0 && pre.trending.length === 0) {
    return <p className="px-4 py-3 text-xs text-[#8a8a8a]">{t("search.startTyping")}</p>;
  }

  return (
    <div className="space-y-4 px-4 py-2">
      {pre.recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#202020]">{t("search.recent")}</h3>
            <button type="button" onClick={pre.clearRecent} className="text-xs font-bold text-[#1f4529] hover:underline">
              {t("search.clearAll")}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {pre.recent.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => onPick(text)}
                className="rounded-full border border-[#e5e5e5] px-3 py-1 text-xs text-[#202020] hover:bg-[#f6faf6]"
              >
                {text}
              </button>
            ))}
          </div>
        </section>
      )}

      {pre.trending.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-[#202020]">{t("search.trending")}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {pre.trending.map((t) =>
              t.productId ? (
                <Link
                  key={`${t.label}-${t.productId}`}
                  href={`/products/${t.productId}`}
                  onClick={onNavigate}
                  className="rounded-full bg-[#eef6fb] px-3 py-1 text-xs text-[#202020] hover:bg-[#e2eef7]"
                >
                  {t.label}
                </Link>
              ) : (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => onPick(t.label)}
                  className="rounded-full bg-[#eef6fb] px-3 py-1 text-xs text-[#202020] hover:bg-[#e2eef7]"
                >
                  {t.label}
                </button>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
