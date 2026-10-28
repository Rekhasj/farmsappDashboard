/**
 * SERVER-ONLY. Shared checks for /api/checkout/* — the RN CartPaymentPage
 * bounces back to the cart for the same reasons. Everything is re-read from
 * the backend on each call, so the browser can't change what gets charged.
 */
import { getSession } from "@/lib/session";
import { fetchCart, fetchDefaultAddress } from "@/services/farmsapp";
import type { CartDetails, PlacedOrder } from "@/types/cart";

export type CheckoutContext = {
  farmerId: number;
  storeId: number;
  cart: CartDetails;
  address: Record<string, unknown>;
  mobileNumber: string;
};

export type CheckoutError = { error: string; status: number };

export async function loadCheckout(): Promise<CheckoutContext | CheckoutError> {
  const { user, storeId } = await getSession();
  if (!user) return { error: "login", status: 401 };
  const farmerId = user.farmerId;
  const [cart, address] = await Promise.all([fetchCart(farmerId), fetchDefaultAddress(farmerId)]);

  if (!cart) return { error: "Couldn't load the cart. Please try again.", status: 502 };
  if (cart.cartProducts.length === 0) return { error: "Your cart is empty.", status: 409 };
  if (cart.cartProducts.some((i) => (i.inventoryCount ?? 0) <= 0))
    return { error: "Some items are out of stock. Remove them from the cart first.", status: 409 };
  if (cart.serviceable === false) return { error: "We currently do not deliver to this pincode.", status: 409 };
  if (!address) return { error: "Add a delivery address first.", status: 409 };

  const mobileNumber = (cart as Record<string, unknown>).farmerMobile;
  if (typeof mobileNumber !== "string" || !mobileNumber) return { error: "Couldn't find your mobile number.", status: 502 };

  return { farmerId, storeId, cart, address, mobileNumber };
}

export const isCheckoutError = (v: CheckoutContext | CheckoutError): v is CheckoutError => "error" in v;

/** RN Checkout.js finalAmount: online gets the prepaid discount. */
export function amountFor(cart: CartDetails, mode: "COD" | "RAZORPAY"): number {
  const base = cart.discountedPrice ?? cart.totalPrice ?? 0;
  return mode === "RAZORPAY" ? base - Math.trunc(cart.prepaidDiscountValue ?? 0) : base;
}

export const codAllowed = (cart: CartDetails) =>
  !cart.codRestricted && (cart.paymentModeOptions ?? []).includes("Cash");

export const onlineAllowed = (cart: CartDetails) => (cart.paymentModeOptions ?? []).includes("Online");

/** What the Order Placed page shows (stored client-side in sessionStorage). */
export function toPlacedOrder(
  ctx: CheckoutContext,
  orderId: string,
  mode: "COD" | "RAZORPAY",
  response: Record<string, unknown>,
): PlacedOrder {
  const a = ctx.address;
  const addressLine =
    typeof response.deliveryAddress === "string"
      ? response.deliveryAddress
      : [a.name, a.address, a.village, a.district, a.state, a.pincode].filter(Boolean).join(", ");
  return {
    orderId,
    paymentMode: mode,
    total: amountFor(ctx.cart, mode),
    expectedDeliveryDate: (response.expectedDeliveryDate as string | undefined) ?? ctx.cart.expectedDeliveryDate,
    address: addressLine,
    items: ctx.cart.cartProducts.map((i) => ({
      skuCode: i.skuCode,
      productId: i.productId,
      productName: i.productName,
      productNameHindi: i.productNameHindi,
      productNameKannada: i.productNameKannada,
      productNameMarathi: i.productNameMarathi,
      productNameTelugu: i.productNameTelugu,
      title: i.title,
      quantity: i.quantity,
      price: i.netPrice ?? i.price,
      imageUrl: i.imageUrl,
      savings: i.savings,
    })),
  };
}
