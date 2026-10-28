import type { LocalizedText, PriceRowLike } from "./order-shared";

/**
 * Orders — response shapes of
 *   GET /companion/v1/productOrder-history  (list)
 *   GET /v1/commerce/order/{orderId}        (detail → `orderDetails`)
 * confirmed live on 2026-10-22. Only the fields the web reads are typed.
 */
export type { LocalizedText };

export type OrderSummary = {
  orderId: number;
  status: string;
  statusColorCode?: string;
  statusDescription?: LocalizedText;
  statusDateText?: LocalizedText;
  finalPrice?: number;
  discountedPrice?: number;
  totalAmount?: number;
  totalSku?: number;
  orderedProducts?: { productId?: number; productImageUrl?: string }[];
};

export type OrderItem = {
  productId?: number;
  productName?: string;
  hindiProductName?: string;
  kannadaProductName?: string;
  marathiProductName?: string;
  teluguProductName?: string;
  productImageUrl?: string;
  skuSize?: string;
  quantity?: number;
  netPrice?: number;
  price?: number;
  sellingPrice?: number;
  mrp?: number;
  savings?: number;
};

export type TimelineStep = {
  appStatus?: string;
  label?: LocalizedText;
  colorCode?: string;
  firstOccurredAt?: string;
  completed?: boolean;
  subComments?: { text?: LocalizedText; occurredAt?: string }[];
};

export type OrderArticle = {
  status?: string;
  shipmentStatus?: { statusColorCode?: string; statusDescription?: LocalizedText };
  packages?: OrderItem[];
  articleId?: string;
  deliveryPartner?: string;
  totalAmount?: number;
  codAmount?: number;
  paymentStatus?: string;
  deliveredOn?: string;
  estimatedDeliveryDate?: string;
  refundInitiatedOn?: string;
  refundedOn?: string;
  returnedOn?: string;
  cancelledOn?: string;
  refundAmount?: number;
  refundInitiatedDate?: string;
  statusTimeline?: TimelineStep[];
};

export type OrderDetail = {
  orderId: number;
  status: string;
  statusColorCode?: string;
  statusDescription?: LocalizedText;
  articles?: OrderArticle[];
  orderedProducts?: OrderItem[];
  expectedDeliveryDate?: string;
  cancelledOn?: string;
  statusTimeline?: TimelineStep[];
  shippingAddress?: { name?: string; pincode?: number | string };
  userName?: string;
  farmerPincode?: number | string;
  mobileNumber?: string;
  farmerDeliveryAddress?: string;
  priceSummary?: PriceRowLike[];
  paymentMode?: string;
  paymentStatus?: string;
  totalSavings?: number;
  invoice?: string;
  orderTime?: string;
};
