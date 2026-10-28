"use client";

import { useT } from "@/i18n/I18nProvider";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-4 text-center">
      <p className="text-sm font-bold text-[#202020]">{t("common.somethingWentWrong")}</p>
      <p className="text-xs text-[#8a8a8a]">{t("common.pageLoadFailed")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-[#2e5b3a] px-5 py-2 text-xs font-bold text-white"
      >
        {t("common.tryAgain")}
      </button>
    </div>
  );
}
