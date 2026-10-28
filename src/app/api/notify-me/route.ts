import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { requestNotifyMe } from "@/services/farmsapp";

/** POST { productId, skuCode? } — "tell me when it's back in stock". */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { productId?: unknown; skuCode?: unknown } | null;
  const productId = Number(body?.productId);
  const skuCode = typeof body?.skuCode === "string" && body.skuCode.length < 64 ? body.skuCode : null;
  if (!Number.isInteger(productId) || productId <= 0) return NextResponse.json({ ok: false }, { status: 400 });

  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, login: true }, { status: 401 });
  const ok = await requestNotifyMe(user.farmerId, productId, skuCode);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
