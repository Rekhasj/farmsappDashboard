"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { parseDeliveryDate } from "@/features/cart/ExpectedDelivery";
import type { Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickField } from "@/i18n/localize";
import { formatRupees } from "@/lib/cart";
import type { PlacedOrder } from "@/types/cart";
import { LAST_ORDER_KEY } from "./CheckoutView";

const readStored = () => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
};
const noSubscribe = () => () => {};

/**
 * Order Placed (RN OrderSuccessPage): tick header, payment badge, expected
 * delivery, address, ordered items, total, payment status, Continue Shopping.
 * The details were saved in sessionStorage when the order was placed; if
 * they're gone (new tab), only the order number is shown.
 */
export default function OrderPlacedView({ orderId }: { orderId: string }) {
  const t = useT();
  const locale = useLocale();
  const raw = useSyncExternalStore(noSubscribe, readStored, () => null);
  const order = useMemo(() => {
    try {
      const o = raw ? (JSON.parse(raw) as PlacedOrder) : null;
      return o && (!orderId || o.orderId === orderId) ? o : null;
    } catch {
      return null;
    }
  }, [raw, orderId]);
  const cod = order?.paymentMode === "COD";
  const detailsHref = `/orders/${encodeURIComponent(orderId)}?from=success`;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10">
      <div className="bg-[#1f4529] px-4 pb-10 pt-12 text-center text-white">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/15">
          <svg viewBox="0 0 24 24" fill="none" className="size-9" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-4 text-lg font-bold">{t("order.placedTitle")}</h1>
        {orderId && <p className="mt-1 text-xs text-white/80">#{orderId}</p>}
        {order && (
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
            {cod ? t("checkout.cod") : t("order.paymentSuccessful")}
          </span>
        )}
      </div>

      <main className="mx-auto -mt-5 w-full max-w-xl space-y-4 px-4">
        {/* RN "Track your order" card → opens the order details. */}
        {orderId && (
          <Link href={detailsHref} className="flex items-center gap-3 rounded-xl border border-[#eee] bg-white p-4 hover:border-[#b9d3bd]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef7ec] text-lg" aria-hidden>
              📦
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#202020]">{t("orders.trackYourOrder")}</span>
              {order?.expectedDeliveryDate && (
                <span className="block text-xs text-[#555]">
                  {t("order.expectedDelivery")}: {formatLongDate(order.expectedDeliveryDate, locale)}
                </span>
              )}
              <span className="block text-[11px] text-[#1f4529]">{t("orders.clickToTrack")}</span>
            </span>
            <span className="text-[#1f4529]" aria-hidden>
              ›
            </span>
          </Link>
        )}

        {order?.address && (
          <section className="rounded-xl border border-[#eee] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase text-[#6a7282]">{t("order.deliveringTo")}</p>
            <p className="mt-1 text-[13px] text-[#202020]">{order.address}</p>
          </section>
        )}

        {order && (
          <section className="rounded-xl border border-[#eee] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#202020]">{t("order.orderedItems")}</h2>
              <span className="text-[11px] text-[#6a7282]">#{order.orderId}</span>
            </div>
            <ul className="mt-2 divide-y divide-[#f0f0f0]">
              {order.items.map((item) => {
                const name = pickField(item, "productName", locale);
                return (
                  <li key={item.skuCode} className="flex items-center gap-3 py-2.5">
                    <ImageWithFallback label={name} imageUrl={item.imageUrl} className="size-12 border border-[#f0f0f0]" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold text-[#202020]">{name}</p>
                      <p className="text-[11px] text-[#8a8a8a]">
                        {item.title} | QTY: {item.quantity}
                      </p>
                      {!!item.savings && (
                        <span className="mt-0.5 inline-block rounded bg-[#e8f5ec] px-1.5 py-0.5 text-[10px] font-bold text-[#1f6b3a]">
                          {t("common.percentOff", { percent: item.savings })}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#202020]">{formatRupees(item.price * item.quantity)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-[#ddd] pt-3 text-sm font-bold text-[#202020]">
              <span>{t("order.total")}</span>
              <span>{formatRupees(order.total)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#6a7282]">{t("order.paymentStatus")}</span>
              <span className={`font-bold ${cod ? "text-[#9a5b00]" : "text-[#1f6b3a]"}`}>{cod ? t("order.codUnpaid") : t("order.onlinePaid")}</span>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/" className="flex h-11 items-center justify-center rounded-lg border border-[#1f4529] text-sm font-bold text-[#1f4529]">
            🏠 {t("order.continueShopping")}
          </Link>
          {orderId ? (
            <Link href={detailsHref} className="flex h-11 items-center justify-center rounded-lg bg-[#1f4529] px-2 text-center text-sm font-bold text-white">
              {t("orders.goToDetails")}
            </Link>
          ) : (
            <span />
          )}
        </div>
      </main>
    </div>
  );
}

/** RN formatDeliveryDate: "12 Jan 2026" → "January 12th" (English); other languages use their own month name. */
function formatLongDate(value: string, locale: Locale): string {
  const d = parseDeliveryDate(value);
  if (!d) return value;
  const month = d.toLocaleString(`${locale}-IN`, { month: "long", timeZone: "UTC" });
  const day = d.getUTCDate();
  if (locale !== "en") return `${day} ${month}`;
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${month} ${day}${suffix}`;
}
