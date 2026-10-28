import CropShopLayout from "@/features/crops/components/CropShopLayout";

export const dynamic = "force-dynamic";

export default function CropsLayout({ children }: { children: React.ReactNode }) {
  return <CropShopLayout>{children}</CropShopLayout>;
}
