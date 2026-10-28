"use client";

import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickField, pickText } from "@/i18n/localize";
import type { Locale } from "@/i18n/config";
import { formatRupees } from "@/lib/cart";
import type { OrderItem, TimelineStep } from "@/types/order";

/** RN: statuses are compared upper-cased with spaces → "_". */
export const normStatus = (s?: string) => (s ?? "").trim().toUpperCase().replace(/\s+/g, "_");

/** RN OrderCard: these show "View Details" instead of "Track Order". */
export const isFinished = (s?: string) => ["DELIVERED", "CANCELLED", "RETURN_INITIATED"].includes(normStatus(s));

/** "#RRGGBB" + alpha suffix → tinted background, as the app does (`${color}1A`). */
export const tint = (hex: string | undefined, alpha: string) => (/^#[0-9a-f]{6}$/i.test(hex ?? "") ? `${hex}${alpha}` : undefined);

/** Backend dates are ISO-ish strings; show "Oct 22, 2026" (RN moment 'MMM D, YYYY'), with time when asked. */
export function formatDate(value: string | undefined, locale: Locale, withTime = false): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value; // already human text like "01 Nov 2026"
  return d.toLocaleString(`${locale}-IN`, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

/** RN OrderItem.js: image, name, size | qty, price, % OFF. Links to the product. */
export function OrderItemRow({ item }: { item: OrderItem }) {
  const t = useT();
  const locale = useLocale();
  const name = pickField(item, "productName", locale, "prefix");
  const price = item.netPrice ?? item.price ?? item.sellingPrice ?? 0;
  const body = (
    <>
      <ImageWithFallback label={name} imageUrl={item.productImageUrl} className="size-14 shrink-0 border border-[#f0f0f0]" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-semibold text-[#202020]">{name}</p>
        <p className="mt-0.5 text-[11px] text-[#8a8a8a]">
          {[item.skuSize, item.quantity ? `QTY: ${item.quantity}` : ""].filter(Boolean).join(" | ")}
        </p>
        <p className="mt-0.5 flex items-center gap-2">
          <span className="text-xs font-bold text-[#202020]">{formatRupees(price)}</span>
          {!!item.savings && (
            <span className="rounded bg-[#e8f5ec] px-1.5 py-0.5 text-[10px] font-bold text-[#1f6b3a]">
              {t("common.percentOff", { percent: item.savings })}
            </span>
          )}
        </p>
      </div>
    </>
  );
  return item.productId ? (
    <Link href={`/products/${item.productId}`} className="flex items-center gap-3 py-2.5 hover:bg-[#fafafa]">
      {body}
    </Link>
  ) : (
    <div className="flex items-center gap-3 py-2.5">{body}</div>
  );
}

/** RN OrderTracker / VerticalStatusStep. */
export function OrderTimeline({ steps }: { steps?: TimelineStep[] }) {
  const locale = useLocale();
  if (!steps?.length) return null;
  return (
    <ol className="mt-3">
      {steps.map((s, i) => {
        const color = s.completed ? s.colorCode || "#085f34" : "#9A9A9A";
        const last = i === steps.length - 1;
        return (
          <li key={s.appStatus ?? i} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && <span className="absolute left-[9px] top-5 h-full w-0.5" style={{ background: color }} aria-hidden />}
            <span
              className="relative z-1 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: color }}
              aria-hidden
            >
              {s.completed ? "✓" : ""}
            </span>
            <div className="min-w-0">
              <p className={`text-xs font-bold ${s.completed ? "text-[#202020]" : "text-[#9a9a9a]"}`}>{pickText(s.label, locale)}</p>
              {s.firstOccurredAt && <p className="text-[11px] text-[#6a7282]">{formatDate(s.firstOccurredAt, locale)}</p>}
              {s.subComments?.map((c, j) => (
                <p key={j} className="mt-0.5 text-[11px] text-[#6a7282]">
                  {pickText(c.text, locale)}
                  {c.occurredAt ? ` · ${formatDate(c.occurredAt, locale, true)}` : ""}
                </p>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
