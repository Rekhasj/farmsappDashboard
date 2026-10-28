import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchCart, saveCart } from "@/services/farmsapp";
import type { CartDetails, CartItem } from "@/types/cart";

/** The browser doesn't need the farmer's phone number; checkout reads it server-side. */
function publicCart(cart: CartDetails) {
  const { farmerMobile: _omit, ...rest } = cart as CartDetails & { farmerMobile?: unknown };
  void _omit;
  return rest;
}

/** GET — the farmer's priced cart (RN useCartBootstrap / fetchCart). */
export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "login", login: true }, { status: 401 });
  const cart = await fetchCart(user.farmerId);
  if (!cart) return NextResponse.json({ error: "Couldn't load the cart" }, { status: 502 });
  return NextResponse.json({ cart: publicCart(cart) });
}

/** POST { items } — replaces the cart and returns the server-priced result (RN syncCart). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { items?: unknown } | null;
  const items = body?.items;
  const valid =
    Array.isArray(items) &&
    items.length <= 100 &&
    items.every(
      (i) =>
        i &&
        typeof i === "object" &&
        typeof (i as CartItem).skuCode === "string" &&
        Number.isInteger((i as CartItem).quantity) &&
        (i as CartItem).quantity > 0,
    );
  if (!valid) return NextResponse.json({ error: "Invalid cart" }, { status: 400 });

  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "login", login: true }, { status: 401 });
  const cart = await saveCart(user.farmerId, items as CartItem[]);
  if (!cart) return NextResponse.json({ error: "Couldn't update the cart" }, { status: 502 });
  return NextResponse.json({ cart: publicCart(cart) });
}
