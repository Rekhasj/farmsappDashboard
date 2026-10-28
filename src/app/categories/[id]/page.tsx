import { notFound } from "next/navigation";
import ProductCard from "@/features/products/components/ProductCard";
import { getSession } from "@/lib/session";
import { mapApiProductsToCards } from "@/lib/product-mappers";
import { fetchProducts } from "@/services/farmsapp";
import { getLocale, getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isFinite(categoryId)) notFound();

  const { farmerId, storeId } = await getSession();
  const [products, locale, t] = await Promise.all([fetchProducts(categoryId, storeId, farmerId), getLocale(), getT()]);
  const cards = mapApiProductsToCards(products, { locale, t });

  return cards.length === 0 ? (
    <p className="pt-10 text-center text-sm text-[#8a8a8a]">{t("common.noProducts")}</p>
  ) : (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
      {cards.map((p) => (
        <ProductCard key={`${p.id}-${p.cart?.skuCode ?? ""}`} product={p} widthClass="w-full" />
      ))}
    </div>
  );
}
