/**
 * CSV component #99 — ImageWithFallback.
 * Renders the real product photo (plain <img>, not next/image — these are
 * external S3 URLs and this avoids configuring remote image domains) when
 * imageUrl is given; otherwise falls back to a labeled placeholder swatch.
 */
export default function ImageWithFallback({
  label,
  imageUrl,
  className = "",
  bg = "bg-[#eef7ec]",
}: {
  label: string;
  imageUrl?: string;
  className?: string;
  bg?: string;
}) {
  if (imageUrl) {
    return (
      <div className={`overflow-hidden rounded-lg bg-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={label} className="size-full object-contain" loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-[8px] ${bg} ${className}`}
      title={`${label} (placeholder image)`}
    >
      <span className="text-[10px] font-semibold text-[#5b7a5a] text-center px-1 leading-tight">
        {label}
      </span>
    </div>
  );
}
