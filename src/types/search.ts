import type { ApiSku, ApiTag, LocalizedText } from "./product";

/** One as-you-type suggestion. `productId` set => opens that product; otherwise it's a plain search phrase. */
export type SearchSuggestion = {
  productId: number | null;
  text: string;
  imageUrl: string | null;
};

export type TrendingSearch = {
  label: string;
  productId: number | null;
};

/** Recent + trending searches shown when the search box is focused and empty. */
export type SearchPreQuery = {
  recent: string[];
  trending: TrendingSearch[];
};

/** A full search result (same shape as the product detail payload, simplified). */
export type SearchProduct = {
  productId: number;
  productName: LocalizedText;
  technicalName?: LocalizedText;
  packshots?: string[];
  inventory?: ApiSku[];
  tags?: ApiTag[];
  productTags?: ApiTag[];
};
