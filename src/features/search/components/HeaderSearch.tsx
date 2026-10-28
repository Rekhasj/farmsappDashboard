"use client";

import { usePathname, useSearchParams } from "next/navigation";
import SearchBox from "./SearchBox";

/** The desktop header's search box; on /search it shows (and resets to) the current query. */
export default function HeaderSearch() {
  const pathname = usePathname();
  const q = useSearchParams().get("q") ?? "";
  const query = pathname === "/search" ? q : "";
  return <SearchBox key={query} initialQuery={query} />;
}
