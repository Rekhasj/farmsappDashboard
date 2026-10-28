import AppDownloadBanner from "@/features/home/components/AppDownloadBanner";
import HomeHeader from "@/features/home/components/HomeHeader";
import CategoriesSection from "@/features/home/components/CategoriesSection";
import PromoBannerCarousel from "@/features/home/components/PromoBannerCarousel";
import ActiveOrderCard from "@/features/home/components/ActiveOrderCard";
import ShopByCropSection from "@/features/home/components/ShopByCropSection";
import RecentlyViewedSection from "@/features/home/components/RecentlyViewedSection";
import BestSellingSection from "@/features/home/components/BestSellingSection";
import HomeWidgetsSection from "@/features/home/components/HomeWidgetsSection";
import AllProductsSection from "@/features/home/components/AllProductsSection";
import BottomNav from "@/components/layout/BottomNav";
import SidebarCacheSeeder from "@/components/layout/SidebarCacheSeeder";
import { categoryNavItems, cropNavItems } from "@/lib/nav-items";
import { fetchAddresses, fetchCategories, fetchCropCollections, fetchHomeBanners, fetchHomepageWidgets, fetchPopularProducts, fetchProducts, fetchRecentlyViewed, toDeliveryLocation } from "@/services/farmsapp";
import { getSession } from "@/lib/session";
import { mapApiProductsToCards, mapApiProductsToRows } from "@/lib/product-mappers";
import { getLocale, getT } from "@/i18n/server";


// Always render on request — this page calls the live backend with
// no-store fetches, so there's nothing useful to prerender at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { farmerId: DEMO_FARMER_ID, storeId: DEMO_STORE_ID, pincode: DEMO_PINCODE, changed, user } = await getSession();
  const [locale, t] = await Promise.all([getLocale(), getT()]);
  const [categories, popularProducts, banners, recentlyViewed, crops, addresses, widgets] = await Promise.all([
    fetchCategories(DEMO_STORE_ID, DEMO_FARMER_ID),
    fetchPopularProducts(DEMO_STORE_ID, DEMO_FARMER_ID),
    fetchHomeBanners(DEMO_STORE_ID, DEMO_FARMER_ID),
    user ? fetchRecentlyViewed(user.farmerId) : Promise.resolve([]),
    fetchCropCollections(DEMO_PINCODE, DEMO_FARMER_ID),
    user ? fetchAddresses(user.farmerId) : Promise.resolve([]),
    // Catalogue content (same for everyone in a store), so guests get it via the browsing farmer.
    fetchHomepageWidgets(user?.farmerId ?? DEMO_FARMER_ID),
  ]);

  // There's no single "all products" feed on the v2 API — "All Products"
  // merges the first couple of real categories instead.
  const allProductsCategoryIds = categories.slice(0, 2).map((c) => c.id);
  const allProductsLists = await Promise.all(
    allProductsCategoryIds.map((id) => fetchProducts(id, DEMO_STORE_ID, DEMO_FARMER_ID)),
  );
  const allProducts = allProductsLists
    .flat()
    .filter((p, i, arr) => arr.findIndex((q) => q.productId === p.productId) === i);

  const bestSellingCards = mapApiProductsToCards(popularProducts, { locale, t });
  const allProductRows = mapApiProductsToRows(allProducts, { locale, t });
  const allProductCards = mapApiProductsToCards(allProducts, { locale, t });

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <AppDownloadBanner />
      <SidebarCacheSeeder cacheKey="categories" items={categoryNavItems(categories, locale)} />
      <SidebarCacheSeeder cacheKey="crops" items={cropNavItems(crops, locale)} />
      <HomeHeader location={toDeliveryLocation(addresses, DEMO_PINCODE, changed)} addresses={addresses} />
      <main className="mx-auto w-full flex-1 pb-36 md:max-w-6xl md:pb-28 xl:max-w-7xl 2xl:max-w-[1440px]">
        <div className="md:grid md:grid-cols-12 md:gap-3 md:pt-3">
          <div className="md:col-span-12">
            <CategoriesSection categories={categories} />
          </div>
          <div className="md:col-span-12">
            <PromoBannerCarousel banners={banners} />
            {/* Backend order: right after the banner slider (layout-config HOMEPAGE_WIDGETS). */}
            <HomeWidgetsSection widgets={widgets.widgets} carousel={widgets.carousel} />
            <ActiveOrderCard />
          </div>
          <div className="md:col-span-12">
            <ShopByCropSection crops={crops} />
          </div>
          <div className="md:col-span-12">
            <RecentlyViewedSection products={recentlyViewed} />
            <BestSellingSection products={bestSellingCards} />
            <AllProductsSection products={allProductRows} cards={allProductCards} />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
