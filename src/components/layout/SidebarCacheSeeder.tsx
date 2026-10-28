"use client";

import { useEffect } from "react";
import type { SidebarItem } from "@/components/layout/SidebarNav";
import { setSidebarItems } from "@/lib/sidebar-cache";

/** Rendered on Home: hands the already-fetched list to the client cache. Renders nothing. */
export default function SidebarCacheSeeder({ cacheKey, items }: { cacheKey: string; items: SidebarItem[] }) {
  useEffect(() => {
    setSidebarItems(cacheKey, items);
  }, [cacheKey, items]);
  return null;
}
