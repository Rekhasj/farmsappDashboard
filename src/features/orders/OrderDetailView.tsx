"use client";

import { useState } from "react";
import Link from "next/link";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import CartSummary from "@/features/cart/CartSummary";
import { useCart } from "@/features/cart/CartProvider";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import type { TranslationKey } from "@/i18n/translate";
import { formatRupees } from "@/lib/cart";
import type { OrderArticle, OrderDetail } from "@/types/order";
import { formatDate, normStatus, OrderItemRow, OrderTimeline } from "./shared";

/** RN ShipmentDetails: which date a package shows, by its status. */
const DATE_BY_STATUS: Record<string, [TranslationKey, keyof OrderArticle]> = {
  DELIVERED: ["orders.deliveredOn", "deliveredOn"],
  REFUND_INITIATED: ["orders.refundInitiatedOn", "refundInitiatedOn"],
  REFUNDED: ["orders.refundedOn", "refundedOn"],
  RETURN_TO_ORIGIN: ["orders.returnedOn", "returnedOn"],
  RETURNED: ["orders.returnedOn", "returnedOn"],
  CANCELLED: ["orders.cancelledOn", "cancelledOn"],
};

const CARD = "rounded-xl border border-[#eee] bg-white p-4";

/** Renders `<bold>…</bold>` from a translated string. */
const bold = (s: string) => s.split(/<\/?bold>/).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

export default function OrderDetailView({
  order,
  orderId,
  fromSuccess,
  mobile,
}: {
  order: OrderDetail | null;
  orderId: string;
  fromSuccess: boolean;
  mobile: string;
}) {
  const t = useT();
  const locale = useLocale();
  const { notify } = useCart();

  const header = (
    <header className="sticky top-0 z-10 border-b border-[#eee] bg-white py-3 md:static md:border-0 md:bg-transparent md:pt-6 md:pb-2">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 md:max-w-6xl md:px-6 xl:max-w-7xl 2xl:max-w-[1440px]">
        <BackLink href="/orders" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]">
          <IconArrowLeft className="size-4" />
        </BackLink>
        <h1 className="flex-1 truncate text-sm font-bold text-[#202020] md:text-xl">{t("orders.details")}</h1>
        <span className="flex items-center gap-1.5 text-[11px] text-[#6a7282]">
          {t("orders.orderId")}:
          <span className="rounded bg-[#F7F7F7] px-2 py-0.5 font-bold text-[#202020]">#{order?.orderId ?? orderId}</span>
        </span>
      </div>
    </header>
  );

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9FAFE] md:min-h-[60vh]">
        {header}
        <p className="pt-20 text-center text-sm font-bold text-[#6a7282]">{t("orders.notFound")}</p>
      </div>
    );
  }

  const articles = order.articles ?? [];
  const cancelled = normStatus(order.status) === "CANCELLED";
  const delivered = normStatus(order.status) === "DELIVERED";
  const paid = normStatus(order.paymentStatus) === "PAID";
  const shippingName = order.shippingAddress?.name || order.userName || "";
  const pin = order.farmerPincode ?? order.shippingAddress?.pincode ?? "";
  const addressLine = (order.farmerDeliveryAddress ?? "").split(",").slice(1, -1).map((s) => s.trim()).filter(Boolean).join(", ");

  return (
    <div className={`min-h-screen bg-[#F9FAFE] md:min-h-0 md:pb-14 ${fromSuccess ? "pb-28" : "pb-10"}`}>
      {header}
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-4 md:max-w-6xl md:px-6 lg:grid lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0 xl:max-w-7xl 2xl:max-w-[1440px]">
        <div className="space-y-4">
        {articles.length > 0 ? (
          <>
            {articles.length > 1 && (
              <div className="rounded-xl bg-[#EFF6FF] p-4 text-[#1C398E]">
                <p className="text-[13px] font-bold">{t("orders.shippedInPackages", { packageCount: articles.length })}</p>
                <p className="mt-0.5 text-xs">{t("orders.packagesNote")}</p>
              </div>
            )}
            {articles.map((a, i) => (
              <PackageCard key={a.articleId ?? i} article={a} index={i} total={articles.length} />
            ))}
          </>
        ) : (
          <>
            <section className={CARD}>
              <h2 className="text-sm font-bold text-[#202020]">
                {t("order.orderedItems")} ({order.orderedProducts?.length ?? 0})
              </h2>
              <div className="mt-1 divide-y divide-[#f0f0f0]">
                {(order.orderedProducts ?? []).map((item, i) => (
                  <OrderItemRow key={`${item.productId}-${i}`} item={item} />
                ))}
              </div>
            </section>
            <section className={CARD}>
              {cancelled ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#c80000]">✕ {t("orders.orderCancelled")}</p>
                    {order.cancelledOn && <p className="text-[11px] text-[#6a7282]">{formatDate(order.cancelledOn, locale)}</p>}
                  </div>
                  <span className="rounded-full bg-[#fdecec] px-2.5 py-1 text-[10px] font-bold text-[#c80000]">{t("orders.cancelledBadge")}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[#202020]">
                    🚚 {bold(t("orders.deliveryBy", { date: order.expectedDeliveryDate ?? "" }))}
                  </p>
                  <span className="rounded-full bg-[#e8f5ec] px-2.5 py-1 text-[10px] font-bold text-[#1f4529]">{t("orders.confirmed")}</span>
                </div>
              )}
              <OrderTimeline steps={order.statusTimeline} />
            </section>
          </>
        )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-22">
        <section className={CARD}>
          <h2 className="text-sm font-bold text-[#202020]">{t("orders.deliveryDetails")}</h2>
          <p className="mt-2 text-[11px] font-semibold uppercase text-[#6a7282]">{t("orders.shippingAddress")}</p>
          <p className="mt-1 text-[13px] font-bold text-[#202020]">{[shippingName, pin].filter(Boolean).join(", ")}</p>
          {addressLine && <p className="text-xs text-[#555]">{addressLine}</p>}
          <p className="mt-1 text-xs text-[#555]">
            {t("address.mobile")}: {order.mobileNumber || mobile}
          </p>
        </section>

        {!!order.priceSummary?.length && (
          <div className="space-y-2">
            <CartSummary rows={order.priceSummary} updating={false} />
            <div className={`${CARD} flex items-center justify-between text-xs`}>
              <span className="text-[#6a7282]">{t("order.paymentStatus")}</span>
              <span className={`font-bold ${paid ? "text-[#1f6b3a]" : "text-[#c80000]"}`}>
                {[order.paymentMode, order.paymentStatus].filter(Boolean).join(" • ")}
              </span>
            </div>
            {!!order.totalSavings && order.totalSavings > 0 && (
              <p className="rounded-lg bg-[#e8f5ec] px-3 py-2 text-center text-xs font-bold text-[#1f6b3a]">
                {t("checkout.save")} {formatRupees(order.totalSavings)}
              </p>
            )}
          </div>
        )}

        {!cancelled &&
          (delivered && order.invoice && /^https:\/\//.test(order.invoice) ? (
            <a href={order.invoice} target="_blank" rel="noopener noreferrer" className={`${CARD} flex items-center justify-between text-sm font-bold text-[#1f4529]`}>
              {t("orders.downloadInvoice")} <span aria-hidden>⬇</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => notify(t("orders.invoiceSoon"))}
              className={`${CARD} flex w-full items-center justify-between text-sm font-bold text-[#9a9a9a]`}
            >
              {t("orders.downloadInvoice")} <span aria-hidden>🔒</span>
            </button>
          ))}

        {order.orderTime && (
          <section className={CARD}>
            <h2 className="text-sm font-bold text-[#202020]">{t("orders.details")}</h2>
            <p className="mt-1 flex justify-between text-xs">
              <span className="text-[#6a7282]">{t("orders.placedAt")}</span>
              <span className="text-[#202020]">{order.orderTime}</span>
            </p>
          </section>
        )}
        </aside>
      </main>

      {fromSuccess && (
        <div className="fixed inset-x-0 bottom-0 border-t border-[#eee] bg-white px-4 py-3 md:static md:mt-6 md:border-0 md:bg-transparent">
          <Link href="/" className="mx-auto flex h-11 max-w-3xl items-center md:max-w-xs justify-center rounded-lg bg-[#1f4529] text-sm font-bold text-white">
            {t("order.continueShopping")}
          </Link>
        </div>
      )}
    </div>
  );
}

/** RN ShipmentDetails: one card per shipped package (open by default when there's only one). */
function PackageCard({ article, index, total }: { article: OrderArticle; index: number; total: number }) {
  const t = useT();
  const locale = useLocale();
  const [open, setOpen] = useState(total === 1);
  const status = normStatus(article.status);
  const [dateKey, dateField] = DATE_BY_STATUS[status] ?? ["orders.expectedDate", "estimatedDeliveryDate"];
  const dateValue = article[dateField] as string | undefined;
  const badgeColor = article.shipmentStatus?.statusColorCode || "#1f4529";
  const cod = (article.codAmount ?? 0) > 0;
  const dateRow = dateValue ? (
    <p className="mt-3 flex justify-between rounded-lg bg-[#1F452912] px-3 py-2 text-xs text-[#1F4529]">
      <span>{t(dateKey)}</span>
      <span className="font-bold">{formatDate(dateValue, locale)}</span>
    </p>
  ) : null;

  return (
    <section className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#202020]">
            {total > 1 ? t("orders.packageOf", { current: index + 1, total }) : t("orders.package")}
          </h2>
          <p className="text-[11px] text-[#6a7282]">
            {article.packages?.length ?? 0} {t("search.items")}
          </p>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: badgeColor }}>
          {pickText(article.shipmentStatus?.statusDescription, locale) || article.status}
        </span>
      </div>
      {dateRow}

      {open && (
        <div className="mt-3">
          {status === "REFUND_INITIATED" && (
            <div className="mb-3 rounded-lg border border-[#e5e5e5] p-3 text-xs">
              <p className="font-bold text-[#202020]">{t("orders.refundInfo")}</p>
              <p className="mt-1 flex justify-between">
                <span>{t("orders.refundAmount")}</span>
                <span className="font-bold">{formatRupees(article.refundAmount ?? 0)}</span>
              </p>
              {article.refundInitiatedDate && (
                <p className="flex justify-between">
                  <span>{t("orders.refundInitiatedOn")}</span>
                  <span>{formatDate(article.refundInitiatedDate, locale)}</span>
                </p>
              )}
              <p className="mt-1 text-[11px] text-[#6a7282]">{t("orders.refundNote")}</p>
            </div>
          )}
          {article.articleId && (
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <p className="rounded-lg border border-[#e5e5e5] p-2">
                <span className="block text-[#6a7282]">{t("orders.trackingId")}</span>
                <span className="font-bold text-[#202020]">{article.articleId}</span>
              </p>
              <p className="rounded-lg border border-[#e5e5e5] p-2">
                <span className="block text-[#6a7282]">{t("orders.courier")}</span>
                <span className="font-bold text-[#202020]">{article.deliveryPartner || "—"}</span>
              </p>
            </div>
          )}
          <div className="divide-y divide-[#f0f0f0]">
            {(article.packages ?? []).map((item, i) => (
              <OrderItemRow key={`${item.productId}-${i}`} item={item} />
            ))}
          </div>
          <p className="mt-2 flex items-center justify-between border-t border-dashed border-[#ddd] pt-2 text-xs">
            <span>
              {t("cart.totalAmount")} {formatRupees(article.totalAmount ?? 0)} • {cod ? t("orders.cod") : t("orders.online")}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                article.paymentStatus === "paid" ? "bg-[#e8f5ec] text-[#1f6b3a]" : "bg-[#fff4e5] text-[#9a5b00]"
              }`}
            >
              {article.paymentStatus === "paid" ? t("orders.paid") : t("orders.unpaid")}
            </span>
          </p>
          <OrderTimeline steps={article.statusTimeline} />
        </div>
      )}

      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-bold text-[#1f4529]">
        {open ? t("orders.hideDetails") : t("orders.viewDetails")}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
          ⌄
        </span>
      </button>
    </section>
  );
}
