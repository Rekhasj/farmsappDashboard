"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Skeletons";
import CartSummary from "@/features/cart/CartSummary";
import ExpectedDelivery from "@/features/cart/ExpectedDelivery";
import { useCart } from "@/features/cart/CartProvider";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import { formatRupees, isInStock } from "@/lib/cart";
import type { CartDetails, PlacedOrder, RazorpayStart } from "@/types/cart";
import { CodBlockedSheet, CodConfirmSheet } from "./CodSheets";
import { payWithRazorpay } from "./razorpay";

type Mode = "RAZORPAY" | "COD";
export const LAST_ORDER_KEY = "fa_last_order";
const CONTAINER = "mx-auto w-full px-4 sm:px-6 md:max-w-6xl";

const codAllowed = (d: CartDetails) => !d.codRestricted && (d.paymentModeOptions ?? []).includes("Cash");
const onlineAllowed = (d: CartDetails) => (d.paymentModeOptions ?? []).includes("Online");

/** RN CartPaymentPage: defaultPaymentMode decides, as long as that mode is usable. */
function defaultMode(d: CartDetails | null): Mode | null {
  if (!d) return null;
  if (d.defaultPaymentMode === "COD" && codAllowed(d)) return "COD";
  if (onlineAllowed(d)) return "RAZORPAY";
  return codAllowed(d) ? "COD" : null;
}

/**
 * Payment Mode page. Amounts shown here come from the server cart; the
 * server recomputes them again when the order is placed (/api/checkout/*).
 */
export default function CheckoutView({ address }: { address: { name: string; line: string; pincode: string } | null }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { items, details, loaded, syncing, refresh, clear, notify } = useCart();
  const [chosen, setChosen] = useState<Mode | null>(null);
  const [busy, setBusy] = useState<null | "starting" | "verifying" | "placing">(null);
  const [sheet, setSheet] = useState<null | "codBlocked" | "codConfirm">(null);
  const placed = useRef(false);

  // RN re-reads the cart whenever this screen gets focus.
  useEffect(() => {
    const id = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(id);
  }, [refresh]);

  // Same bounce-back rules as the app: empty cart or out-of-stock lines → back to the cart.
  const blocked = loaded && !syncing && (items.length === 0 || items.some((i) => !isInStock(i)));
  useEffect(() => {
    if (blocked && !placed.current) router.replace("/cart");
  }, [blocked, router]);

  const mode = chosen ?? defaultMode(details);
  const serviceable = details?.serviceable !== false;
  const base = details?.discountedPrice ?? 0;
  const prepaid = Math.trunc(details?.prepaidDiscountValue ?? 0);
  const total = mode === "RAZORPAY" ? base - prepaid : base;
  const rows = (mode === "RAZORPAY" ? details?.onlinePriceSummary : details?.codPriceSummary) ?? details?.priceSummary ?? [];
  const canSubmit = !!address && serviceable && !!mode && !busy && !syncing && !!details;

  async function submit(payment: Mode, razorpay?: unknown) {
    setBusy(payment === "RAZORPAY" ? "verifying" : "placing");
    try {
      const res = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMode: payment, razorpay }),
      });
      const data = (await res.json()) as { order?: PlacedOrder; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error || t("location.errorGeneric"));
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(data.order));
      } catch {
        /* the success page falls back to just the order id */
      }
      placed.current = true;
      clear(); // RN: setCartDetails([]) after a successful order
      router.replace(`/order-placed?id=${encodeURIComponent(data.order.orderId)}`);
    } catch (e) {
      notify(e instanceof Error ? e.message : t("location.errorGeneric"));
      setBusy(null);
    }
  }

  async function payOnline() {
    setBusy("starting");
    try {
      const res = await fetch("/api/checkout/razorpay-order", { method: "POST" });
      const data = (await res.json()) as { start?: RazorpayStart; error?: string };
      if (!res.ok || !data.start) throw new Error(data.error || t("location.errorGeneric"));
      const result = await payWithRazorpay(data.start, "#1f4529");
      if (!result) {
        notify(t("checkout.paymentCancelled"));
        setBusy(null);
        return;
      }
      await submit("RAZORPAY", result);
    } catch (e) {
      notify(e instanceof Error ? e.message : t("location.errorGeneric"));
      setBusy(null);
    }
  }

  function onCta() {
    if (!canSubmit) return;
    if (mode === "RAZORPAY") return void payOnline();
    if (details?.codIntermediaryInfo?.show) return setSheet("codConfirm");
    void submit("COD");
  }

  if (!loaded || !details || blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-36 md:pb-10">
      <header className="sticky top-0 z-10 md:static border-b border-[#eee] bg-white py-3">
        <div className={`${CONTAINER} flex items-center gap-3`}>
          <BackLink href="/cart" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]">
            <IconArrowLeft className="size-4" />
          </BackLink>
          <h1 className="truncate text-sm font-bold text-[#202020]">{t("checkout.title")}</h1>
        </div>
      </header>

      {details.orderCancellationAlert && (
        <p className="bg-[#fff4e5] px-4 py-2 text-center text-xs font-semibold text-[#9a5b00]">{t("checkout.noCancellation")}</p>
      )}

      <main className={`${CONTAINER} pt-4 md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-6 md:pt-6`}>
        <div className="space-y-4">
          <Stepper />

          <section className="rounded-xl border border-[#eee] bg-white p-4">
            {!address ? (
              <p className="text-[13px] font-semibold text-[#c80000]">{t("checkout.noAddress")}</p>
            ) : !serviceable ? (
              <>
                <p className="text-[13px] font-bold text-[#c80000]">{t("checkout.notServiceable")}</p>
                <p className="mt-1 text-xs text-[#6a7282]">{t("checkout.notServiceableText")}</p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase text-[#6a7282]">{t("checkout.deliverTo")}</p>
                <p className="mt-1 text-[13px] font-bold text-[#202020]">{address.name}</p>
                <p className="text-xs text-[#555]">
                  {[address.line, address.pincode].filter(Boolean).join(" – ")}
                </p>
                {details.expectedDeliveryDate && <ExpectedDelivery date={details.expectedDeliveryDate} hasDivider />}
              </>
            )}
          </section>

          <section className="rounded-xl border border-[#eee] bg-white p-4">
            <h2 className="text-sm font-bold text-[#202020]">{t("checkout.selectMethod")}</h2>
            <div className="mt-3 space-y-3" role="radiogroup" aria-label={t("checkout.selectMethod")}>
              {onlineAllowed(details) && (
                <PaymentOption
                  selected={mode === "RAZORPAY"}
                  disabled={!!busy}
                  onSelect={() => setChosen("RAZORPAY")}
                  badge={t("checkout.recommended")}
                  title={t("checkout.payOnline")}
                  description={t("checkout.onlineDescription")}
                  price={
                    <>
                      {prepaid > 0 && <span className="text-[11px] text-[#9a9a9a] line-through">{formatRupees(base)}</span>}
                      <span>{formatRupees(base - prepaid)}</span>
                    </>
                  }
                  footer={
                    <span className="flex flex-wrap items-center gap-2 text-[11px] text-[#1f6b3a]">
                      <span>🔒 {t("checkout.secure")}</span>
                      {prepaid > 0 && (
                        <span className="rounded-full bg-[#e8f5ec] px-2 py-0.5 font-bold">
                          {t("checkout.save")} {formatRupees(prepaid)}
                        </span>
                      )}
                    </span>
                  }
                />
              )}
              {(details.paymentModeOptions ?? []).includes("Cash") &&
                (details.codRestricted ? (
                  <button
                    type="button"
                    onClick={() => setSheet("codBlocked")}
                    className="w-full rounded-xl border border-[#eee] bg-[#fafafa] p-3 text-left opacity-80"
                  >
                    <p className="text-[13px] font-bold text-[#8a8a8a]">{t("checkout.codUnavailable")}</p>
                    <p className="mt-0.5 text-[11px] text-[#8a8a8a]">
                      {t("checkout.codUnavailableHint")}{" "}
                      <span className="font-semibold text-[#e07b00] underline">{t("checkout.tapToKnowWhy")}</span>
                    </p>
                  </button>
                ) : (
                  <PaymentOption
                    selected={mode === "COD"}
                    disabled={!!busy}
                    onSelect={() => setChosen("COD")}
                    title={t("checkout.cod")}
                    description={t("checkout.codDescription")}
                    price={<span>{formatRupees(base)}</span>}
                  />
                ))}
            </div>
          </section>

          {details.policies?.policies && details.policies.policies.length > 0 && (
            <section className="rounded-xl border border-[#eee] bg-white p-4">
              <h2 className="text-sm font-bold text-[#202020]">{pickText(details.policies.header, locale)}</h2>
              <ul className="mt-3 space-y-3">
                {details.policies.policies.map((p, i) => (
                  <li key={i}>
                    <p className="text-[13px] font-semibold text-[#202020]">{pickText(p.title, locale)}</p>
                    <p className="text-xs leading-5 text-[#6a7282]">{pickText(p.description, locale)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="mt-4 space-y-4 md:sticky md:top-20 md:mt-0">
          <CartSummary rows={rows} updating={syncing} />
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eee] bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:static md:rounded-xl md:border md:p-4 md:shadow-none">
            <div className="mx-auto flex max-w-xl items-center gap-3 md:max-w-none">
              <div className="shrink-0">
                <p className="text-[11px] text-[#6a7282]">{t("cart.totalAmount")}</p>
                <p className="text-lg font-bold text-[#202020]">{formatRupees(serviceable ? total : 0)}</p>
              </div>
              <button
                type="button"
                onClick={onCta}
                disabled={!canSubmit}
                className="h-11 flex-1 rounded-lg bg-[#1f4529] px-3 text-sm font-bold text-white hover:bg-[#2e5b3a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mode === "COD" ? t("checkout.placeOrder") : t("checkout.payNow")}
              </button>
            </div>
          </div>
        </aside>
      </main>

      {sheet === "codBlocked" && details.codRestrictionInfo && (
        <CodBlockedSheet info={details.codRestrictionInfo} onClose={() => setSheet(null)} />
      )}
      {sheet === "codConfirm" && details.codIntermediaryInfo && (
        <CodConfirmSheet
          info={details.codIntermediaryInfo}
          onCancel={() => setSheet(null)}
          onConfirm={() => {
            setSheet(null);
            void submit("COD");
          }}
        />
      )}
      {busy && busy !== "starting" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/90 text-center" role="status">
          <Spinner />
          {busy === "verifying" ? (
            <>
              <p className="text-base font-bold text-[#202020]">{t("checkout.holdOn")}</p>
              <p className="text-xs text-[#6a7282]">{t("checkout.verifying")}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-[#202020]">{t("checkout.placing")}</p>
          )}
        </div>
      )}
    </div>
  );
}

/** Cart ✓ — Payment Mode — Order Placed (RN Stepper, current step 1). */
function Stepper() {
  const t = useT();
  const steps = [t("checkout.stepCart"), t("checkout.title"), t("checkout.stepPlaced")];
  return (
    <ol className="flex items-center gap-2 rounded-xl border border-[#eee] bg-white px-4 py-3 text-[11px] font-semibold">
      {steps.map((label, i) => (
        <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
              i < 1 ? "bg-[#1f4529] text-white" : i === 1 ? "border-2 border-[#1f4529] text-[#1f4529]" : "border border-[#ccc] text-[#999]"
            }`}
          >
            {i < 1 ? "✓" : i + 1}
          </span>
          <span className={`truncate ${i <= 1 ? "text-[#202020]" : "text-[#999]"}`}>{label}</span>
          {i < steps.length - 1 && <span className="h-px min-w-3 flex-1 bg-[#ddd]" />}
        </li>
      ))}
    </ol>
  );
}

function PaymentOption({
  selected,
  disabled,
  onSelect,
  badge,
  title,
  description,
  price,
  footer,
}: {
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  badge?: string;
  title: string;
  description: string;
  price: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`relative w-full rounded-xl border p-3 text-left transition-colors ${
        selected ? "border-[#1f4529] bg-[#f3faf1]" : "border-[#e5e5e5] bg-white hover:border-[#b9d3bd]"
      }`}
    >
      {badge && (
        <span className="absolute -top-2 left-3 rounded-full bg-linear-to-r from-[#1f4529] to-[#3f8a52] px-2 py-0.5 text-[9px] font-bold tracking-wide text-white">
          {badge}
        </span>
      )}
      <span className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#1f4529]" : "border-[#bbb]"}`}
          aria-hidden
        >
          {selected && <span className="size-2 rounded-full bg-[#1f4529]" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-[#202020]">{title}</span>
          <span className="block text-[11px] text-[#6a7282]">{description}</span>
        </span>
        <span className="flex shrink-0 items-baseline gap-1.5 text-sm font-bold text-[#202020]">{price}</span>
      </span>
      {footer && <span className="mt-2 block pl-7">{footer}</span>}
    </button>
  );
}
