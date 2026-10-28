"use client";

import { useT } from "@/i18n/I18nProvider";

/**
 * `- qty +` control (RN CartActions / CartItemQuantitySection). With
 * `trashAtOne`, the minus becomes a bin icon at quantity 1 (cart page).
 */
export default function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
  trashAtOne = false,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md" | "lg";
  trashAtOne?: boolean;
}) {
  const t = useT();
  const box = { sm: "h-8 text-xs", md: "h-9 text-sm", lg: "h-11 text-base" }[size];
  const btn = { sm: "w-8", md: "w-9", lg: "w-11" }[size];
  const showTrash = trashAtOne && quantity === 1;

  return (
    <div className={`flex w-full items-center justify-between overflow-hidden rounded-lg bg-[#1f4529] font-bold text-white ${box}`}>
      <button
        type="button"
        onClick={onDecrement}
        aria-label={showTrash ? t("cart.remove") : t("cart.decrease")}
        className={`flex h-full ${btn} shrink-0 items-center justify-center hover:bg-white/10`}
      >
        {showTrash ? (
          <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
            <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span aria-hidden>−</span>
        )}
      </button>
      <span aria-live="polite" className="min-w-6 text-center tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={t("cart.increase")}
        className={`flex h-full ${btn} shrink-0 items-center justify-center hover:bg-white/10`}
      >
        <span aria-hidden>+</span>
      </button>
    </div>
  );
}
