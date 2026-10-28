import { notFound, redirect } from "next/navigation";
import AddressForm from "@/features/address/AddressForm";
import { toFormFields } from "@/features/address/fields";
import { getUser } from "@/lib/session";
import { fetchAddresses } from "@/services/farmsapp";

export const dynamic = "force-dynamic";

/** Edit Address (RN AddressDetailsScreen with label 'edit'). */
export default async function EditAddressPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const from = (await searchParams).from === "cart" ? "cart" : null;
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/addresses/${id}/edit${from ? "?from=cart" : ""}`)}`);
  const address = (await fetchAddresses(user.farmerId)).find((a) => a.id === id);
  if (!address) notFound();
  return <AddressForm mode="edit" addressId={id} from={from} initial={toFormFields(address.raw)} />;
}
