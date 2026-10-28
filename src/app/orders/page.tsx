import { redirect } from "next/navigation";
import OrdersView from "@/features/orders/OrdersView";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** My Orders (RN pages/OrderPage.js). */
export default async function OrdersPage() {
  if (!(await getUser())) redirect("/login?next=/orders");
  return <OrdersView />;
}
