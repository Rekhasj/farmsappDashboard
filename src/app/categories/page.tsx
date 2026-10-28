import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchCategories } from "@/services/farmsapp";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

/** "View all" lands on the first category's products — the left list picks another. */
export default async function AllCategoriesPage() {
  const { farmerId, storeId } = await getSession();
  const categories = await fetchCategories(storeId, farmerId);

  if (categories.length > 0) redirect(`/categories/${categories[0].id}`);

  const t = await getT();
  return <p className="pt-10 text-center text-sm text-[#8a8a8a]">{t("browse.noCategories")}</p>;
}
