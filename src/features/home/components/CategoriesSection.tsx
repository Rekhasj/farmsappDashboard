import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";
import Tile from "@/components/ui/Tile";
import type { ApiCategory } from "@/types/product";
import { pickField } from "@/i18n/localize";
import { getLocale, getT } from "@/i18n/server";

/**
 * Ported from Figma node 11058:45135 ("Group 1171277063" — Categories).
 * Renders real categories from the backend (fetchCategories, see
 * app/page.tsx) when available; falls back to this static list — matched
 * to the Figma labels — if the API call fails or returns nothing.
 */
const FALLBACK_CATEGORIES = [
  "Combo Saver",
  "Water soluble fertilizers",
  "Micronutrients fertilizers",
  "Liquid fertilizers",
  "Insecticides",
  "Herbicides",
  "Fungicides",
  "Plant growth regulator",
  "Nano fertilizers",
];

export default async function CategoriesSection({ categories }: { categories?: ApiCategory[] }) {
  const [locale, t] = await Promise.all([getLocale(), getT()]);
  const items =
    categories && categories.length > 0
      ? categories.map((c) => ({ key: String(c.id), label: pickField(c, "name", locale, "prefix"), imageUrl: c.imageUrl, href: `/categories/${c.id}` }))
      : FALLBACK_CATEGORIES.map((label) => ({ key: label, label, imageUrl: undefined, href: undefined }));

  return (
    <section className="px-4 sm:px-6 pt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-black md:text-lg">{t("common.categories")}</h2>
        <Link href="/categories" className="flex items-center gap-1.5 text-xs font-bold text-[#1f4529]">
          {t("common.viewAll")}
          <IconArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex gap-5 overflow-x-auto pb-1 md:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Tile key={item.key} label={item.label} imageUrl={item.imageUrl} href={item.href} />
        ))}
      </div>
    </section>
  );
}
