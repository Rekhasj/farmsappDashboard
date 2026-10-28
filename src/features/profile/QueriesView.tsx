"use client";

import { useCallback, useEffect, useState } from "react";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Skeletons";
import { useCart } from "@/features/cart/CartProvider";
import { formatDate } from "@/features/orders/shared";
import { useLocale, useT } from "@/i18n/I18nProvider";
import type { CustomerQuery } from "@/services/farmsapp";

/** RN CommonQueryDisplay: your questions with support's answers, newest first, and a box to ask a new one. */
export default function QueriesView() {
  const t = useT();
  const locale = useLocale();
  const { notify } = useCart();
  const [queries, setQueries] = useState<CustomerQuery[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    fetch("/api/queries", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ queries?: CustomerQuery[] }>)
      .then((d) => setQueries(d.queries ?? []))
      .catch(() => setQueries([]));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return notify(t("query.empty"));
    setSending(true);
    const res = await fetch("/api/queries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text.trim() }) });
    setSending(false);
    if (!res.ok) return notify(t("location.errorGeneric"));
    setText("");
    notify(t("query.saved"));
    load();
  }

  const sorted = [...(queries ?? [])].sort((a, b) => (b.createdDate ?? "").localeCompare(a.createdDate ?? ""));

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5] md:min-h-[60vh] md:pb-14">
      <header className="sticky top-0 z-10 border-b border-[#eee] bg-white py-3 md:static md:border-0 md:bg-transparent md:pt-6">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 md:px-6">
          <BackLink href="/profile" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eee] bg-white">
            <IconArrowLeft className="size-4" />
          </BackLink>
          <h1 className="truncate text-sm font-bold text-[#202020] md:text-xl">{t("query.title")}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-3 px-4 pb-36 pt-4 md:px-6 md:pb-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[#6a7282]">{t("query.list")}</h2>
        {queries === null ? (
          <div className="flex justify-center pt-10">
            <Spinner />
          </div>
        ) : sorted.length === 0 ? (
          <p className="pt-10 text-center text-sm text-[#6a7282]">{t("query.none")}</p>
        ) : (
          sorted.map((q) => (
            <article key={q.id} className="rounded-2xl border border-[#eee] bg-white p-4">
              <p className="text-sm text-[#202020]">{q.query}</p>
              {q.createdDate && <p className="mt-1 text-[11px] text-[#9a9a9a]">{formatDate(q.createdDate, locale, true)}</p>}
              {q.response && (
                <p className="mt-3 rounded-xl bg-[#eef7ec] px-3 py-2 text-sm text-[#1f4529]">
                  <span aria-hidden>↳ </span>
                  {q.response}
                </p>
              )}
            </article>
          ))
        )}
      </main>

      <form onSubmit={send} className="fixed inset-x-0 bottom-0 border-t border-[#eee] bg-white px-4 py-3 md:static md:border-0 md:bg-transparent">
        <div className="mx-auto flex max-w-3xl gap-2 md:px-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder={t("query.placeholder")}
            className="min-h-11 flex-1 resize-none rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#202020] outline-none focus:border-[#1f4529]"
          />
          <button type="submit" disabled={sending} className="h-11 self-end rounded-lg bg-[#1f4529] px-5 text-sm font-bold text-white disabled:opacity-60">
            {sending ? "…" : t("query.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
