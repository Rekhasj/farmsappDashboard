/** CSV component #5 — PriceDisplay. Selling price with struck-through MRP. */
export default function PriceDisplay({
  price,
  mrp,
  size = "text-sm",
}: {
  price: string;
  mrp?: string;
  size?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`${size} font-bold text-[#202020]`}>{price}</span>
      {mrp && (
        <span className="text-[11px] text-[#9a9a9a] line-through">{mrp}</span>
      )}
    </div>
  );
}
