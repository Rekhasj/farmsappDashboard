import Link from "next/link";
import { getT } from "@/i18n/server";

/** Desktop/TV footer (md and up). Phones use the farmsapp bottom tab bar instead. */
export default async function SiteFooter() {
  const t = await getT();
  const links: [string, string][] = [
    ["/", t("common.home")],
    ["/categories", t("browse.allCategories")],
    ["/crops", t("browse.allCrops")],
    ["/best-selling", t("browse.bestSellingTitle")],
    ["/orders", t("common.myOrders")],
    ["/addresses", t("address.mine")],
    ["/cart", t("cart.title")],
    ["/crop-doctor", t("doctor.title")],
    ["/contact", t("contact.title")],
    ["/product-enquiry", t("enquiry.title")],
  ];
  return (
    <footer className="mt-auto hidden border-t border-[#e5e5e5] bg-white md:block">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_2fr_1fr] 2xl:max-w-[1440px]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="FarmsApp" className="h-6 w-auto" />
          <p className="mt-3 max-w-xs text-xs leading-5 text-[#6a7282]">{t("home.shopByCropSubtitle")}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm lg:grid-cols-3">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="text-[#374151] hover:text-[#1f4529] hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <div>
          <p className="text-sm font-bold text-[#202020]">{t("home.offerTitle")}</p>
          <p className="mt-1 text-xs text-[#6a7282]">{t("home.offerSubtitle")}</p>
          <span className="mt-3 inline-flex rounded-lg bg-[#1f4529] px-4 py-2 text-xs font-bold text-white">{t("home.downloadApp")}</span>
        </div>
      </div>
      <div className="border-t border-[#f0f0f0] py-4 text-center text-[11px] text-[#99a1af]">© {new Date().getFullYear()} Zuari FarmHub · FarmsApp</div>
    </footer>
  );
}
