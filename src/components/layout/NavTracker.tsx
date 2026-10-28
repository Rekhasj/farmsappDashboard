"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { markNavigation } from "@/lib/nav-history";

/** Mounted once in the root layout; lets BackLink know whether history.back() stays inside the app. */
export default function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    markNavigation();
  }, [pathname]);
  return null;
}
