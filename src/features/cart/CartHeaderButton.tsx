"use client";

import Link from "next/link";
import { IconCart } from "@/components/ui/icons";
import { useT } from "@/i18n/I18nProvider";
import { useCart } from "./CartProvider";

/** Header cart icon (RN HeaderItems/Cart.jsx): badge = number of distinct SKUs, hidden when empty. */
export default function CartHeaderButton() {
  const t = useT();
  const { items } = useCart();
  const count = items.length;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `${t("common.viewCart")} (${count})` : t("common.viewCart")}
      className="relative flex size-9 items-center justify-center rounded-full bg-white/10"
    >
      <IconCart className="size-[18px] text-white" />
      {count > 0 && (
        <span className="absolute -right-1 -top-2 flex size-5 items-center justify-center rounded-full bg-[#c80000] text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
