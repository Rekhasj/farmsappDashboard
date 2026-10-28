import Link from "next/link";

/**
 * CSV component #12 — Tile (Category/Crop/Pest).
 * Image + label tile, used by the Categories grid and Shop By Crop rail.
 * Renders the real category icon when imageUrl is given, otherwise the
 * placeholder box. Wraps in an <a> when href is given.
 */
export default function Tile({
  label,
  imageUrl,
  href,
  size = "size-[70px]",
  bg = "bg-[rgba(212,248,200,0.34)]",
}: {
  label: string;
  imageUrl?: string;
  href?: string;
  size?: string;
  bg?: string;
}) {
  const content = (
    <>
      <div
        className={`flex ${size} items-center justify-center overflow-hidden rounded-md ${imageUrl ? "bg-white" : bg} md:size-24`}
        title={imageUrl ? label : `${label} (placeholder image)`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={label} className="size-full object-contain p-1.5" loading="lazy" />
        ) : null}
      </div>
      <p className="text-center text-[11px] font-semibold leading-tight text-[#202020]">
        {label}
      </p>
    </>
  );

  const className = "flex w-[70px] shrink-0 flex-col items-center gap-2.5 md:w-24";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
