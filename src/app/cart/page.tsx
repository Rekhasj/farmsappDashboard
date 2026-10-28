import { redirect } from "next/navigation";
import CartView from "@/features/cart/CartView";
import { getSession } from "@/lib/session";
import { fetchAddresses } from "@/services/farmsapp";

export const dynamic = "force-dynamic";

/** Cart page (RN pages/cartCheckout/screens/CartPage.js). The cart itself comes from CartProvider. */
export default async function CartPage() {
  const { user, pincode, changed } = await getSession();
  if (!user) redirect("/login?next=/cart");
  const addresses = await fetchAddresses(user.farmerId);
  const def = addresses.find((a) => a.isDefault) ?? null;
  const r = def?.raw ?? {};
  const text = (k: string) => (typeof r[k] === "string" || typeof r[k] === "number" ? String(r[k]).trim() : "");
  return (
    <CartView
      delivery={{
        // RN DeliveryAddressView: name, flat/house, village (each shortened), then mobile + pincode.
        address: def
          ? {
              name: text("name"),
              line: [text("name").slice(0, 12), text("address").slice(0, 15), (text("village") || text("areaName")).slice(0, 15)].filter(Boolean).join(", "),
              pincode: def.pincode,
            }
          : null,
        hasAddresses: addresses.length > 0,
        // The farmer's current pincode: a location change wins, else the profile pincode.
        pincode: (changed ? pincode : user.pincode) ?? null,
        mobile: user.mobile,
      }}
    />
  );
}
