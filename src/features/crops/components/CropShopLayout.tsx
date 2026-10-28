import { Suspense } from "react";
import CachedSidebarNav from "@/components/layout/CachedSidebarNav";
import SidebarBrowseLayout from "@/components/layout/SidebarBrowseLayout";
import SidebarNav from "@/components/layout/SidebarNav";
import { cropNavItems } from "@/lib/nav-items";
import { getSession } from "@/lib/session";
import { fetchCropCollections } from "@/services/farmsapp";
import { getLocale, getT } from "@/i18n/server";

export const CROPS_CACHE_KEY = "crops";

async function CropNav({ title }: { title: string }) {
  const { farmerId, pincode } = await getSession();
  const [crops, locale] = await Promise.all([fetchCropCollections(pincode, farmerId), getLocale()]);
  return <SidebarNav title={title} items={cropNavItems(crops, locale)} cacheKey={CROPS_CACHE_KEY} />;
}

/** All Crops shell — used by app/crops/layout.tsx. The list shows Home's cached crops until fresh ones arrive. */
export default async function CropShopLayout({ children }: { children: React.ReactNode }) {
  const title = (await getT())("browse.allCrops");
  return (
    <SidebarBrowseLayout
      title={title}
      nav={
        <Suspense fallback={<CachedSidebarNav title={title} cacheKey={CROPS_CACHE_KEY} />}>
          <CropNav title={title} />
        </Suspense>
      }
    >
      {children}
    </SidebarBrowseLayout>
  );
}
