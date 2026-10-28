import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_MAX_AGE, authCookieOptions, getUser, signSession } from "@/lib/session";
import { languageName } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { updateFarmerName } from "@/services/farmsapp";

/** PUT { name } — RN PersonalInfo "Save Profile". Only the name can change; the session is re-signed with it. */
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, login: true }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 51) return NextResponse.json({ ok: false, error: "Please Enter Name" }, { status: 400 });

  const ok = await updateFarmerName(user.farmerId, name, user.mobile, languageName(await getLocale()));
  if (!ok) return NextResponse.json({ ok: false, error: "Couldn't update your profile." }, { status: 502 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, signSession({ ...user, name }), { ...authCookieOptions, maxAge: AUTH_MAX_AGE });
  return res;
}
