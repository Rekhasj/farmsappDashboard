"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { Spinner } from "@/components/ui/Skeletons";
import { useCart } from "@/features/cart/CartProvider";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { LANGUAGES, type Locale } from "@/i18n/config";
import type { DoctorCrop } from "@/services/farmsapp";
import { cropLabel } from "./CropDoctorView";

type Step = "crops" | "waiting" | "busy" | "inCall" | "feedback" | "thanks";

/**
 * The RN call flow on the web. The video room is the same Tata Tele page the
 * app shows in a WebView; here it opens in a new tab (camera/mic prompts work
 * reliably there), and the farmer comes back to give feedback.
 */
export default function CallFlow() {
  const t = useT();
  const locale = useLocale();
  const { notify } = useCart();
  const [step, setStep] = useState<Step>("crops");
  const [crops, setCrops] = useState<DoctorCrop[] | null>(null);
  const [recent, setRecent] = useState<DoctorCrop[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [asking, setAsking] = useState(false);
  const [callLang, setCallLang] = useState<Locale>(locale);
  const [call, setCall] = useState<{ auditId: number; url: string } | null>(null);
  const [resolved, setResolved] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/doctor?crops=1&lang=${locale}`, { cache: "no-store" })
      .then((r) => r.json() as Promise<{ crops?: DoctorCrop[]; recentCrops?: DoctorCrop[] }>)
      .then((d) => {
        if (!alive) return;
        setCrops(d.crops ?? []);
        setRecent(d.recentCrops ?? []);
      })
      .catch(() => alive && setCrops([]));
    return () => {
      alive = false;
    };
  }, [locale]);

  const byId = new Map([...(crops ?? []), ...recent].map((c) => [c.id, c]));
  const name = (c: DoctorCrop) => cropLabel(c, locale, "name");

  function toggle(id: number) {
    if (picked.includes(id)) return setPicked((p) => p.filter((x) => x !== id));
    if (picked.length >= 3) return notify(t("doctor.cropLimit")); // RN CropSelectionLimit
    setPicked((p) => [...p, id]);
  }

  async function proceed() {
    setAsking(false);
    setStep("waiting");
    // Open the tab now, inside the click, so pop-up blockers allow it; it's pointed at the room once ready.
    const tab = window.open("about:blank", "_blank");
    try {
      const r = await fetch("/api/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropIds: picked, lang: callLang }),
      });
      const d = (await r.json()) as { auditId?: number; url?: string; busy?: boolean; noExpert?: boolean };
      if (!r.ok || !d.url || !d.auditId) {
        tab?.close();
        if (d.noExpert) notify(t("doctor.noExpert"));
        return setStep("busy");
      }
      setCall({ auditId: d.auditId, url: d.url });
      if (tab) {
        tab.opener = null; // the external video page must not be able to reach back into this tab
        tab.location.href = d.url;
      }
      else window.open(d.url, "_blank", "noopener");
      setStep("inCall");
    } catch {
      tab?.close();
      notify(t("location.errorGeneric"));
      setStep("crops");
    }
  }

  async function sendFeedback(issueResolved: boolean) {
    if (!call) return;
    if (!issueResolved && !feedback.trim()) return notify(t("doctor.feedback"));
    setSending(true);
    const r = await fetch("/api/doctor/feedback", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId: call.auditId, issueResolved, comments: feedback.trim() }),
    }).catch(() => null);
    setSending(false);
    if (!r?.ok) return notify(t("location.errorGeneric"));
    setStep("thanks");
  }

  const card = "rounded-2xl border border-[#eee] bg-white p-5";

  if (step === "waiting") {
    return (
      <PageShell title={t("doctor.title")} back="/crop-doctor" width="max-w-xl">
        <section className={`${card} flex flex-col items-center py-12 text-center`}>
          <Spinner />
          <p className="mt-5 max-w-xs text-sm font-semibold text-[#202020]">{t("doctor.pleaseWait")}</p>
        </section>
      </PageShell>
    );
  }

  if (step === "busy") {
    return (
      <PageShell title={t("doctor.title")} back="/crop-doctor" width="max-w-xl">
        <section className={`${card} text-center`}>
          <p className="text-3xl" aria-hidden>
            ⏳
          </p>
          <p className="mt-3 text-sm font-semibold text-[#9a5b00]">{t("doctor.busy")}</p>
          <Link href="/crop-doctor" className="mt-5 inline-flex h-11 items-center rounded-lg bg-[#1f4529] px-6 text-sm font-bold text-white">
            {t("doctor.goToDoctor")}
          </Link>
        </section>
      </PageShell>
    );
  }

  if (step === "inCall" && call) {
    return (
      <PageShell title={t("doctor.title")} back="/crop-doctor" width="max-w-xl">
        <section className={`${card} text-center`}>
          <p className="text-4xl" aria-hidden>
            🎥
          </p>
          <p className="mt-3 text-sm text-[#202020]">{t("doctor.inCall")}</p>
          <a href={call.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-[#1447E6] underline">
            {t("doctor.reopenCall")}
          </a>
          <button type="button" onClick={() => setStep("feedback")} className="mt-6 h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white">
            {t("doctor.callEnded")}
          </button>
        </section>
      </PageShell>
    );
  }

  if (step === "feedback") {
    return (
      <PageShell title={t("doctor.title")} back="/crop-doctor" width="max-w-xl">
        <section className={card}>
          <p className="text-center text-base font-bold text-[#202020]">{t("doctor.resolvedQ")}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" disabled={sending} onClick={() => sendFeedback(true)} className="h-12 rounded-xl border border-[#1f4529] text-sm font-bold text-[#1f4529]">
              👍 {t("doctor.yes")}
            </button>
            <button type="button" disabled={sending} onClick={() => setResolved(false)} className="h-12 rounded-xl bg-[#c80000] text-sm font-bold text-white">
              👎 {t("doctor.no")}
            </button>
          </div>
          {resolved === false && (
            <div className="mt-5">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={100}
                rows={3}
                placeholder={t("doctor.feedback")}
                className="w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#202020] outline-none focus:border-[#1f4529]"
              />
              <button type="button" disabled={sending} onClick={() => sendFeedback(false)} className="mt-3 h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-60">
                {t("query.submit")}
              </button>
            </div>
          )}
        </section>
      </PageShell>
    );
  }

  if (step === "thanks" && call) {
    return (
      <PageShell title={t("doctor.title")} back="/crop-doctor" width="max-w-xl">
        <section className={`${card} text-center`}>
          <p className="text-4xl" aria-hidden>
            🙏
          </p>
          <p className="mt-3 text-lg font-bold text-[#202020]">{t("doctor.thanks")}</p>
          <p className="mt-1 text-sm text-[#6a7282]">{t("doctor.hereIs")}</p>
          <div className="mt-6 grid gap-3">
            <Link href={`/crop-doctor/prescription/${call.auditId}`} className="flex h-11 items-center justify-center rounded-lg bg-[#1f4529] text-sm font-bold text-white">
              {t("doctor.viewPrescription")}
            </Link>
            <Link href="/crop-doctor" className="flex h-11 items-center justify-center rounded-lg border border-[#1f4529] text-sm font-bold text-[#1f4529]">
              {t("doctor.goToDoctor")}
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  // Step: crops (RN SelectCropsPage).
  const tile = (c: DoctorCrop) => {
    const on = picked.includes(c.id);
    const img = c.imageUrl ?? c.image;
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => toggle(c.id)}
        aria-pressed={on}
        className={`flex flex-col items-center gap-2 rounded-xl border p-2 text-center ${on ? "border-[#1f4529] bg-[#eef7ec]" : "border-[#eee] bg-white hover:border-[#b9d3bd]"}`}
      >
        <span className="flex size-14 items-center justify-center">
          {typeof img === "string" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="size-full object-contain" loading="lazy" />
          )}
        </span>
        <span className="line-clamp-2 text-[11px] font-semibold text-[#202020]">{name(c)}</span>
      </button>
    );
  };

  return (
    <PageShell
      title={t("doctor.selectCrops")}
      back="/crop-doctor"
      width="max-w-4xl"
      footer={
        <button type="button" disabled={picked.length === 0} onClick={() => setAsking(true)} className="h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-50">
          {t("doctor.chooseLanguage")}
        </button>
      }
    >
      {crops === null ? (
        <div className="flex justify-center pt-16">
          <Spinner />
        </div>
      ) : (
        <>
          {picked.length > 0 && (
            <section className={card}>
              <h2 className="text-xs font-bold uppercase tracking-wide text-[#6a7282]">{t("doctor.selectedCrops")}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {picked.map((id) => {
                  const c = byId.get(id);
                  return c ? (
                    <button key={id} type="button" onClick={() => toggle(id)} className="rounded-full bg-[#1f4529] px-3 py-1 text-xs font-bold text-white">
                      {name(c)} ×
                    </button>
                  ) : null;
                })}
              </div>
            </section>
          )}
          {recent.length > 0 && (
            <section className={card}>
              <h2 className="text-xs font-bold uppercase tracking-wide text-[#6a7282]">{t("doctor.recentCrops")}</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{recent.map(tile)}</div>
            </section>
          )}
          <section className={card}>
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#6a7282]">{t("doctor.crops")}</h2>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{crops.filter((c) => !recent.some((r) => r.id === c.id)).map(tile)}</div>
          </section>
        </>
      )}

      {asking && (
        // RN CallLanguageSelectionModal
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={t("doctor.chooseLanguage")}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setAsking(false)} />
          <div className="relative w-full rounded-t-2xl bg-white p-5 md:max-w-md md:rounded-2xl">
            <p className="text-base font-bold text-[#202020]">{t("doctor.chooseLanguage")}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  lang={l.code}
                  onClick={() => setCallLang(l.code)}
                  className={`h-11 rounded-lg border text-sm font-bold ${callLang === l.code ? "border-[#1f4529] bg-[#eef7ec] text-[#1f4529]" : "border-[#ddd] text-[#202020]"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-[#1f4529]">
              {t("doctor.callWillBe", { language: LANGUAGES.find((l) => l.code === callLang)?.label ?? "" })}
            </p>
            <p className="mt-1 text-xs text-[#6a7282]">{t("doctor.expertWill")}</p>
            <button type="button" onClick={proceed} className="mt-5 h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white">
              {t("doctor.proceed")}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
