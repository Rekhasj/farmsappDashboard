import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";
import ScrollRail from "@/components/ui/ScrollRail";
import type { CropCollection } from "@/types/product";
import { pickField } from "@/i18n/localize";
import { getLocale, getT } from "@/i18n/server";

/**
 * Section title/subtitle ported exactly from Figma node 11058:46569
 * ("Frame 1171277512"). The crop-card row itself (11058:46240) was
 * rate-limited, so the items below are approximated from the screenshot.
 */
const CROPS = ["Ash Gourd", "Peas", "Pumpkin", "Paddy"];

export default async function ShopByCropSection({ crops = [] }: { crops?: CropCollection[] }) {
  const [locale, t] = await Promise.all([getLocale(), getT()]);
  const items =
    crops.length > 0
      ? crops.map((c) => ({ ...c, cropName: pickField(c, "cropName", locale) }))
      : CROPS.map((c) => ({ id: c, cropName: c, imageUrl: undefined }));
  return (
    <section className="bg-[#eef6fb] px-4 py-5 sm:px-6 md:mx-4 md:rounded-[12px] md:p-6 lg:mx-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-black md:text-lg">{t("home.shopByCrop")}</h2>
          <p className="text-[10px] font-semibold text-[#555] md:text-xs">
            {t("home.shopByCropSubtitle")}
          </p>
        </div>
        <Link href="/crops" className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1f4529]">
          {t("common.viewAll")}
          <IconArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Phones: the app's single swipe row. Desktop: two rows that scroll sideways, with ‹ › arrows. */}
      <ScrollRail className="mt-4 gap-3 pb-1 md:grid md:auto-cols-[144px] md:grid-flow-col md:grid-rows-2 md:justify-center-safe md:gap-4 md:pb-0">
        {items.map((crop) => (
          <CropTile key={crop.id} crop={crop} className="w-25 shrink-0 md:h-40 md:w-36" />
        ))}
      </ScrollRail>
    </section>
  );
}

/** Bordered crop card; links to the crop's product page when it has a real (numeric) id. */
/** A real crop has a numeric id; the static placeholder tiles use string ids and don't link. */
type CropTileData = Omit<CropCollection, "id"> & { id: number | string };

export function CropTile({ crop, className = "w-25 shrink-0 md:w-full" }: { crop: CropTileData; className?: string }) {
  const cls = `flex ${className} flex-col items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-white p-2 md:p-3`;
  const inner = (
    <>
      <div className="flex size-18 items-center justify-center md:size-24">
        {crop.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crop.imageUrl} alt={crop.cropName} className="size-full object-contain" loading="lazy" />
        ) : null}
      </div>
      <p
        title={crop.cropName}
        className="line-clamp-2 min-h-[2.5em] w-full text-center text-[11px] font-semibold leading-tight text-[#202020] md:text-xs"
      >
        {crop.cropName}
      </p>
    </>
  );
  return typeof crop.id === "number" ? (
    <Link href={`/crops/${crop.id}`} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
