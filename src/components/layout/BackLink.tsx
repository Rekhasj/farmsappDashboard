"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasInAppHistory } from "@/lib/nav-history";
import { useT } from "@/i18n/I18nProvider";

/**
 * Back arrow. When the user arrived from another page of the app it goes
 * back in history — which restores the previous page instantly from the
 * router cache (no reload, no loader). Opened directly (no history), it
 * falls back to a normal link to `href`.
 */
export default function BackLink({
  href = "/",
  className,
  children,
  "aria-label": ariaLabel,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const router = useRouter();
  const t = useT();
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? t("common.back")}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (hasInAppHistory()) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      {children}
    </Link>
  );
}
