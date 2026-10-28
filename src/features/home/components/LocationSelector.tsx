"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronDown } from "@/components/ui/icons";
import { clearSidebarCache } from "@/lib/sidebar-cache";
import { goToLogin } from "@/features/auth/UserProvider";
import { useT } from "@/i18n/I18nProvider";
import type { DeliveryLocation, SavedAddress } from "@/types/location";

/**
 * Header location block + the "Confirm Location" modal (RN LocationChangeModal).
 * Ways to change: use the browser's location, type a 6-digit pincode (submits
 * on the 6th digit, like the app), or pick a saved address.
 */
export default function LocationSelector({
  location,
  addresses,
}: {
  location: DeliveryLocation | null;
  addresses: SavedAddress[];
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const title = location?.title || t("location.select");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex shrink-0 flex-col gap-1 text-left"
      >
        <span className="max-w-50 truncate text-[13px] font-bold text-white md:max-w-65">{title}</span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-white">
          {location?.subtitle && (
            <span title={location.subtitle} className="max-w-42.5 truncate md:max-w-55">
              {location.subtitle}
            </span>
          )}
          <IconChevronDown className="size-3.5 shrink-0" />
        </span>
      </button>
      {open && <LocationModal addresses={addresses} onClose={() => setOpen(false)} />}
    </>
  );
}

function LocationModal({ addresses, onClose }: { addresses: SavedAddress[]; onClose: () => void }) {
  const router = useRouter();
  const t = useT();
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"gps" | "save" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, busy]);

  async function submit(code: string, address?: SavedAddress) {
    setError("");
    setBusy("save");
    try {
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: code, address: address?.raw }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; login?: boolean };
      if (data.login) return goToLogin(); // changing location edits the farmer's account
      if (!res.ok || !data.ok) {
        setError(data.error || t("location.errorGeneric"));
        setBusy(null);
        return;
      }
      clearSidebarCache(); // crops/categories can differ for the new store
      onClose();
      router.refresh(); // re-render every server component for the new store
    } catch {
      setError(t("location.errorGeneric"));
      setBusy(null);
    }
  }

  function onPincodeChange(value: string) {
    setError("");
    if (!/^\d*$/.test(value)) return setError(t("location.errorDigits"));
    if (value.startsWith("0")) return setError(t("location.errorPincode"));
    setPincode(value);
    if (value.length === 6) void submit(value);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return setError(t("location.errorUnsupported"));
    setError("");
    setBusy("gps");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/location?lat=${coords.latitude}&lng=${coords.longitude}`);
          const data = (await res.json().catch(() => ({}))) as { pincode?: string };
          if (!res.ok || !data.pincode) {
            setError(t("location.errorNoPincode"));
            setBusy(null);
            return;
          }
          setPincode(data.pincode);
          await submit(data.pincode);
        } catch {
          setError(t("location.errorFailed"));
          setBusy(null);
        }
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? t("location.errorDenied")
            : t("location.errorFailed"),
        );
        setBusy(null);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={t("location.confirm")}>
      <div className="absolute inset-0 bg-black/50" onClick={() => !busy && onClose()} />
      <div className="relative flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white px-5 pb-6 pt-3 md:max-w-md md:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={!!busy}
          aria-label={t("common.close")}
          className="ml-auto flex size-8 items-center justify-center rounded-full text-xl leading-none text-[#4a5565] hover:bg-[#f3f4f6]"
        >
          ×
        </button>

        <div className="overflow-y-auto">
          <h2 className="text-center text-base font-bold text-[#202020]">{t("location.confirm")}</h2>
          <p className="mt-2 text-center text-xs text-[#6a7282]">{t("location.why")}</p>

          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={!!busy}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-60"
          >
            {busy === "gps" ? t("location.fetching") : t("location.useCurrent")}
          </button>

          <div className="relative my-5 flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-[#f3f4f6]" />
            <span className="relative bg-white px-2.5 text-[10px] uppercase text-[#99a1af]">{t("location.orEnterPincode")}</span>
          </div>

          <input
            ref={inputRef}
            value={pincode}
            onChange={(e) => onPincodeChange(e.target.value)}
            disabled={!!busy}
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            placeholder={t("location.pincodePlaceholder")}
            aria-invalid={!!error}
            className={`h-11 w-full rounded-lg border px-3 text-sm outline-none disabled:opacity-60 ${
              error ? "border-[#c80000]" : "border-[#e5e5e5] focus:border-[#1f4529]"
            }`}
          />
          {busy === "save" && <p className="mt-2 text-xs text-[#6a7282]">{t("location.updating")}</p>}
          {error && <p role="alert" className="mt-2 text-xs font-medium text-[#c80000]">{error}</p>}

          {addresses.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-[#202020]">{t("location.saved")}</h3>
              <ul className="mt-2 divide-y divide-[#f0f0f0]">
                {addresses.map((a, i) => (
                  <li key={a.id || i}>
                    <button
                      type="button"
                      disabled={!!busy || !/^[1-9]\d{5}$/.test(a.pincode)}
                      onClick={() => submit(a.pincode, a)}
                      className="flex w-full items-start justify-between gap-3 py-3 text-left disabled:opacity-60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-[#202020]">{a.title}</span>
                        {a.subtitle && <span className="block truncate text-[11px] text-[#6a7282]">{a.subtitle}</span>}
                      </span>
                      {a.isDefault && (
                        <span className="shrink-0 rounded-full bg-[#e8f5ec] px-2 py-0.5 text-[10px] font-bold text-[#1f4529]">
                          {t("location.selected")}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
