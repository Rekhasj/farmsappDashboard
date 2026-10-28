/**
 * Product/category types — matched against real responses captured from
 * the shared dev backend (storeId=2904, farmerId=81) on 2026-09-28, not
 * just inferred from the RN app's source. Optional fields are optional
 * because different endpoints (v2/products, popular-product,
 * recently-viewed-products) return overlapping but not identical shapes.
 */

export type LocalizedText = {
  en: string;
  hi?: string;
  kn?: string;
  mr?: string;
  te?: string;
};

export type ApiTag = {
  position?: number;
  text: LocalizedText;
  fillColor?: string;
  textColor?: string;
  borderColor?: string;
};

export type ApiSku = {
  skuCode: string;
  skuUnit: string;
  skuSize: number;
  netPrice: number;
  mrp: number;
  savings?: number; // percentage, e.g. 56 = 56% off
  savingsValue?: number;
  inventoryCount?: number;
  skuImageUrl?: string;
  deliverable?: boolean;
  estimatedDeliveryDate?: string;
};

/** Shared by /companion/v2/products and /v1/commerce/popular-product/store-id. */
export type ApiProduct = {
  /** recently-viewed-products uses `id` instead of `productId` — see fetchRecentlyViewed. */
  productId: number;
  productName: string;
  productNameHindi?: string;
  productNameKannada?: string;
  productNameMarathi?: string;
  productNameTelugu?: string;
  technicalName?: string;
  productImageUrl?: string;
  deliverable?: boolean;
  tags?: ApiTag[];
  skus?: ApiSku[];
};

export type ApiCategory = {
  id: number;
  code?: string;
  name: string;
  kannadaName?: string;
  teluguName?: string;
  marathiName?: string;
  hindiName?: string;
  imageUrl?: string;
  badgeEnabled?: boolean;
  badgeColor?: string;
  badgeText?: string;
};

export type CropCollection = {
  id: number;
  cropName: string;
  imageUrl?: string;
};

/**
 * A real home-banner slide, embedded in the popular-product response
 * (`advertisementBanner`) — confirmed live on 2026-09-29. The dedicated
 * /companion/v1/banner/channel-id/5 endpoint returns an empty list in dev,
 * so this is the actual source for the carousel, not that one.
 */
export type AdvertisementBanner = {
  imageUrl: string;
  /** false seems to mean "don't show this banner right now" — filtered out in fetchPopularProducts. */
  showContent: boolean;
  data?: {
    page?: string; // e.g. "ProductDetailPage", "CropProductPage", "AllProductPage"
    productId?: string;
    cropId?: string;
    catId?: string;
  } | null;
  page?: string | null;
};

/** Response shape of GET {BACKEND_ORIGIN}/search/products/{productId} (no /kisaan prefix). */
export type ProductDetail = {
  id: string;
  productId: number;
  productName: LocalizedText;
  technicalName?: LocalizedText;
  description?: LocalizedText;
  category?: LocalizedText;
  subCategory?: LocalizedText;
  applicationAndDosage?: LocalizedText;
  molecularCompostion?: LocalizedText;
  packshots?: string[];
  bannerImages?: string[];
  suitableCrops?: unknown[];
  applicablePests?: unknown[];
  inventory: ApiSku[];
  deliveryAddresses?: unknown[];
  shareableLink?: string;
  productPurchasedAtleastOnce?: boolean;
  similarProducts?: ApiProduct[];
  dgServiceable?: boolean;
  deliveryStatus?: string;
  tags?: ApiTag[];
  rating?: { averageRating?: number; totalRatings?: number };
};
