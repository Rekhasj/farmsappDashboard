"use client";

import { useState } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useT } from "@/i18n/I18nProvider";
import type { TranslationKey } from "@/i18n/translate";

const SECTIONS: { title: TranslationKey; items: { href: string; label: TranslationKey; icon: string; sub?: TranslationKey }[] }[] = [
  { title: "profile.account", items: [{ href: "/addresses", label: "address.mine", icon: "📍" }] },
  {
    title: "profile.help",
    items: [
      { href: "/contact", label: "contact.title", icon: "📞", sub: "contact.subtitle" },
      { href: "/queries", label: "query.title", icon: "💬" },
      { href: "/product-enquiry", label: "enquiry.title", icon: "📝" },
    ],
  },
];

/**
 * RN ProfilePage: profile card (name, mobile, Edit / My Orders / Change
 * Language), Account Management, Help & Support, Crop Doctor, Logout with
 * the app's confirmation.
 */
export default function ProfileView({ name, mobile }: { name: string | null; mobile: string }) {
  const t = useT();
  const [confirming, setConfirming] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 md:min-h-[60vh] md:pb-14">
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-4 md:px-6 md:pt-8">
        <section className="rounded-2xl bg-[#1f4529] p-5 text-white">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-bold">
              {(name?.trim()[0] ?? "👤").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold">{name || t("profile.fallbackName")}</p>
              <p className="text-sm text-white/80">+91 {mobile}</p>
            </div>
            <Link href="/profile/edit" className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#1f4529]">
              {t("profile.edit")}
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/orders" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-semibold hover:bg-white/15">
              📦 {t("common.myOrders")}
            </Link>
            <div className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-semibold">
              {t("profile.changeLanguage")} <LanguageSwitcher />
            </div>
          </div>
        </section>

        <Link href="/crop-doctor" className="flex items-center gap-3 rounded-2xl border border-[#d9ead8] bg-[#eef7ec] p-4 hover:bg-[#e4f2e1]">
          <span className="text-2xl" aria-hidden>
            🩺
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#1f4529]">{t("doctor.title")}</span>
            <span className="block text-xs text-[#4a6b52]">{t("doctor.callOur")}</span>
          </span>
          <span className="text-[#1f4529]" aria-hidden>
            ›
          </span>
        </Link>

        {SECTIONS.map((s) => (
          <section key={s.title} className="overflow-hidden rounded-2xl border border-[#eee] bg-white">
            <h2 className="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-[#6a7282]">{t(s.title)}</h2>
            <ul className="divide-y divide-[#f0f0f0]">
              {s.items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fafafa]">
                    <span className="text-lg" aria-hidden>
                      {it.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#202020]">{t(it.label)}</span>
                      {it.sub && <span className="block text-[11px] text-[#6a7282]">{t(it.sub)}</span>}
                    </span>
                    <span className="text-[#9a9a9a]" aria-hidden>
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {confirming ? (
          <div className="rounded-2xl border border-[#f3d4d4] bg-white p-4">
            <p className="text-sm text-[#202020]">{t("auth.logoutConfirm")}</p>
            <div className="mt-3 flex gap-3">
              <button type="button" onClick={() => setConfirming(false)} className="h-10 flex-1 rounded-lg border border-[#ddd] text-sm font-bold">
                {t("common.cancel")}
              </button>
              <button type="button" onClick={logout} className="h-10 flex-1 rounded-lg bg-[#c80000] text-sm font-bold text-white">
                {t("auth.logout")}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="h-11 w-full rounded-2xl border border-[#f3d4d4] bg-white text-sm font-bold text-[#c80000]">
            {t("auth.logout")}
          </button>
        )}
      </main>
    </div>
  );
}
