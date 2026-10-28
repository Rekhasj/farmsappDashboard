import { NextResponse } from "next/server";
import { amountFor, codAllowed, isCheckoutError, loadCheckout, toPlacedOrder, type CheckoutContext } from "@/lib/checkout";
import { placeOrder, verifyRazorpayPayment } from "@/services/farmsapp";

type Body = {
  paymentMode?: unknown;
  razorpay?: { razorpay_order_id?: unknown; razorpay_payment_id?: unknown; razorpay_signature?: unknown };
};

/**
 * POST { paymentMode: "COD" } or
 * POST { paymentMode: "RAZORPAY", razorpay: { razorpay_order_id, razorpay_payment_id, razorpay_signature } }
 * — RN Checkout.js submitOrder (COD) / PaymentVerificationScreen + submitOrder (online).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const mode = body?.paymentMode;
  if (mode !== "COD" && mode !== "RAZORPAY") return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });

  const ctx = await loadCheckout();
  if (isCheckoutError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  // One order at a time per farmer (RN: isProcessingRef) — a double click must not place two orders.
  if (inFlight.has(ctx.farmerId)) return NextResponse.json({ error: "Your order is already being placed." }, { status: 409 });
  inFlight.add(ctx.farmerId);
  try {
    return await submit(ctx, mode, body);
  } finally {
    inFlight.delete(ctx.farmerId);
  }
}

const inFlight = new Set<number>();

async function submit(ctx: CheckoutContext, mode: "COD" | "RAZORPAY", body: Body | null) {
  let razorPayPaymentId = "";
  if (mode === "COD") {
    if (!codAllowed(ctx.cart)) return NextResponse.json({ error: "Cash on Delivery isn't available." }, { status: 409 });
  } else {
    const r = body?.razorpay;
    const ids = [r?.razorpay_order_id, r?.razorpay_payment_id, r?.razorpay_signature];
    if (!ids.every((v) => typeof v === "string" && v.length > 0 && v.length < 200)) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }
    const [orderId, paymentId, signature] = ids as string[];
    const verified = await verifyRazorpayPayment({ razorpayOrderId: orderId, paymentId, signature });
    if (!verified) {
      return NextResponse.json({ error: "We couldn't verify your payment. If money was deducted, please contact support." }, { status: 402 });
    }
    razorPayPaymentId = orderId; // the app sends the Razorpay *order* id in this field
  }

  const result = await placeOrder({
    mobileNumber: ctx.mobileNumber,
    paymentMode: mode,
    storeId: ctx.storeId,
    totalPrice: amountFor(ctx.cart, mode),
    deliveryAddress: ctx.address,
    items: ctx.cart.cartProducts.map((i) => ({ skuCode: i.skuCode, quantity: i.quantity })),
    razorPayPaymentId,
    deliveryFee: ctx.cart.deliveryFee,
    deliveryFeeWaived: ctx.cart.deliveryFeeWaived,
    tax: ctx.cart.tax,
  });

  if (!result.ok) {
    const paid = mode === "RAZORPAY" ? " Your payment was received — please contact support." : "";
    return NextResponse.json({ error: (result.message || "Couldn't place the order.") + paid }, { status: 502 });
  }
  return NextResponse.json({ order: toPlacedOrder(ctx, result.orderId, mode, result.response) });
}
