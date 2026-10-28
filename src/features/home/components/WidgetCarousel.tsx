"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/features/cart/AddToCartButton";
import { formatRupees, type CartItemInput } from "@/lib/cart";
import type { WidgetCarouselConfig } from "@/types/widgets";

type Theme = { backgroundColor?: string; borderColor?: string; titleColor?: string; subtitleColor?: string };
type Row = { productId: number; name: string; sub: string; imageUrl?: string; price: number; mrp: number; cart?: CartItemInput };

export type WidgetCard =
  | {
      kind: "list";
      key: string;
      title: string;
      subtitle: string;
      theme: Theme;
      viewAll: { href: string | null; label: string; bg?: string; color?: string } | null;
      bodyHref: string | null;
      rows: Row[];
    }
  | { kind: "banner"; key: string; imageUrl: string; href: string | null; bg?: string; alt: string; contain: boolean };

/** RN: every card is 312×363 (half the 624×726 banner artwork), 12px apart, corner radius 20. */
const CARD = "h-[363px] w-[312px] shrink-0 snap-center overflow-hidden rounded-[20px]";

/**
 * RN HomepageWidgets carousel: horizontal, snaps to centre, auto-advances
 * every `autoScrollIntervalMs` and stops for good once the farmer touches it
 * (`stopOnInteraction`). Desktop adds ‹ › buttons.
 */
export default function WidgetCarousel({ cards, carousel }: { cards: WidgetCard[]; carousel: WidgetCarouselConfig | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stopped, setStopped] = useState(false);
  const interval = carousel?.autoScroll && (carousel.autoScrollIntervalMs ?? 0) > 0 ? carousel.autoScrollIntervalMs! : 0;
  const stopOnTouch = carousel?.stopOnInteraction !== false;
  // Which ends still have cards off-screen (arrows + auto-scroll only make sense then).
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);
  const fits = edges.start && edges.end;

  useEffect(() => {
    const el = ref.current;
    if (!el || !interval || stopped || fits || cards.length < 2) return;
    const id = setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + 324, behavior: "smooth" });
    }, interval);
    return () => clearInterval(id);
  }, [interval, stopped, fits, cards.length]);

  const interact = () => stopOnTouch && setStopped(true);
  const page = (dir: 1 | -1) => {
    interact();
    ref.current?.scrollBy({ left: dir * 324, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        onPointerDown={interact}
        onWheel={interact}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-2.5 py-2 [scrollbar-width:none] sm:px-4 md:justify-center-safe md:gap-4 md:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((c) => (c.kind === "list" ? <ListCard key={c.key} card={c} /> : <BannerCard key={c.key} card={c} />))}
      </div>
      {!fits && (
        <>
          <button type="button" onClick={() => page(-1)} disabled={edges.start} aria-label="‹" className="absolute left-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-xl text-[#1f4529] shadow-md disabled:opacity-0 md:flex">
            ‹
          </button>
          <button type="button" onClick={() => page(1)} disabled={edges.end} aria-label="›" className="absolute right-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-xl text-[#1f4529] shadow-md disabled:opacity-0 md:flex">
            ›
          </button>
        </>
      )}
    </div>
  );
}

/** RN ProductListWidgetCard. */
function ListCard({ card }: { card: Extract<WidgetCard, { kind: "list" }> }) {
  const { theme } = card;
  const header = (
    <div className="px-4 pt-4 text-center">
      <p className="text-lg font-extrabold leading-6" style={{ color: theme.titleColor }}>
        {card.title}
      </p>
      {card.subtitle && (
        <p className="text-[11px] font-semibold leading-4" style={{ color: theme.subtitleColor ?? theme.titleColor }}>
          {card.subtitle}
        </p>
      )}
    </div>
  );
  return (
    <div
      className={`${CARD} flex flex-col`}
      style={{ background: theme.backgroundColor, border: theme.borderColor ? `1px solid ${theme.borderColor}` : undefined }}
    >
      {card.bodyHref ? <Link href={card.bodyHref}>{header}</Link> : header}
      <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3">
        {card.rows.map((r) => (
          <li key={r.productId} className="flex min-h-[52px] items-center gap-2 rounded-[10px] bg-white px-2 py-1.5">
            <Link href={`/products/${r.productId}`} className="flex min-w-0 flex-1 items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center">
                {r.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt="" className="size-full object-contain" loading="lazy" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[#1F1B24]">{r.name}</span>
                <span className="block text-[11px] text-[#6E6872]">{r.sub}</span>
              </span>
            </Link>
            {r.cart && (
              <span className="w-[84px] shrink-0">
                <AddToCartButton input={r.cart} compact />
              </span>
            )}
            <span className="flex w-12 shrink-0 flex-col items-end">
              {r.mrp > r.price && <span className="text-[9px] text-[#8E8791] line-through">{formatRupees(r.mrp)}</span>}
              <span className="text-xs font-bold text-[#1F1B24]">{formatRupees(r.price)}</span>
            </span>
          </li>
        ))}
      </ul>
      {card.viewAll && (
        <Link
          href={card.viewAll.href ?? "#"}
          className="mt-3 flex h-10 shrink-0 items-center justify-center text-[13px] font-bold"
          style={{ background: card.viewAll.bg, color: card.viewAll.color ?? theme.titleColor }}
        >
          {card.viewAll.label} »
        </Link>
      )}
    </div>
  );
}

/** RN BannerWidgetCard. */
function BannerCard({ card }: { card: Extract<WidgetCard, { kind: "banner" }> }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={card.imageUrl} alt={card.alt} className={`size-full ${card.contain ? "object-contain" : "object-fill"}`} loading="lazy" draggable={false} />
  );
  return card.href ? (
    <Link href={card.href} className={`${CARD} block`} style={{ background: card.bg }}>
      {img}
    </Link>
  ) : (
    <div className={CARD} style={{ background: card.bg }}>
      {img}
    </div>
  );
}
