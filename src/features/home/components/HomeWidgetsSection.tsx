import { cartInputFromApiProduct } from "@/lib/cart";
import { pickField, pickText } from "@/i18n/localize";
import { getLocale, getT } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import type { LocalizedText } from "@/types/product";
import type { HomeWidget, Localized, WidgetCarouselConfig } from "@/types/widgets";
import WidgetCarousel, { type WidgetCard } from "./WidgetCarousel";

const text = (v: Localized | undefined, locale: Locale) =>
  typeof v === "string" ? v : pickText(v as LocalizedText | undefined, locale);

/** RN widgetUtils.resolveViewAllRoute → web paths. */
function viewAllHref(w: HomeWidget): string | null {
  const s = w.viewAll?.screen;
  const id = Number(w.viewAll?.params?.categoryId);
  if (s === "COLLECTIONS") return Number.isInteger(id) && id > 0 ? `/categories/${id}` : "/categories";
  if (s === "BEST_SELLING") return "/best-selling";
  return null;
}

/** A static banner's `action` → web path (only pages the site has). */
function actionHref(a: HomeWidget["action"]): string | null {
  const n = (k: string) => Number(a?.[k]);
  switch (a?.page) {
    case "ProductDetailPage":
      return n("productId") > 0 ? `/products/${n("productId")}` : null;
    case "AllProductPage":
      return n("catId") > 0 ? `/categories/${n("catId")}` : "/categories";
    case "BestSellingProductPage":
      return "/best-selling";
    case "CropProductPage":
      return n("cropId") > 0 ? `/crops/${n("cropId")}` : "/crops";
    default:
      return null;
  }
}

/**
 * Home widgets carousel (RN components/HomepageWidgets): PRODUCT_LIST widgets
 * become one themed card each (in-stock items only), BANNER widgets one card
 * per banner image. Hidden when nothing is left, like the app.
 */
export default async function HomeWidgetsSection({
  widgets,
  carousel,
}: {
  widgets: HomeWidget[];
  carousel: WidgetCarouselConfig | null;
}) {
  const [locale, t] = await Promise.all([getLocale(), getT()]);
  const cards: WidgetCard[] = [];

  for (const w of widgets) {
    const items = [...(w.items ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    if (w.widgetType === "PRODUCT_LIST") {
      const rows = items.flatMap((it) => {
        const p = it.product;
        const sku = p?.skus?.[0];
        if (!p || !sku || (sku.inventoryCount ?? 0) <= 0) return [];
        const bundle = sku.skuType === "BUNDLE" || (p.itemCount ?? 0) > 1;
        return [{
          productId: p.productId,
          name: text(it.label, locale) || pickField(p, "productName", locale),
          sub: bundle ? `${p.itemCount ?? ""} ${t("search.items")}`.trim() : `${sku.skuSize} ${sku.skuUnit}`,
          imageUrl: p.productImageUrl ?? sku.skuImageUrl,
          price: sku.netPrice,
          mrp: sku.mrp,
          // RN: the Add button only on the Best Selling widget, when the backend allows it.
          cart: w.code === "BEST_SELLING" && w.showAddToCart ? cartInputFromApiProduct(p, sku) : undefined,
        }];
      });
      if (rows.length === 0) continue;
      cards.push({
        kind: "list",
        key: w.code,
        title: text(w.title, locale),
        subtitle: text(w.subtitle, locale),
        theme: w.theme ?? {},
        viewAll: w.viewAll?.label
          ? { href: viewAllHref(w), label: text(w.viewAll.label, locale), bg: w.viewAll.backgroundColor, color: w.viewAll.textColor }
          : null,
        bodyHref: viewAllHref(w),
        rows,
      });
      continue;
    }

    if (w.widgetType === "BANNER") {
      if (items.length === 0 && w.bannerImage) {
        const img = text(w.bannerImage, locale);
        if (img) cards.push({ kind: "banner", key: w.code, imageUrl: img, href: actionHref(w.action), bg: w.theme?.backgroundColor, alt: w.code, contain: true });
        continue;
      }
      for (const it of items) {
        const img = text(it.bannerImage, locale);
        if (!img) continue;
        cards.push({
          kind: "banner",
          key: `${w.code}-${it.position ?? it.product?.productId}`,
          imageUrl: img,
          href: it.product?.productId ? `/products/${it.product.productId}` : null,
          bg: w.theme?.backgroundColor,
          alt: text(it.label, locale) || w.code,
          contain: false,
        });
      }
    }
  }

  if (cards.length === 0) return null;
  return (
    <section className="pt-5">
      <WidgetCarousel cards={cards} carousel={carousel} />
    </section>
  );
}
