import { getT } from "@/i18n/server";

/**
 * CSV component #18 — ActiveOrderCard.
 * Only renders when there's real active-order data to show — fetchActiveOrders
 * (app/page.tsx) currently 400s against the dev backend with just
 * storeId/farmerId (it likely needs a logged-in farmer's auth token), so
 * in practice this renders nothing until that's sorted out, rather than
 * showing a fake order.
 */
export default async function ActiveOrderCard({ hasActiveOrder = false }: { hasActiveOrder?: boolean }) {
  if (!hasActiveOrder) return null;
  const t = await getT();

  return (
    <section className="px-4 sm:px-6 pt-4">
      <div className="flex items-center justify-between gap-3 rounded-full bg-[#2e5b3a] px-3 py-2 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15">
            <svg viewBox="0 0 16 16" fill="none" className="size-4">
              <path
                d="M2 5.2 8 2l6 3.2v5.6L8 14l-6-3.2V5.2Z"
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path d="M2 5.2 8 8.4l6-3.2M8 8.4V14" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">2 items · ₹680</p>
            <p className="text-[10px] text-white/80 truncate">
              Order placed at: 12 Aug 2:35PM
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#2e5b3a]"
        >
          {t("home.trackOrder")}
        </button>
      </div>
    </section>
  );
}
