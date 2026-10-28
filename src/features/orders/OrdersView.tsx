"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Skeletons";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import type { TranslationKey } from "@/i18n/translate";
import { formatRupees } from "@/lib/cart";
import type { OrderSummary } from "@/types/order";
import { isFinished, tint } from "./shared";

/** RN OrderPage ORDER_TABS. */
const TABS: { id: "" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED"; label: TranslationKey }[] = [
  { id: "", label: "orders.all" },
  { id: "IN_TRANSIT", label: "orders.inTransit" },
  { id: "DELIVERED", label: "orders.delivered" },
  { id: "CANCELLED", label: "orders.cancelled" },
];

type Page = { orders: OrderSummary[]; totalPages: number; total: number };

/**
 * RN OrderPage: status pills, order cards, infinite scroll (10 a page,
 * de-duplicated by orderId), "No Order Found!" when empty.
 */
export default function OrdersView() {
  const t = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("");
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // Page 1 whenever the filter changes.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/orders?page=1&status=${tab}`, { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Page>) : Promise.reject()))
      .then((d) => {
        setOrders(d.orders);
        setPage(1);
        setTotalPages(d.totalPages);
        if (tab === "") setTotal(d.total);
        setFailed(false);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") {
          setOrders([]);
          setFailed(true);
        }
      });
    return () => ctrl.abort();
  }, [tab]);

  // Next page when the bottom comes into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !orders || page >= totalPages || loadingMore) return;
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      setLoadingMore(true);
      try {
        const r = await fetch(`/api/orders?page=${page + 1}&status=${tab}`, { cache: "no-store" });
        const d = (await r.json()) as Page;
        setOrders((prev) => {
          const seen = new Set((prev ?? []).map((o) => o.orderId));
          return [...(prev ?? []), ...(d.orders ?? []).filter((o) => !seen.has(o.orderId))];
        });
        setPage((p) => p + 1);
      } catch {
        /* stop paging quietly */
        setTotalPages(page);
      } finally {
        setLoadingMore(false);
      }
    }, { rootMargin: "40px" });
    io.observe(el);
    return () => io.disconnect();
  }, [orders, page, totalPages, tab, loadingMore]);

  const showFilters = (orders?.length ?? 0) > 0 || tab !== "";

  return (
    <div className="min-h-screen bg-[#F9FAFE] pb-10 md:min-h-[60vh] md:pb-14">
      <header className="sticky top-0 z-10 border-b border-[#eee] bg-white py-3 md:static md:border-0 md:bg-transparent md:pt-6 md:pb-2">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 md:max-w-6xl md:px-6 xl:max-w-7xl 2xl:max-w-[1440px]">
          <BackLink href="/" aria-label={t("common.backToHome")} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]">
            <IconArrowLeft className="size-4" />
          </BackLink>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{t("common.myOrders")}</h1>
            {!!total && total > 0 && (
              <p className="text-[11px] text-[#99A1AF]">
                {total} {t("orders.count")}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 md:max-w-6xl md:px-6 xl:max-w-7xl 2xl:max-w-[1440px]">
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
            {TABS.map((tb) => (
              <button
                key={tb.id || "all"}
                type="button"
                role="tab"
                aria-selected={tab === tb.id}
                onClick={() => {
                  if (tab === tb.id) return;
                  setOrders(null);
                  setTab(tb.id);
                }}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-bold ${
                  tab === tb.id ? "border-[#1F4529] bg-[#1F4529] text-white" : "border-[#E5E7EB] bg-white text-[#374151]"
                }`}
              >
                {t(tb.label)}
              </button>
            ))}
          </div>
        )}

        {orders === null ? (
          <div className="flex justify-center pt-16">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center pt-20 text-center">
            <BoxIcon />
            <p className="mt-4 text-base font-bold text-[#202020]">{failed ? t("common.somethingWentWrong") : t("orders.empty")}</p>
            <Link href="/" className="mt-5 rounded-lg bg-[#1f4529] px-6 py-2.5 text-sm font-bold text-white">
              {t("cart.startShopping")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-4 pt-1 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 xl:grid-cols-3">
            {orders.map((o) => (
              <li key={o.orderId} className="md:h-full">
                <OrderCard order={o} />
              </li>
            ))}
          </ul>
        )}
        <div ref={sentinel} />
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Spinner className="size-6" />
          </div>
        )}
      </main>
    </div>
  );
}

/** RN components/Orders/OrderCard. */
function OrderCard({ order }: { order: OrderSummary }) {
  const t = useT();
  const locale = useLocale();
  const color = order.statusColorCode || "#2563EB";
  const amount = order.finalPrice ?? order.discountedPrice ?? order.totalAmount ?? 0;
  const done = isFinished(order.status);
  return (
    <Link href={`/orders/${order.orderId}`} className="flex h-full flex-col rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color, background: tint(color, "1A") ?? "#2563EB1A" }}>
          {pickText(order.statusDescription, locale) || order.status}
        </span>
        <span className="text-[17px] font-extrabold text-[#101828]">{formatRupees(amount)}</span>
      </div>
      {order.statusDateText && <p className="mt-2 text-[13px] text-[#6A7282]">{pickText(order.statusDateText, locale)}</p>}
      {!!order.orderedProducts?.length && (
        <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {order.orderedProducts.map((p, i) => (
            <span key={`${p.productId}-${i}`} className="flex size-15 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#F7F7F7]">
              {p.productImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.productImageUrl} alt="" className="size-full object-contain p-1" loading="lazy" />
              )}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 flex justify-between text-xs text-[#99A1AF]">
        <span>
          {order.totalSku ?? order.orderedProducts?.length ?? 0} {t("search.items")}
        </span>
        <span>#{order.orderId}</span>
      </p>
      {/* Pushes the button to the bottom so cards in a grid row line up. */}
      <span className="min-h-3 flex-1" aria-hidden />
      <span
        className={`flex h-10 items-center justify-center rounded-lg text-sm font-bold ${
          done ? "border border-[#DDDDDD] text-[#202020]" : "bg-[#1f4529] text-white"
        }`}
      >
        {done ? t("orders.viewDetails") : t("home.trackOrder")}
      </span>
    </Link>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-[71px] text-[#c9d6cc]" aria-hidden>
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
