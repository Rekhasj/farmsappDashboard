import type { ApiProduct, LocalizedText } from "./product";

/** GET /kiosk/homepage-widgets (RN pages/home/services/homeScreenService.js). Confirmed live 2026-10-22. */
export type Localized = LocalizedText | string;

export type HomeWidgetItem = {
  position?: number;
  label?: Localized;
  bannerImage?: Localized;
  product?: ApiProduct & { itemCount?: number; skus?: (NonNullable<ApiProduct["skus"]>[number] & { skuType?: string })[] };
};

export type HomeWidget = {
  code: string;
  widgetType: "PRODUCT_LIST" | "BANNER" | string;
  title?: Localized;
  subtitle?: Localized;
  theme?: { backgroundColor?: string; borderColor?: string; titleColor?: string; subtitleColor?: string };
  viewAll?: { screen?: string; params?: Record<string, unknown>; label?: Localized; backgroundColor?: string; textColor?: string };
  showAddToCart?: boolean;
  bannerImage?: Localized;
  action?: { page?: string; [k: string]: unknown };
  items?: HomeWidgetItem[];
};

export type WidgetCarouselConfig = { autoScroll?: boolean; autoScrollIntervalMs?: number; stopOnInteraction?: boolean };
