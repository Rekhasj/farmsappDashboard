"use client";

import { IconChevronDown } from "@/components/ui/icons";

/**
 * CSV component #7 — PackSizeSelector.
 * Static dropdown-styled button for now — the CSV notes 4 different
 * patterns exist across screens; this is the "dropdown" variant used on
 * Home. Wire up real size options + selection state when this becomes
 * interactive (Product Details page will need the full sheet variant).
 */
export default function PackSizeSelector({
  size,
  fullWidth = false,
}: {
  size: string;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1 rounded-[6px] border border-[#ddd] px-2 py-1.5 text-[11px] font-semibold text-[#202020] ${
        fullWidth ? "w-full justify-between" : ""
      }`}
    >
      {size}
      <IconChevronDown className="size-3" />
    </button>
  );
}
