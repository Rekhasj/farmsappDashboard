"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import type { TranslationKey } from "@/i18n/translate";

/** `href` null = no web page yet (Profile). */
const TABS: { label: TranslationKey; icon: "home" | "grid" | "box" | "user"; href: string | null }[] = [
  { label: "common.home", icon: "home", href: "/" },
  { label: "common.categories", icon: "grid", href: "/categories" },
  { label: "common.myOrders", icon: "box", href: "/orders" },
  { label: "common.profile", icon: "user", href: "/profile" },
];

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? "#1f4529" : "#9a9a9a";
  switch (icon) {
    case "home":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="size-5">
          <path d="M3 9.5 10 4l7 5.5V17a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V9.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="size-5">
          <rect x="3" y="3" width="6" height="6" rx="1.2" stroke={color} strokeWidth="1.4" />
          <rect x="11" y="3" width="6" height="6" rx="1.2" stroke={color} strokeWidth="1.4" />
          <rect x="3" y="11" width="6" height="6" rx="1.2" stroke={color} strokeWidth="1.4" />
          <rect x="11" y="11" width="6" height="6" rx="1.2" stroke={color} strokeWidth="1.4" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="size-5">
          <path d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5v-7Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M3 6.5 10 10l7-3.5M10 10v7" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="size-5">
          <circle cx="10" cy="7" r="3" stroke={color} strokeWidth="1.4" />
          <path d="M3.5 17c0-3 3-5 6.5-5s6.5 2 6.5 5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Mobile-only bottom tab bar (hidden at md+ — desktop uses the header nav
 * instead, per typical desktop e-commerce conventions).
 * Home / Categories / My Orders are real links (RN TabNavigationConfig).
 */
export default function BottomNav() {
  const t = useT();
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-between border-t border-[#eee] bg-white px-6 py-2.5 md:hidden">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : !!tab.href && pathname.startsWith(tab.href);
        const inner = (
          <>
            <TabIcon icon={tab.icon} active={active} />
            <span className={`text-[10px] font-semibold ${active ? "text-[#1f4529]" : "text-[#9a9a9a]"}`}>{t(tab.label)}</span>
          </>
        );
        return tab.href ? (
          <Link key={tab.label} href={tab.href} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-1">
            {inner}
          </Link>
        ) : (
          <span key={tab.label} className="flex flex-col items-center gap-1 opacity-60">
            {inner}
          </span>
        );
      })}
    </nav>
  );
}
