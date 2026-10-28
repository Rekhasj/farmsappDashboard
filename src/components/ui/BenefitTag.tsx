/** CSV component #2 — BenefitTag. Colored pill describing a product benefit. */
const TONES = {
  green: "bg-[#e7f6e9] text-[#1f6b3a]",
  purple: "bg-[#fdeaf3] text-[#a13a72]",
  orange: "bg-[#fdf3e3] text-[#9a6a1f]",
} as const;

export default function BenefitTag({
  label,
  tone = "green",
}: {
  label: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={`inline-block w-fit rounded px-1.5 py-0.5 text-[9px] font-semibold ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}
