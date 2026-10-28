"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { useCart } from "./CartProvider";

/** Browsing screens that get the bar (RN uses it on product lists). Not on PDP / cart, which have their own CTAs. */
const SHOW_ON = [/^\/$/, /^\/categories/, /^\/crops/, /^\/best-selling/, /^\/search/];

/**
 * Floating "View Cart" bar (RN components/CartDeliveryBanner.js): free-delivery
 * progress ring + message on the left, "View Cart · n items" on the right.
 * Progress = server cart total / server free-delivery threshold.
 */
export default function ViewCartBar() {
  const t = useT();
  const pathname = usePathname();
  const { items, details } = useCart();

  if (items.length === 0 || !SHOW_ON.some((re) => re.test(pathname))) return null;

  const min = details?.minOrderValueForFreeDelivery;
  const total = details?.totalPrice ?? 0;
  const hasThreshold = typeof min === "number" && Number.isFinite(min);
  const percent = !hasThreshold ? 0 : min <= 0 ? 100 : Math.min(100, (total / min) * 100);
  const unlocked = percent >= 100;

  return (
    // Sits above the mobile bottom tab bar on Home.
    <div className={`fixed inset-x-0 z-30 px-3 md:hidden ${pathname === "/" ? "bottom-17" : "bottom-3"}`}>
      <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-[#1f4529] p-2.5 pl-3 text-white shadow-lg">
        {hasThreshold && (
          <>
            <ProgressRing percent={percent} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{unlocked ? t("cart.freeDeliveryApplied") : t("cart.unlockFreeDelivery")}</p>
              <p className="truncate text-[11px] text-white/80">
                {unlocked
                  ? t("cart.enjoyShopping")
                  : t("cart.moreForFreeDelivery", { amount: Math.ceil((min as number) - total).toLocaleString("en-IN") })}
              </p>
            </div>
          </>
        )}
        <Link
          href="/cart"
          className={`flex shrink-0 flex-col items-center rounded-xl bg-white px-4 py-1.5 text-[#1f4529] ${hasThreshold ? "" : "ml-auto"}`}
        >
          <span className="text-xs font-bold">{t("common.viewCart")}</span>
          <span className="text-[10px] font-semibold">
            {items.length} {items.length > 1 ? t("search.items") : t("search.item")}
          </span>
        </Link>
      </div>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="size-9 shrink-0 -rotate-90" aria-hidden>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke="#9be08f"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent / 100)}
      />
    </svg>
  );
}
