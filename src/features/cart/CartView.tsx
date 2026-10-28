"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { Spinner } from "@/components/ui/Skeletons";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickField } from "@/i18n/localize";
import { formatRupees, isInStock } from "@/lib/cart";
import type { CartItem } from "@/types/cart";
import CartDeliveryBlock, { useAddressNavigation, type CartDelivery } from "@/features/address/CartDeliveryBlock";
import CartRecommendations from "./CartRecommendations";
import CartSummary from "./CartSummary";
import { useCart } from "./CartProvider";
import QuantityStepper from "./QuantityStepper";

const CONTAINER = "mx-auto w-full px-4 sm:px-6 md:max-w-6xl";

/**
 * Cart page body (RN CartPage.js), top to bottom: delivery info, out-of-stock
 * items, cart items, "You might also like", Order Summary, then the total +
 * "Choose Payment Mode" footer (sticky on mobile, a side card on desktop).
 * "Choose Payment Mode" opens /checkout (out-of-stock lines are removed first, like the app's modal).
 */
export default function CartView({ delivery }: { delivery: CartDelivery }) {
  const t = useT();
  const router = useRouter();
  const { items, details, loaded, syncing, refresh, remove } = useCart();
  const [confirmSku, setConfirmSku] = useState<string | null>(null);

  // RN refetches the cart every time the cart page gets focus, for fresh prices/stock.
  useEffect(() => {
    const id = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(id);
  }, [refresh]);

  const inStock = items.filter(isInStock);
  const outOfStock = items.filter((i) => !isInStock(i));
  const summary = details?.codPriceSummary ?? details?.priceSummary ?? [];
  const serviceable = details?.serviceable !== false;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-40 md:pb-10">
      <header className="sticky top-0 z-10 md:static border-b border-[#eee] bg-white py-3">
        <div className={`${CONTAINER} flex items-center gap-3`}>
          <BackLink href="/" aria-label={t("common.backToHome")} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]">
            <IconArrowLeft className="size-4" />
          </BackLink>
          <h1 className="truncate text-sm font-bold text-[#202020]">{t("cart.title")}</h1>
        </div>
      </header>

      {!loaded ? (
        <div className="flex justify-center pt-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <main className={`${CONTAINER} pt-4 md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-6 md:pt-6`}>
          <div className="space-y-4">
            <CartDeliveryBlock
              delivery={delivery}
              serviceable={serviceable}
              expectedDeliveryDate={inStock.length > 0 ? details?.expectedDeliveryDate : undefined}
            />

            {outOfStock.length > 0 && (
              <section className="rounded-xl border border-[#f3d4d4] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-[#202020]">
                    {t("cart.outOfStockItems")} ({outOfStock.length})
                  </h2>
                  <button type="button" onClick={() => remove(...outOfStock.map((i) => i.skuCode))} className="text-xs font-bold text-[#c80000] hover:underline">
                    {t("cart.removeAll")}
                  </button>
                </div>
                <ul className="mt-2 divide-y divide-[#f0f0f0]">
                  {outOfStock.map((item) => (
                    <CartLineRow key={item.skuCode} item={item} />
                  ))}
                </ul>
              </section>
            )}

            {inStock.length > 0 && (
              <section className="rounded-xl border border-[#eee] bg-white p-4">
                <h2 className="text-sm font-bold text-[#202020]">
                  {outOfStock.length > 0 ? t("cart.availableItems") : t("cart.items")} ({inStock.length})
                </h2>
                <ul className="mt-2 divide-y divide-[#f0f0f0]">
                  {inStock.map((item) => (
                    <CartLineRow key={item.skuCode} item={item} onAskRemove={() => setConfirmSku(item.skuCode)} />
                  ))}
                </ul>
              </section>
            )}

            <CartRecommendations />
          </div>

          <aside className="mt-4 space-y-4 md:sticky md:top-20 md:mt-0">
            <CartSummary rows={summary} updating={syncing} />
            <CheckoutFooter
              total={details?.serviceable === false ? 0 : (details?.discountedPrice ?? 0)}
              inStockCount={inStock.length}
              outOfStockCount={outOfStock.length}
              updating={syncing}
              serviceable={serviceable}
              delivery={delivery}
              onProceed={() => {
                if (outOfStock.length > 0) remove(...outOfStock.map((i) => i.skuCode));
                router.push("/checkout");
              }}
            />
          </aside>
        </main>
      )}

      {confirmSku && (
        <ConfirmRemove
          onCancel={() => setConfirmSku(null)}
          onConfirm={() => {
            remove(confirmSku);
            setConfirmSku(null);
          }}
        />
      )}
    </div>
  );
}

function CartLineRow({ item, onAskRemove }: { item: CartItem; onAskRemove?: () => void }) {
  const t = useT();
  const locale = useLocale();
  const { increment, decrement } = useCart();
  const name = pickField(item, "productName", locale);
  const price = item.netPrice ?? item.price;
  const offer = !!item.savings && item.mrp > price;
  const available = isInStock(item);

  return (
    <li className="flex gap-3 py-3">
      <Link href={`/products/${item.productId}`} className="shrink-0">
        <ImageWithFallback label={name} imageUrl={item.imageUrl} className={`size-18 border border-[#f0f0f0] ${available ? "" : "opacity-50"}`} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/products/${item.productId}`} className="line-clamp-2 text-[13px] font-semibold text-[#202020] hover:underline">
          {name}
        </Link>
        <p className="mt-0.5 text-[11px] text-[#8a8a8a]">{item.title}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          {available ? (
            <p className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-[#1f6b3a]">{formatRupees(price)}</span>
              {offer && <span className="text-[11px] text-[#9a9a9a] line-through">{formatRupees(item.mrp)}</span>}
            </p>
          ) : (
            <p className="text-xs font-bold text-[#c80000]">{t("common.outOfStock")}</p>
          )}
          {available && (
            <div className="w-28">
              <QuantityStepper
                quantity={item.quantity}
                size="sm"
                trashAtOne
                onIncrement={() => increment(item.skuCode)}
                onDecrement={() => (item.quantity === 1 && onAskRemove ? onAskRemove() : decrement(item.skuCode))}
              />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function CheckoutFooter({
  total,
  inStockCount,
  outOfStockCount,
  updating,
  serviceable,
  delivery,
  onProceed,
}: {
  total: number;
  inStockCount: number;
  outOfStockCount: number;
  updating: boolean;
  serviceable: boolean;
  delivery: CartDelivery;
  onProceed: () => void;
}) {
  const t = useT();
  const { go: changeAddress, modal } = useAddressNavigation(delivery);
  const disclaimer =
    outOfStockCount === 0
      ? null
      : inStockCount === 0
        ? t("cart.allOutOfStock")
        : t("cart.someOutOfStock", { outOfStockItemsCount: outOfStockCount });

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eee] bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:static md:rounded-xl md:border md:p-4 md:shadow-none">
      <div className="mx-auto max-w-xl md:max-w-none">
        {disclaimer && <p className="mb-2 text-[11px] font-medium text-[#c80000]">{disclaimer}</p>}
        {inStockCount > 0 && !delivery.address ? (
          // RN CartFooter: no delivery address yet → one address button instead of the total + payment CTA.
          <button
            type="button"
            onClick={changeAddress}
            className="h-11 w-full rounded-lg bg-[#1f4529] px-3 text-sm font-bold text-white hover:bg-[#2e5b3a]"
          >
            {delivery.pincode && delivery.hasAddresses ? t("address.changeDelivery") : t("address.addDelivery")}
          </button>
        ) : inStockCount > 0 ? (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <p className="text-[11px] text-[#6a7282]">{t("cart.totalAmount")}</p>
              <p className={`text-lg font-bold text-[#202020] ${updating ? "opacity-50" : ""}`}>{formatRupees(total)}</p>
            </div>
            <div className="flex-1 text-right">
              <button
                type="button"
                disabled={updating || !serviceable}
                onClick={onProceed}
                className="h-11 w-full rounded-lg bg-[#1f4529] px-3 text-sm font-bold text-white hover:bg-[#2e5b3a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("cart.choosePaymentMode")}
              </button>
              {!serviceable && <p className="mt-1 text-[10px] text-[#c80000]">{t("checkout.notServiceable")}</p>}
            </div>
          </div>
        ) : (
          <Link href="/" className="flex h-11 items-center justify-center rounded-lg bg-[#1f4529] text-sm font-bold text-white">
            {t("cart.startShopping")}
          </Link>
        )}
      </div>
      {modal}
    </div>
  );
}

function EmptyCart() {
  const t = useT();
  return (
    <div className="flex flex-col items-center px-6 pt-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-[#eef7ec]">
        <svg viewBox="0 0 24 24" fill="none" className="size-10 text-[#1f4529]" aria-hidden>
          <path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9.5" cy="19.5" r="1.3" fill="currentColor" />
          <circle cx="17" cy="19.5" r="1.3" fill="currentColor" />
        </svg>
      </div>
      <p className="mt-5 text-base font-bold text-[#202020]">{t("cart.empty")}</p>
      <p className="mt-1.5 max-w-xs text-xs text-[#6a7282]">{t("cart.emptyDescription")}</p>
      <Link href="/" className="mt-6 rounded-lg bg-[#1f4529] px-6 py-2.5 text-sm font-bold text-white">
        {t("cart.startShopping")}
      </Link>
    </div>
  );
}

function ConfirmRemove({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full rounded-t-2xl bg-white p-5 md:max-w-sm md:rounded-2xl">
        <p className="text-center text-sm font-bold text-[#202020]">{t("cart.removeConfirm")}</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="h-10 flex-1 rounded-lg border border-[#ddd] text-sm font-bold text-[#202020]">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={onConfirm} autoFocus className="h-10 flex-1 rounded-lg bg-[#c80000] text-sm font-bold text-white">
            {t("cart.remove")}
          </button>
        </div>
      </div>
    </div>
  );
}
