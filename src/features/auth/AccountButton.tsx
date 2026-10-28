"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";
import { goToLogin, useUser } from "./UserProvider";

/**
 * Header account control: "Login" for guests; for a logged-in farmer, their
 * initial with a small menu (name, number, Logout with the app's
 * "Are you sure you want to logout?" confirmation).
 */
export default function AccountButton() {
  const t = useT();
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <button type="button" onClick={goToLogin} className="h-9 rounded-full bg-white px-3.5 text-xs font-bold text-[#1f4529]">
        {t("auth.login")}
      </button>
    );
  }

  const initial = (user.name?.trim()[0] ?? "👤").toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // Full reload on purpose: drop the cart and every farmer-specific page.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setConfirming(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("common.profile")}
        className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white"
      >
        {initial}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-[10px] border border-[#eee] bg-white p-3 shadow-lg">
          {user.name && <p className="truncate text-[13px] font-bold text-[#202020]">{user.name}</p>}
          <p className="text-[11px] text-[#6a7282]">+91 {user.mobile.replace(/^(\d{2})\d{5}(\d{3})$/, "$1•••••$2")}</p>
          <nav className="mt-3 flex flex-col border-t border-[#f0f0f0] pt-2">
            <Link href="/profile" role="menuitem" className="rounded px-1 py-1.5 text-xs font-semibold text-[#202020] hover:bg-[#f6faf6]">
              {t("common.profile")}
            </Link>
            <Link href="/orders" role="menuitem" className="rounded px-1 py-1.5 text-xs font-semibold text-[#202020] hover:bg-[#f6faf6]">
              {t("common.myOrders")}
            </Link>
            <Link href="/addresses" role="menuitem" className="rounded px-1 py-1.5 text-xs font-semibold text-[#202020] hover:bg-[#f6faf6]">
              {t("address.mine")}
            </Link>
          </nav>
          {confirming ? (
            <div className="mt-3 border-t border-[#f0f0f0] pt-3">
              <p className="text-xs text-[#202020]">{t("auth.logoutConfirm")}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setConfirming(false)} className="h-8 flex-1 rounded-lg border border-[#ddd] text-xs font-bold">
                  {t("common.cancel")}
                </button>
                <button type="button" onClick={logout} className="h-8 flex-1 rounded-lg bg-[#c80000] text-xs font-bold text-white">
                  {t("auth.logout")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirming(true)}
              className="mt-3 w-full border-t border-[#f0f0f0] pt-3 text-left text-xs font-bold text-[#c80000]"
            >
              {t("auth.logout")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
