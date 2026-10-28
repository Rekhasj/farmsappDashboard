import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import CartHeaderButton from "@/features/cart/CartHeaderButton";
import AccountButton from "@/features/auth/AccountButton";
import type { DeliveryLocation, SavedAddress } from "@/types/location";
import LocationSelector from "@/features/home/components/LocationSelector";
import SearchBox from "@/features/search/components/SearchBox";

/**
 * Ported from Figma node 11058:46505 ("Header").
 * CSV component #24 — HomeHeader (location + language + cart + search).
 * Location comes from the farmer's default saved address (see
 * fetchDeliveryLocation). Changing it (CSV #21 LocationSelector) is not built yet.
 *
 * Mobile: stacked (location + actions row, then full-width search below).
 * Desktop (md+): single row — location left, search centered and wider,
 * language/cart on the right.
 */
export default function HomeHeader({
  location,
  addresses = [],
}: {
  location?: DeliveryLocation | null;
  addresses?: SavedAddress[];
}) {
  return (
    <div className="bg-[#1f4529] py-4 md:hidden">
      <div className="mx-auto w-full px-4 sm:px-6 md:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px]">
        {/* Location + actions row (both breakpoints) */}
        <div className="flex items-start justify-between md:items-center">
          <LocationSelector location={location ?? null} addresses={addresses} />

          <div className="hidden md:block md:flex-1 md:max-w-md md:px-8">
            <SearchBox />
          </div>

          <div className="flex items-center gap-3.5">
            <HeaderActions />
          </div>
        </div>

        {/* Mobile-only search row */}
        <div className="mt-4 md:hidden">
          <SearchBox />
        </div>
      </div>
    </div>
  );
}

function HeaderActions() {
  return (
    <>
      <LanguageSwitcher />
      <CartHeaderButton />
      <AccountButton />
    </>
  );
}
