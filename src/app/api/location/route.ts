import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { setLocationCookie } from "@/lib/location";
import { lookupPincode, setDefaultAddress, updateFarmerPincode } from "@/services/farmsapp";

/** GET ?lat=&lng= — turns GPS coordinates into a pincode. */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || sp.get("lat") === null || sp.get("lng") === null) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  const pincode = await lookupPincode(lat, lng);
  if (!pincode) return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
  return NextResponse.json({ pincode });
}

/**
 * POST { pincode, address? } — same steps as the RN LocationChangeModal:
 * optionally make a saved address the default, then save the pincode on the
 * farmer. On success the serving store is remembered in a cookie so every
 * page re-renders for the new store.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    pincode?: unknown;
    address?: Record<string, unknown>;
  } | null;
  const pincode = typeof body?.pincode === "string" ? body.pincode.trim() : "";

  if (!/^[1-9]\d{5}$/.test(pincode)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid 6-digit pincode" }, { status: 400 });
  }

  // Changing location edits the farmer's own saved pincode, so it needs a real login (never the demo farmer).
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "login", login: true }, { status: 401 });
  const { farmerId } = user;
  if (body?.address && typeof body.address === "object") {
    await setDefaultAddress(farmerId, body.address);
  }

  const result = await updateFarmerPincode(farmerId, pincode);
  if (!result.ok) {
    const error =
      result.reason === "not-serviceable"
        ? "Sorry, we don't deliver to this pincode yet."
        : result.message || (result.reason === "invalid" ? "Invalid pincode" : "Something went wrong. Please try again.");
    return NextResponse.json({ ok: false, error }, { status: result.reason === "failed" ? 502 : 422 });
  }

  const res = NextResponse.json({ ok: true, pincode: result.pincode });
  setLocationCookie(res, farmerId, result);
  return res;
}
