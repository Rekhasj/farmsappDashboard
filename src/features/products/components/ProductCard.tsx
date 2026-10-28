import Link from "next/link";
import BenefitTag from "@/components/ui/BenefitTag";
import DiscountBadge from "@/components/ui/DiscountBadge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import PriceDisplay from "@/components/ui/PriceDisplay";
import PackSizeSelector from "./PackSizeSelector";
import AddToCartButton from "@/features/cart/AddToCartButton";
import NotifyMeButton from "@/features/cart/NotifyMeButton";
import type { CartItemInput } from "@/lib/cart";

export type Product = {
  id: number | string;
  name: string;
  technicalName?: string;
  tag: string;
  tagTone: "green" | "purple" | "orange";
  discount?: string;
  price: string;
  mrp: string;
  size: string;
  imageUrl?: string;
  /** Cart line for the shown SKU; absent on static fallback cards and on products with no SKU (Notify Me). */
  cart?: CartItemInput;
};

/**
 * CSV component #15 — ProductCard (vertical grid/carousel card).
 * Used by the Best Selling row. No Add to Cart control (current scope).
 * Links to the PDP only for real (numeric) ids; static fallback cards
 * render without a link instead of 404ing. The name is clamped to 2 lines
 * and the technical-name line and benefit-tag row always reserve their height, so price and size
 * selector line up across cards whether or not a product has a tag.
 * The link is "stretched" over the card (absolute overlay) so the Add to
 * Cart control can sit above it — a button can't live inside an <a>.
 */
export default function ProductCard({
  product,
  widthClass = "w-37.5 shrink-0 md:w-52",
}: {
  product: Product;
  /** Width utilities — the default suits the Best Selling carousel; pass "w-full" inside a grid. */
  widthClass?: string;
}) {
  const isReal = typeof product.id === "number";

  const inner = (
    <>
      {product.discount && <DiscountBadge label={product.discount} />}
      <ImageWithFallback label={product.name} imageUrl={product.imageUrl} className="h-25 w-full md:h-40" />
      <p className="mt-2 line-clamp-2 min-h-[2.5em] text-ellipsis text-xs font-bold text-[#202020]">
        {product.name}
      </p>
      <p className="mt-0.5 min-h-[1.25em] truncate text-[12px] leading-tight text-[#3d3d3d]" title={product.technicalName}>
        {product.technicalName}
      </p>
      <div className="mt-1 min-h-5">
        {product.tag && <BenefitTag label={product.tag} tone={product.tagTone} />}
      </div>
      {product.price && (
        <>
          <div className="mt-1.5">
            <PriceDisplay price={product.price} mrp={product.mrp} />
          </div>
          <div className="mt-2 w-full">
            <PackSizeSelector size={product.size} fullWidth />
          </div>
        </>
      )}
    </>
  );

  return (
    <div className={`relative flex flex-col ${widthClass} rounded-[10px] border border-[#eee] bg-white p-2.5`}>
      {isReal && (
        <Link href={`/products/${product.id}`} aria-label={product.name} className="absolute inset-0 z-1 rounded-[10px]" />
      )}
      {inner}
      {isReal && (
        <div className="relative z-2 mt-auto pt-2">
          {product.cart ? (
            <AddToCartButton input={product.cart} />
          ) : (
            // RN ProductCommonCard: a product with no SKU gets Notify Me.
            <NotifyMeButton productId={product.id as number} />
          )}
        </div>
      )}
    </div>
  );
}
