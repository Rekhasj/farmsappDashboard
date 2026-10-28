"use client";

import { useT } from "@/i18n/I18nProvider";
import type { CartItemInput } from "@/lib/cart";
import { useCart } from "./CartProvider";
import NotifyMeButton from "./NotifyMeButton";
import QuantityStepper from "./QuantityStepper";

/**
 * Product-card action (RN ProductCardActions): "Add to Cart" until the SKU
 * is in the cart, then a `- qty +` stepper. Out-of-stock SKUs get "Notify Me".
 * `compact` = the short "Add" label.
 */
export default function AddToCartButton({
  input,
  compact = false,
  size = "sm",
}: {
  input: CartItemInput;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const t = useT();
  const { quantityOf, add, increment, decrement } = useCart();
  const quantity = quantityOf(input.skuCode);
  const height = { sm: "h-8 text-xs", md: "h-9 text-sm", lg: "h-11 text-base" }[size];

  if ((input.inventoryCount ?? 0) <= 0 && quantity === 0) {
    return <NotifyMeButton productId={input.productId} skuCode={input.skuCode} size={size} />;
  }

  if (quantity > 0) {
    return (
      <QuantityStepper
        quantity={quantity}
        size={size}
        onIncrement={() => increment(input.skuCode)}
        onDecrement={() => decrement(input.skuCode)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => add(input)}
      className={`flex w-full items-center justify-center rounded-lg border border-[#1f4529] bg-white font-bold text-[#1f4529] hover:bg-[#eef7ec] ${height}`}
    >
      {compact ? t("cart.add") : t("cart.addToCart")}
    </button>
  );
}
