import ScrollRail from "@/components/ui/ScrollRail";
import CompactProductCard from "@/features/products/components/CompactProductCard";
import type { ApiProduct } from "@/types/product";
import { pickField } from "@/i18n/localize";
import { getLocale, getT } from "@/i18n/server";

/**
 * The farmer's recently viewed products. Personal, so it's simply left out
 * when there are none (e.g. guests) rather than showing placeholder tiles.
 */
export default async function RecentlyViewedSection({ products }: { products?: ApiProduct[] }) {
  if (!products?.length) return null;
  const [locale, t] = await Promise.all([getLocale(), getT()]);
  return (
    <section className="px-4 sm:px-6 pt-5">
      <h2 className="text-xs font-bold text-black md:text-lg">{t("home.recentlyViewed")}</h2>
      <ScrollRail className="mt-4 gap-3 pb-1 md:gap-4">
        {products.map((p) => (
          <CompactProductCard key={p.productId} id={p.productId} name={pickField(p, "productName", locale)} imageUrl={p.productImageUrl} />
        ))}
      </ScrollRail>
    </section>
  );
}
