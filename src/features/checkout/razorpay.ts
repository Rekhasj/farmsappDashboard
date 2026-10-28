/**
 * Razorpay web Checkout — the browser counterpart of the RN app's
 * react-native-razorpay call (components/Checkout.js). Options mirror the app.
 */
import type { RazorpayStart } from "@/types/cart";

export type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

type RazorpayInstance = { open: () => void; on: (event: string, cb: (resp: unknown) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("Couldn't load Razorpay"));
    };
    document.body.appendChild(s);
  });
  return loading;
}

/** Opens the Razorpay popup. Resolves with the signed result, or null if the farmer closed it / it failed. */
export async function payWithRazorpay(start: RazorpayStart, themeColor: string): Promise<RazorpaySuccess | null> {
  await loadScript();
  if (!window.Razorpay) throw new Error("Razorpay unavailable");
  const Razorpay = window.Razorpay;

  return new Promise((resolve) => {
    let settled = false;
    const done = (v: RazorpaySuccess | null) => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    const rzp = new Razorpay({
      key: start.keyId,
      amount: start.amount,
      currency: "INR",
      order_id: start.razorpayOrderId,
      name: start.name,
      description: "Product Order Payment",
      image: "https://zfhl-s3.s3.ap-south-1.amazonaws.com/DIGITAL-KIOSK-DEV/images/farmsapp.png",
      theme: { color: themeColor },
      handler: (resp: RazorpaySuccess) => done(resp),
      modal: { ondismiss: () => done(null) },
    });
    rzp.on("payment.failed", () => {
      /* Razorpay shows its own retry UI; ondismiss fires if the farmer gives up */
    });
    rzp.open();
  });
}
