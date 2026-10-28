"use client";

import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import { formatRupees } from "@/lib/cart";
import type { PriceRow } from "@/types/cart";

/**
 * "Order Summary" (RN components/Cart/CartSummary): renders the server's bill
 * rows as-is — no client-side maths. The item-count row is hidden like in the
 * app, debit rows get a "-" and the last row (grand total) is bold.
 */
export default function CartSummary({ rows, updating }: { rows: PriceRow[]; updating: boolean }) {
  const t = useT();
  const locale = useLocale();
  const visible = rows.filter((r) => r.type !== "info");
  if (visible.length === 0) return null;

  return (
    <section className={`rounded-xl border border-[#eee] bg-white p-4 transition-opacity ${updating ? "opacity-60" : ""}`} aria-busy={updating}>
      <h2 className="text-sm font-bold text-[#202020]">{t("cart.orderSummary")}</h2>
      <dl className="mt-3 space-y-2.5 text-[13px]">
        {visible.map((row, i) => {
          const last = i === visible.length - 1;
          const green = row.color === "green";
          const value =
            typeof row.value === "number" ? (
              <span>{(row.type === "debit" ? "-" : "") + formatRupees(row.value)}</span>
            ) : (
              <span className="flex items-baseline gap-1.5">
                {row.value.originalAmount !== row.value.finalAmount && (
                  <span className="text-[11px] text-[#9a9a9a] line-through">{formatRupees(row.value.originalAmount)}</span>
                )}
                <span>{formatRupees(row.value.finalAmount)}</span>
              </span>
            );
          return (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 ${last ? "border-t border-dashed border-[#ddd] pt-3 text-sm font-bold text-[#202020]" : "text-[#555]"} ${green ? "text-[#1f6b3a]" : ""}`}
            >
              <dt>{pickText(row.label, locale)}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
