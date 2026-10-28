import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { fetchQueries, postQuery } from "@/services/farmsapp";

/** GET — the farmer's support queries with answers (RN CommonQueryDisplay). */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ login: true }, { status: 401 });
  const queries = await fetchQueries(user.farmerId);
  if (!queries) return NextResponse.json({ error: "Couldn't load your queries." }, { status: 502 });
  return NextResponse.json({ queries });
}

/** POST { query } — post a new question to support. */
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, login: true }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 1000) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  const ok = await postQuery(user.farmerId, query);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
