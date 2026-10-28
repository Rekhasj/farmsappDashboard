/** Loading placeholders shown by the route-level loading.tsx files while server data is fetched. */

import T from "@/i18n/T";
import type { TranslationKey } from "@/i18n/translate";

const PULSE = "animate-pulse rounded bg-[#ececec]";

export function Spinner({ className = "size-8" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${className} animate-spin rounded-full border-2 border-[#c9d6cc] border-t-[#1f4529]`}
    />
  );
}

function HeaderBar({ title }: { title: TranslationKey }) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-[#eee] bg-white px-4 py-3">
      <div className="size-8 shrink-0 rounded-full border border-[#eee]" />
      <h1 className="truncate text-sm font-bold text-[#202020]">
        <T k={title} />
      </h1>
    </header>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-[10px] border border-[#eee] bg-white p-2.5">
      <div className={`${PULSE} h-25 w-full md:h-40`} />
      <div className={`${PULSE} mt-3 h-3 w-4/5`} />
      <div className={`${PULSE} mt-2 h-3 w-3/5`} />
      <div className={`${PULSE} mt-3 h-5 w-2/5`} />
      <div className={`${PULSE} mt-3 h-8 w-full`} />
    </div>
  );
}

/** Just the product-card grid — used inside the crops/categories layout, whose list stays mounted. */
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Sidebar list + product card grid (crops and categories). */
export function BrowseSkeleton({ title }: { title: TranslationKey }) {
  return (
    <div className="flex h-dvh flex-col bg-white" aria-busy="true">
      <HeaderBar title={title} />
      <div className="mx-auto flex min-h-0 w-full flex-1 md:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px]">
        <div className="flex w-22 shrink-0 flex-col items-center gap-4 py-3 md:w-32">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`${PULSE} size-14 rounded-lg md:size-16`} />
              <div className={`${PULSE} h-2.5 w-12`} />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 bg-[#f5f5f5] p-3 md:p-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Header + a list of product rows (best selling, search). */
export function ListSkeleton({ title }: { title: TranslationKey }) {
  return (
    <div className="min-h-screen bg-white" aria-busy="true">
      <HeaderBar title={title} />
      <div className="mx-auto w-full px-4 sm:px-6 md:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px]">
        <div className="divide-y divide-[#eee] md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-4 md:rounded-[10px] md:border md:border-[#e5e5e5] md:p-3">
              <div className={`${PULSE} size-22.5 shrink-0 md:size-32`} />
              <div className="flex-1 space-y-2">
                <div className={`${PULSE} h-3 w-4/5`} />
                <div className={`${PULSE} h-3 w-3/5`} />
                <div className={`${PULSE} h-5 w-2/5`} />
                <div className={`${PULSE} h-4 w-1/3`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Product details: gallery + info. */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-busy="true">
      <HeaderBar title="product.details" />
      <div className="mx-auto w-full max-w-xl md:max-w-6xl md:px-6">
        <div className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 md:pt-8">
          <div className={`${PULSE} aspect-square w-full rounded-none md:rounded-[10px]`} />
          <div className="space-y-3 p-4 md:p-0">
            <div className={`${PULSE} h-5 w-4/5`} />
            <div className={`${PULSE} h-4 w-3/5`} />
            <div className={`${PULSE} h-7 w-2/5`} />
            <div className={`${PULSE} h-10 w-full`} />
            <div className={`${PULSE} h-24 w-full`} />
          </div>
        </div>
      </div>
    </div>
  );
}
