"use client";

import { useLocale, useT } from "@/i18n/I18nProvider";

/** RN ExpectedDeliverySection: "Delivery by **Nov 1**" + today / tomorrow / N days badge. Used on cart + checkout. */
export default function ExpectedDelivery({ date, hasDivider = false }: { date: string; hasDivider?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const parsed = parseDeliveryDate(date);
  if (!parsed) return null;

  const today = new Date();
  const days = Math.round(
    (Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86_400_000,
  );
  const badge =
    days <= 0 ? t("cart.deliveryToday") : days === 1 ? t("cart.deliveryTomorrow") : t("cart.daysDelivery", { count: days });

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 ${hasDivider ? "mt-3 border-t border-[#f0f0f0] pt-3" : ""}`}>
      <p className="text-[13px] text-[#202020]">
        <BoldTags
          text={t("cart.deliveryBy", {
            month: parsed.toLocaleString(`${locale}-IN`, { month: "short", timeZone: "UTC" }),
            day: parsed.getUTCDate(),
          })}
        />
      </p>
      <span className="rounded-full bg-[#e8f5ec] px-2.5 py-1 text-[11px] font-bold text-[#1f4529]">{badge}</span>
    </div>
  );
}

/** Renders i18next-style `<bold>…</bold>` from a translated string. */
function BoldTags({ text }: { text: string }) {
  return <>{text.split(/<\/?bold>/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Backend format: "01 Nov 2026". */
export function parseDeliveryDate(value: string): Date | null {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})$/.exec(value.trim());
  const month = m ? MONTHS.indexOf(m[2].toLowerCase()) : -1;
  return m && month >= 0 ? new Date(Date.UTC(Number(m[3]), month, Number(m[1]))) : null;
}
