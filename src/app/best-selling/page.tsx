import Link from "next/link";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import ProductRow from "@/features/products/components/ProductRow";
import { getSession } from "@/lib/session";
import { mapApiProductsToRows } from "@/lib/product-mappers";
import { fetchBestSellingPage } from "@/services/farmsapp";
import { getLocale, getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

const CONTAINER = "mx-auto w-full px-4 sm:px-6 md:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px]";

export default async function BestSellingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.floor(Number(pageParam)) || 1);
  const { farmerId, storeId } = await getSession();
  const [locale, t] = await Promise.all([getLocale(), getT()]);

  const { products, totalPages } = await fetchBestSellingPage(page, storeId, farmerId);
  const rows = mapApiProductsToRows(products, { locale, t });

  return (
    <div className="min-h-screen bg-white pb-28">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#eee] bg-white px-4 py-3 md:static md:mx-auto md:max-w-6xl md:border-0 md:px-6 md:pt-5 xl:max-w-7xl 2xl:max-w-[1440px]">
        <BackLink
          href="/"
          aria-label={t("common.backToHome")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]"
        >
          <IconArrowLeft className="size-4" />
        </BackLink>
        <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{t("browse.bestSellingTitle")}</h1>
      </header>

      <main className={CONTAINER}>
        {rows.length === 0 ? (
          <p className="pt-10 text-center text-sm text-[#8a8a8a]">{t("common.noProducts")}</p>
        ) : (
          <div className="divide-y divide-[#eee] md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 lg:grid-cols-3">
            {rows.map((item) => (
              <div key={`${item.id}-${item.cart?.skuCode ?? ""}`} className="md:h-full">
                <ProductRow item={item} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label={t("browse.pagination")} className="mt-6 flex items-center justify-center gap-4 text-xs font-bold">
            {page > 1 ? (
              <Link href={`/best-selling?page=${page - 1}`} className="rounded-full border border-[#1f4529] px-4 py-2 text-[#1f4529]">
                {t("common.previous")}
              </Link>
            ) : (
              <span className="rounded-full border border-[#e5e5e5] px-4 py-2 text-[#b5b5b5]">{t("common.previous")}</span>
            )}
            <span className="font-normal text-[#6a7282]">
              {t("browse.pageOf", { page, total: totalPages })}
            </span>
            {page < totalPages ? (
              <Link href={`/best-selling?page=${page + 1}`} className="rounded-full bg-[#1f4529] px-4 py-2 text-white">
                {t("common.next")}
              </Link>
            ) : (
              <span className="rounded-full border border-[#e5e5e5] px-4 py-2 text-[#b5b5b5]">{t("common.next")}</span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
