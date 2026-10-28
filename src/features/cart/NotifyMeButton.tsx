"use client";

import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { goToLogin, useUser } from "@/features/auth/UserProvider";
import { useCart } from "./CartProvider";

/**
 * Orange "Notify Me" for out-of-stock products (RN NotifyMe.js). Registers a
 * back-in-stock request; after success the button stays done for this visit.
 */
export default function NotifyMeButton({
  productId,
  skuCode,
  size = "sm",
}: {
  productId: number;
  skuCode?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const t = useT();
  const { notify } = useCart();
  const user = useUser();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const height = { sm: "h-8 text-xs", md: "h-9 text-sm", lg: "h-11 text-base" }[size];

  async function send() {
    if (!user) return goToLogin();
    setState("sending");
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, skuCode: skuCode ?? null }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      notify(t("notify.done"));
    } catch {
      setState("idle");
      notify(t("location.errorGeneric"));
    }
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={state !== "idle"}
      className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#CD8D04] font-bold text-white hover:bg-[#b57c00] disabled:opacity-70 ${height}`}
    >
      {state === "done" && <span aria-hidden>✓</span>}
      {t("notify.button")}
    </button>
  );
}
