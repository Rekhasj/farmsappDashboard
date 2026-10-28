"use client";

import { useState } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

/** PDP image gallery: main packshot + tappable thumbnail strip. Client component only for the selected-thumbnail state. */
export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div className="px-4 pt-4 sm:px-6 md:px-0 md:pt-0">
      <ImageWithFallback
        label={name}
        imageUrl={hasImages ? images[active] : undefined}
        className="aspect-square w-full sm:aspect-4/3 md:aspect-square md:rounded-xl md:border md:border-[#eee]"
      />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-[6px] border p-0.5 ${
                i === active ? "border-[#1f4529]" : "border-[#eee]"
              }`}
            >
              <ImageWithFallback label={name} imageUrl={src} className="size-14" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
