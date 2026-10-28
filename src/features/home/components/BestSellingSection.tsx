import Link from "next/link";
import ScrollRail from "@/components/ui/ScrollRail";
import { IconArrowRight } from "@/components/ui/icons";
import ProductCard, { type Product } from "@/features/products/components/ProductCard";
import { getT } from "@/i18n/server";

/** Shown when fetchPopularProducts (app/page.tsx) returns nothing — e.g. before real data was wired in, or on an API error. */
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-calnit-19",
    name: "Calnit 19",
    tag: "Boosts Root Growth",
    tagTone: "green",
    discount: "20% Off",
    price: "₹2300",
    mrp: "₹2499",
    size: "10KG",
  },
  {
    id: "fallback-neem-powder",
    name: "Neem Powder",
    tag: "Better Flowering",
    tagTone: "purple",
    price: "₹299",
    mrp: "₹499",
    size: "1KG",
  },
];

export default async function BestSellingSection({ products }: { products?: Product[] }) {
  const t = await getT();
  const items = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  return (
    <section className="px-4 sm:px-6 pt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-black md:text-lg">{t("home.bestSelling")}</h2>
        <Link href="/best-selling" className="flex items-center gap-1.5 text-xs font-bold text-[#1f4529]">
          {t("common.viewAll")}
          <IconArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4">
        <ScrollRail className="gap-3 pb-1 md:gap-4">
          {items.map((product) => (
            <ProductCard key={`${product.id}-${product.cart?.skuCode ?? ""}`} product={product} />
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}
