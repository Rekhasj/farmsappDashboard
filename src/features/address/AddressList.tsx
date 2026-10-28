"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Skeletons";
import { useCart } from "@/features/cart/CartProvider";
import { useT } from "@/i18n/I18nProvider";
import type { SavedAddress } from "@/types/location";
import PincodeModal from "./PincodeModal";
import { backTo, goFresh } from "./nav";

const text = (r: Record<string, unknown>, k: string) =>
  typeof r[k] === "string" || typeof r[k] === "number" ? String(r[k]).trim() : "";

/**
 * RN SelectAddress: tap a row to deliver there (made default + farmer pincode
 * follows); ⋮ → Edit / Delete; "Add New Address" asks for a pincode first.
 */
export default function AddressList({ from, mobile }: { from: "cart" | null; mobile: string }) {
  const t = useT();
  const router = useRouter();
  const { notify } = useCart();
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses", { cache: "no-store" });
      const data = (await res.json()) as { addresses?: SavedAddress[] };
      setAddresses(data.addresses ?? []);
    } catch {
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/addresses", { cache: "no-store" })
      .then((res) => res.json() as Promise<{ addresses?: SavedAddress[] }>)
      .then((data) => alive && setAddresses(data.addresses ?? []))
      .catch(() => alive && setAddresses([]));
    return () => {
      alive = false;
    };
  }, []);

  async function select(a: SavedAddress) {
    if (a.isDefault) return from ? router.push(backTo(from)) : undefined; // RN: tapping the current one does nothing
    setBusyId(a.id);
    const res = await fetch(`/api/addresses/${encodeURIComponent(a.id)}/select`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setBusyId(null);
      return notify(data.error || t("location.errorGeneric"));
    }
    if (from) return goFresh(backTo(from));
    setBusyId(null);
    await load();
  }

  async function remove(id: string) {
    setConfirmId(null);
    setBusyId(id);
    const res = await fetch(`/api/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) return notify(t("location.errorGeneric"));
    notify(t("address.deleted"));
    await load();
  }

  const newAddressUrl = (pincode: string) => `/addresses/new?pincode=${pincode}${from ? `&from=${from}` : ""}`;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-28 md:min-h-[60vh] md:pb-14">
      <header className="sticky top-0 z-10 border-b border-[#eee] bg-white py-3 md:static md:border-0 md:bg-transparent md:pt-6 md:pb-2">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 md:max-w-6xl md:px-6 xl:max-w-7xl 2xl:max-w-[1440px]">
          <BackLink href={from ? backTo(from) : "/"} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]">
            <IconArrowLeft className="size-4" />
          </BackLink>
          <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{t("address.mine")}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-3 px-4 pt-4 md:grid md:max-w-6xl md:grid-cols-2 md:gap-4 md:space-y-0 md:px-6 xl:max-w-7xl xl:grid-cols-3 2xl:max-w-[1440px]">
        {/* Desktop: "add" lives in the grid as a dashed card (phones use the bottom bar). */}
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="hidden min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#b9d3bd] bg-white text-sm font-bold text-[#1f4529] hover:bg-[#f6faf6] md:flex"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-[#eef7ec] text-2xl leading-none" aria-hidden>
            +
          </span>
          {t("address.addNew")}
        </button>
        {addresses === null ? (
          <div className="flex justify-center pt-16 md:col-span-full">
            <Spinner />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-16 text-center md:col-span-full md:pt-6">
            <p className="text-base font-bold text-[#202020]">{t("address.noneSaved")}</p>
            <p className="mt-1.5 max-w-xs text-xs text-[#6a7282]">{t("address.noneSavedText")}</p>
          </div>
        ) : (
          addresses.map((a) => {
            const r = a.raw;
            const lines = [
              text(r, "flatNumber"),
              text(r, "address"),
              text(r, "village").slice(0, 20),
              (text(r, "townName") || text(r, "town")).slice(0, 20),
              text(r, "district").slice(0, 30),
              text(r, "state").slice(0, 30),
              mobile,
            ].filter(Boolean);
            const landmark = text(r, "landmark");
            return (
              <div
                key={a.id}
                className={`relative rounded-xl border bg-white md:h-full ${a.isDefault ? "border-[#1f4529]" : "border-[#eee]"} ${busyId === a.id ? "opacity-60" : ""}`}
              >
                <button type="button" onClick={() => select(a)} disabled={!!busyId} className="block w-full p-4 pr-12 text-left md:h-full">
                  <span className="flex items-center gap-2">
                    <HomeIcon />
                    <span className="max-w-[60%] truncate text-[13px] font-bold text-[#202020]">{text(r, "name") || a.title}</span>
                    <span className="text-[13px] text-[#202020]">, {a.pincode}</span>
                    {a.isDefault && <span className="text-[#1f6b3a]" aria-label="✓">✓</span>}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#6a7282]">{lines.join(", ")}</span>
                  {landmark && <span className="block text-xs text-[#6a7282]">Landmark: {landmark.slice(0, 30)}</span>}
                </button>
                <RowMenu
                  open={menuId === a.id}
                  onToggle={() => setMenuId((m) => (m === a.id ? null : a.id))}
                  onClose={() => setMenuId(null)}
                  onEdit={() => router.push(`/addresses/${encodeURIComponent(a.id)}/edit${from ? `?from=${from}` : ""}`)}
                  onDelete={() => {
                    setMenuId(null);
                    setConfirmId(a.id);
                  }}
                />
              </div>
            );
          })
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#eee] bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="mx-auto flex h-11 w-full max-w-2xl items-center justify-center rounded-lg bg-[#1f4529] text-sm font-bold text-white"
        >
          + {t("address.addNew")}
        </button>
      </div>

      {asking && <PincodeModal onClose={() => setAsking(false)} onPincode={(p) => router.push(newAddressUrl(p))} />}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmId(null)} />
          <div className="relative w-full rounded-t-2xl bg-white p-5 md:max-w-sm md:rounded-2xl">
            <p className="text-center text-sm font-bold text-[#202020]">{t("address.deleteConfirm")}</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setConfirmId(null)} className="h-10 flex-1 rounded-lg border border-[#ddd] text-sm font-bold">
                {t("common.cancel")}
              </button>
              <button type="button" onClick={() => remove(confirmId)} className="h-10 flex-1 rounded-lg bg-[#c80000] text-sm font-bold text-white">
                {t("address.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RowMenu({
  open,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onClose();
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  return (
    <div ref={ref} className="absolute right-2 top-2">
      <button type="button" onClick={onToggle} aria-haspopup="menu" aria-expanded={open} aria-label="⋮" className="flex size-8 items-center justify-center rounded-full text-lg text-[#6a7282] hover:bg-[#f3f4f6]">
        ⋮
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 w-32 overflow-hidden rounded-lg border border-[#eee] bg-white shadow-lg">
          <button type="button" role="menuitem" onClick={onEdit} className="block w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#f6faf6]">
            {t("address.edit")}
          </button>
          <button type="button" role="menuitem" onClick={onDelete} className="block w-full px-3 py-2 text-left text-xs font-semibold text-[#c80000] hover:bg-[#fff5f5]">
            {t("address.delete")}
          </button>
        </div>
      )}
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0 text-[#1f4529]" aria-hidden>
      <path d="M3 9.5 10 4l7 5.5V17a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
