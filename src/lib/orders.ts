/**
 * SERVER-ONLY. The order-detail endpoint takes any orderId plus a farmerId;
 * it isn't known to check that the order belongs to that farmer, so the web
 * also checks the order's mobile number against the logged-in farmer's.
 */
import type { SessionUser } from "@/lib/session";
import { fetchOrderDetail } from "@/services/farmsapp";
import type { OrderDetail } from "@/types/order";

const last10 = (v: unknown) => String(v ?? "").replace(/\D/g, "").slice(-10);

export async function fetchOwnOrder(user: SessionUser, orderId: number): Promise<OrderDetail | null> {
  if (!Number.isInteger(orderId) || orderId <= 0) return null;
  const order = await fetchOrderDetail(user.farmerId, orderId);
  if (!order) return null;
  if (order.mobileNumber && last10(order.mobileNumber) !== last10(user.mobile)) return null;
  return order;
}
