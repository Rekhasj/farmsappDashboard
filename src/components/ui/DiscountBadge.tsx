/** CSV component #3 — DiscountBadge. Corner ribbon on a product image. */
export default function DiscountBadge({ label }: { label: string }) {
  return (
    <span className="absolute left-0 top-0 z-10 rounded-tl-[8px] rounded-br-[6px] bg-[#e64545] px-1.5 py-0.5 text-[9px] font-bold text-white">
      {label}
    </span>
  );
}
