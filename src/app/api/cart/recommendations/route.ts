import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { fetchCartRecommendations } from "@/services/farmsapp";

/** GET — "You might also like" products for the cart page. Optional: an empty list on failure. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ recommendations: [] });
  return NextResponse.json({ recommendations: await fetchCartRecommendations(user.farmerId) });
}
