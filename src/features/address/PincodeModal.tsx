"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/I18nProvider";

/**
 * RN LocationChangeModal in `gatherPinCodeMode`: only collects a pincode
 * (GPS or typed — submits on the 6th digit) and hands it on, e.g. to the
 * new-address form. It does not change anything by itself.
 */
export default function PincodeModal({ onPincode, onClose }: { onPincode: (pincode: string) => void; onClose: () => void }) {
  const t = useT();
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function onChange(value: string) {
    setError("");
    if (!/^\d*$/.test(value)) return setError(t("location.errorDigits"));
    if (value.startsWith("0")) return setError(t("location.errorPincode"));
    setPincode(value);
    if (value.length === 6) onPincode(value);
  }

  function useGps() {
    if (!navigator.geolocation) return setError(t("location.errorUnsupported"));
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/location?lat=${coords.latitude}&lng=${coords.longitude}`);
          const data = (await res.json().catch(() => ({}))) as { pincode?: string };
          if (!res.ok || !data.pincode) throw new Error();
          onPincode(data.pincode);
        } catch {
          setError(t("location.errorNoPincode"));
          setBusy(false);
        }
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? t("location.errorDenied") : t("location.errorFailed"));
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={t("location.confirm")}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full rounded-t-2xl bg-white px-5 pb-6 pt-3 md:max-w-md md:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="ml-auto flex size-8 items-center justify-center rounded-full text-xl leading-none text-[#4a5565] hover:bg-[#f3f4f6]"
        >
          ×
        </button>
        <h2 className="text-center text-base font-bold text-[#202020]">{t("location.confirm")}</h2>
        <p className="mt-2 text-center text-xs text-[#6a7282]">{t("location.why")}</p>
        <button
          type="button"
          onClick={useGps}
          disabled={busy}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? t("location.fetching") : t("location.useCurrent")}
        </button>
        <div className="relative my-5 flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-[#f3f4f6]" />
          <span className="relative bg-white px-2.5 text-[10px] uppercase text-[#99a1af]">{t("location.orEnterPincode")}</span>
        </div>
        <input
          value={pincode}
          onChange={(e) => onChange(e.target.value)}
          disabled={busy}
          inputMode="numeric"
          maxLength={6}
          autoFocus
          autoComplete="postal-code"
          placeholder={t("location.pincodePlaceholder")}
          aria-invalid={!!error}
          className={`h-11 w-full rounded-lg border px-3 text-sm outline-none ${error ? "border-[#c80000]" : "border-[#e5e5e5] focus:border-[#1f4529]"}`}
        />
        {error && (
          <p role="alert" className="mt-2 text-xs font-medium text-[#c80000]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
