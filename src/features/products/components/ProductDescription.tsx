"use client";

import type { ProductDetail } from "@/types/product";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";

/**
 * Description + Application & Dosage, full width under the PDP's
 * gallery/buy-box row. Side by side on desktop when both exist, stacked on mobile.
 */
export default function ProductDescription({ product }: { product: ProductDetail }) {
  const t = useT();
  const locale = useLocale();
  const sections = [
    { title: t("product.description"), body: pickText(product.description, locale) },
    { title: t("product.applicationDosage"), body: pickText(product.applicationAndDosage, locale) },
  ].filter((s) => s.body);

  if (sections.length === 0) return null;

  return (
    <div className={`mt-6 grid gap-3 px-4 sm:px-6 md:mt-10 md:gap-6 md:px-0 ${sections.length > 1 ? "md:grid-cols-2" : ""}`}>
      {sections.map((s) => (
        <section key={s.title} className="rounded-xl border border-[#eee] bg-[#fafafa] p-4 md:p-6">
          <h2 className="text-sm font-bold text-[#202020] md:text-base">{s.title}</h2>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[#555] md:text-sm md:leading-7">{s.body}</p>
        </section>
      ))}
    </div>
  );
}
