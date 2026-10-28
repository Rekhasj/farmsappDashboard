import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

/**
 * CSV component #14 — CompactProductCard. Small card for Recently Viewed.
 * The border wraps the whole card (image + name); the name is clamped to
 * 2 lines with an ellipsis and reserves 2 lines of height so every card
 * in a row is the same size. Links to the PDP only for real (numeric) ids;
 * static fallback cards render without a link instead of 404ing.
 */
export default function CompactProductCard({
  id,
  name,
  imageUrl,
}: {
  id: number | string;
  name: string;
  imageUrl?: string;
}) {
  const isReal = typeof id === "number";
  const className =
    "flex w-21 shrink-0 flex-col items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-white p-2 md:w-32";

  const inner = (
    <>
      <ImageWithFallback
        label={name}
        imageUrl={imageUrl}
        bg="bg-white"
        className="size-16 md:size-20 md:w-full"
      />
      <p
        title={name}
        className="line-clamp-2 min-h-[2.5em] w-full overflow-hidden text-ellipsis text-center text-[11px] font-semibold leading-tight text-[#202020]"
      >
        {name}
      </p>
    </>
  );

  if (!isReal) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href={`/products/${id}`} className={className}>
      {inner}
    </Link>
  );
}
