import { redirect } from "next/navigation";
import AddressList from "@/features/address/AddressList";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** My Addresses (RN pages/SelectAddress.js). `?from=cart` returns to the cart after a pick. */
export default async function AddressesPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const from = (await searchParams).from === "cart" ? "cart" : null;
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(from ? "/addresses?from=cart" : "/addresses")}`);
  return <AddressList from={from} mobile={user.mobile} />;
}
