/**
 * Small hand-coded inline icons used across the home page.
 * These are close visual approximations of the Figma icons (arrow-right,
 * search, cart, chevron, download) — swap for exact exports later if needed.
 */

export function IconArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M11.5 7h-9M6.5 3.5 3 7l3.5 3.5"
        stroke="black"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M3.5 5.25L7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M14 14l-3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconCart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className}>
      <path
        d="M2 2h1.5l1.4 8.4a1.5 1.5 0 0 0 1.48 1.26h6.24a1.5 1.5 0 0 0 1.48-1.26L15.5 5H4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="16" r="1.1" fill="currentColor" />
      <circle cx="12.5" cy="16" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconDownload({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className}>
      <path
        d="M6 1v6.5M3 5.5 6 8.5l3-3M2 10.5h8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
