import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { savePincode, withBody } from "@/lib/location";
import { toAddressPayload, validateAddress, type AddressFields } from "@/features/address/fields";
import { createAddress, fetchAddresses } from "@/services/farmsapp";

const LOGIN = () => NextResponse.json({ ok: false, error: "login", login: true }, { status: 401 });

/** GET — the farmer's saved addresses (RN useSelectAddress: refetched every time the list opens). */
export async function GET() {
  const user = await getUser();
  if (!user) return LOGIN();
  return NextResponse.json({ addresses: await fetchAddresses(user.farmerId) });
}

/**
 * POST { fields } — add an address (made default), then save its pincode on
 * the farmer so store + cart follow it (RN useAddressForm: POST → saveUserDetails).
 */
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return LOGIN();
  const fields = (await request.json().catch(() => null))?.fields as AddressFields | undefined;
  if (!fields || typeof fields !== "object") return NextResponse.json({ ok: false, error: "Invalid address" }, { status: 400 });
  const problem = validateAddress(fields);
  if (problem) return NextResponse.json({ ok: false, field: problem.field, message: problem.message }, { status: 400 });

  const created = await createAddress(user.farmerId, toAddressPayload(fields));
  if (!created.ok) return NextResponse.json({ ok: false, error: created.message || "Couldn't save the address." }, { status: 502 });

  const res = NextResponse.json({ ok: true, serviceable: true });
  const pin = await savePincode(res, user.farmerId, fields.pincode.trim());
  return pin.error ? NextResponse.json({ ok: false, error: pin.error }, { status: 502 }) : withBody(res, { ok: true, serviceable: pin.serviceable });
}
