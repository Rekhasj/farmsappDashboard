/**
 * Shared, client-safe helpers for turning raw ApiProduct/ApiCategory
 * objects (from lib/farmsapp-api.ts) into the flat props the UI
 * components (ProductCard, ProductRow, CompactProductCard, Tile) expect.
 * No "use client" needed here — plain functions, no hooks/env access.
 */
import type { Product } from "@/features/products/components/ProductCard";
import type { ProductRowItem } from "@/features/products/components/ProductRow";
import type { ApiProduct, ApiSku } from "@/types/product";
import type { SearchProduct } from "@/types/search";
import type { Locale } from "@/i18n/config";
import { pickField, pickText } from "@/i18n/localize";
import type { TFunction } from "@/i18n/translate";
import { cartInputFromApiProduct, cartInputFromDetail } from "@/lib/cart";

/** Current language + translator — from getLocale()/getT() on the server. */
export type MapperI18n = { locale: Locale; t: TFunction };

const TAG_TONE_ORDER = ["green", "purple", "orange"] as const;

/** The real API doesn't return a tone — pick one deterministically from the product id so colors stay varied but stable across renders. */
function toneForProduct(productId: number): "green" | "purple" | "orange" {
  return TAG_TONE_ORDER[productId % TAG_TONE_ORDER.length];
}

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/**
 * The SKU a card shows and sells: the first one, exactly like the RN app
 * (ProductCommonCard uses skus[0]). If it's out of stock — or the product has
 * no SKUs at all — the card offers "Notify Me" instead of Add to Cart.
 */
function cardSku(skus: ApiSku[] | undefined) {
  return skus?.[0];
}

/** Price/size/badge for a card; blank when the product has no SKU (Notify Me only). */
function skuDisplay(sku: ApiSku | undefined, t: TFunction) {
  if (!sku) return { price: "", mrp: "", size: "", badge: undefined, outOfStock: true };
  return {
    price: formatRupees(sku.netPrice),
    mrp: formatRupees(sku.mrp),
    size: `${sku.skuSize}${sku.skuUnit}`,
    badge: sku.savings ? t("common.percentOff", { percent: sku.savings }) : undefined,
    outOfStock: (sku.inventoryCount ?? 0) <= 0,
  };
}

export function mapApiProductToCard(product: ApiProduct, { locale, t }: MapperI18n): Product {
  const sku = cardSku(product.skus);
  const d = skuDisplay(sku, t);
  return {
    id: product.productId,
    name: pickField(product, "productName", locale),
    technicalName: pickField(product, "technicalName", locale, "prefix"),
    tag: pickText(product.tags?.[0]?.text, locale),
    tagTone: toneForProduct(product.productId),
    discount: d.badge,
    price: d.price,
    mrp: d.mrp,
    size: d.size,
    imageUrl: product.productImageUrl ?? sku?.skuImageUrl,
    cart: sku ? cartInputFromApiProduct(product, sku) : undefined,
  };
}

export function mapApiProductToRow(product: ApiProduct, { locale, t }: MapperI18n): ProductRowItem {
  const sku = cardSku(product.skus);
  const d = skuDisplay(sku, t);
  return {
    id: product.productId,
    name: pickField(product, "productName", locale),
    tag: pickText(product.tags?.[0]?.text, locale),
    tagTone: toneForProduct(product.productId),
    description: pickField(product, "technicalName", locale, "prefix"),
    price: d.price,
    mrp: d.mrp,
    size: d.size,
    badge: d.badge,
    outOfStock: d.outOfStock,
    imageUrl: product.productImageUrl ?? sku?.skuImageUrl,
    cart: sku ? cartInputFromApiProduct(product, sku) : undefined,
  };
}

export function mapApiProductsToCards(products: ApiProduct[], i18n: MapperI18n): Product[] {
  return products.map((p) => mapApiProductToCard(p, i18n));
}

export function mapApiProductsToRows(products: ApiProduct[], i18n: MapperI18n): ProductRowItem[] {
  return products.map((p) => mapApiProductToRow(p, i18n));
}

/** Search results use the detail-style shape (localized names, `inventory`, `packshots`). */
export function mapSearchProductToRow(product: SearchProduct, { locale, t }: MapperI18n): ProductRowItem {
  const sku = cardSku(product.inventory);
  const d = skuDisplay(sku, t);
  return {
    id: product.productId,
    name: pickText(product.productName, locale),
    tag: pickText((product.tags ?? product.productTags)?.[0]?.text, locale),
    tagTone: toneForProduct(product.productId),
    description: pickText(product.technicalName, locale),
    price: d.price,
    mrp: d.mrp,
    size: d.size,
    badge: d.badge,
    outOfStock: d.outOfStock,
    imageUrl: product.packshots?.[0] ?? sku?.skuImageUrl,
    cart: sku ? cartInputFromDetail(product, sku) : undefined,
  };
}

export function mapSearchProductsToRows(products: SearchProduct[], i18n: MapperI18n): ProductRowItem[] {
  return products.map((p) => mapSearchProductToRow(p, i18n));
}
