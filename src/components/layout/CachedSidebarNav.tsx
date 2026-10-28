"use client";

import { useState } from "react";
import SidebarNav from "@/components/layout/SidebarNav";
import { getSidebarItems } from "@/lib/sidebar-cache";

/**
 * Suspense fallback for the real (server-fetched) list: shows the list Home
 * already loaded, or grey placeholders when the screen was opened directly.
 */
export default function CachedSidebarNav({ title, cacheKey }: { title: string; cacheKey: string }) {
  const [items] = useState(() => getSidebarItems(cacheKey));
  if (items) return <SidebarNav title={title} items={items} cacheKey={cacheKey} />;
  return (
    <div className="flex w-22 shrink-0 flex-col items-center gap-4 py-3 md:w-56 md:rounded-xl md:border md:border-[#eee] md:bg-white lg:w-64" aria-busy="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div className="size-14 animate-pulse rounded-lg bg-[#ececec] md:size-16" />
          <div className="h-2.5 w-12 animate-pulse rounded bg-[#ececec]" />
        </div>
      ))}
    </div>
  );
}
