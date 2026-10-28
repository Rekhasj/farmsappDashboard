import { NextResponse } from "next/server";
import { fetchStates, lookupLocationInfo } from "@/services/farmsapp";

/**
 * GET ?pincode=XXXXXX — area / town / district / state for auto-fill.
 * GET (no pincode)    — the state picker list.
 */
export async function GET(request: Request) {
  const pincode = new URL(request.url).searchParams.get("pincode");
  if (pincode === null) return NextResponse.json({ states: await fetchStates() });
  if (!/^[1-9]\d{5}$/.test(pincode)) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json(await lookupLocationInfo(pincode));
}
