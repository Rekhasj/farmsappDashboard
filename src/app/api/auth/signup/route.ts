import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { startSession } from "@/lib/auth";
import { PENDING_SIGNUP_COOKIE, type PendingSignup } from "@/lib/session";
import { verify } from "@/lib/signed-cookie";
import { signupFarmer } from "@/services/farmsapp";

/** POST { pincode } — finishes a new farmer's signup after OTP (RN PincodeSelectionScreen). */
export async function POST(request: Request) {
  const pending = verify<PendingSignup>((await cookies()).get(PENDING_SIGNUP_COOKIE)?.value);
  if (!pending) return NextResponse.json({ ok: false, error: "Your session expired. Please log in again.", restart: true }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { pincode?: unknown } | null;
  const pincode = typeof body?.pincode === "string" ? body.pincode.trim() : "";
  if (!/^[1-9]\d{5}$/.test(pincode)) return NextResponse.json({ ok: false, error: "Please enter a valid 6-digit pincode" }, { status: 400 });

  const farmerId = await signupFarmer(pending.mobile, pincode, pending.preferredLanguage);
  const res = NextResponse.json({ ok: true });
  if (!farmerId || !(await startSession(res, farmerId, pending.mobile))) {
    return NextResponse.json({ ok: false, error: "Couldn't create your account. Please try again." }, { status: 502 });
  }
  return res;
}
