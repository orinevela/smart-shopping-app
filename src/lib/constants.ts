export const PRODUCT_CATEGORIES = [
  "PRODUCE",
  "DAIRY_CHILLED",
  "FROZEN",
  "DRY_GOODS",
  "CLEANING_TOILETRIES",
  "MEAT_FISH",
  "BAKERY",
  "OTHER",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  PRODUCE: "פירות וירקות",
  DAIRY_CHILLED: "מוצרי חלב וקירור",
  FROZEN: "קפואים",
  DRY_GOODS: "יבשים ושימורים",
  CLEANING_TOILETRIES: "ניקיון וטואלטיקה",
  MEAT_FISH: "בשר ודגים",
  BAKERY: "מאפים",
  OTHER: "אחר",
};

// Route order inside a store: dry goods first, produce, then chilled/frozen last
// to minimize the time perishables spend out of refrigeration (see spec 6).
export const CATEGORY_ROUTE_ORDER: ProductCategory[] = [
  "DRY_GOODS",
  "CLEANING_TOILETRIES",
  "BAKERY",
  "PRODUCE",
  "MEAT_FISH",
  "DAIRY_CHILLED",
  "FROZEN",
  "OTHER",
];

export const UNITS = ["UNIT", "KG", "LITER", "PACK"] as const;
export type Unit = (typeof UNITS)[number];

export const UNIT_LABELS: Record<Unit, string> = {
  UNIT: "יח'",
  KG: 'ק"ג',
  LITER: "ליטר",
  PACK: "אריזה",
};

export const PRICE_SOURCES = ["OFFICIAL_FEED", "CROWD"] as const;
export type PriceSource = (typeof PRICE_SOURCES)[number];

export const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
  OFFICIAL_FEED: "מחירון רשמי",
  CROWD: "דיווח משתמשים",
};

export const SHARE_PERMISSIONS = ["VIEW", "EDIT"] as const;
export type SharePermission = (typeof SHARE_PERMISSIONS)[number];
