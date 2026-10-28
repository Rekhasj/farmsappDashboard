"use client";

import { useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { formatDate } from "@/features/orders/shared";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { LANGUAGES, type Locale } from "@/i18n/config";
import type { Prescription } from "@/services/farmsapp";

const PREFIX: Record<Locale, string> = { en: "", hi: "hindi", kn: "kannada", mr: "marathi", te: "telugu" };

/** One crop's name + recommendations in a language (callDetails carry hindiName / hindiRecommendations, ...). */
function inLanguage(d: Prescription["callDetails"][number], l: Locale) {
  if (l === "en") return { name: String(d.crop ?? ""), recs: Array.isArray(d.recommendations) ? (d.recommendations as string[]) : [] };
  const p = PREFIX[l];
  const recs = d[`${p}Recommendations`];
  return { name: String(d[`${p}Name`] ?? d.crop ?? ""), recs: Array.isArray(recs) ? (recs as string[]) : [] };
}

/**
 * RN ViewPrescription: company + "Crop Care Prescription", language tabs
 * (only languages that have recommendations), then per crop: name, audit
 * date and the recommendations as a bulleted list.
 */
export default function PrescriptionView({ prescription }: { prescription: Prescription | null }) {
  const t = useT();
  const locale = useLocale();
  const offered = LANGUAGES.filter((l) => prescription?.callDetails.some((d) => inLanguage(d, l.code).recs.length > 0));
  const [lang, setLang] = useState<Locale>(offered.some((l) => l.code === locale) ? locale : (offered[0]?.code ?? "en"));

  return (
    <PageShell title={t("doctor.prescription")} back="/crop-doctor" width="max-w-3xl">
      {!prescription || offered.length === 0 ? (
        <p className="pt-16 text-center text-sm text-[#6a7282]">{t("orders.notFound")}</p>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-[#d9ead8] bg-white">
          <header className="flex items-center gap-3 bg-[#f6faf6] px-5 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-6 w-auto" />
            <div>
              <p className="text-xs font-semibold text-[#6a7282]">{t("doctor.company")}</p>
              <p className="text-base font-bold text-[#1f4529]">{t("doctor.prescription")}</p>
            </div>
          </header>
          <div className="space-y-5 p-5">
            <div>
              <p className="text-xs font-semibold text-[#6a7282]">{t("doctor.pickLanguage")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {offered.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    lang={l.code}
                    onClick={() => setLang(l.code)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${lang === l.code ? "border-[#1f4529] bg-[#1f4529] text-white" : "border-[#ddd] text-[#202020]"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            {prescription.callDetails.map((d, i) => {
              const { name, recs } = inLanguage(d, lang);
              if (recs.length === 0) return null;
              return (
                <section key={i} className="rounded-xl border border-[#eee] p-4">
                  <p className="text-xs text-[#6a7282]">
                    {t("doctor.cropName")}: <span className="font-bold text-[#202020]">{name}</span>
                  </p>
                  {prescription.auditTime && (
                    <p className="text-xs text-[#6a7282]">
                      {t("doctor.auditDate")}: {formatDate(prescription.auditTime, locale)}
                    </p>
                  )}
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[#202020]" lang={lang}>
                    {recs.map((r, j) => (
                      <li key={j}>{r}</li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </article>
      )}
      <Link href="/" className="flex h-11 items-center justify-center rounded-lg border border-[#1f4529] text-sm font-bold text-[#1f4529]">
        {t("doctor.goHome")}
      </Link>
    </PageShell>
  );
}
