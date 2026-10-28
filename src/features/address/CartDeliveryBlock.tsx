"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import ExpectedDelivery from "@/features/cart/ExpectedDelivery";
import PincodeModal from "./PincodeModal";

/** What the cart knows about where the order goes (built server-side in app/cart/page.tsx). */
export type CartDelivery = {
  /** The farmer's default saved address, or null. */
  address: { name: string; line: string; pincode: string } | null;
  hasAddresses: boolean;
  /** The farmer's current pincode (profile / last location change). */
  pincode: string | null;
  mobile: string;
};

/**
 * RN handleAddressNavigation: no pincode yet → ask for one, then the new-address
 * form; saved addresses → My Addresses; none → the new-address form.
 */
export function useAddressNavigation(delivery: CartDelivery) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const go = () => {
    if (!delivery.pincode) return setAsking(true);
    router.push(delivery.hasAddresses ? "/addresses?from=cart" : "/addresses/new?from=cart");
  };
  const modal = asking ? (
    <PincodeModal
      onClose={() => setAsking(false)}
      onPincode={(pincode) => router.push(`/addresses/new?from=cart&pincode=${pincode}`)}
    />
  ) : null;
  return { go, modal };
}

/** RN components/Cart/DeliveryAddressView.jsx (with allowChange). */
export default function CartDeliveryBlock({
  delivery,
  serviceable,
  expectedDeliveryDate,
}: {
  delivery: CartDelivery;
  serviceable: boolean;
  expectedDeliveryDate?: string;
}) {
  const t = useT();
  const { go, modal } = useAddressNavigation(delivery);
  const { address, pincode } = delivery;
  const notServed = !serviceable && !!pincode;
  const label = delivery.hasAddresses ? t("auth.change") : t("address.add");

  return (
    <section className={`rounded-xl border bg-white p-4 ${notServed ? "border-[#f3d4d4]" : "border-[#eee]"}`}>
      {notServed && (
        <div className="mb-3 border-b border-[#f0f0f0] pb-3">
          <p className="flex items-center gap-2 text-[13px] font-bold text-[#c80000]">
            <TruckIcon /> {t("checkout.notServiceable")}
          </p>
          <p className="mt-1 text-xs text-[#6a7282]">{t("checkout.notServiceableText")}</p>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {pincode ? (
            <p className="truncate text-[13px] text-[#202020]">
              <span className="font-bold">{t("checkout.deliverTo")}</span>
              {address ? ` ${address.name.slice(0, 12)}, ${pincode}` : ` ${pincode}`}
            </p>
          ) : (
            <p className="text-[13px] font-semibold text-[#c80000]">{t("address.addDetails")}</p>
          )}
          {address && (
            <p className="mt-1 line-clamp-3 text-xs text-[#6a7282]">
              {[address.line, delivery.mobile, address.pincode].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={go}
          className={`shrink-0 text-xs font-bold ${!pincode || notServed ? "text-[#c80000]" : "text-[#1447E6]"} hover:underline`}
        >
          {label}
        </button>
      </div>

      {serviceable && expectedDeliveryDate && <ExpectedDelivery date={expectedDeliveryDate} hasDivider />}
      {modal}
    </section>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0" aria-hidden>
      <path d="M2 5h10v8H2zM12 8h3.5L18 11v2h-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="5.5" cy="14.5" r="1.5" fill="currentColor" />
      <circle cx="15" cy="14.5" r="1.5" fill="currentColor" />
    </svg>
  );
}
