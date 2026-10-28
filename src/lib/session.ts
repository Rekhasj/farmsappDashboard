import { cookies } from "next/headers";
import type { DeliveryLocation } from "@/types/location";
import { DEMO_FARMER_ID, DEMO_PINCODE, DEMO_STORE_ID } from "@/lib/constants";
import { sign, verify } from "@/lib/signed-cookie";

/** Cookie written by /api/location when the farmer picks a new delivery pincode. */
export const LOCATION_COOKIE = "fa_loc";
/** Signed login cookie (see lib/signed-cookie) — the web version of the RN app's AsyncStorage farmerId. */
export const AUTH_COOKIE = "fa_auth";
/** Signed, short-lived: OTP verified for a new mobile number that still needs a pincode to sign up. */
export const PENDING_SIGNUP_COOKIE = "fa_signup";

export const AUTH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const PENDING_SIGNUP_MAX_AGE = 60 * 15; // 15 minutes

export type SessionUser = { farmerId: number; name?: string; mobile: string; storeId?: number; pincode?: string };
export type PendingSignup = { mobile: string; preferredLanguage: string };

export interface Session {
  /**
   * The farmer for catalogue reads. The backend needs *a* farmerId even to
   * list products, so guests browse as the demo farmer — but nothing personal
   * (cart, orders, addresses, location changes) is ever done for a guest.
   */
  farmerId: number;
  storeId: number;
  pincode: string;
  /** Set once the farmer has chosen a location (cookie present). */
  changed?: { place: DeliveryLocation | null };
  /** The logged-in farmer, or null for a guest. Use this for anything personal. */
  user: SessionUser | null;
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const signSession = (user: SessionUser) => sign(user, AUTH_MAX_AGE);

/** SERVER-ONLY. The logged-in farmer from the signed cookie, or null. */
export async function getUser(): Promise<SessionUser | null> {
  const user = verify<SessionUser>((await cookies()).get(AUTH_COOKIE)?.value);
  return user && Number.isInteger(user.farmerId) && user.farmerId > 0 ? user : null;
}

/**
 * SERVER-ONLY. Store and pincode follow, in order: the location the farmer
 * last picked (cookie), the logged-in farmer's own store, then the demo store.
 */
export async function getSession(): Promise<Session> {
  const jar = await cookies();
  const user = await getUser();
  const base = {
    farmerId: user?.farmerId ?? DEMO_FARMER_ID,
    storeId: user?.storeId ?? DEMO_STORE_ID,
    pincode: user?.pincode ?? DEMO_PINCODE,
    user,
  };

  const raw = jar.get(LOCATION_COOKIE)?.value;
  if (raw && user) {
    try {
      const v = JSON.parse(raw) as { farmerId?: unknown; storeId?: unknown; pincode?: unknown; place?: DeliveryLocation | null };
      // The location cookie is only honoured for the farmer who set it.
      if (
        v.farmerId === user.farmerId &&
        typeof v.storeId === "number" &&
        typeof v.pincode === "string" &&
        /^[1-9]\d{5}$/.test(v.pincode)
      ) {
        return { ...base, storeId: v.storeId, pincode: v.pincode, changed: { place: v.place ?? null } };
      }
    } catch {
      /* fall through */
    }
  }
  return base;
}
