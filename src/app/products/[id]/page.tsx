import BackLink from "@/components/layout/BackLink";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@/components/ui/icons";
import ProductGallery from "@/features/products/components/ProductGallery";
import ProductDetailInfo from "@/features/products/components/ProductDetailInfo";
import ProductDescription from "@/features/products/components/ProductDescription";
import { fetchProductDetail } from "@/services/farmsapp";

import { getSession } from "@/lib/session";
import { getLocale, getT } from "@/i18n/server";
import { pickText } from "@/i18n/localize";

// Always render on request — same reasoning as Home (see app/page.tsx).
export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { farmerId: DEMO_FARMER_ID, storeId: DEMO_STORE_ID } = await getSession();
  const productId = Number(id);
  const [locale, t] = await Promise.all([getLocale(), getT()]);

  if (!Number.isFinite(productId)) {
    notFound();
  }

  const product = await fetchProductDetail(productId, DEMO_STORE_ID, DEMO_FARMER_ID);

  if (!product) {
    notFound();
  }

  return (
    // pb-28 on mobile clears the fixed buy bar (PdpBuyBar)
    <div className="min-h-screen bg-white pb-28 md:pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#eee] bg-white px-4 py-3 md:static md:mx-auto md:max-w-6xl md:border-0 md:px-6 md:pt-5 xl:max-w-7xl 2xl:max-w-[1440px]">
        <BackLink
          href="/"
          aria-label={t("common.backToHome")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee]"
        >
          <IconArrowLeft className="size-4" />
        </BackLink>
        <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{t("product.details")}</h1>
      </header>

      <div className="mx-auto w-full max-w-xl md:max-w-6xl md:px-6">
        {/* Gallery | buy box — similar heights, so no gap under the image. Long text goes full width below. */}
        <div className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start md:gap-10 md:pt-8">
          <div className="md:sticky md:top-20">
            <ProductGallery images={product.packshots ?? []} name={pickText(product.productName, locale)} />
          </div>
          <ProductDetailInfo product={product} />
        </div>
        <ProductDescription product={product} />
      </div>
    </div>
  );
}
