import { useCallback, useEffect, useState } from "react";
import type { SearchPreQuery } from "@/types/search";

/** Loads recent + trending searches the first time `enabled` becomes true. */
export function useSearchPreQuery(enabled: boolean) {
  const [data, setData] = useState<SearchPreQuery | null>(null);

  useEffect(() => {
    if (!enabled || data) return;
    let cancelled = false;
    fetch("/api/search/pre-query")
      .then((res) => (res.ok ? res.json() : { recent: [], trending: [] }))
      .then((json: SearchPreQuery) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ recent: [], trending: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, data]);

  const clearRecent = useCallback(async () => {
    const res = await fetch("/api/search/pre-query", { method: "DELETE" }).catch(() => null);
    if (res?.ok) setData((prev) => (prev ? { ...prev, recent: [] } : prev));
  }, []);

  return {
    loading: enabled && !data,
    recent: data?.recent ?? [],
    trending: data?.trending ?? [],
    clearRecent,
  };
}
