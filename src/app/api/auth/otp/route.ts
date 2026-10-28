import { NextResponse } from "next/server";
import { allow, isMobile } from "@/lib/auth";
import { triggerOtp } from "@/services/farmsapp";

/** POST { mobile } — sends the 4-digit OTP (RN trigger-otp; "Resend OTP" calls this again). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { mobile?: unknown } | null;
  const mobile = body?.mobile;
  if (!isMobile(mobile)) return NextResponse.json({ ok: false, error: "Enter a valid 10-digit mobile number" }, { status: 400 });

  // Same 30 s as the app's resend timer, enforced here so the SMS can't be spammed.
  if (!allow(`otp:${mobile}`, 1, 30_000)) {
    return NextResponse.json({ ok: false, error: "Please wait before requesting another OTP." }, { status: 429 });
  }

  const result = await triggerOtp(mobile);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.message || "Couldn't send the OTP." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
