"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { pickText } from "@/i18n/localize";
import type { CartDetails, CodIntermediaryInfo } from "@/types/cart";

function Sheet({ onClose, children, label }: { onClose: () => void; children: React.ReactNode; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full rounded-t-2xl bg-white p-5 md:max-w-md md:rounded-2xl">{children}</div>
    </div>
  );
}

/** RN CodBlockedModal: why COD is off for this farmer (texts come from the server). */
export function CodBlockedSheet({
  info,
  onClose,
}: {
  info: NonNullable<CartDetails["codRestrictionInfo"]>;
  onClose: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const heading = pickText(info.heading, locale);
  return (
    <Sheet onClose={onClose} label={heading || t("checkout.codUnavailable")}>
      <p className="text-center text-3xl" aria-hidden>
        🚫
      </p>
      <p className="mt-2 text-center text-base font-bold text-[#202020]">{heading}</p>
      <p className="mt-2 text-center text-[13px] leading-5 text-[#555]">{pickText(info.subHeading, locale)}</p>
      <button type="button" onClick={onClose} className="mt-5 h-11 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white">
        {pickText(info.ctaText, locale) || t("checkout.codGotIt")}
      </button>
    </Sheet>
  );
}

/**
 * RN CODOrderConfirmtaionModal: points to read, and a button that fills up
 * over `durationMs` before it can be pressed (auto-confirms if
 * `autoPlaceOnTimerEnd`). Closing it cancels the order.
 */
export function CodConfirmSheet({
  info,
  onCancel,
  onConfirm,
}: {
  info: CodIntermediaryInfo;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const locale = useLocale();
  const duration = info.durationMs && info.durationMs > 0 ? info.durationMs : 8000;
  const [ready, setReady] = useState(false);
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    const start = requestAnimationFrame(() => setFilling(true));
    const done = setTimeout(() => setReady(true), duration);
    return () => {
      cancelAnimationFrame(start);
      clearTimeout(done);
    };
  }, [duration]);

  const fired = useRef(false);
  const confirmOnce = () => {
    if (fired.current) return;
    fired.current = true;
    onConfirm();
  };

  useEffect(() => {
    if (ready && info.autoPlaceOnTimerEnd && !fired.current) {
      fired.current = true;
      onConfirm();
    }
  }, [ready, info.autoPlaceOnTimerEnd, onConfirm]);

  return (
    <Sheet onClose={onCancel} label={pickText(info.button?.initialText, locale)}>
      <button
        type="button"
        onClick={onCancel}
        aria-label="✕"
        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-lg text-[#4a5565] hover:bg-[#f3f4f6]"
      >
        ×
      </button>
      <ul className="mt-4 space-y-4">
        {(info.points ?? []).map((p, i) => (
          <li key={i} className="flex items-start gap-3">
            {p.icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.icon.replace(/%22$/, "")} alt="" className="size-8 shrink-0" />
            )}
            <p className="text-[13px] leading-5 text-[#202020]">{pickText(p.text, locale)}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={!ready}
        onClick={confirmOnce}
        className="relative mt-6 h-12 w-full overflow-hidden rounded-lg bg-[#9db8a3] text-sm font-bold text-white disabled:cursor-wait"
      >
        <span
          className="absolute inset-y-0 left-0 bg-[#1f4529] ease-linear"
          style={{ width: filling ? "100%" : "0%", transition: `width ${duration}ms linear` }}
          aria-hidden
        />
        <span className="relative">
          {ready ? pickText(info.button?.ctaText, locale) : pickText(info.button?.initialText, locale)}
        </span>
      </button>
    </Sheet>
  );
}
