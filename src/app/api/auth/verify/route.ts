import { NextResponse } from "next/server";
import { allow, isMobile, isOtp, resetLimit, startSession } from "@/lib/auth";
import { PENDING_SIGNUP_COOKIE, PENDING_SIGNUP_MAX_AGE, authCookieOptions, type PendingSignup } from "@/lib/session";
import { sign } from "@/lib/signed-cookie";
import { languageName } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { saveFarmerLanguage, signupFarmer, verifyOtpLogin } from "@/services/farmsapp";

/**
 * POST { mobile, otp } — RN useSubmitOtp + resolveLoginOutcome:
 *  - registered farmer → save language, load profile, log in
 *  - new farmer + enablePincode → ask for a pincode first (signed pending cookie)
 *  - new farmer otherwise → sign up without a pincode, log in
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { mobile?: unknown; otp?: unknown } | null;
  const { mobile, otp } = body ?? {};
  if (!isMobile(mobile) || !isOtp(otp)) return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 400 });

  // A 4-digit OTP is guessable; cap attempts per number.
  if (!allow(`verify:${mobile}`, 5, 15 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please request a new OTP later." }, { status: 429 });
  }

  const language = languageName(await getLocale());
  const outcome = await verifyOtpLogin(mobile, otp, language);
  if (!outcome.ok) return NextResponse.json({ ok: false, error: outcome.message || "Invalid OTP" }, { status: 401 });
  resetLimit(`verify:${mobile}`);

  const res = NextResponse.json({ ok: true, needPincode: false });

  if (outcome.registered) {
    await saveFarmerLanguage(outcome.farmerId, language);
    if (!(await startSession(res, outcome.farmerId, mobile))) {
      return NextResponse.json({ ok: false, error: "Couldn't load your profile. Please try again." }, { status: 502 });
    }
    return res;
  }

  if (outcome.enablePincode) {
    const pending: PendingSignup = { mobile, preferredLanguage: language };
    const ask = NextResponse.json({ ok: true, needPincode: true });
    ask.cookies.set(PENDING_SIGNUP_COOKIE, sign(pending, PENDING_SIGNUP_MAX_AGE), {
      ...authCookieOptions,
      maxAge: PENDING_SIGNUP_MAX_AGE,
    });
    return ask;
  }

  const farmerId = await signupFarmer(mobile, null, language);
  if (!farmerId || !(await startSession(res, farmerId, mobile))) {
    return NextResponse.json({ ok: false, error: "Couldn't create your account. Please try again." }, { status: 502 });
  }
  return res;
}
