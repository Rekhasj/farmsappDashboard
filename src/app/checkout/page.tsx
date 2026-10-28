import { redirect } from "next/navigation";
import CheckoutView from "@/features/checkout/CheckoutView";
import { getSession } from "@/lib/session";
import { fetchDefaultAddress } from "@/services/farmsapp";

export const dynamic = "force-dynamic";

/** Payment Mode page (RN pages/cartCheckout/screens/CartPaymentPage.jsx). */
export default async function CheckoutPage() {
  const { user } = await getSession();
  if (!user) redirect("/login?next=/checkout");
  const a = await fetchDefaultAddress(user.farmerId);
  const text = (k: string) => (typeof a?.[k] === "string" || typeof a?.[k] === "number" ? String(a[k]).trim() : "");
  const address = a
    ? {
        name: text("name"),
        line: [text("address"), text("village") || text("townName"), text("district"), text("state")].filter(Boolean).join(", "),
        pincode: text("pincode"),
      }
    : null;
  return <CheckoutView address={address} />;
}
