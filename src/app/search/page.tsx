import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import SearchBox from "@/features/search/components/SearchBox";
import ProductRow from "@/features/products/components/ProductRow";
import { getSession } from "@/lib/session";
import { mapSearchProductsToRows } from "@/lib/product-mappers";
import { fetchSearchResults } from "@/services/farmsapp";
import { getLocale, getT } from "@/i18n/server";

// Results depend on the query and the live backend — never prerender.
export const dynamic = "force-dynamic";

const CONTAINER = "mx-auto w-full px-4 sm:px-6 md:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px]";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const { farmerId: DEMO_FARMER_ID, storeId: DEMO_STORE_ID } = await getSession();
  const [locale, t] = await Promise.all([getLocale(), getT()]);

  const products = query ? await fetchSearchResults(query, DEMO_STORE_ID, DEMO_FARMER_ID) : [];
  const rows = mapSearchProductsToRows(products, { locale, t });

  return (
    <div className="min-h-screen bg-white pb-28">
      <header className="relative z-20 bg-[#1f4529] py-3 md:hidden">
        <div className={`${CONTAINER} flex items-center gap-3`}>
          <BackLink
            href="/"
            aria-label={t("common.backToHome")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <IconArrowLeft className="size-4" />
          </BackLink>
          <div className="w-full md:max-w-md">
            {/* key: re-initialise the input when a new search is submitted */}
            <SearchBox key={query} initialQuery={query} />
          </div>
        </div>
      </header>

      <main className={`${CONTAINER} pt-5`}>
        {!query ? (
          <p className="pt-10 text-center text-sm text-[#8a8a8a]">{t("search.typeToSearch")}</p>
        ) : rows.length === 0 ? (
          <p className="pt-10 text-center text-sm text-[#8a8a8a]">{t("search.noResults", { q: query })}</p>
        ) : (
          <>
            <h1 className="text-xs font-bold text-black">
              {t("search.resultsFor", { q: query })}{" "}
              <span className="font-normal">
                ({rows.length} {rows.length > 1 ? t("search.items") : t("search.item")})
              </span>
            </h1>
            <div className="mt-3 divide-y divide-[#eee] md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 lg:grid-cols-3">
              {rows.map((item) => (
                <div key={`${item.id}-${item.cart?.skuCode ?? ""}`} className="md:h-full">
                  <ProductRow item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
