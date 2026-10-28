import { Suspense } from "react";
import CachedSidebarNav from "@/components/layout/CachedSidebarNav";
import SidebarBrowseLayout from "@/components/layout/SidebarBrowseLayout";
import SidebarNav from "@/components/layout/SidebarNav";
import { categoryNavItems } from "@/lib/nav-items";
import { getSession } from "@/lib/session";
import { fetchCategories } from "@/services/farmsapp";
import { getLocale, getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

const KEY = "categories";

async function CategoryNav({ title }: { title: string }) {
  const { farmerId, storeId } = await getSession();
  const [categories, locale] = await Promise.all([fetchCategories(storeId, farmerId), getLocale()]);
  return <SidebarNav title={title} items={categoryNavItems(categories, locale)} cacheKey={KEY} />;
}

export default async function CategoriesLayout({ children }: { children: React.ReactNode }) {
  const title = (await getT())("browse.allCategories");
  return (
    <SidebarBrowseLayout
      title={title}
      nav={
        <Suspense fallback={<CachedSidebarNav title={title} cacheKey={KEY} />}>
          <CategoryNav title={title} />
        </Suspense>
      }
    >
      {children}
    </SidebarBrowseLayout>
  );
}
