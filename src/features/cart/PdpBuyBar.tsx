"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { formatRupees, type CartItemInput } from "@/lib/cart";
import AddToCartButton from "./AddToCartButton";
import { useCart } from "./CartProvider";

/**
 * PDP actions (RN components/ProductDetail/BottomButton.js): Add to Cart /
 * stepper on the left, "Buy Now • ₹price" (adds, then opens the cart) or
 * "Go To Cart" on the right. Fixed to the bottom on mobile, inline on desktop.
 */
export default function PdpBuyBar({ input }: { input: CartItemInput }) {
  const t = useT();
  const router = useRouter();
  const { quantityOf, add } = useCart();
  const inCart = quantityOf(input.skuCode) > 0;
  const inStock = (input.inventoryCount ?? 0) > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eee] bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:static md:mt-5 md:border-0 md:p-0 md:shadow-none">
      <div className="mx-auto flex max-w-xl gap-3 md:max-w-none">
        <div className="flex-1">
          <AddToCartButton input={input} size="lg" />
        </div>
        {inStock && (
          <button
            type="button"
            onClick={() => {
              if (!inCart) add(input);
              router.push("/cart");
            }}
            className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#1f4529] px-3 text-sm font-bold text-white hover:bg-[#2e5b3a] md:text-base"
          >
            {inCart ? t("cart.goToCart") : `${t("cart.buyNow")} • ${formatRupees(input.price)}`}
          </button>
        )}
      </div>
    </div>
  );
}
