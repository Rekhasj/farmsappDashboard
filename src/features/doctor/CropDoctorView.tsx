"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { formatDate } from "@/features/orders/shared";
import { useLocale, useT } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import type { CallHistoryEntry } from "@/services/farmsapp";

type Status = { kind: "open" | "closed" | "holiday"; text: string; dayFrom?: string; dayTo?: string } | null;

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
/** "MONDAY" → the weekday in the page language (RN t('MONDAY')). */
function dayName(day: string | undefined, locale: Locale) {
  const i = DAYS.indexOf((day ?? "").toUpperCase());
  if (i < 0) return day ?? "";
  return new Date(Date.UTC(2024, 0, 7 + i)).toLocaleString(`${locale}-IN`, { weekday: "long", timeZone: "UTC" });
}

/** Crop name in the page language (history items carry hindiName, teluguName, ...). */
export function cropLabel(item: Record<string, unknown>, locale: Locale, base = "cropName") {
  const names: Record<string, string> = { hi: "hindiName", kn: "kannadaName", mr: "marathiName", te: "teluguName" };
  const v = locale !== "en" ? item[names[locale]] : undefined;
  return (typeof v === "string" && v.trim()) || String(item[base] ?? item.crop ?? "");
}

/**
 * RN CropDoctor: green header, availability message (open / closed with
 * days / holiday), Video Call Now (busy check first), toll-free number,
 * call history (date · crops → prescription · issue resolved).
 */
export default function CropDoctorView({
  status,
  canCall,
  tollFree,
  history,
}: {
  status: Status;
  canCall: boolean;
  tollFree: string;
  history: CallHistoryEntry[];
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [comments, setComments] = useState<string | null>(null);

  async function startCall() {
    setChecking(true);
    setBusy(false);
    try {
      const r = await fetch(`/api/doctor?check=1&lang=${locale}`, { cache: "no-store" });
      const d = (await r.json()) as { available?: boolean };
      if (d.available) return router.push("/crop-doctor/call");
      setBusy(true);
    } catch {
      setBusy(true);
    } finally {
      setChecking(false);
    }
  }

  return (
    <PageShell title={t("doctor.title")} back="/profile" width="max-w-4xl md:max-w-6xl">
      {/* Phones: the app's single column. Desktop: call card + steps | call history. */}
      <div className="space-y-4 md:grid md:grid-cols-[1fr_1.25fr] md:items-start md:gap-6 md:space-y-0">
      <div className="space-y-4 md:sticky md:top-22">
      <section className="overflow-hidden rounded-2xl border border-[#d9ead8] bg-white md:shadow-sm">
        <div className="bg-[#1f4529] px-5 py-4 text-white">
          <p className="text-lg font-bold">🩺 {t("doctor.callOur")}</p>
        </div>
        <div className="space-y-4 p-5">
          {status && (
            <p className={`text-sm leading-6 ${status.kind === "open" ? "text-[#1f4529]" : "text-[#9a5b00]"}`}>
              {status.text}
              {status.kind === "closed" && status.dayFrom && (
                <span className="block font-semibold">
                  {dayName(status.dayFrom, locale)} – {dayName(status.dayTo, locale)}
                </span>
              )}
            </p>
          )}
          {busy && <p className="rounded-lg bg-[#fff4e5] px-3 py-2 text-sm font-semibold text-[#9a5b00]">{t("doctor.busy")}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            {canCall && (
              <button
                type="button"
                onClick={startCall}
                disabled={checking}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1f4529] px-3 py-2 text-center text-sm font-bold leading-tight text-white hover:bg-[#2e5b3a] disabled:opacity-60"
              >
                🎥 {checking ? t("common.loading") : t("doctor.videoCallNow")}
              </button>
            )}
            <a href={`tel:${tollFree.replace(/[^\d+]/g, "")}`} 
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#1f4529] px-3 py-2  text-sm font-bold leading-tight text-[#1f4529]">
              <span aria-hidden>
                📞</span>
              <span>
                {t("doctor.tollFree")}                  <span className="whitespace-nowrap">{tollFree}</span>
              </span>
            </a>
          </div>
        </div>
      </section>
      <section className="hidden rounded-2xl border border-[#eee] bg-white p-5 md:block">
        <ol className="space-y-3 text-sm text-[#202020]">
          {[
            ["🌱", t("doctor.selectCrops")],
            ["🗣️", t("doctor.chooseLanguage")],
            ["🎥", t("doctor.videoCallNow")],
            ["📋", t("doctor.viewPrescription")],
          ].map(([icon, label], i) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef7ec]" aria-hidden>
                {icon}
              </span>
              <span className="text-xs font-bold text-[#6a7282]">{i + 1}.</span>
              <span className="font-semibold">{label}</span>
            </li>
          ))}
        </ol>
      </section>
      </div>

      <section className="rounded-2xl border border-[#eee] bg-white p-5 md:p-6 md:shadow-sm">
        <h2 className="text-sm font-bold text-[#202020]">{t("doctor.history")}</h2>
        {history.length === 0 ? (
          <p className="pt-6 text-center text-sm text-[#6a7282]">{t("doctor.noHistory")}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-105 text-left text-xs md:text-sm">
              <thead className="text-[#6a7282]">
                <tr className="border-b border-[#f0f0f0]">
                  <th className="py-2 pr-3 font-semibold">{t("doctor.date")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("doctor.crops")}</th>
                  <th className="py-2 font-semibold">{t("doctor.resolved")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {history.map((h) => (
                  <tr key={h.auditId} className="align-top">
                    <td className="py-3 pr-3 text-[#202020]">{formatDate(h.auditDate, locale)}</td>
                    <td className="py-3 pr-3">
                      <Link href={`/crop-doctor/prescription/${h.auditId}`} className="font-semibold text-[#1f6b3a] underline">
                        {(h.auditData ?? []).map((a) => cropLabel(a, locale)).filter(Boolean).join(", ")}
                      </Link>
                    </td>
                    <td className="py-3">
                      {/* RN: comments present = the farmer said it wasn't resolved */}
                      <span className={h.comments ? "text-[#c80000]" : "text-[#1f6b3a]"}>{h.comments ? t("doctor.no") : t("doctor.yes")}</span>
                      {h.comments && (
                        <button type="button" onClick={() => setComments(h.comments ?? "")} className="ml-2 font-semibold text-[#1447E6] underline">
                          {t("doctor.viewMore")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </div>

      {comments !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setComments(null)} />
          <div className="relative w-full rounded-t-2xl bg-white p-5 md:max-w-sm md:rounded-2xl">
            <p className="text-sm font-bold text-[#202020]">{t("doctor.comments")}</p>
            <p className="mt-2 whitespace-pre-line text-sm text-[#555]">{comments}</p>
            <button type="button" onClick={() => setComments(null)} className="mt-5 h-10 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white">
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
