/**
 * After an address/pincode change the store (and so prices, stock and every
 * product list) can change, so go there with a full load — no cached page
 * from the old store may survive. RN does the same with navigation resets.
 */
export function goFresh(path: string) {
  window.location.assign(path);
}

export const backTo = (from: string | null) => (from === "cart" ? "/cart" : "/addresses");
