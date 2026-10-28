/**
 * Client-safe builders for cart lines — the web version of the RN app's
 * buildCartItem (modules/productDetail/domain/cartItem.js). Everything that
 * shows an Add to Cart control turns its product + SKU into a CartItemInput
 * here, so the line sent to the backend looks the same from every screen.
 */
import type { CartItem, CartLine, CartRecommendation } from "@/types/cart";
import type { ApiProduct, ApiSku, ProductDetail } from "@/types/product";

export type CartItemInput = Omit<CartLine, "quantity" | "isAddedToCartClicked" | "isChecked">;

const packTitle = (sku: Pick<ApiSku, "skuSize" | "skuUnit">) => `${sku.skuSize} ${sku.skuUnit}`.trim();

/** `l` is either a `{ en, hi, ... }` map or an object with flat productNameHindi-style fields. */
function names(en: string, l: object) {
  const r = l as Record<string, unknown>;
  const pick = (k: string) => (typeof r[k] === "string" && (r[k] as string).trim() ? (r[k] as string) : undefined);
  return {
    productName: en,
    productNameHindi: pick("hi") ?? pick("productNameHindi"),
    productNameKannada: pick("kn") ?? pick("productNameKannada"),
    productNameMarathi: pick("mr") ?? pick("productNameMarathi"),
    productNameTelugu: pick("te") ?? pick("productNameTelugu"),
  };
}

function base(productId: number, sku: ApiSku, imageUrl: string | undefined, deliverable?: boolean) {
  return {
    id: sku.skuCode,
    skuCode: sku.skuCode,
    productId,
    title: packTitle(sku),
    price: sku.netPrice,
    netPrice: sku.netPrice,
    mrp: sku.mrp,
    imageUrl: sku.skuImageUrl ?? imageUrl,
    inventoryCount: sku.inventoryCount ?? 0,
    deliverable: deliverable ?? sku.deliverable,
  };
}

/** v2 product feeds (cards): flat per-language name fields. */
export function cartInputFromApiProduct(product: ApiProduct, sku: ApiSku): CartItemInput {
  return {
    ...base(product.productId, sku, product.productImageUrl, product.deliverable),
    ...names(product.productName, product),
  };
}

/** Product-detail / search payloads: `{ en, hi, ... }` names. */
export function cartInputFromDetail(
  product: Pick<ProductDetail, "productId" | "productName" | "packshots">,
  sku: ApiSku,
): CartItemInput {
  return {
    ...base(product.productId, sku, product.packshots?.[0]),
    ...names(product.productName.en, product.productName),
  };
}

/** Cart-page "You might also like" cards. */
export function cartInputFromRecommendation(rec: CartRecommendation): CartItemInput {
  const { sku } = rec;
  return {
    id: sku.skuCode,
    skuCode: sku.skuCode,
    productId: rec.productId,
    title: sku.title,
    price: sku.netPrice,
    netPrice: sku.netPrice,
    mrp: sku.mrp,
    imageUrl: sku.imageUrl,
    inventoryCount: sku.inventoryCount,
    ...names(rec.productName.en, rec.productName),
  };
}

export function buildCartItem(input: CartItemInput, quantity = 1): CartItem {
  return { ...input, quantity, isAddedToCartClicked: true, isChecked: true };
}

export const isInStock = (item: Pick<CartItem, "inventoryCount">) => (item.inventoryCount ?? 0) > 0;

export const formatRupees = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
