"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AdvertisementBanner } from "@/types/product";
import { useT } from "@/i18n/I18nProvider";

/**
 * CSV component #17 — PromoBannerCarousel.
 * Real backend data: the popular-product feed's `advertisementBanner`
 * array. Plain images in a horizontally scrollable, snap-aligned strip
 * (swipe on touch, arrow buttons on desktop). Each image navigates on
 * click based on its `data.page`. Falls back to a static banner when
 * there's no banner data.
 */
function hrefFor(banner: AdvertisementBanner): string | undefined {
  const d = banner.data;
  if (!d) return undefined;
  switch (d.page) {
    case "ProductDetailPage":
      return d.productId ? `/products/${d.productId}` : undefined;
    case "AllProductPage":
      return d.catId ? `/categories/${d.catId}` : undefined;
    default:
      // e.g. "CropProductPage" — that page isn't built yet, so no link
      // (rather than a link that 404s).
      return undefined;
  }
}

/** Scroller's left padding (16px on mobile, 0 on desktop) — slide-to-scroll offset. */
function padLeft(el: HTMLElement): number {
  return parseFloat(getComputedStyle(el).paddingLeft) || 0;
}

export default function PromoBannerCarousel({ banners = [] }: { banners?: AdvertisementBanner[] }) {
  const t = useT();
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = banners.length;

  const goTo = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    const slide = el.children[i] as HTMLElement | undefined;
    if (slide) el.scrollTo({ left: slide.offsetLeft - padLeft(el), behavior: "smooth" });
  }, []);

  // Auto-advance every 4s; pauses while hovering or dragging.
  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => {
      setActive((a) => {
        const next = (a + 1) % count;
        goTo(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [count, paused, goTo]);

  if (count === 0) return <FallbackBanner />;

  // Desktop shows 2 (md) or 3 (xl) banners at once — size slides by how many there
  // are, and only show arrows/dots where some are actually off-screen.
  const slideWidth =
    count === 1 ? "" : count === 2 ? "md:w-[calc(50%-8px)]" : "md:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)]";
  const navHidden = count === 2 ? "md:hidden" : count === 3 ? "xl:hidden" : "";

  // Keep the dots in sync when the user scrolls/swipes manually.
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - padLeft(el) - el.scrollLeft);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  };

  // Mouse drag-to-scroll (touch already scrolls natively).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = scroller.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    setPaused(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    el.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
    // Snap to the nearest slide after a drag.
    const el = scroller.current;
    if (drag.current.moved && el) {
      let best = 0;
      let bestDist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const d = Math.abs((c as HTMLElement).offsetLeft - padLeft(el) - el.scrollLeft);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
      goTo(best);
    }
  };
  // Swallow the click that ends a drag so it doesn't navigate.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const step = (dir: 1 | -1) => {
    const next = (active + dir + count) % count;
    setActive(next);
    goTo(next);
  };

  return (
    <section
      className={`relative px-4 pt-5 sm:px-6 ${count === 1 ? "md:mx-auto md:max-w-4xl" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        endDrag();
      }}
    >
      <div
        ref={scroller}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onClickCapture={onClickCapture}
        className="flex cursor-grab snap-x snap-mandatory overflow-x-auto scrollbar-none active:cursor-grabbing md:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, i) => {
          const href = hrefFor(banner);
          const image = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.imageUrl}
              alt={t("home.promotion", { n: i + 1 })}
              className="aspect-13/5 w-full select-none rounded-xl object-cover"
              draggable={false}
            />
          );
          return (
            <div key={banner.imageUrl + i} className={`w-full shrink-0 snap-start ${slideWidth}`}>
              {href ? <Link href={href} draggable={false}>{image}</Link> : image}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label={t("home.previousBanner")}
            onClick={() => step(-1)}
            className={`absolute left-6 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-green-800 text-xl shadow ${navHidden}`}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={t("home.nextBanner")}
            onClick={() => step(1)}
            className={`absolute right-6 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-green-800 text-xl shadow ${navHidden}`}
          >
            ›
          </button>
          <div className={`mt-2 flex justify-center gap-1.5 ${navHidden}`}>
            {banners.map((b, i) => (
              <button
                key={b.imageUrl + i}
                type="button"
                aria-label={t("home.goToBanner", { n: i + 1 })}
                onClick={() => {
                  setActive(i);
                  goTo(i);
                }}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-[#1f4529]" : "w-1.5 bg-[#c9d6cc]"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FallbackBanner() {
  return (
    <section className="px-4 pt-5 sm:px-6">
      <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-[#eef8d8] via-[#d9f0c9] to-[#8fcf7a] px-4 py-4 md:px-10 md:py-10">
        <div className="flex items-center justify-between gap-3 md:mx-auto md:max-w-4xl">
          <div className="max-w-42.5 md:max-w-md">
            <p className="text-lg font-extrabold leading-tight text-[#1f4529] md:text-4xl">
              SMART
              <br />
              SOLUTION
            </p>
            <p className="mt-1 text-[11px] text-[#3c4a33] md:mt-3 md:text-base">
              All-in-one nutrient formula for better Growth, flowering, fruit
              set & amp; higher yield.
            </p>
            <button
              type="button"
              className="mt-3 rounded-full bg-[#2e5b3a] px-4 py-1.5 text-[11px] font-bold text-white md:mt-5 md:px-6 md:py-2.5 md:text-sm"
            >
              BUY NOW
            </button>
          </div>

          <div className="relative flex size-24 shrink-0 items-center justify-center md:size-44">
            <div className="flex h-20 w-14 items-center justify-center rounded-md bg-white/70 text-[9px] font-semibold text-[#2e5b3a] text-center px-1 md:h-36 md:w-24 md:text-sm">
              Smart product
            </div>
            {["5%", "16%", "10%"].map((pct, i) => (
              <span
                key={pct}
                className="absolute flex size-8 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#2e5b3a] shadow md:size-12 md:text-sm"
                style={{
                  top: i === 0 ? "-6px" : i === 1 ? "20%" : "auto",
                  bottom: i === 2 ? "-4px" : "auto",
                  right: i === 0 ? "-4px" : i === 2 ? "10px" : "auto",
                  left: i === 1 ? "-10px" : "auto",
                }}
              >
                {pct}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
