/** CSV component #4 — StockStatusLabel. */
import { getT } from "@/i18n/server";

export default async function StockStatusLabel() {
  const t = await getT();
  return (
    <span className="absolute bottom-0 left-0 z-10 w-full bg-[#333] text-center text-[9px] font-semibold text-white py-0.5">
      {t("common.outOfStock")}
    </span>
  );
}
