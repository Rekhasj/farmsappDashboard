"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { useT } from "@/i18n/I18nProvider";

const MAX_IMAGES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * RN ProductEnquiryPage: product name and/or molecule name (one is enough),
 * a description and up to 3 photos (≤5 MB each); then the "Thanks for
 * Sharing!" screen.
 */
export default function EnquiryForm() {
  const t = useT();
  const [productName, setProductName] = useState("");
  const [moleculeName, setMoleculeName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canSubmit = (!!productName.trim() || !!moleculeName.trim()) && !sending;

  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function addFiles(list: FileList | null) {
    setError("");
    const picked = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (picked.some((f) => f.size > MAX_BYTES)) setError(t("enquiry.tooBig"));
    const ok = picked.filter((f) => f.size <= MAX_BYTES);
    if (images.length + ok.length > MAX_IMAGES) setError(t("enquiry.max3"));
    setImages((prev) => [...prev, ...ok].slice(0, MAX_IMAGES));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim() && !moleculeName.trim()) return setError(t("enquiry.oneRequired"));
    setSending(true);
    setError("");
    const form = new FormData();
    form.set("productName", productName.trim());
    form.set("moleculeName", moleculeName.trim());
    form.set("productDescription", description.trim());
    images.forEach((f) => form.append("images", f, f.name));
    const res = await fetch("/api/product-enquiry", { method: "POST", body: form }).catch(() => null);
    setSending(false);
    if (!res?.ok) return setError(t("enquiry.failed"));
    setDone(true);
  }

  if (done) {
    return (
      <PageShell title={t("enquiry.title")} back="/profile" width="max-w-xl md:max-w-2xl">
        <section className="flex flex-col items-center rounded-2xl border border-[#eee] bg-white px-6 py-10 text-center md:py-16 md:shadow-sm">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#eef7ec] text-3xl" aria-hidden>
            ✓
          </span>
          <h2 className="mt-4 text-lg font-bold text-[#202020]">{t("enquiry.thanks")}</h2>
          <p className="mt-1 text-sm font-semibold text-[#1f4529]">{t("enquiry.valuable")}</p>
          <p className="mt-3 max-w-sm text-xs leading-5 text-[#6a7282]">{t("enquiry.successText")}</p>
          <Link href="/" className="mt-6 rounded-lg bg-[#1f4529] px-6 py-2.5 text-sm font-bold text-white">
            {t("order.continueShopping")}
          </Link>
        </section>
      </PageShell>
    );
  }

  const input = "mt-1 h-11 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm text-[#202020] outline-none focus:border-[#1f4529]";
  return (
    <PageShell
      title={t("enquiry.title")}
      back="/profile"
      width="max-w-xl md:max-w-5xl"
      footer={
        <button type="submit" form="enquiry-form" disabled={!canSubmit} className="h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-50 md:hidden">
          {sending ? t("common.loading") : t("enquiry.request")}
        </button>
      }
    >
      <div className="md:grid md:grid-cols-[1fr_1.4fr] md:items-start md:gap-6">
      {/* Desktop side panel — what happens to the request (phones: the app's plain form). */}
      <aside className="hidden rounded-2xl bg-linear-to-br from-[#1f4529] to-[#2e6b3d] p-8 text-white md:sticky md:top-22 md:block">
        <span className="text-5xl" aria-hidden>
          🔍
        </span>
        <p className="mt-4 text-xl font-extrabold leading-snug">{t("enquiry.notFound")}</p>
        <p className="mt-2 text-sm text-white/85">{t("enquiry.letUsKnow")}</p>
        <ol className="mt-6 space-y-3 text-sm">
          {[t("enquiry.productName"), t("enquiry.addPhotos"), t("enquiry.request")].map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/90">⏱ {t("enquiry.successText")}</p>
      </aside>
      <form id="enquiry-form" onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-[#eee] bg-white p-5 md:p-8 md:shadow-sm">
        <label className="block">
          <span className="text-xs font-semibold text-[#202020]">
            {t("enquiry.productName")} <span className="text-[#c80000]">*</span>
          </span>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} maxLength={120} className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#202020]">{t("enquiry.moleculeName")}</span>
          <input value={moleculeName} onChange={(e) => setMoleculeName(e.target.value)} maxLength={120} className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#202020]">{t("enquiry.description")}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
            className="mt-1 w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#202020] outline-none focus:border-[#1f4529]"
          />
        </label>
        <div>
          <p className="text-xs font-semibold text-[#202020]">
            {t("enquiry.addPhotos")} <span className="font-normal text-[#9a9a9a]">({images.length}/{MAX_IMAGES})</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={src} className="relative size-20 overflow-hidden rounded-lg border border-[#eee]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={t("cart.remove")}
                  className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#b9d3bd] text-[10px] font-bold text-[#1f4529]"
              >
                <span className="text-xl leading-none">+</span>
                {t("enquiry.upload")}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        </div>
        {error && (
          <p role="alert" className="text-xs font-medium text-[#c80000]">
            {error}
          </p>
        )}
        <button type="submit" disabled={!canSubmit} className="hidden h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-50 md:block">
          {sending ? t("common.loading") : t("enquiry.request")}
        </button>
      </form>
      </div>
    </PageShell>
  );
}
