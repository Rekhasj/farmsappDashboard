/**
 * SERVER-ONLY. Do not import this file from a "use client" component —
 * it reads BACKEND_AUTH_KEY from the environment, which must never reach
 * the browser bundle. Call these functions from Server Components (the
 * default for everything under app/) or Route Handlers, then pass the
 * results down as props.
 *
 * This talks to the backend directly (BACKEND_ORIGIN + BACKEND_CONTEXT_PATH),
 * not through the /api/backend proxy in next.config.ts — that proxy exists
 * so the *browser* never needs the backend's real URL or the auth key;
 * server-side code has no such constraint and this avoids an unnecessary
 * hop back through the same Next.js server.
 *
 * Endpoint paths and response shapes were confirmed live against the
 * shared dev server (storeId=2904, farmerId=81) on 2026-09-28 — not just
 * guessed from the RN app's source — so the field names in types/product.ts
 * match what the backend actually returns today.
 */

import type { AdvertisementBanner, ApiCategory, ApiProduct, CropCollection, LocalizedText, ProductDetail } from "@/types/product";
import type { CartDetails, CartItem, CartRecommendation } from "@/types/cart";
import type { OrderDetail, OrderSummary } from "@/types/order";
import type { HomeWidget, WidgetCarouselConfig } from "@/types/widgets";
import type { DeliveryLocation, SavedAddress } from "@/types/location";
import type { SearchPreQuery, SearchProduct, SearchSuggestion } from "@/types/search";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

const ENDPOINTS = {
  categories: "/companion/v2/product-catalogue/categories",
  products: "/companion/v2/products",
  cropCollections: "/v1/commerce/crop-collections",
  recentlyViewed: "/v1/commerce/recently-viewed-products",
  popularProducts: "/v1/commerce/popular-product/store-id",
  offerProducts: "/companion/v1/offer/products",
  carousel: "/companion/v1/banner/channel-id/5",
  activeOrders: "/companion/v1/active-orders",
  searchPreQuery: "/v1/commerce/search-data/pre-query",
  recentSearches: "/v1/commerce/search-data/recent-searches",
  searchSuggestions: "/search/catalogue/localized-suggestions",
  searchResults: "/search/catalogue/localized",
  cart: "/companion/v1/farmer/cart",
  orders: "/kiosk/product-catalogue/orders",
  razorpayOrder: "/payment/v1/razorpay/order",
  razorpaySuccess: "/payment/v1/razorpay/success",
  notifyMe: "/companion/v1/notify-me",
  triggerOtp: "/companion/v1/trigger-otp",
  login: "/companion/v1/login",
  signup: "/companion/v1/signup",
  farmer: "/companion/v1/farmer",
  farmerAddress: "/farmer/address",
  states: "/companion/v1/states/all",
  locationInfo: "/farmer/location-info",
  orderHistory: "/companion/v1/productOrder-history",
  homepageWidgets: "/kiosk/homepage-widgets",
  contactUs: "/companion/v1/contact-us",
  queries: "/companion/v1/customer/queries",
  query: "/companion/v1/customer/query",
  requestProduct: "/companion/v1/request/product",
  expertAvailability: "/companion/v1/expert-services/availability",
  agentAvailability: "/v1/agro-call/agent-availability",
  doctorCrops: "/companion/v1/crops/signup",
  callAudit: "/companion/v1/agro-call/audit",
  callHistory: "/v1/agro-call/history",
  callRecommendation: "/v1/agro-call/recommendation",
  callFeedback: "/v1/agro-call/feedback",
  orderDetail: "/v1/commerce/order",
} as const;

function backendUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const origin = process.env.BACKEND_ORIGIN;
  const contextPath = process.env.BACKEND_CONTEXT_PATH ?? "/kisaan";
  if (!origin) {
    throw new Error("BACKEND_ORIGIN is not set — check .env.local.");
  }
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `${origin}${contextPath}${path}${query ? `?${query}` : ""}`;
}

/**
 * The product-detail endpoint lives at BACKEND_ORIGIN directly — NOT under
 * /kisaan — confirmed live (kisaan/search/products/{id} 404s, while
 * {origin}/search/products/{id} returns the real payload). Ported as-is
 * from the RN app's ProductDetail.js, which builds this same URL.
 */
function searchServiceUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const origin = process.env.BACKEND_ORIGIN;
  if (!origin) {
    throw new Error("BACKEND_ORIGIN is not set — check .env.local.");
  }
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `${origin}${path}${query ? `?${query}` : ""}`;
}

function authHeaders(): HeadersInit {
  const basic = process.env.BACKEND_AUTH_BASIC;
  const key = process.env.BACKEND_AUTH_KEY;
  if (!basic || !key) {
    throw new Error(
      "BACKEND_AUTH_BASIC / BACKEND_AUTH_KEY are not set — add them to .env.local (see FRONTEND_BACKEND_SETUP.md).",
    );
  }
  // .trim() BACKEND_AUTH_BASIC and join with an explicit space, rather than
  // concatenating it directly with the key — a trailing space in
  // BACKEND_AUTH_BASIC's .env.local value is easy to lose (editors and
  // copy/paste routinely strip trailing whitespace), which glues the two
  // values together with no separator and makes the backend 400 the
  // request rather than 401 it. This makes the header correct either way.
  // No Content-Type: these are body-less GETs, and the working browser
  // request never sent one — some servers 400 a GET that claims a JSON body.
  return {
    Authorization: `${basic.trim()} ${key.trim()}`,
    Accept: "application/json",
  };
}

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
    if (!res.ok) {
      // TEMP debug: log the response body too, not just the status — we
      // need to see *why* the backend is rejecting this (it 400s from
      // Node but 200s from a browser on the same machine with the exact
      // same request, so the body should say what it doesn't like).
      const body = await res.text().catch(() => "<no body>");
      console.error(`Farmsapp API ${url} failed with ${res.status}: ${body}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Farmsapp API ${url} threw`, err);
    return null;
  }
}

export async function fetchCategories(storeId?: number, farmerId?: number): Promise<ApiCategory[]> {
  if (!storeId || !farmerId) return [];
  const data = await get<{ categories?: ApiCategory[] }>(
    backendUrl(ENDPOINTS.categories, { storeId, farmerId }),
  );
  return data?.categories ?? [];
}

export async function fetchProducts(
  categoryId: number,
  storeId?: number,
  farmerId?: number,
): Promise<ApiProduct[]> {
  if (!storeId || !farmerId) return [];
  const data = await get<{ products?: ApiProduct[] }>(
    backendUrl(ENDPOINTS.products, { categoryId, storeId, farmerId }),
  );
  return data?.products ?? [];
}

export type PopularProductsResult = {
  products: ApiProduct[];
  banners: AdvertisementBanner[];
};

/** "Best Selling products" — the popular-product feed. */
export async function fetchPopularProducts(storeId?: number, farmerId?: number): Promise<ApiProduct[]> {
  if (!storeId || !farmerId) return [];
  const data = await get<{ products?: ApiProduct[] }>(
    backendUrl(ENDPOINTS.popularProducts, { storeId, farmerId }),
  );
  return data?.products ?? [];
}

/** One page of the full best-selling list ("View all"). Same endpoint as the home strip, paged. */
export async function fetchBestSellingPage(
  page: number,
  storeId?: number,
  farmerId?: number,
  pageSize = 12,
): Promise<{ products: ApiProduct[]; totalPages: number }> {
  if (!storeId || !farmerId) return { products: [], totalPages: 1 };
  const data = await get<{ products?: ApiProduct[]; totalPages?: number }>(
    backendUrl(ENDPOINTS.popularProducts, {
      storeId,
      farmerId,
      pageNumber: page,
      pageSize,
      channelId: 5,
      fetchBestSellers: "true",
    }),
  );
  return { products: data?.products ?? [], totalPages: Math.max(1, data?.totalPages ?? 1) };
}

/**
 * Home banner carousel. The RN app reads `advertisementBanner` from the
 * offer-products endpoint (homeScreenService.fetchOfferProducts), not the
 * popular-product or /banner/channel-id/5 ones.
 */
export async function fetchHomeBanners(storeId?: number, farmerId?: number): Promise<AdvertisementBanner[]> {
  if (!storeId || !farmerId) return [];
  const data = await get<{ advertisementBanner?: AdvertisementBanner[] }>(
    backendUrl(ENDPOINTS.offerProducts, { storeId, farmerId }),
  );
  return (data?.advertisementBanner ?? []).filter((b) => b.showContent && !!b.imageUrl);
}

/** Requires a resolved pincode + farmerId — see Crops.jsx in the RN app. */
export async function fetchCropCollections(
  pincode?: string,
  farmerId?: number,
): Promise<CropCollection[]> {
  if (!pincode) return [];
  const data = await get<{ collections?: (CropCollection & Record<string, unknown>)[] }>(
    backendUrl(ENDPOINTS.cropCollections, { pincode, farmerId }),
  );
  // Image field name isn't confirmed (CropCard.jsx wasn't available), so accept likely variants.
  const raw = data?.collections ?? [];
  // TEMP debug: shows the real field names of one crop object in the terminal.
  if (raw[0]) console.log("Farmsapp crop-collections sample item:", JSON.stringify(raw[0]));
  return raw.map((c) => ({
    ...c,
    cropName:
      (c.cropName as string | undefined) ??
      (c.name as string | undefined) ??
      (c.cropNameEn as string | undefined) ??
      (c.title as string | undefined) ??
      (c.displayName as string | undefined) ??
      "",
    imageUrl:
      (c.imageUrl as string | undefined) ??
      (c.cropImageUrl as string | undefined) ??
      (c.image as string | undefined) ??
      (c.iconUrl as string | undefined),
  }));
}

/** Products for one crop (RN CropProductPage: crop-collections/{id}/products?pincode=&pageSize=100). */
export async function fetchCropProducts(cropId: number, pincode?: string): Promise<ApiProduct[]> {
  if (!cropId || !pincode) return [];
  const data = await get<{ products?: (ApiProduct & { id?: number })[] }>(
    backendUrl(`${ENDPOINTS.cropCollections}/${cropId}/products`, { pincode, pageSize: 100 }),
  );
  const list = data?.products ?? [];
  // TEMP debug: confirm the product shape for crop products, then remove.
  if (list[0]) console.log("Farmsapp crop product sample:", JSON.stringify(list[0]).slice(0, 600));
  return list.map((p) => ({ ...p, productId: p.productId ?? p.id ?? 0 }));
}

/**
 * NOTE: this endpoint's product objects use `id`, not `productId`, unlike
 * every other product feed — confirmed live. fetchRecentlyViewed
 * normalizes that here so callers only ever see `productId`.
 */
export async function fetchRecentlyViewed(farmerId?: number): Promise<ApiProduct[]> {
  if (!farmerId) return [];
  const data = await get<{ products?: (ApiProduct & { id?: number })[] }>(
    backendUrl(ENDPOINTS.recentlyViewed, { farmerId }),
  );
  return (data?.products ?? []).map((p) => ({ ...p, productId: p.productId ?? p.id ?? 0 }));
}

/** CMS-driven home banner. Returned an empty bannerList in dev as of 2026-09-28 — caller should fall back to a static banner when this is empty. */
export async function fetchCarousel(storeId?: number, farmerId?: number): Promise<unknown[]> {
  const data = await get<{ bannerList?: unknown[] }>(
    backendUrl(ENDPOINTS.carousel, { storeId, farmerId }),
  );
  return data?.bannerList ?? [];
}

/**
 * Confirmed live: this call 400s with just farmerId (and with farmerId+storeId).
 * It likely needs a logged-in farmer's auth token rather than the app-level
 * Basic credential — left wired (returns [] on failure) so the UI can stay
 * conditional on real data once that's sorted out, rather than always
 * showing a fake "active order" pill.
 */
export async function fetchActiveOrders(farmerId?: number): Promise<unknown[]> {
  if (!farmerId) return [];
  const data = await get<{ orders?: unknown[] }>(backendUrl(ENDPOINTS.activeOrders, { farmerId }));
  return data?.orders ?? [];
}

/**
 * Product Details Page data. Confirmed live against productId 685 on the
 * dev server. Hits the search-service directly (see searchServiceUrl above)
 * rather than the /kisaan-prefixed backend.
 */
export async function fetchProductDetail(
  productId: number,
  storeId?: number,
  farmerId?: number,
): Promise<ProductDetail | null> {
  if (!productId) return null;
  const url = searchServiceUrl(`/search/products/${productId}`, { storeId, farmerId });
  try {
    const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "<no body>");
      console.error(`Farmsapp API ${url} failed with ${res.status}: ${body}`);
      return null;
    }
    return (await res.json()) as ProductDetail;
  } catch (err) {
    console.error(`Farmsapp API ${url} threw`, err);
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * Search — ported from the RN app (useProductSearch / useRecentSearches /
 * useTrendingSearches). The two /search/catalogue endpoints live at the
 * backend origin (no /kisaan prefix), like product detail; recent/trending
 * live under /kisaan.
 * ------------------------------------------------------------------------- */

/** As-you-type suggestions (products with images, plus plain phrases). */
export async function fetchSearchSuggestions(
  query: string,
  storeId?: number,
  farmerId?: number,
): Promise<SearchSuggestion[]> {
  if (!query.trim()) return [];
  const data = await get<{
    suggestions?: { productId?: number | null; text?: string | null; url?: string | null }[];
  }>(searchServiceUrl(ENDPOINTS.searchSuggestions, { q: query, page: 1, storeId, farmerId }));
  return (data?.suggestions ?? [])
    .filter((s) => !!s.text)
    .map((s) => ({ productId: s.productId ?? null, text: s.text as string, imageUrl: s.url ?? null }));
}

/** Full results for a submitted search. (The backend also records it in the farmer's recent searches.) */
export async function fetchSearchResults(
  query: string,
  storeId?: number,
  farmerId?: number,
): Promise<SearchProduct[]> {
  if (!query.trim()) return [];
  const data = await get<{ productsSimplified?: SearchProduct[] }>(
    searchServiceUrl(ENDPOINTS.searchResults, { q: query, page: 1, storeId, farmerId }),
  );
  return Array.isArray(data?.productsSimplified) ? data.productsSimplified : [];
}

/** A keyword can arrive as a plain string or a localized object ({ en, hi, ... }). */
function keywordText(k: unknown, locale: Locale = DEFAULT_LOCALE): string {
  if (typeof k === "string") return k;
  if (k && typeof k === "object") {
    const o = k as Record<string, unknown>;
    const v = o[locale] || o.en || Object.values(o).find((x) => typeof x === "string");
    return typeof v === "string" ? v : "";
  }
  return "";
}

/** Recent searches + trending keywords for the empty search box. */
export async function fetchSearchPreQuery(farmerId?: number, locale: Locale = DEFAULT_LOCALE): Promise<SearchPreQuery> {
  if (!farmerId) return { recent: [], trending: [] };
  const data = await get<Record<string, unknown>>(backendUrl(ENDPOINTS.searchPreQuery, { farmerId }));
  // TEMP debug: the raw response, so field names can be checked against what the backend really sends.
  console.log("Farmsapp search pre-query raw:", JSON.stringify(data)?.slice(0, 1200));

  const recentRaw = Array.isArray(data?.recentSearches) ? (data.recentSearches as unknown[]) : [];
  const trendingRaw = Array.isArray(data?.trendingKeywords) ? (data.trendingKeywords as unknown[]) : [];

  return {
    recent: recentRaw
      .map((r) => keywordText(typeof r === "string" ? r : (r as { keyword?: unknown })?.keyword, locale))
      .filter(Boolean),
    trending: trendingRaw
      .map((t) => {
        const item = t as { keyword?: unknown; productId?: number | null };
        return { label: keywordText(item?.keyword ?? t, locale), productId: item?.productId ?? null };
      })
      .filter((t) => t.label),
  };
}

/** Clears the farmer's recent searches. Returns true when the backend accepted it. */
export async function clearRecentSearches(farmerId?: number): Promise<boolean> {
  if (!farmerId) return false;
  const url = backendUrl(ENDPOINTS.recentSearches, { farmerId });
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { ...authHeaders(), Source: "5" },
      cache: "no-store",
    });
    if (!res.ok) console.error(`Farmsapp API ${url} failed with ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error(`Farmsapp API ${url} threw`, err);
    return false;
  }
}

/* ---------------------------------------------------------------------------
 * Delivery location. Mirrors the RN LocationChangeModal:
 *   - saved addresses:  GET /kisaan/farmer/{id}/address  -> { addresses[] } (one has defaultAddress: true)
 *   - make one default: PUT /kisaan/farmer/address       { farmerId, address }
 *   - change pincode:   PUT /kisaan/companion/v1/farmer  { id, pincode } -> { status_code, farmer[], farmerJunctionInfo }
 *   - GPS -> pincode:   GET /kisaan/companion/v1/pincode?latitude=&longitude=
 * ------------------------------------------------------------------------- */

function pickText(o: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
}

function shapeAddress(addr: Record<string, unknown>): SavedAddress {
  const title = pickText(addr, ["addressLine1", "street", "streetName", "areaName", "area", "village", "landmark", "name"]);
  const parts = [
    pickText(addr, ["addressLine2", "areaName", "area"]),
    pickText(addr, ["village"]),
    pickText(addr, ["city", "district"]),
    pickText(addr, ["state", "stateName"]),
    pickText(addr, ["pincode", "pinCode"]),
  ].filter((p, i, arr) => p && p !== title && arr.indexOf(p) === i);
  return {
    id: pickText(addr, ["addressId", "id"]),
    title: title || parts[0] || "Saved address",
    subtitle: (title ? parts : parts.slice(1)).join(", "),
    pincode: pickText(addr, ["pincode", "pinCode"]),
    isDefault: addr.defaultAddress === true,
    raw: addr,
  };
}

/** The farmer's saved addresses (default first). */
export async function fetchAddresses(farmerId?: number): Promise<SavedAddress[]> {
  if (!farmerId) return [];
  const data = await get<{ addresses?: Record<string, unknown>[] }>(backendUrl(`/farmer/${farmerId}/address`));
  const list = Array.isArray(data?.addresses) ? data.addresses : [];
  // TEMP debug: confirm the real field names, then remove.
  console.log("Farmsapp address raw:", JSON.stringify(list[0] ?? null));
  return list.map(shapeAddress).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

/**
 * What the header shows. Before the farmer has changed location: the default
 * saved address. After: the default address only if it is in the chosen
 * pincode, otherwise the place the backend resolved for that pincode.
 */
export function toDeliveryLocation(
  addresses: SavedAddress[],
  pincode?: string,
  changed?: { place?: DeliveryLocation | null },
): DeliveryLocation | null {
  const def = addresses.find((a) => a.isDefault) ?? addresses[0];
  if (!changed) {
    if (def) return { title: def.title, subtitle: def.subtitle };
    return pincode ? { title: "Select delivery location", subtitle: `Pincode ${pincode}` } : null;
  }
  const match = addresses.find((a) => a.isDefault && a.pincode === pincode);
  if (match) return { title: match.title, subtitle: match.subtitle };
  if (changed.place) return changed.place;
  return pincode ? { title: `Pincode ${pincode}`, subtitle: "" } : null;
}

async function send<T>(
  method: "PUT" | "POST" | "DELETE",
  url: string,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method,
      headers: { ...authHeaders(), "Content-Type": "application/json", ...extraHeaders },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) console.error(`Farmsapp API ${method} ${url} failed with ${res.status}: ${text}`);
    return text ? (JSON.parse(text) as T) : null;
  } catch (err) {
    console.error(`Farmsapp API ${method} ${url} threw`, err);
    return null;
  }
}

/** GPS coordinates -> pincode. */
export async function lookupPincode(latitude: number, longitude: number): Promise<string | null> {
  const data = await get<{ pincode?: string | number }>(
    backendUrl("/companion/v1/pincode", { latitude, longitude }),
  );
  return data?.pincode ? String(data.pincode) : null;
}

/** Marks one saved address as the default. */
export async function setDefaultAddress(farmerId: number, address: Record<string, unknown>): Promise<boolean> {
  const data = await send<{ status_code?: string }>("PUT", backendUrl("/farmer/address"), {
    farmerId,
    address: { ...address, defaultAddress: true },
  });
  return data?.status_code === "SUCC200";
}

export type PincodeChangeResult =
  | { ok: true; storeId: number; pincode: string; place: DeliveryLocation | null }
  | { ok: false; reason: "not-serviceable" | "invalid" | "failed"; message?: string };

/** Saves a new pincode on the farmer; the backend answers with the serving store (-1 = not serviceable). */
export async function updateFarmerPincode(farmerId: number, pincode: string): Promise<PincodeChangeResult> {
  const data = await send<{
    status_code?: string;
    message?: string;
    farmer?: Record<string, unknown>[];
    farmerJunctionInfo?: { storeId?: number };
  }>("PUT", backendUrl("/companion/v1/farmer"), { id: farmerId, pincode });

  if (!data) return { ok: false, reason: "failed" };
  if (data.status_code === "CERR400") return { ok: false, reason: "invalid", message: data.message };
  if (data.status_code !== "SUCC200") return { ok: false, reason: "failed", message: data.message };

  const storeId = data.farmerJunctionInfo?.storeId;
  if (typeof storeId !== "number" || storeId === -1) return { ok: false, reason: "not-serviceable" };
  const f = data.farmer?.[0] ?? {};
  // TEMP debug: confirm which fields describe the place, then remove.
  console.log("Farmsapp pincode change raw:", JSON.stringify(f));
  const title = pickText(f, ["streetName", "areaName", "village", "currentLocation"]);
  const rest = [pickText(f, ["areaName"]), pickText(f, ["village"]), pickText(f, ["district"]), pickText(f, ["stateName"]), pincode]
    .filter((p, i, arr) => p && p !== title && arr.indexOf(p) === i);
  const place = title || rest.length ? { title: title || rest[0], subtitle: (title ? rest : rest.slice(1)).join(", ") } : null;
  return { ok: true, storeId, pincode: String(f.pincode ?? pincode), place };
}

/* ---------------------------------------------------------------------------
 * Cart — the RN app keeps the cart on the server (webAPI/cartService.js,
 * hooks/cart/useCartApi.js): every change is POSTed and the backend answers
 * with the full priced cart (bill rows, totals, delivery date).
 * ------------------------------------------------------------------------- */

type CartResponse = { status?: string; status_code?: string; message?: string; cartDetails?: Partial<CartDetails> | null };

/** An empty `cartDetails` ({}) means "no cart yet" — normalize to an empty item list. */
function toCartDetails(data: CartResponse | null): CartDetails | null {
  if (!data || data.status !== "Success") return null;
  const d = data.cartDetails ?? {};
  return { ...d, cartProducts: Array.isArray(d.cartProducts) ? d.cartProducts : [] };
}

export async function fetchCart(farmerId: number, storeId?: number): Promise<CartDetails | null> {
  return toCartDetails(await get<CartResponse>(backendUrl(ENDPOINTS.cart, { farmerId, storeId })));
}

/** Replaces the farmer's cart with `items` and returns the server-priced cart. */
export async function saveCart(farmerId: number, items: CartItem[]): Promise<CartDetails | null> {
  return toCartDetails(
    await send<CartResponse>("POST", backendUrl(ENDPOINTS.cart), {
      farmerId,
      cartProducts: items,
      couponCode: null,
      validCoupon: false,
    }),
  );
}

/** "You might also like" on the cart page — same normalization as RN mapRecommendations. */
export async function fetchCartRecommendations(farmerId: number, limit = 10): Promise<CartRecommendation[]> {
  const data = await get<unknown>(backendUrl(`${ENDPOINTS.cart}/recommendations`, { farmerId, limit }));
  const o = (data ?? {}) as Record<string, unknown>;
  const list = (Array.isArray(data) ? data : o.recommendations ?? o.products ?? o.data ?? []) as Record<string, unknown>[];
  return list.flatMap((p) => {
    const sku = ((p.skus as Record<string, unknown>[] | undefined)?.[0] ?? p.sku) as Record<string, unknown> | undefined;
    if (!sku?.skuCode) return [];
    const mrp = Number(sku.mrp) || 0;
    const netPrice = Number(sku.netPrice) || 0;
    const name = p.productName;
    return [{
      productId: Number(p.productId ?? p.id),
      productName:
        name && typeof name === "object"
          ? (name as LocalizedText)
          : { en: String(name ?? ""), hi: p.productNameHindi as string, kn: p.productNameKannada as string, mr: p.productNameMarathi as string, te: p.productNameTelugu as string },
      discountPercentage:
        Number(sku.discountPercentage || p.discountValue) || (mrp > netPrice ? Math.round(((mrp - netPrice) / mrp) * 100) : 0),
      sku: {
        skuCode: String(sku.skuCode),
        title: (sku.title as string) || [sku.skuSize, sku.skuUnit].filter(Boolean).join(" "),
        netPrice,
        mrp,
        inventoryCount: Number(sku.inventoryCount) || 0,
        imageUrl: (sku.imageUrl ?? sku.skuImageUrl ?? p.productImageUrl ?? p.imageUrl) as string | undefined,
      },
    }];
  });
}

/* ---------------------------------------------------------------------------
 * Checkout — RN components/Checkout.js + pages/PaymentVerificationScreen.js.
 * Amounts are always taken from a fresh server cart here, never from the
 * browser (the RN app trusts its own state; a website can't).
 * ------------------------------------------------------------------------- */

/** The farmer's default saved address, untouched — the order API wants the whole object. */
export async function fetchDefaultAddress(farmerId: number): Promise<Record<string, unknown> | null> {
  const list = await fetchAddresses(farmerId);
  return list.find((a) => a.isDefault)?.raw ?? null;
}

/** Step 1 of Pay Online: a Razorpay order for `amount` rupees. Returns Razorpay's order id + amount (paise). */
export async function createRazorpayOrder(farmerId: number, amount: number): Promise<{ id: string; amount: number } | null> {
  const data = await send<{ order?: { id?: string; amount?: number } }>("POST", backendUrl(ENDPOINTS.razorpayOrder), {
    amount,
    currency: "INR",
    receipt: "Receipt no. 1",
    farmerId,
    paymentFrom: "productOrder",
  });
  return data?.order?.id && typeof data.order.amount === "number" ? { id: data.order.id, amount: data.order.amount } : null;
}

/** Step 3 of Pay Online: the backend checks Razorpay's signature. */
export async function verifyRazorpayPayment(p: {
  razorpayOrderId: string;
  paymentId: string;
  signature: string;
}): Promise<boolean> {
  const data = await send<{ status_code?: string }>("POST", backendUrl(ENDPOINTS.razorpaySuccess), {
    orderId: p.razorpayOrderId,
    checkoutOrderId: p.razorpayOrderId,
    signature: p.signature,
    paymentId: p.paymentId,
  });
  return data?.status_code === "SUCC200";
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; response: Record<string, unknown> }
  | { ok: false; message?: string };

/** Creates the order (RN Checkout.js submitOrder). `Source` marks the sales channel; the app sends 5. */
export async function placeOrder(order: {
  mobileNumber: string;
  paymentMode: "COD" | "RAZORPAY";
  storeId: number;
  totalPrice: number;
  deliveryAddress: Record<string, unknown>;
  items: { skuCode: string; quantity: number }[];
  razorPayPaymentId: string;
  deliveryFee?: number;
  deliveryFeeWaived?: number;
  tax?: number;
}): Promise<PlaceOrderResult> {
  const data = await send<Record<string, unknown>>(
    "POST",
    backendUrl(ENDPOINTS.orders),
    {
      mobileNumber: order.mobileNumber,
      paymentMode: order.paymentMode,
      deliveryMode: "Home Delivery",
      storeId: order.storeId,
      totalPrice: order.totalPrice,
      orderDiscountedPrice: null, // the app always sends null here (NaN serialised)
      deliveryAddress: order.deliveryAddress,
      cartDetails: { productItems: order.items.map((i) => ({ quantity: i.quantity, skuId: i.skuCode })) },
      razorPayPaymentId: order.razorPayPaymentId,
      userLocation: {},
      deliveryFee: order.deliveryFee,
      deliveryFeeWaived: order.deliveryFeeWaived,
      tax: order.tax ?? 0,
    },
    { Source: process.env.ORDER_SOURCE ?? "5" },
  );
  if (data?.status_code === "SUCC200" && data.orderId != null) {
    return { ok: true, orderId: String(data.orderId), response: data };
  }
  return { ok: false, message: (data?.message ?? data?.error) as string | undefined };
}

/** Out-of-stock "Notify Me" (RN webAPI/outofStockNotifyMe.js). channelId 5 = the app's channel, same as the order Source. */
export async function requestNotifyMe(farmerId: number, productId: number, skuCode: string | null): Promise<boolean> {
  const data = await send<{ status_code?: string }>("POST", backendUrl(ENDPOINTS.notifyMe), {
    farmerId,
    products: [productId],
    channelId: 5,
    skuCode,
  });
  return data?.status_code === "SUCC200";
}

/* ---------------------------------------------------------------------------
 * Auth — RN modules/auth/services/authApi.js + services/farmer/farmerApi.js.
 * The backend has no per-user token: after OTP it just tells us the farmerId,
 * and the website keeps that in a signed cookie (lib/session.ts).
 * Native-only fields (SMS hash, FCM token, device id) are sent as null.
 * ------------------------------------------------------------------------- */

const CHANNEL = "COMPANION";
type ApiMessage = { status?: string; status_code?: string; message?: string; errorMessage?: string };
const apiError = (d: ApiMessage | null) => d?.errorMessage || d?.message || undefined;

export async function triggerOtp(mobileNumber: string): Promise<{ ok: boolean; message?: string }> {
  const data = await send<ApiMessage>("POST", backendUrl(ENDPOINTS.triggerOtp), { mobileNumber, channel: CHANNEL, hashValue: null });
  return { ok: data?.status_code === "SUCC200", message: apiError(data) };
}

export type LoginOutcome =
  | { ok: true; registered: true; farmerId: number }
  | { ok: true; registered: false; enablePincode: boolean }
  | { ok: false; message?: string };

export async function verifyOtpLogin(mobileNumber: string, otp: string, preferredLanguage: string): Promise<LoginOutcome> {
  const data = await send<ApiMessage & { registeredFarmer?: boolean; farmerId?: number; enablePincode?: boolean }>(
    "POST",
    backendUrl(ENDPOINTS.login),
    { mobileNumber, otp, channel: CHANNEL, deviceToken: null, preferredLanguage, deviceId: null },
  );
  if (!data || (data.status_code && data.status_code !== "SUCC200") || data.errorMessage) {
    return { ok: false, message: apiError(data) };
  }
  if (data.registeredFarmer === true && typeof data.farmerId === "number") {
    return { ok: true, registered: true, farmerId: data.farmerId };
  }
  if (data.registeredFarmer === false) return { ok: true, registered: false, enablePincode: !!data.enablePincode };
  return { ok: false, message: apiError(data) };
}

/** New farmer (RN PincodeSelectionScreen / signupFarmer): only the mobile + pincode are known. */
export async function signupFarmer(mobile: string, pincode: string | null, preferredLanguage: string): Promise<number | null> {
  const data = await send<ApiMessage & { farmerId?: number }>("POST", backendUrl(ENDPOINTS.signup), {
    name: null,
    mobile,
    age: null,
    address: null,
    channel: CHANNEL,
    pincode,
    deviceToken: null,
    crops: null,
    preferredLanguage,
    storeCode: null,
  });
  return typeof data?.farmerId === "number" ? data.farmerId : null;
}

export async function saveFarmerLanguage(farmerId: number, preferredLanguage: string): Promise<void> {
  await send("PUT", backendUrl(ENDPOINTS.farmer), { id: farmerId, preferredLanguage });
}

export type FarmerProfile = { farmerId: number; name?: string; mobile?: string; pincode?: string; storeId?: number };

export async function fetchFarmerProfile(farmerId: number): Promise<FarmerProfile | null> {
  const data = await get<{
    status?: string;
    farmer?: Record<string, unknown>[];
    farmerJunctionInfo?: { storeId?: number; pinCode?: string | number };
  }>(backendUrl(ENDPOINTS.farmer, { farmerId, channel: CHANNEL }));
  if (data?.status !== "Success") return null;
  const f = data.farmer?.[0] ?? {};
  const storeId = data.farmerJunctionInfo?.storeId;
  const pincode = f.pincode ?? data.farmerJunctionInfo?.pinCode;
  return {
    farmerId,
    name: typeof f.name === "string" && f.name.trim() ? f.name.trim() : undefined,
    mobile: typeof f.mobile === "string" || typeof f.mobile === "number" ? String(f.mobile) : undefined,
    pincode: pincode != null && /^[1-9]\d{5}$/.test(String(pincode)) ? String(pincode) : undefined,
    storeId: typeof storeId === "number" && storeId > 0 ? storeId : undefined,
  };
}

/* ---------------------------------------------------------------------------
 * Address book — RN services/address/addressApiService.js, hooks/useSelectAddress.js,
 * hooks/useAddressForm.js.
 * ------------------------------------------------------------------------- */

type AddressResponse = { status_code?: string; message?: string; addresses?: Record<string, unknown>[] };

/** POST /farmer/address — new address, made the default (RN buildCreateAddressPayload). */
export async function createAddress(farmerId: number, address: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  const data = await send<AddressResponse>("POST", backendUrl(ENDPOINTS.farmerAddress), { farmerId, address });
  return { ok: data?.status_code === "SUCC200", message: data?.message };
}

/** PUT /farmer/address — edit an address or make it the default (always sent with defaultAddress: true, like the app). */
export async function updateAddress(farmerId: number, address: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  const data = await send<AddressResponse>("PUT", backendUrl(ENDPOINTS.farmerAddress), {
    farmerId,
    address: { ...address, defaultAddress: true },
  });
  return { ok: data?.status_code === "SUCC200", message: data?.message };
}

export async function deleteAddress(farmerId: number, addressId: string): Promise<boolean> {
  const data = await send<AddressResponse>(
    "DELETE",
    backendUrl(`/farmer/${farmerId}/address/${encodeURIComponent(addressId)}`),
    undefined,
    { Source: process.env.ORDER_SOURCE ?? "5" },
  );
  return data?.status_code === "SUCC200";
}

export type StateOption = { id: number; stateName: string };

/** The state picker's list (RN StateSelectSheet). */
export async function fetchStates(): Promise<StateOption[]> {
  const data = await get<{ states?: StateOption[] }>(backendUrl(ENDPOINTS.states));
  return (data?.states ?? []).filter((s) => typeof s?.id === "number" && typeof s?.stateName === "string");
}

export type LocationInfo =
  | { ok: true; areaName?: string; district?: string; stateName?: string; townName?: string }
  | { ok: false; message?: LocalizedText | string };

/** Pincode → area / town / district / state for auto-fill (RN useAddressForm). */
export async function lookupLocationInfo(pincode: string): Promise<LocationInfo> {
  const data = await get<{
    status_code?: string;
    data?: { areaName?: string; district?: string; stateName?: string; townName?: string };
    localizedMessage?: LocalizedText;
    message?: string;
  }>(backendUrl(ENDPOINTS.locationInfo, { pincode: Number(pincode) }));
  if (data?.status_code === "SUCC200" && data.data) return { ok: true, ...data.data };
  return { ok: false, message: data?.localizedMessage ?? data?.message };
}

/* ---------------------------------------------------------------------------
 * Orders — RN webAPI/orderService.js (pages/OrderPage.js, OrderProductPage).
 * ------------------------------------------------------------------------- */

export const ORDER_PAGE_SIZE = 10;

/** One page (1-based, like the app) of the farmer's orders; `status` "" = all. */
export async function fetchOrderHistory(
  farmerId: number,
  pageNumber: number,
  status: "" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED",
): Promise<{ orders: OrderSummary[]; totalPages: number; total: number } | null> {
  const data = await get<{ status_code?: string; productOrders?: OrderSummary[]; totalPages?: number; totalOrderCount?: number }>(
    backendUrl(ENDPOINTS.orderHistory, { channelId: 5, farmerId, pageNumber, pageSize: ORDER_PAGE_SIZE, status }),
  );
  if (data?.status_code !== "SUCC200") return null;
  return { orders: data.productOrders ?? [], totalPages: data.totalPages ?? 0, total: data.totalOrderCount ?? 0 };
}

export async function fetchOrderDetail(farmerId: number, orderId: number): Promise<OrderDetail | null> {
  const data = await get<{ status_code?: string; orderDetails?: OrderDetail }>(
    backendUrl(`${ENDPOINTS.orderDetail}/${orderId}`, { farmerId }),
  );
  return data?.status_code === "SUCC200" && data.orderDetails ? data.orderDetails : null;
}

/** Home widgets carousel (RN fetchHomepageWidgets): product-list and banner cards, in display order. */
export async function fetchHomepageWidgets(farmerId?: number): Promise<{ widgets: HomeWidget[]; carousel: WidgetCarouselConfig | null }> {
  if (!farmerId) return { widgets: [], carousel: null };
  const data = await get<{ status?: string; widgets?: HomeWidget[]; carousel?: WidgetCarouselConfig }>(
    backendUrl(ENDPOINTS.homepageWidgets, { farmerId }),
  );
  if (data?.status === "Success" && Array.isArray(data.widgets)) return { widgets: data.widgets, carousel: data.carousel ?? null };
  return { widgets: [], carousel: null };
}

/* ---------------------------------------------------------------------------
 * Profile / Help & Support — RN PersonalInfo.js, ContactUsPage.jsx,
 * CommonQueryDisplay.js, ProductEnquiryPage.js.
 * ------------------------------------------------------------------------- */

/** RN PersonalInfo: only the name is editable; mobile + language are sent back unchanged. */
export async function updateFarmerName(farmerId: number, name: string, mobile: string, preferredLanguage: string): Promise<boolean> {
  const data = await send<{ status_code?: string }>("PUT", backendUrl(ENDPOINTS.farmer), { id: farmerId, name, mobile, preferredLanguage });
  return data?.status_code === "SUCC200";
}

export type ContactDetails = { customerCareNumber?: string; customerCareEmail?: string; whatsappNumber?: string };

export async function fetchContactUs(farmerId: number): Promise<ContactDetails | null> {
  const data = await get<{ contactUs?: ContactDetails }>(backendUrl(ENDPOINTS.contactUs, { farmerId, channel: CHANNEL }));
  return data?.contactUs ?? null;
}

export type CustomerQuery = { id: number; query: string; response?: string | null; createdDate?: string };

export async function fetchQueries(farmerId: number): Promise<CustomerQuery[] | null> {
  const data = await get<{ status_code?: string; queries?: CustomerQuery[] }>(backendUrl(ENDPOINTS.queries, { farmerId }));
  return data?.status_code === "SUCC200" ? (data.queries ?? []) : null;
}

export async function postQuery(farmerId: number, query: string): Promise<boolean> {
  const data = await send<{ status_code?: string }>("POST", backendUrl(ENDPOINTS.query), { farmerId, query });
  return data?.status_code === "SUCC200";
}

/** "Request a product" (multipart, like the app): names, description and up to 3 photos. */
export async function requestProduct(fields: {
  farmerId: number;
  storeId: number;
  productName: string;
  moleculeName: string;
  productDescription: string;
  images: File[];
}): Promise<boolean> {
  const form = new FormData();
  form.set("farmerId", String(fields.farmerId));
  form.set("storeId", String(fields.storeId));
  form.set("productName", fields.productName);
  form.set("moleculeName", fields.moleculeName);
  form.set("productDescription", fields.productDescription);
  for (const img of fields.images) form.append("images", img, img.name);
  try {
    const res = await fetch(backendUrl(ENDPOINTS.requestProduct), { method: "POST", headers: authHeaders(), body: form, cache: "no-store" });
    if (!res.ok) console.error(`Farmsapp API request/product failed with ${res.status}: ${await res.text().catch(() => "")}`);
    return res.ok;
  } catch (err) {
    console.error("Farmsapp API request/product threw", err);
    return false;
  }
}

/* ---------------------------------------------------------------------------
 * Crop Doctor — RN pages/CropDoctor.js, SelectCropsPage, VideoCallAvailability,
 * VideoCallScreen (Tata Tele hosted call page), FeedbackScreen, CallHistory, ViewPrescription.
 * ------------------------------------------------------------------------- */

export type ExpertService = {
  expertAvailable?: boolean;
  videoCallMessage?: string;
  tollFreeNumber?: string;
  holiday?: boolean;
  videoCallEnabled?: boolean;
  dayFrom?: string;
  dayTo?: string;
  [localizedText: string]: unknown; // expertUnavailableText{Lang}, holidayText{Lang}
};

export async function fetchExpertService(farmerId: number): Promise<ExpertService | null> {
  const data = await get<{ expertService?: ExpertService }>(backendUrl(ENDPOINTS.expertAvailability, { farmerId }));
  return data?.expertService ?? null;
}

/** Is any crop doctor free right now, for this call language (English, Hindi, ...)? */
export async function checkAgentAvailable(farmerId: number, language: string): Promise<boolean> {
  const data = await get<{ agent_availability?: { available?: boolean } }>(
    backendUrl(ENDPOINTS.agentAvailability, { language, farmerId, channel: CHANNEL }),
  );
  return data?.agent_availability?.available === true;
}

export type DoctorCrop = { id: number; name: string; imageUrl?: string; image?: string; [lang: string]: unknown };

export async function fetchDoctorCrops(farmerId: number, language: string): Promise<{ crops: DoctorCrop[]; recentCrops: DoctorCrop[] }> {
  const data = await get<{ crops?: DoctorCrop[]; recentCrops?: DoctorCrop[] }>(
    backendUrl(ENDPOINTS.doctorCrops, { farmerId, language, channel: CHANNEL }),
  );
  return { crops: data?.crops ?? [], recentCrops: data?.recentCrops ?? [] };
}

/** Creates the call record (RN VideoCallAvailability) and returns its auditId. */
export async function createCallAudit(farmerId: number, crops: unknown[], language: string): Promise<number | null> {
  const data = await send<{ status_code?: string; auditId?: number }>(
    "POST",
    backendUrl(ENDPOINTS.callAudit, { channel: CHANNEL }),
    { farmerId, crops, language },
  );
  return data?.status_code === "SUCC200" && typeof data.auditId === "number" ? data.auditId : null;
}

/** The Tata Tele video room for this call (RN VideoCallScreen), an ordinary web page. */
export async function fetchCallUrl(farmerId: number, auditId: number, language: string, name: string): Promise<string | null> {
  const data = await get<{ agro_detail?: { available?: boolean; url?: string } }>(
    backendUrl(`/v1/agro-call/farmer-id/${farmerId}/audit-id/${auditId}`, { language, name, channel: CHANNEL }),
  );
  const url = data?.agro_detail?.available ? data.agro_detail.url : undefined;
  return url && /^https:\/\//.test(url) ? url : null;
}

export async function sendCallFeedback(auditId: number, issueResolved: boolean, comments: string): Promise<boolean> {
  const data = await send<{ feedback?: unknown }>("PUT", backendUrl(ENDPOINTS.callFeedback), {
    auditId,
    rating: -1,
    comments,
    issueResolved,
    channel: CHANNEL,
  });
  return !!data?.feedback;
}

export type CallHistoryEntry = {
  auditId: number;
  auditDate?: string;
  comments?: string | null;
  auditData?: { cropName?: string; recommendations?: unknown; [k: string]: unknown }[];
};

export async function fetchCallHistory(farmerId: number): Promise<CallHistoryEntry[] | null> {
  const data = await get<{ status?: string; callHistory?: CallHistoryEntry[] }>(backendUrl(ENDPOINTS.callHistory, { farmerId }));
  return data?.status === "Success" ? (data.callHistory ?? []).filter((c) => (c.auditData?.length ?? 0) > 0) : null;
}

export type Prescription = { auditTime?: string; callDetails: { crop?: string; recommendations?: string[]; [k: string]: unknown }[] };

export async function fetchPrescription(auditId: number): Promise<Prescription | null> {
  const data = await get<{ callDetails?: Prescription["callDetails"]; auditTime?: string; detailedCallHistory?: Prescription["callDetails"] }>(
    backendUrl(ENDPOINTS.callRecommendation, { auditId, channel: CHANNEL }),
  );
  const details = data?.callDetails ?? data?.detailedCallHistory;
  return details ? { auditTime: data?.auditTime, callDetails: details } : null;
}
