/**
 * SERVER-ONLY. Login plumbing shared by /api/auth/*: finishing a login
 * (profile → signed cookie) and simple in-memory throttles. The throttles
 * live in this server process only — good enough for one Node server; use a
 * shared store (Redis etc.) if the site ever runs on several instances.
 */
import type { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_MAX_AGE,
  LOCATION_COOKIE,
  PENDING_SIGNUP_COOKIE,
  authCookieOptions,
  signSession,
  type SessionUser,
} from "@/lib/session";
import { fetchFarmerProfile } from "@/services/farmsapp";

export const isMobile = (v: unknown): v is string => typeof v === "string" && /^\d{10}$/.test(v);
export const isOtp = (v: unknown): v is string => typeof v === "string" && /^\d{4}$/.test(v);

/** Loads the farmer and writes the signed login cookie (RN: load profile → markFarmerRegistered). */
export async function startSession(res: NextResponse, farmerId: number, mobile: string): Promise<boolean> {
  const profile = await fetchFarmerProfile(farmerId);
  if (!profile) return false;
  const user: SessionUser = { farmerId, mobile, name: profile.name, storeId: profile.storeId, pincode: profile.pincode };
  res.cookies.set(AUTH_COOKIE, signSession(user), { ...authCookieOptions, maxAge: AUTH_MAX_AGE });
  // A location picked by someone else on this browser doesn't apply to this farmer.
  res.cookies.delete(LOCATION_COOKIE);
  res.cookies.delete(PENDING_SIGNUP_COOKIE);
  return true;
}

export function endSession(res: NextResponse) {
  for (const name of [AUTH_COOKIE, LOCATION_COOKIE, PENDING_SIGNUP_COOKIE]) res.cookies.delete(name);
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** True if `key` may act now; at most `limit` times per `windowMs`. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

export const resetLimit = (key: string) => buckets.delete(key);
