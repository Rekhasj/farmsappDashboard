"use client";

import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import { cartInputFromRecommendation, formatRupees } from "@/lib/cart";
import type { CartRecommendation } from "@/types/cart";
import { useCart } from "./CartProvider";

/**
 * "You might also like" (RN components/Cart/CartRecommendations.jsx): products
 * already in the cart are hidden; adding one shows "Item added to the cart"
 * and scrolls back to the top, like the app.
 */
export default function CartRecommendations() {
  const t = useT();
  const locale = useLocale();
  const { items, add, notify } = useCart();
  const [recs, setRecs] = useState<CartRecommendation[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/cart/recommendations", { cache: "no-store" })
      .then((res) => res.json() as Promise<{ recommendations?: CartRecommendation[] }>)
      .then((data) => alive && setRecs(data.recommendations ?? []))
      .catch(() => {}); // optional section
    return () => {
      alive = false;
    };
  }, []);

  const inCart = new Set(items.map((i) => i.skuCode));
  const shown = recs.filter((r) => !inCart.has(r.sku.skuCode) && r.sku.inventoryCount > 0);
  if (shown.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-bold text-[#202020]">{t("cart.youMightAlsoLike")}</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shown.map((rec) => {
          const name = pickText(rec.productName, locale);
          return (
            <div key={rec.sku.skuCode} className="relative flex w-37.5 shrink-0 flex-col rounded-[10px] border border-[#eee] bg-white p-2.5">
              {rec.discountPercentage > 0 && (
                <span className="absolute left-0 top-0 z-10 rounded-tl-[8px] rounded-br-[6px] bg-[#e64545] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {t("common.percentOff", { percent: rec.discountPercentage })}
                </span>
              )}
              <ImageWithFallback label={name} imageUrl={rec.sku.imageUrl} className="h-24 w-full" />
              <p className="mt-2 line-clamp-2 min-h-[2.5em] text-xs font-bold text-[#202020]">{name}</p>
              <p className="text-[11px] text-[#8a8a8a]">{rec.sku.title}</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#202020]">{formatRupees(rec.sku.netPrice)}</span>
                {rec.sku.mrp > rec.sku.netPrice && (
                  <span className="text-[11px] text-[#9a9a9a] line-through">{formatRupees(rec.sku.mrp)}</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  add(cartInputFromRecommendation(rec));
                  notify(t("cart.itemAdded"));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-2 h-8 rounded-lg border border-[#1f4529] text-xs font-bold text-[#1f4529] hover:bg-[#eef7ec]"
              >
                {t("cart.addToCart")}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
