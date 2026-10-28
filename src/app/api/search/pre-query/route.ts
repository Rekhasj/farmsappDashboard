import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { clearRecentSearches, fetchSearchPreQuery } from "@/services/farmsapp";
import { getLocale } from "@/i18n/server";

/** Recent + trending searches for the empty search box. */
export async function GET() {
  // Recent searches are personal: guests get none (trending needs a farmer too).
  const user = await getUser();
  if (!user) return NextResponse.json({ recent: [], trending: [] });
  return NextResponse.json(await fetchSearchPreQuery(user.farmerId, await getLocale()));
}

/** "Clear all" on the recent searches list. */
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const ok = await clearRecentSearches(user.farmerId);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
