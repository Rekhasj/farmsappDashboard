/** Only same-site paths are allowed as a post-login `next` (no "//evil.com", no "https://..."). Server + client safe. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
