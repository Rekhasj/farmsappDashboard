"use client";

import { useEffect, useState } from "react";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { useCart } from "@/features/cart/CartProvider";
import { useT } from "@/i18n/I18nProvider";

/**
 * RN PersonalInfo: Full Name (max 51) is the only editable field; Save is
 * enabled when it changed; leaving with unsaved changes asks first.
 */
export default function EditProfileForm({ name, mobile }: { name: string; mobile: string }) {
  const t = useT();
  const { notify } = useCart();
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [askLeave, setAskLeave] = useState(false);
  const dirty = value.trim() !== name.trim();
  const canSave = !!value.trim() && dirty && !saving;

  // Browser back / close with unsaved edits (RN beforeRemove guard).
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return setError(t("profile.enterName"));
    if (!canSave) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value.trim() }),
    });
    if (!res.ok) {
      setSaving(false);
      return notify(t("location.errorGeneric"));
    }
    notify(t("profile.saved"));
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/profile"); // full load so the header and menus show the new name
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-28 md:min-h-[60vh] md:pb-14">
      <header className="sticky top-0 z-10 border-b border-[#eee] bg-white py-3 md:static md:border-0 md:bg-transparent md:pt-6">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 md:px-0">
          {dirty ? (
            <button type="button" onClick={() => setAskLeave(true)} aria-label={t("common.back")} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee] bg-white">
              <IconArrowLeft className="size-4" />
            </button>
          ) : (
            <BackLink href="/profile" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee] bg-white">
              <IconArrowLeft className="size-4" />
            </BackLink>
          )}
          <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{t("profile.editTitle")}</h1>
        </div>
      </header>

      <form id="profile-form" onSubmit={save} noValidate className="mx-auto mt-4 w-full max-w-xl space-y-5 px-4 md:mt-2 md:rounded-2xl md:border md:border-[#eee] md:bg-white md:p-8 md:shadow-sm">
        <label className="block">
          <span className="text-xs font-semibold text-[#202020]">{t("profile.fullName")}</span>
          <input
            value={value}
            onChange={(e) => {
              setError("");
              setValue(e.target.value);
            }}
            maxLength={51}
            autoFocus
            autoComplete="name"
            placeholder={t("profile.enterFullName")}
            aria-invalid={!!error}
            className={`mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm text-[#202020] outline-none ${error ? "border-[#c80000]" : "border-[#e5e5e5] focus:border-[#1f4529]"}`}
          />
          {error && <span className="mt-1 block text-[11px] font-medium text-[#c80000]">{error}</span>}
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#202020]">{t("address.mobile")}</span>
          <input value={`+91 ${mobile}`} readOnly disabled className="mt-1 h-11 w-full cursor-not-allowed rounded-lg border border-[#e5e5e5] bg-[#f3f4f6] px-3 text-sm text-[#6a7282]" />
        </label>
        <div className="rounded-lg bg-[#fff8e6] p-3 text-xs text-[#7a5a00]">
          <p className="font-bold">{t("profile.numberFixed")}</p>
          <p className="mt-1 leading-5">{t("profile.numberReason")}</p>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#eee] bg-white px-4 py-3 md:static md:mt-4 md:border-0 md:bg-transparent">
        <div className="mx-auto max-w-xl">
          <button type="submit" form="profile-form" disabled={!canSave} className="h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-50">
            {saving ? t("common.loading") : t("profile.save")}
          </button>
        </div>
      </div>

      {askLeave && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAskLeave(false)} />
          <div className="relative w-full rounded-t-2xl bg-white p-5 md:max-w-sm md:rounded-2xl">
            <p className="text-sm font-bold text-[#202020]">{t("profile.unsaved")}</p>
            <p className="mt-1 text-xs text-[#6a7282]">{t("profile.unsavedText")}</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setAskLeave(false)} className="h-10 flex-1 rounded-lg border border-[#ddd] text-sm font-bold">
                {t("common.cancel")}
              </button>
              <a href="/profile" className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#c80000] text-sm font-bold text-white">
                {t("profile.discard")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
