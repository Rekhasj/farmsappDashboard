import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { fetchOrderHistory } from "@/services/farmsapp";

const STATUSES = ["", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;

/** GET ?page=1&status=IN_TRANSIT — one page of My Orders (RN OrderPage). */
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login", login: true }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const page = Math.max(1, Math.floor(Number(sp.get("page"))) || 1);
  const status = (STATUSES as readonly string[]).includes(sp.get("status") ?? "") ? (sp.get("status") as (typeof STATUSES)[number]) : "";
  const result = await fetchOrderHistory(user.farmerId, page, status);
  if (!result) return NextResponse.json({ error: "Couldn't load your orders." }, { status: 502 });
  return NextResponse.json(result);
}
