import { redirect } from "next/navigation";
import OrderDetailView from "@/features/orders/OrderDetailView";
import { fetchOwnOrder } from "@/lib/orders";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Order details (RN pages/OrderProductPage). `?from=success` adds Continue Shopping, like the app. */
export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
  const order = await fetchOwnOrder(user, Number(id));
  return <OrderDetailView order={order} orderId={id} fromSuccess={(await searchParams).from === "success"} mobile={user.mobile} />;
}
