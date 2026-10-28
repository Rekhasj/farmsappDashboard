"use client";

import Link from "next/link";
import { IconCart } from "@/components/ui/icons";
import { useT } from "@/i18n/I18nProvider";
import { formatRupees } from "@/lib/cart";
import { useCart } from "./CartProvider";

/**
 * Desktop header cart (Blinkit-style): "My Cart" when empty, otherwise the
 * item count and the server-priced total. Replaces the floating View Cart
 * bar on big screens.
 */
export default function DesktopCartButton() {
  const t = useT();
  const { items, details } = useCart();
  const count = items.length;
  const total = details?.discountedPrice ?? items.reduce((s, i) => s + (i.netPrice ?? i.price) * i.quantity, 0);

  return (
    <Link
      href="/cart"
      className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-3.5 text-[#1f4529] shadow-sm transition hover:bg-[#eef7ec]"
    >
      <IconCart className="size-5" />
      {count === 0 ? (
        <span className="text-sm font-bold">{t("common.viewCart")}</span>
      ) : (
        <span className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold">
            {count} {count > 1 ? t("search.items") : t("search.item")}
          </span>
          <span className="text-sm font-extrabold">{formatRupees(total)}</span>
        </span>
      )}
    </Link>
  );
}
