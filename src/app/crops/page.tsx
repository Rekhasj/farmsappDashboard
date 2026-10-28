import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchCropCollections } from "@/services/farmsapp";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

/** "View all" lands on the first crop's products — the left list picks another. */
export default async function AllCropsPage() {
  const { farmerId, pincode } = await getSession();
  const crops = await fetchCropCollections(pincode, farmerId);

  const first = crops.find((c) => typeof c.id === "number");
  if (first) redirect(`/crops/${first.id}`);

  const t = await getT();
  return <p className="pt-10 text-center text-sm text-[#8a8a8a]">{t("browse.noCrops")}</p>;
}
