import type { SidebarItem } from "@/components/layout/SidebarNav";

/**
 * Client-side memory of the crop / category lists. Home already fetches both,
 * so it seeds them here and the All Crops / All Categories screens can paint
 * their left-hand list instantly while the products load. Lives only in the
 * browser tab's memory; cleared when the delivery location changes.
 */
const cache = new Map<string, SidebarItem[]>();

export const getSidebarItems = (key: string) => cache.get(key);
export const setSidebarItems = (key: string, items: SidebarItem[]) => {
  if (items.length > 0) cache.set(key, items);
};
export const clearSidebarCache = () => cache.clear();
