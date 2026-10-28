import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { savePincode, withBody } from "@/lib/location";
import { toAddressPayload, validateAddress, type AddressFields } from "@/features/address/fields";
import { deleteAddress, fetchAddresses, updateAddress } from "@/services/farmsapp";

const LOGIN = () => NextResponse.json({ ok: false, error: "login", login: true }, { status: 401 });

/** The address must belong to this farmer — looked up server-side, never trusted from the browser. */
async function findOwn(farmerId: number, id: string) {
  return (await fetchAddresses(farmerId)).find((a) => a.id === id) ?? null;
}

/** PUT { fields } — edit (RN buildUpdateAddressPayload), then follow its pincode. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return LOGIN();
  const { id } = await params;
  const existing = await findOwn(user.farmerId, id);
  if (!existing) return NextResponse.json({ ok: false, error: "Address not found" }, { status: 404 });

  const fields = (await request.json().catch(() => null))?.fields as AddressFields | undefined;
  if (!fields || typeof fields !== "object") return NextResponse.json({ ok: false, error: "Invalid address" }, { status: 400 });
  const problem = validateAddress(fields);
  if (problem) return NextResponse.json({ ok: false, field: problem.field, message: problem.message }, { status: 400 });

  const updated = await updateAddress(user.farmerId, toAddressPayload(fields, existing.raw));
  if (!updated.ok) return NextResponse.json({ ok: false, error: updated.message || "Couldn't update the address." }, { status: 502 });

  const res = NextResponse.json({ ok: true });
  const pin = await savePincode(res, user.farmerId, fields.pincode.trim());
  return pin.error ? NextResponse.json({ ok: false, error: pin.error }, { status: 502 }) : withBody(res, { ok: true, serviceable: pin.serviceable });
}

/** DELETE — remove; if it was the delivery address, the next one becomes default (RN useSelectAddress). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return LOGIN();
  const { id } = await params;
  const existing = await findOwn(user.farmerId, id);
  if (!existing) return NextResponse.json({ ok: false, error: "Address not found" }, { status: 404 });

  if (!(await deleteAddress(user.farmerId, id))) {
    return NextResponse.json({ ok: false, error: "Couldn't delete the address." }, { status: 502 });
  }
  const res = NextResponse.json({ ok: true });
  if (existing.isDefault) {
    const next = (await fetchAddresses(user.farmerId))[0];
    if (next && (await updateAddress(user.farmerId, next.raw)).ok && next.pincode) {
      await savePincode(res, user.farmerId, next.pincode);
    }
  }
  return res;
}
