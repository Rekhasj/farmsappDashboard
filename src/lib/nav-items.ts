import type { SidebarItem } from "@/components/layout/SidebarNav";
import type { Locale } from "@/i18n/config";
import { pickField } from "@/i18n/localize";
import type { ApiCategory, CropCollection } from "@/types/product";

export const categoryNavItems = (categories: ApiCategory[], locale: Locale): SidebarItem[] =>
  categories.map((c) => ({
    id: c.id,
    label: pickField(c, "name", locale, "prefix"),
    imageUrl: c.imageUrl,
    href: `/categories/${c.id}`,
  }));

export const cropNavItems = (crops: CropCollection[], locale: Locale): SidebarItem[] =>
  crops
    .filter((c) => typeof c.id === "number")
    .map((c) => ({ id: c.id, label: pickField(c, "cropName", locale), imageUrl: c.imageUrl, href: `/crops/${c.id}` }));
