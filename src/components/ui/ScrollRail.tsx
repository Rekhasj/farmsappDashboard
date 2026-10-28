"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A horizontal row of cards. Phones: plain swipe (as in the app). Desktop:
 * Blinkit-style ‹ › buttons that page by most of a screen width, shown only
 * when there's more to scroll that way.
 */
export default function ScrollRail({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const page = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <div className="group relative">
      <div ref={ref} className={`flex overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
        {children}
      </div>
      {!edges.start && <Arrow side="left" onClick={() => page(-1)} />}
      {!edges.end && <Arrow side="right" onClick={() => page(1)} />}
    </div>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "‹" : "›"}
      className={`absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-xl text-[#1f4529] shadow-md transition hover:bg-[#f6faf6] md:flex ${
        side === "left" ? "-left-4" : "-right-4"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
