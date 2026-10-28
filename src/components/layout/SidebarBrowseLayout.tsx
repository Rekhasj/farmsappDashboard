import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { getT } from "@/i18n/server";

/**
 * Shared "pick on the left, products on the right" shell for All Crops and
 * All Categories. Use it from a route *layout*: the shell paints at once, the
 * `nav` slot streams in (with a cached fallback), and the right-hand content
 * changes per item without reloading the list.
 */
export default async function SidebarBrowseLayout({
  title,
  nav,
  children,
}: {
  title: string;
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = await getT();
  return (
    <div className="flex h-dvh flex-col bg-white md:h-auto md:min-h-[calc(100dvh-4.5rem)] md:bg-[#f5f5f5]">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#eee] bg-white px-4 py-3 md:mx-auto md:w-full md:max-w-6xl md:border-0 md:bg-transparent md:px-6 md:pt-5 xl:max-w-7xl 2xl:max-w-[1440px]">
        <BackLink
          href="/"
          aria-label={t("common.backToHome")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee] shadow-sm"
        >
          <IconArrowLeft className="size-4" />
        </BackLink>
        <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{title}</h1>
      </header>

      <div className="mx-auto flex min-h-0 w-full flex-1 md:max-w-6xl md:items-start md:gap-5 md:px-6 md:pb-10 xl:max-w-7xl 2xl:max-w-[1440px]">
        {nav}
        <main className="min-w-0 flex-1 overflow-y-auto bg-[#f5f5f5] p-3 pb-24 md:overflow-visible md:p-0">{children}</main>
      </div>
    </div>
  );
}
