"use client";

import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { useCart } from "@/features/cart/CartProvider";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import type { LocalizedText } from "@/types/product";
import { ADDRESS_FIELDS, validateAddress, type AddressFields, type FieldKey } from "./fields";
import { backTo, goFresh } from "./nav";

type StateOption = { id: number; stateName: string };

/**
 * RN AddressDetailsScreen + useAddressForm: the 8 fields in the app's order,
 * typing filters, pincode → area / city / state auto-fill, a state picker,
 * first-error validation, then save and go back (to the cart if we came from it).
 */
export default function AddressForm({
  mode,
  addressId,
  from,
  initial,
}: {
  mode: "new" | "edit";
  addressId?: string;
  from: "cart" | null;
  initial: AddressFields;
}) {
  const t = useT();
  const locale = useLocale();
  const { notify } = useCart();
  const [f, setF] = useState<AddressFields>(initial);
  const [errorField, setErrorField] = useState<FieldKey | null>(null);
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");
  const [saving, setSaving] = useState(false);
  const [states, setStates] = useState<StateOption[] | null>(null);
  const [statesFailed, setStatesFailed] = useState(false);
  const lookedUp = useRef(mode === "edit" ? initial.pincode : "");

  const fetchStates = () =>
    fetch("/api/address-meta")
      .then((r) => r.json() as Promise<{ states?: StateOption[] }>)
      .then((d) => (d.states?.length ? setStates(d.states) : setStatesFailed(true)))
      .catch(() => setStatesFailed(true));
  const retryStates = () => {
    setStatesFailed(false);
    void fetchStates();
  };
  useEffect(() => {
    void fetchStates();
  }, []);

  // Pincode → auto-fill (RN: on the 6th digit; in edit mode only when it changed).
  useEffect(() => {
    const pin = f.pincode;
    if (!/^[1-9]\d{5}$/.test(pin) || pin === lookedUp.current) return;
    lookedUp.current = pin;
    let alive = true;
    fetch(`/api/address-meta?pincode=${pin}`)
      .then((r) => r.json() as Promise<{ ok?: boolean; areaName?: string; townName?: string; stateName?: string; message?: LocalizedText | string }>)
      .then((d) => {
        if (!alive) return;
        if (!d.ok) {
          setPinError(typeof d.message === "string" ? d.message : pickText(d.message, locale) || t("address.invalidPincode"));
          setF((v) => ({ ...v, areaName: "", townName: "", stateName: "", districtName: "", stateId: undefined }));
          return;
        }
        setPinError("");
        setF((v) => ({
          ...v,
          areaName: d.areaName || v.areaName,
          townName: d.townName || v.townName,
          stateName: d.stateName || v.stateName,
        }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [f.pincode, locale, t]);

  // Keep stateId in step with the chosen/auto-filled state name.
  const stateId = states?.find((s) => s.stateName.toLowerCase() === f.stateName.trim().toLowerCase())?.id ?? f.stateId;

  function change(key: FieldKey, value: string, allowed?: RegExp) {
    if (allowed && !allowed.test(value)) {
      setErrorField(key);
      setError(key === "pincode" ? t("location.errorDigits") : t("address.onlyLetters"));
      return;
    }
    if (errorField === key) {
      setErrorField(null);
      setError("");
    }
    if (key === "pincode") setPinError("");
    setF((v) => ({ ...v, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pinError) {
      setErrorField("pincode");
      return setError(pinError);
    }
    const problem = validateAddress({ ...f, stateId });
    if (problem) {
      setErrorField(problem.field);
      setError(pickText(problem.message, locale));
      document.getElementById(`addr-${problem.field}`)?.focus();
      return;
    }
    setSaving(true);
    const res = await fetch(mode === "edit" ? `/api/addresses/${encodeURIComponent(addressId!)}` : "/api/addresses", {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { ...f, stateId } }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; field?: FieldKey; message?: LocalizedText };
    if (!res.ok || !data.ok) {
      setSaving(false);
      if (data.field) setErrorField(data.field);
      return setError(data.message ? pickText(data.message, locale) : data.error || t("location.errorGeneric"));
    }
    notify(mode === "edit" ? t("address.updated") : t("address.added"));
    goFresh(backTo(from));
  }

  return (
    <div className="min-h-screen bg-white pb-28 md:min-h-0 md:bg-[#f5f5f5] md:pb-14">
      <header className="sticky top-0 z-10 border-b border-[#eee] bg-white py-3 md:static md:border-0 md:bg-transparent md:pt-6 md:pb-2">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 md:max-w-3xl md:px-0">
          <BackLink href={backTo(from)} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]">
            <IconArrowLeft className="size-4" />
          </BackLink>
          <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{mode === "edit" ? t("address.editTitle") : t("address.newTitle")}</h1>
        </div>
      </header>

      <form id="address-form" onSubmit={save} noValidate className="mx-auto grid w-full max-w-2xl gap-4 px-4 pt-5 sm:grid-cols-2 md:mt-2 md:max-w-3xl md:rounded-2xl md:border md:border-[#eee] md:bg-white md:p-8 md:shadow-sm">
        {ADDRESS_FIELDS.map(([key, def]) => {
          const invalid = errorField === key;
          const full = key === "name" || key === "address" || key === "areaName" || key === "landmark";
          return (
            <label key={key} className={`block ${full ? "sm:col-span-2" : ""}`}>
              <span className="text-xs font-semibold text-[#202020]">
                {pickText(def.label, locale)} <span className="text-[#c80000]">*</span>
              </span>
              {key === "stateName" ? (
                states ? (
                  <select
                    id={`addr-${key}`}
                    value={states.some((s) => s.stateName === f.stateName) ? f.stateName : ""}
                    onChange={(e) => change("stateName", e.target.value)}
                    aria-invalid={invalid}
                    className={`mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm text-[#202020] outline-none ${invalid ? "border-[#c80000]" : "border-[#e5e5e5] focus:border-[#1f4529]"}`}
                  >
                    <option value="">{t("address.selectState")}</option>
                    {f.stateName && !states.some((s) => s.stateName === f.stateName) && <option value={f.stateName}>{f.stateName}</option>}
                    {states.map((s) => (
                      <option key={s.id} value={s.stateName}>
                        {s.stateName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="mt-1 flex h-11 items-center justify-between rounded-lg border border-[#e5e5e5] px-3 text-xs text-[#6a7282]">
                    {statesFailed ? t("address.statesFailed") : t("common.loading")}
                    {statesFailed && (
                      <button type="button" onClick={retryStates} className="font-bold text-[#1f4529]">
                        {t("address.retry")}
                      </button>
                    )}
                  </span>
                )
              ) : (
                <input
                  id={`addr-${key}`}
                  value={f[key]}
                  onChange={(e) => change(key, e.target.value, def.allowed)}
                  maxLength={def.maxLength}
                  inputMode={key === "pincode" ? "numeric" : undefined}
                  autoComplete={key === "name" ? "name" : key === "pincode" ? "postal-code" : "off"}
                  placeholder={pickText(def.placeholder, locale)}
                  aria-invalid={invalid || (key === "pincode" && !!pinError)}
                  className={`mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm text-[#202020] outline-none placeholder:text-[#9a9a9a] ${
                    invalid || (key === "pincode" && pinError) ? "border-[#c80000]" : "border-[#e5e5e5] focus:border-[#1f4529]"
                  }`}
                />
              )}
              {key === "pincode" && pinError && !invalid && <span className="mt-1 block text-[11px] font-medium text-[#c80000]">{pinError}</span>}
              {invalid && error && (
                <span role="alert" className="mt-1 block text-[11px] font-medium text-[#c80000]">
                  {error}
                </span>
              )}
            </label>
          );
        })}
      </form>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#eee] bg-white px-4 py-3 md:static md:mt-4 md:border-0 md:bg-transparent md:px-0">
        <div className="mx-auto max-w-2xl md:max-w-3xl">
          <p className="mb-2 text-center text-[11px] text-[#6a7282]">{t("address.accurateInfo")}</p>
          {error && !errorField && <p className="mb-2 text-center text-xs font-medium text-[#c80000]">{error}</p>}
          <button
            type="submit"
            form="address-form"
            disabled={saving}
            className="h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? t("common.loading") : t("address.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
