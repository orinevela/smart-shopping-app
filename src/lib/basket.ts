import "server-only";
import { prisma } from "@/lib/prisma";
import { distanceKm, estimateTravelMinutes } from "@/lib/distance";

export type ItemPricing = {
  itemId: string;
  productId: string | null;
  name: string;
  quantity: number;
  matched: boolean;
  unitPrice: number | null;
  lineTotal: number | null;
  promoApplied: boolean;
  promoLabel: string | null;
  promoSuggestion: {
    unitsNeeded: number;
    promoLabel: string;
    estimatedSavings: number;
  } | null;
  source: string | null;
  updatedAt: Date | null;
};

export type StoreBasket = {
  storeId: string;
  chain: string;
  branch: string;
  address: string;
  distanceKm: number;
  travelMinutes: number;
  items: ItemPricing[];
  matchedCount: number;
  unmatchedCount: number;
  total: number;
  oldestPriceUpdatedAt: Date | null;
  hasCrowdSourcedPrice: boolean;
  hasDelivery: boolean;
  deliveryFee: number | null;
  deliveryMinOrder: number | null;
  deliveryEtaMin: number | null;
  meetsDeliveryMinimum: boolean;
  totalWithDelivery: number | null;
};

/**
 * Computes, for every store within the given radius of `origin`, the cost of
 * buying the full list there — matching each list line to that store's price
 * row and applying a promo only when the line's quantity already meets the
 * promo's minimum (per spec 5.3, quantity is never changed automatically).
 */
export async function computeStoreBaskets(
  listId: string,
  origin: { lat: number; lng: number } | null,
  radiusKm: number
): Promise<StoreBasket[]> {
  const [list, stores] = await Promise.all([
    prisma.shoppingList.findUnique({
      where: { id: listId },
      include: { items: { include: { product: true } } },
    }),
    prisma.store.findMany({ include: { prices: true } }),
  ]);

  if (!list) return [];

  const nearbyStores = origin
    ? stores
        .map((store) => ({ store, distance: distanceKm(origin, store) }))
        .filter((s) => s.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
    : stores.map((store) => ({ store, distance: 0 }));

  return nearbyStores.map(({ store, distance }) => {
    const priceByProduct = new Map(store.prices.map((p) => [p.productId, p]));

    const items: ItemPricing[] = list.items.map((item) => {
      const price = item.productId ? priceByProduct.get(item.productId) : undefined;
      const name = item.product?.name ?? item.freeTextName ?? "פריט";

      if (!price) {
        return {
          itemId: item.id,
          productId: item.productId,
          name,
          quantity: item.quantity,
          matched: false,
          unitPrice: null,
          lineTotal: null,
          promoApplied: false,
          promoLabel: null,
          promoSuggestion: null,
          source: null,
          updatedAt: null,
        };
      }

      const promoQualifies =
        price.promoMinQty != null &&
        price.promoUnitPrice != null &&
        item.quantity >= price.promoMinQty;

      const unitPrice = promoQualifies ? price.promoUnitPrice! : price.price;
      const lineTotal = unitPrice * item.quantity;

      let promoSuggestion: ItemPricing["promoSuggestion"] = null;
      if (
        !promoQualifies &&
        price.promoMinQty != null &&
        price.promoUnitPrice != null &&
        price.promoLabel &&
        price.promoMinQty - item.quantity <= 3
      ) {
        const unitsNeeded = price.promoMinQty - item.quantity;
        const currentCost = price.price * price.promoMinQty;
        const promoCost = price.promoUnitPrice * price.promoMinQty;
        promoSuggestion = {
          unitsNeeded,
          promoLabel: price.promoLabel,
          estimatedSavings: Math.max(0, currentCost - promoCost),
        };
      }

      return {
        itemId: item.id,
        productId: item.productId,
        name,
        quantity: item.quantity,
        matched: true,
        unitPrice,
        lineTotal,
        promoApplied: promoQualifies,
        promoLabel: price.promoLabel,
        promoSuggestion,
        source: price.source,
        updatedAt: price.updatedAt,
      };
    });

    const matchedItems = items.filter((i) => i.matched);
    const total = matchedItems.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);
    const oldestPriceUpdatedAt = matchedItems.length
      ? matchedItems.reduce(
          (oldest, i) => (i.updatedAt! < oldest ? i.updatedAt! : oldest),
          matchedItems[0].updatedAt!
        )
      : null;

    const meetsDeliveryMinimum =
      !store.deliveryMinOrder || total >= store.deliveryMinOrder;

    return {
      storeId: store.id,
      chain: store.chain,
      branch: store.branch,
      address: store.address,
      distanceKm: distance,
      travelMinutes: estimateTravelMinutes(distance),
      items,
      matchedCount: matchedItems.length,
      unmatchedCount: items.length - matchedItems.length,
      total,
      oldestPriceUpdatedAt,
      hasCrowdSourcedPrice: matchedItems.some((i) => i.source === "CROWD"),
      hasDelivery: store.hasDelivery,
      deliveryFee: store.deliveryFee,
      deliveryMinOrder: store.deliveryMinOrder,
      deliveryEtaMin: store.deliveryEtaMin,
      meetsDeliveryMinimum,
      totalWithDelivery: store.hasDelivery
        ? total + (store.deliveryFee ?? 0)
        : null,
    };
  });
}
