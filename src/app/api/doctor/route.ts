import { NextResponse } from "next/server";
import { authCookieOptions, getUser } from "@/lib/session";
import { sign } from "@/lib/signed-cookie";
import { CALL_COOKIE, CALL_MAX_AGE } from "./route-shared";
import { isLocale, languageName } from "@/i18n/config";
import { checkAgentAvailable, createCallAudit, fetchCallUrl, fetchDoctorCrops } from "@/services/farmsapp";

/**
 * Crop Doctor actions (RN CropDoctor → SelectCropsPage → LanguageCall →
 * VideoCallAvailability → VideoCallScreen):
 *   GET  ?check=1&lang=hi      → { available } (is any doctor free?)
 *   GET  ?crops=1&lang=hi      → { crops, recentCrops }
 *   POST { cropIds, lang }     → { auditId, url } (re-checks, creates the call, returns the video room)
 */
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ login: true }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const lang = sp.get("lang");
  const language = languageName(isLocale(lang) ? lang : "en");
  if (sp.get("check")) return NextResponse.json({ available: await checkAgentAvailable(user.farmerId, language) });
  if (sp.get("crops")) return NextResponse.json(await fetchDoctorCrops(user.farmerId, language));
  return NextResponse.json({ error: "Unknown request" }, { status: 400 });
}

const inFlight = new Set<number>();

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ login: true }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { cropIds?: unknown; lang?: unknown } | null;
  const ids = Array.isArray(body?.cropIds) ? body.cropIds.filter((x): x is number => Number.isInteger(x)) : [];
  if (ids.length < 1 || ids.length > 3) return NextResponse.json({ error: "Pick 1 to 3 crops" }, { status: 400 });
  const language = languageName(isLocale(body?.lang) ? body.lang : "en");

  // One call request at a time per farmer.
  if (inFlight.has(user.farmerId)) return NextResponse.json({ error: "busy" }, { status: 409 });
  inFlight.add(user.farmerId);
  try {
    if (!(await checkAgentAvailable(user.farmerId, language))) return NextResponse.json({ busy: true }, { status: 409 });

    // Send the backend its own crop objects (as the app does), never what the browser claims.
    const { crops, recentCrops } = await fetchDoctorCrops(user.farmerId, language);
    const byId = new Map([...recentCrops, ...crops].map((c) => [c.id, c]));
    const chosen = ids.map((id) => byId.get(id)).filter(Boolean).map((c) => ({ ...c, active: true }));
    if (chosen.length !== ids.length) return NextResponse.json({ error: "Unknown crop" }, { status: 400 });

    const auditId = await createCallAudit(user.farmerId, chosen, language);
    if (!auditId) return NextResponse.json({ error: "Couldn't start the call." }, { status: 502 });

    const url = await fetchCallUrl(user.farmerId, auditId, language, user.name ?? "Farmer");
    if (!url) return NextResponse.json({ noExpert: true, auditId }, { status: 409 });
    const res = NextResponse.json({ auditId, url });
    res.cookies.set(CALL_COOKIE, sign({ auditId, farmerId: user.farmerId }, CALL_MAX_AGE), { ...authCookieOptions, maxAge: CALL_MAX_AGE });
    return res;
  } finally {
    inFlight.delete(user.farmerId);
  }
}
