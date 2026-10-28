import Link from "next/link";
import ProductRow, { type ProductRowItem } from "@/features/products/components/ProductRow";
import ProductCard, { type Product } from "@/features/products/components/ProductCard";
import { getT } from "@/i18n/server";

/**
 * Shown when the real product feed (app/page.tsx) returns nothing. Per
 * your request, the "Add to Cart" / "Notify Me" buttons and the floating
 * "View Cart" bar are intentionally left out for now.
 */
const FALLBACK_PRODUCTS: ProductRowItem[] = [
  {
    id: "fallback-barrix",
    name: "Barrix Magic Sticker",
    tag: "Boosts Root Growth",
    tagTone: "green",
    description: "Flubendiamide 19.92% + Thiacloprid 19.92% w...",
    price: "₹200",
    mrp: "₹499",
    size: "1 LTR",
    badge: "7% Off",
  },
  {
    id: "fallback-bio20tea",
    name: "Bio 20 Tea",
    tag: "Better Flowering",
    tagTone: "purple",
    description: "Flubendiamide 19.92% + Thiacloprid 19.92% w...",
    price: "₹200",
    mrp: "₹499",
    size: "1 LTR",
    outOfStock: true,
  },
  {
    id: "fallback-bensaan50",
    name: "Bensaan 50",
    tag: "Stress Protection",
    tagTone: "orange",
    description: "Flubendiamide 19.92% + Thiacloprid 19.92% w...",
    price: "₹200",
    mrp: "₹499",
    size: "1 LTR",
  },
  {
    id: "fallback-zinc33",
    name: "Zinc 33",
    tag: "Better Flowering",
    tagTone: "purple",
    description: "Flubendiamide 19.92% + Thiacloprid 19.92% w...",
    price: "₹200",
    mrp: "₹499",
    size: "1 LTR",
    badge: "5% Off",
  },
  {
    id: "fallback-setright",
    name: "Setright",
    tag: "Boosts Root Growth",
    tagTone: "green",
    description: "Flubendiamide 19.92% + Thiacloprid 19.92% w...",
    price: "₹200",
    mrp: "₹499",
    size: "1 LTR",
    badge: "10% Off",
  },
  {
    id: "fallback-nutroplus",
    name: "Nutro Plus",
    tag: "Boosts Root Growth",
    tagTone: "green",
    description: "Flubendiamide 19.92% + Thiacloprid 19.92% w...",
    price: "₹200",
    mrp: "₹499",
    size: "1 LTR",
  },
];

/** Phones: the app's list rows. Desktop: a Blinkit-style card grid (`cards`, same products). */
export default async function AllProductsSection({ products, cards = [] }: { products?: ProductRowItem[]; cards?: Product[] }) {
  const t = await getT();
  const items = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  return (
    <section className="px-4 sm:px-6 pt-5 pb-6">
      <h2 className="text-xs font-bold text-black md:text-lg">{t("home.allProducts")}</h2>

      <div className={`mt-3 divide-y divide-[#eee] ${cards.length ? "md:hidden" : "md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 lg:grid-cols-3"}`}>
        {items.map((item) => (
          <div key={`${item.id}-${item.cart?.skuCode ?? ""}`} className="md:h-full">
            <ProductRow item={item} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#b9d3bd] bg-[#f6faf6] px-5 py-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-sm font-bold text-[#202020]">{t("enquiry.notFound")}</p>
          <p className="mt-0.5 text-xs text-[#6a7282]">{t("enquiry.letUsKnow")}</p>
        </div>
        <Link href="/product-enquiry" className="mt-2 shrink-0 rounded-lg bg-[#1f4529] px-5 py-2.5 text-sm font-bold text-white md:mt-0">
          {t("enquiry.request")}
        </Link>
      </div>
      {cards.length > 0 && (
        <div className="mt-4 hidden gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {cards.map((p) => (
            <ProductCard key={`${p.id}-${p.cart?.skuCode ?? ""}`} product={p} widthClass="w-full" />
          ))}
        </div>
      )}
    </section>
  );
}
