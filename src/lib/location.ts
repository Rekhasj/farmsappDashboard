/**
 * SERVER-ONLY. After the farmer's pincode changes (header location picker,
 * picking/adding an address), the backend tells us the serving store; every
 * page then renders for that store via the location cookie (lib/session).
 */
import { NextResponse } from "next/server";
import { LOCATION_COOKIE } from "@/lib/session";
import { updateFarmerPincode, type PincodeChangeResult } from "@/services/farmsapp";

export function setLocationCookie(res: NextResponse, farmerId: number, change: Extract<PincodeChangeResult, { ok: true }>) {
  res.cookies.set(
    LOCATION_COOKIE,
    JSON.stringify({ farmerId, storeId: change.storeId, pincode: change.pincode, place: change.place }),
    { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true },
  );
}

/**
 * RN saveUserDetails(pincode): PUT the farmer's pincode. Returns whether the
 * new pincode is served; an unserved pincode is still saved on the farmer
 * (the cart then shows "Non Serviceable Area"), so it isn't an error here.
 */
export async function savePincode(res: NextResponse, farmerId: number, pincode: string): Promise<{ serviceable: boolean; error?: string }> {
  const change = await updateFarmerPincode(farmerId, pincode);
  if (change.ok) {
    setLocationCookie(res, farmerId, change);
    return { serviceable: true };
  }
  if (change.reason === "not-serviceable") {
    res.cookies.delete(LOCATION_COOKIE); // no store for this pincode — fall back to the farmer's own
    return { serviceable: false };
  }
  return { serviceable: false, error: change.message || "Something went wrong. Please try again." };
}

/** Re-send `res` (keeping the cookies set on it) with a different JSON body. */
export function withBody(res: NextResponse, body: unknown) {
  const out = NextResponse.json(body);
  for (const c of res.cookies.getAll()) out.cookies.set(c);
  return out;
}
