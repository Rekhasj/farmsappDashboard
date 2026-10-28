"use client";

import { createContext, useContext } from "react";

/** What the browser may know about the logged-in farmer (farmerId stays in the signed cookie). */
export type ClientUser = { name?: string; mobile: string } | null;

const UserContext = createContext<ClientUser>(null);

export default function UserProvider({ user, children }: { user: ClientUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);

/** Full navigation to /login, coming back to the current page afterwards. */
export function goToLogin() {
  const here = `${window.location.pathname}${window.location.search}`;
  // A full load on purpose: login switches farmer, so no client state (cart etc.) may carry over.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?next=${encodeURIComponent(here)}`);
}
