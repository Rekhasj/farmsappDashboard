import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchSearchSuggestions } from "@/services/farmsapp";

/**
 * Browser-facing proxy for as-you-type suggestions. The backend credentials
 * stay on the server (see services/farmsapp.ts) — the search box only ever
 * talks to this route.
 */
export async function GET(request: Request) {
  const { farmerId: DEMO_FARMER_ID, storeId: DEMO_STORE_ID } = await getSession();
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const suggestions = query ? await fetchSearchSuggestions(query, DEMO_STORE_ID, DEMO_FARMER_ID) : [];
  return NextResponse.json({ suggestions });
}
