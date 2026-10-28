import { NextResponse } from "next/server";
import { amountFor, isCheckoutError, loadCheckout, onlineAllowed } from "@/lib/checkout";
import { createRazorpayOrder } from "@/services/farmsapp";
import type { RazorpayStart } from "@/types/cart";

/** POST — starts Pay Online: creates a Razorpay order for the server-computed amount (RN Checkout.js step 1). */
export async function POST() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) return NextResponse.json({ error: "Online payment isn't configured." }, { status: 500 });

  const ctx = await loadCheckout();
  if (isCheckoutError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  if (!onlineAllowed(ctx.cart)) return NextResponse.json({ error: "Online payment isn't available." }, { status: 409 });

  const order = await createRazorpayOrder(ctx.farmerId, amountFor(ctx.cart, "RAZORPAY"));
  if (!order) return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });

  const start: RazorpayStart = {
    keyId,
    razorpayOrderId: order.id,
    amount: order.amount,
    name: process.env.RAZORPAY_NAME ?? "FarmsApp",
  };
  return NextResponse.json({ start });
}
