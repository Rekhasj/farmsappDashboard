import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { savePincode, withBody } from "@/lib/location";
import { fetchAddresses, updateAddress } from "@/services/farmsapp";

/** POST — deliver to this saved address: make it default, then follow its pincode (RN SelectAddress). */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "login", login: true }, { status: 401 });
  const { id } = await params;
  const address = (await fetchAddresses(user.farmerId)).find((a) => a.id === id);
  if (!address) return NextResponse.json({ ok: false, error: "Address not found" }, { status: 404 });

  const updated = await updateAddress(user.farmerId, address.raw);
  if (!updated.ok) return NextResponse.json({ ok: false, error: updated.message || "Couldn't select the address." }, { status: 502 });

  const res = NextResponse.json({ ok: true });
  if (!address.pincode) return res;
  const pin = await savePincode(res, user.farmerId, address.pincode);
  return pin.error ? NextResponse.json({ ok: false, error: pin.error }, { status: 502 }) : withBody(res, { ok: true, serviceable: pin.serviceable });
}
