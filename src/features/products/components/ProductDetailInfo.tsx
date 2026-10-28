"use client";

import { useState } from "react";
import BenefitTag from "@/components/ui/BenefitTag";
import type { ProductDetail } from "@/types/product";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import PdpBuyBar from "@/features/cart/PdpBuyBar";
import NotifyMeButton from "@/features/cart/NotifyMeButton";
import { cartInputFromDetail } from "@/lib/cart";

const TAG_TONES = ["green", "purple", "orange"] as const;

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/**
 * PDP buy box, beside the gallery on desktop: name, tags, price for the
 * selected pack size, size picker, delivery note. Client component so the
 * pack-size picker can update the shown price without a page reload.
 * The long text lives in ProductDescription, below both columns, so the
 * image column isn't left with a tall empty gap.
 * No Add to Cart / Notify Me control, per current scope.
 */
export default function ProductDetailInfo({ product }: { product: ProductDetail }) {
  const t = useT();
  const locale = useLocale();
  const text = (value: Parameters<typeof pickText>[0]) => pickText(value, locale);
  const skus = product.inventory ?? [];
  const [selectedCode, setSelectedCode] = useState(skus[0]?.skuCode);
  const selected = skus.find((s) => s.skuCode === selectedCode) ?? skus[0];

  const unavailable =
    product.deliveryStatus === "PRODUCT_UNAVAILABLE" || product.deliveryStatus === "PINCODE_UNSERVICEABLE";

  return (
    <div className="px-4 pt-5 sm:px-6 md:px-0 md:pt-2">
      {/* Title block */}
      <section>
        {product.tags && product.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {product.tags.map((tag, i) => (
              <BenefitTag key={tag.position ?? i} label={text(tag.text)} tone={TAG_TONES[i % TAG_TONES.length]} />
            ))}
          </div>
        )}
        <h1 className="text-lg font-bold leading-snug text-[#202020] md:text-2xl">{text(product.productName)}</h1>
        {text(product.technicalName) && (
          <p className="mt-1.5 text-[13px] leading-snug text-[#8a8a8a] md:text-sm">{text(product.technicalName)}</p>
        )}

        {selected && (
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-bold text-[#202020] md:text-3xl">{formatRupees(selected.netPrice)}</span>
            {selected.mrp > selected.netPrice && (
              <span className="text-sm text-[#8a8a8a] line-through">{formatRupees(selected.mrp)}</span>
            )}
            {!!selected.savings && (
              <span className="text-sm font-bold text-[#1f4529]">{t("common.percentOff", { percent: selected.savings })}</span>
            )}
          </div>
        )}
      </section>

      {/* Pack size */}
      {skus.length > 0 && (
        <section className="mt-5 border-t border-[#f0f0f0] pt-5">
          <h2 className="text-sm font-bold text-[#202020]">{t("product.packSize")}</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {skus.map((sku) => {
              const active = sku.skuCode === selected?.skuCode;
              const outOfStock = (sku.inventoryCount ?? 0) <= 0;
              return (
                <button
                  key={sku.skuCode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCode(sku.skuCode)}
                  className={`min-w-18 rounded-lg border px-4 py-2 text-sm font-semibold ${
                    active ? "border-[#1f4529] bg-[#eef7ec] text-[#1f4529]" : "border-[#ddd] text-[#202020]"
                  } ${outOfStock && !active ? "text-[#9a9a9a]" : ""}`}
                >
                  {sku.skuSize}
                  {sku.skuUnit}
                  {outOfStock ? ` · ${t("common.outOfStock")}` : ""}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Buy actions — RN getPurchaseState: none when the product/pincode can't be served */}
      {selected && !unavailable && <PdpBuyBar input={cartInputFromDetail(product, selected)} />}
      {!selected && !unavailable && (
        <div className="mt-5">
          <NotifyMeButton productId={product.productId} size="lg" />
        </div>
      )}

      {/* Delivery */}
      {((selected?.estimatedDeliveryDate && !unavailable) || unavailable) && (
        <section className="mt-5 border-t border-[#f0f0f0] pt-5">
          {unavailable ? (
            <p className="text-sm font-semibold text-[#b3261e]">
              {t("product.notDeliverable")}
            </p>
          ) : (
            <p className="text-sm font-semibold text-[#1f4529]">
              {t("product.estimatedDelivery", { date: selected?.estimatedDeliveryDate ?? "" })}
            </p>
          )}
        </section>
      )}

      {(text(product.category) || text(product.subCategory)) && (
        <p className="mt-5 border-t border-[#f0f0f0] pt-4 text-xs text-[#8a8a8a]">
          {[text(product.category), text(product.subCategory)].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}
