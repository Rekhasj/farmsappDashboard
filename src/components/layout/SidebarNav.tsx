"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";
import { setSidebarItems } from "@/lib/sidebar-cache";

export type SidebarItem = { id: number | string; label: string; imageUrl?: string; href: string };

/**
 * Left-hand picker. A client component only so it can read the active route
 * segment — the layout around it stays mounted while the products change, so
 * the list doesn't reload or flash when you switch items.
 */
export default function SidebarNav({
  title,
  items,
  cacheKey,
}: {
  title: string;
  items: SidebarItem[];
  /** When set, the list is remembered for next time (see lib/sidebar-cache). */
  cacheKey?: string;
}) {
  const segment = useSelectedLayoutSegment();
  useEffect(() => {
    if (cacheKey) setSidebarItems(cacheKey, items);
  }, [cacheKey, items]);

  return (
    <nav
      aria-label={title}
      className="w-22 shrink-0 overflow-y-auto py-3 [scrollbar-width:none] md:sticky md:top-22 md:max-h-[calc(100dvh-6.5rem)] md:w-56 md:rounded-xl md:border md:border-[#eee] md:bg-white md:py-2 lg:w-64 [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex flex-col items-center gap-3 md:gap-0.5">
        {items.map((it) => (
          <li key={it.id} className="w-full">
            <NavItem href={it.href} label={it.label} selected={segment === String(it.id)}>
              {it.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.imageUrl} alt="" className="size-full object-contain p-1" loading="lazy" />
              )}
            </NavItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NavItem({
  href,
  label,
  selected,
  children,
}: {
  href: string;
  label: string;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-current={selected ? "page" : undefined} className={`relative flex flex-col items-center gap-1.5 px-2 md:flex-row md:gap-3 md:px-3 md:py-2 ${selected ? "md:bg-[#eef7ec]" : "md:hover:bg-[#f7f7f7]"}`}>
      {selected && <span className="absolute right-0 top-0 h-14 w-1 rounded-l bg-[#1f4529] md:left-0 md:right-auto md:h-full md:rounded-l-none md:rounded-r" />}
      <span
        className={`flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg md:size-11 ${
          selected ? "bg-[#1f4529]/20 ring-2 ring-[#1f4529] md:ring-1" : "bg-[#f5f5f5]"
        }`}
      >
        {children}
      </span>
      <span
        className={`line-clamp-2 text-center text-[11px] leading-tight md:text-left md:text-[13px] ${
          selected ? "font-bold text-[#202020]" : "font-medium text-[#8a8a8a]"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
