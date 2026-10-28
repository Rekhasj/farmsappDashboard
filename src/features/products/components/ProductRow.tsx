import Link from "next/link";
import BenefitTag from "@/components/ui/BenefitTag";
import DiscountBadge from "@/components/ui/DiscountBadge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import PriceDisplay from "@/components/ui/PriceDisplay";
import StockStatusLabel from "@/components/ui/StockStatusLabel";
import PackSizeSelector from "./PackSizeSelector";
import AddToCartButton from "@/features/cart/AddToCartButton";
import NotifyMeButton from "@/features/cart/NotifyMeButton";
import type { CartItemInput } from "@/lib/cart";

export type ProductRowItem = {
  id: number | string;
  name: string;
  tag: string;
  tagTone: "green" | "purple" | "orange";
  description: string;
  price: string;
  mrp: string;
  size: string;
  badge?: string;
  outOfStock?: boolean;
  imageUrl?: string;
  /** Cart line for the shown SKU; absent on static fallback rows. */
  cart?: CartItemInput;
};

/**
 * CSV component #16 — ProductRow (list-style item), used by All Products.
 * Per current scope, no Add to Cart / Notify Me control is rendered.
 * Links to the PDP only for real (numeric) ids. Name, technical name and tag
 * rows always reserve their height so rows stay equal whether or not they exist.
 * Stretched link (see ProductCard) so the Add to Cart control can sit above it.
 */
export default function ProductRow({ item }: { item: ProductRowItem }) {
  const isReal = typeof item.id === "number";

  const inner = (
    <>
      {/* Badge sits on the card's own top-left corner (same as ProductCard), not inset with the image. */}
      {item.badge && <DiscountBadge label={item.badge} />}
      <div className="relative shrink-0 self-start">
        {item.outOfStock && <StockStatusLabel />}
        <ImageWithFallback label={item.name} imageUrl={item.imageUrl} className="size-22.5 md:size-32" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="line-clamp-2 min-h-[2.5em] text-[13px] font-bold text-[#202020]">{item.name}</p>
        <p className="mt-0.5 min-h-[1.25em] truncate text-[12px] text-[#3d3d3d]" title={item.description}>
          {item.description}
        </p>
        <div className="mt-1 min-h-5">
          {item.tag && <BenefitTag label={item.tag} tone={item.tagTone} />}
        </div>

        {item.price && (
          <div className="mt-2 flex items-center gap-3">
            <PriceDisplay price={item.price} mrp={item.mrp} />
            <PackSizeSelector size={item.size} />
          </div>
        )}
        {isReal && (
          <div className="relative z-2 mt-2.5 w-32 self-end md:mt-auto md:pt-2.5">
            {item.cart ? (
              <AddToCartButton input={item.cart} />
            ) : (
              // RN ProductCommonCard: a product with no SKU gets Notify Me.
              <NotifyMeButton productId={item.id as number} />
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="relative flex gap-3 py-4 md:h-full md:rounded-[10px] md:border md:border-[#e5e5e5] md:p-3">
      {isReal && (
        <Link href={`/products/${item.id}`} aria-label={item.name} className="absolute inset-0 z-1 md:rounded-[10px]" />
      )}
      {inner}
    </div>
  );
}
