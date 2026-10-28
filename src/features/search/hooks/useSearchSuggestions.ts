import { useEffect, useState } from "react";
import type { SearchSuggestion } from "@/types/search";

/**
 * Fetches suggestions for `query` (already debounced by the caller).
 * Stale responses are ignored: results are stored together with the query
 * they belong to, and only shown while that query is still current.
 */
export function useSearchSuggestions(query: string) {
  const [result, setResult] = useState<{ query: string; items: SearchSuggestion[] }>({ query: "", items: [] });

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();

    fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { suggestions: [] }))
      .then((data: { suggestions?: SearchSuggestion[] }) =>
        setResult({ query, items: data.suggestions ?? [] }),
      )
      .catch((err) => {
        if (err?.name !== "AbortError") setResult({ query, items: [] });
      });

    return () => controller.abort();
  }, [query]);

  const current = !!query && result.query === query;
  return {
    suggestions: current ? result.items : [],
    loading: !!query && !current,
  };
}
