import OrderPlacedView from "@/features/checkout/OrderPlacedView";

export const dynamic = "force-dynamic";

/** RN pages/OrderSuccessPage.js. */
export default async function OrderPlacedPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id = "" } = await searchParams;
  return <OrderPlacedView orderId={id.slice(0, 40)} />;
}
