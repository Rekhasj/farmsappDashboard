import type { LocalizedText } from "./product";

/**
 * One cart line — the RN app's `cartDetails` item (buildCartItem in
 * modules/productDetail/domain/cartItem.js). Sent as-is in the cart POST;
 * the server answers with the same shape plus extras (savings, inStock, ...),
 * which we keep so they round-trip on the next POST.
 */
export type CartItem = CartLine & { [extra: string]: unknown };

/** The fields the web reads/writes (CartItem minus the server's pass-through extras). */
export type CartLine = {
  id: string; // = skuCode
  skuCode: string;
  productId: number;
  productName: string;
  productNameHindi?: string;
  productNameKannada?: string;
  productNameMarathi?: string;
  productNameTelugu?: string;
  title: string; // pack label, e.g. "500 ML"
  price: number; // = netPrice
  netPrice?: number;
  mrp: number;
  imageUrl?: string;
  quantity: number;
  inventoryCount: number;
  isAddedToCartClicked: boolean;
  isChecked: boolean;
  deliverable?: boolean;
  savings?: number;
  inStock?: boolean;
};

/** A row of the server-built bill. `value` is a plain amount, or a struck-through original + final. */
export type PriceRow = {
  label: LocalizedText;
  value: number | { originalAmount: number; finalAmount: number };
  type: "info" | "credit" | "debit" | string;
  color?: string;
};

/** The `cartDetails` object from GET/POST /companion/v1/farmer/cart (only the fields the web uses). */
export type CartDetails = {
  cartProducts: CartItem[];
  discountedPrice?: number;
  totalPrice?: number;
  totalMrp?: number;
  totalSavings?: number;
  minOrderValueForFreeDelivery?: number | null;
  expectedDeliveryDate?: string; // "01 Nov 2026"
  serviceable?: boolean;
  priceSummary?: PriceRow[];
  codPriceSummary?: PriceRow[];
  onlinePriceSummary?: PriceRow[];
  // Checkout (RN CartPaymentPage)
  paymentModeOptions?: string[]; // "Cash" | "Online"
  defaultPaymentMode?: string; // "Online" | "COD"
  prepaidDiscountValue?: number;
  codRestricted?: boolean;
  codRestrictionInfo?: { heading?: LocalizedText; subHeading?: LocalizedText; ctaText?: LocalizedText } | null;
  codIntermediaryInfo?: CodIntermediaryInfo | null;
  codCtaStyle?: string;
  orderCancellationAlert?: boolean;
  policies?: { header?: LocalizedText; policies?: { title?: LocalizedText; description?: LocalizedText }[] } | null;
  deliveryFee?: number;
  deliveryFeeWaived?: number;
  tax?: number;
};

/** The "please read before COD" sheet (RN CODOrderConfirmtaionModal). */
export type CodIntermediaryInfo = {
  show?: boolean;
  durationMs?: number;
  autoPlaceOnTimerEnd?: boolean;
  points?: { icon?: string; text?: LocalizedText }[];
  button?: { initialText?: LocalizedText; ctaText?: LocalizedText };
};

/** What the browser needs to open Razorpay Checkout. */
export type RazorpayStart = { keyId: string; razorpayOrderId: string; amount: number; name: string };

/** Kept in sessionStorage for the Order Placed page. */
export type PlacedOrder = {
  orderId: string;
  paymentMode: "COD" | "RAZORPAY";
  total: number;
  expectedDeliveryDate?: string;
  address?: string;
  items: (Pick<CartLine, "skuCode" | "productId" | "productName" | "productNameHindi" | "productNameKannada" | "productNameMarathi" | "productNameTelugu" | "title" | "quantity" | "price" | "imageUrl" | "savings">)[];
};

/** "You might also like" card (RN useCartRecommendations → mapRecommendations). */
export type CartRecommendation = {
  productId: number;
  productName: LocalizedText;
  discountPercentage: number;
  sku: { skuCode: string; title: string; netPrice: number; mrp: number; inventoryCount: number; imageUrl?: string };
};
