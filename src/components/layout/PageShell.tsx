import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";

/**
 * Simple-page frame: phones get the app's sticky white bar (back + title);
 * desktop gets an inline title under the global header and a centred column.
 */
export default function PageShell({
  title,
  back = "/",
  width = "max-w-3xl",
  children,
  footer,
}: {
  title: string;
  back?: string;
  /** Desktop content width. */
  width?: string;
  children: React.ReactNode;
  /** Optional bottom bar (fixed on phones, inline on desktop). */
  footer?: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-[#f5f5f5] md:min-h-[60vh] md:pb-14 ${footer ? "pb-28" : "pb-10"}`}>
      <header className="sticky top-0 z-10 border-b border-[#eee] bg-white py-3 md:static md:border-0 md:bg-transparent md:pb-2 md:pt-6">
        <div className={`mx-auto flex w-full items-center gap-3 px-4 md:px-6 ${width}`}>
          <BackLink href={back} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee] bg-white">
            <IconArrowLeft className="size-4" />
          </BackLink>
          <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{title}</h1>
        </div>
      </header>
      <main className={`mx-auto w-full space-y-4 px-4 pt-4 md:px-6 ${width}`}>{children}</main>
      {footer && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eee] bg-white px-4 py-3 md:static md:mt-4 md:border-0 md:bg-transparent">
          <div className={`mx-auto w-full md:px-6 ${width}`}>{footer}</div>
        </div>
      )}
    </div>
  );
}
