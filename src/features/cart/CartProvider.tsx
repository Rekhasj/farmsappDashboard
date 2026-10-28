"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { goToLogin, useUser } from "@/features/auth/UserProvider";
import { pickField } from "@/i18n/localize";
import { buildCartItem, type CartItemInput } from "@/lib/cart";
import type { CartDetails, CartItem } from "@/types/cart";

/** Debounce for the cart POST, so tapping + three times sends one request. */
const SYNC_DELAY_MS = 400;

type CartContextValue = {
  items: CartItem[];
  /** Last server-priced cart (bill rows, totals, delivery date). Null until the first load. */
  details: CartDetails | null;
  loaded: boolean;
  /** A change is waiting for, or being priced by, the server. */
  syncing: boolean;
  quantityOf: (skuCode: string) => number;
  add: (input: CartItemInput) => void;
  increment: (skuCode: string) => void;
  decrement: (skuCode: string) => void;
  remove: (...skuCodes: string[]) => void;
  /** Empties the cart after an order (RN Checkout.js: setCartDetails([])). */
  clear: () => void;
  /** Re-reads the cart from the server (RN re-validates on every cart-page focus). */
  refresh: () => Promise<void>;
  notify: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * App-wide cart, mounted in the root layout — the web version of the RN
 * cart slice + useCart + useCartBootstrap. Changes apply instantly, then the
 * whole cart is POSTed (debounced) and replaced by the server's priced copy.
 */
export default function CartProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const locale = useLocale();
  const user = useUser();
  const loggedIn = !!user;
  const [items, setItems] = useState<CartItem[]>([]);
  const [details, setDetails] = useState<CartDetails | null>(null);
  // Guests have no cart (it lives on the farmer's account), so there's nothing to load.
  const [loaded, setLoaded] = useState(!loggedIn);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const itemsRef = useRef(items);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0); // only the newest response may overwrite local state
  const pending = useRef(false); // a local change hasn't been priced by the server yet

  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const applyServer = useCallback((cart: CartDetails) => {
    itemsRef.current = cart.cartProducts;
    setItems(cart.cartProducts);
    setDetails(cart);
  }, []);

  const refresh = useCallback(async () => {
    if (!loggedIn || pending.current) return; // a newer local change is being priced anyway
    const mine = ++seq.current;
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = (await res.json()) as { cart?: CartDetails };
      if (mine === seq.current && data.cart) applyServer(data.cart);
    } catch {
      /* keep what we have */
    } finally {
      if (mine === seq.current) setLoaded(true);
    }
  }, [applyServer, loggedIn]);

  // First load (RN useCartBootstrap).
  useEffect(() => {
    if (!loggedIn) return;
    let alive = true;
    fetch("/api/cart", { cache: "no-store" })
      .then((res) => res.json() as Promise<{ cart?: CartDetails }>)
      .then((data) => {
        if (alive && data.cart && !pending.current) applyServer(data.cart);
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [applyServer, loggedIn]);

  const sync = useCallback(async () => {
    timer.current = null;
    const mine = ++seq.current;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsRef.current }),
      });
      const data = (await res.json()) as { cart?: CartDetails };
      if (mine !== seq.current) return;
      if (!res.ok || !data.cart) throw new Error("sync failed");
      pending.current = false;
      setSyncing(false);
      applyServer(data.cart);
    } catch {
      if (mine !== seq.current) return;
      pending.current = false;
      setSyncing(false);
      notify(t("location.errorGeneric"));
      await refresh(); // fall back to whatever the server really has
    }
  }, [applyServer, notify, refresh, t]);

  const commit = useCallback(
    (next: CartItem[]) => {
      itemsRef.current = next;
      setItems(next);
      pending.current = true;
      setSyncing(true);
      seq.current++; // invalidate any response already in flight
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void sync(), SYNC_DELAY_MS);
    },
    [sync],
  );

  const increment = useCallback(
    (skuCode: string) => {
      const item = itemsRef.current.find((i) => i.skuCode === skuCode);
      if (!item) return;
      if (item.quantity + 1 > item.inventoryCount) {
        // RN useCart: "<name> Available Stock <n>"
        notify(`${pickField(item, "productName", locale)} — ${t("cart.availableStock")} ${item.inventoryCount}`);
        return;
      }
      commit(itemsRef.current.map((i) => (i.skuCode === skuCode ? { ...i, quantity: i.quantity + 1 } : i)));
    },
    [commit, locale, notify, t],
  );

  const add = useCallback(
    (input: CartItemInput) => {
      if (!loggedIn) return goToLogin(); // RN: the cart needs a signed-in farmer
      if (itemsRef.current.some((i) => i.skuCode === input.skuCode)) return increment(input.skuCode);
      if ((input.inventoryCount ?? 0) <= 0) return;
      commit([...itemsRef.current, buildCartItem(input)]);
    },
    [commit, increment, loggedIn],
  );

  const decrement = useCallback(
    (skuCode: string) => {
      commit(
        itemsRef.current
          .map((i) => (i.skuCode === skuCode ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0),
      );
    },
    [commit],
  );

  const remove = useCallback(
    (...skuCodes: string[]) => commit(itemsRef.current.filter((i) => !skuCodes.includes(i.skuCode))),
    [commit],
  );

  const clear = useCallback(() => commit([]), [commit]);

  const quantityOf = useCallback(
    (skuCode: string) => items.find((i) => i.skuCode === skuCode)?.quantity ?? 0,
    [items],
  );

  const value = useMemo(
    () => ({ items, details, loaded, syncing, quantityOf, add, increment, decrement, remove, clear, refresh, notify }),
    [items, details, loaded, syncing, quantityOf, add, increment, decrement, remove, clear, refresh, notify],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-60 max-w-[90vw] -translate-x-1/2 rounded-lg bg-[#202020] px-4 py-2.5 text-center text-xs font-semibold text-white shadow-lg md:bottom-8"
        >
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
