import { Suspense } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import AccountButton from "@/features/auth/AccountButton";
import DesktopCartButton from "@/features/cart/DesktopCartButton";
import LocationSelector from "@/features/home/components/LocationSelector";
import HeaderSearch from "@/features/search/components/HeaderSearch";
import { getSession } from "@/lib/session";
import { fetchAddresses, toDeliveryLocation } from "@/services/farmsapp";

/**
 * Desktop/TV header (md and up), one for every page — Blinkit-style single
 * row: logo · delivery location · wide search · language · account · cart.
 * Phones keep the farmsapp per-screen headers; this one is `hidden` there.
 */
export default async function SiteHeader() {
  const { user, pincode, changed } = await getSession();
  const addresses = user ? await fetchAddresses(user.farmerId) : [];
  const location = toDeliveryLocation(addresses, pincode, changed);

  return (
    <header className="sticky top-0 z-40 hidden bg-[#1f4529] shadow-[0_2px_8px_rgba(0,0,0,0.12)] md:block">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-4 px-6 lg:gap-6 2xl:max-w-[1440px]">
        <Link href="/" aria-label="FarmsApp" className="flex h-10 shrink-0 items-center rounded-lg bg-white px-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="FarmsApp" className="h-5 w-auto lg:h-6" />
        </Link>

        <div className="hidden shrink-0 border-l border-white/20 pl-4 lg:block lg:pl-6">
          <LocationSelector location={location} addresses={addresses} />
        </div>

        <div className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-11 rounded-lg bg-white" />}>
            <HeaderSearch />
          </Suspense>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LanguageSwitcher />
          <AccountButton />
          <DesktopCartButton />
        </div>
      </div>
    </header>
  );
}
