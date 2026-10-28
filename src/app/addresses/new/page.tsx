import { redirect } from "next/navigation";
import AddressForm from "@/features/address/AddressForm";
import { EMPTY_ADDRESS } from "@/features/address/fields";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** New Address (RN AddressDetailsScreen). Name and pincode start from the farmer / the pincode just picked. */
export default async function NewAddressPage({ searchParams }: { searchParams: Promise<{ from?: string; pincode?: string }> }) {
  const sp = await searchParams;
  const from = sp.from === "cart" ? "cart" : null;
  const { user, pincode } = await getSession();
  if (!user) {
    const qs = new URLSearchParams({ ...(from ? { from } : {}), ...(sp.pincode ? { pincode: sp.pincode } : {}) }).toString();
    redirect(`/login?next=${encodeURIComponent(`/addresses/new${qs ? `?${qs}` : ""}`)}`);
  }
  const start = /^[1-9]\d{5}$/.test(sp.pincode ?? "") ? sp.pincode! : (user.pincode ?? pincode ?? "");
  return <AddressForm mode="new" from={from} initial={{ ...EMPTY_ADDRESS, name: user.name ?? "", pincode: start }} />;
}
