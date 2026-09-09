import "server-only";
import { prisma } from "@/lib/prisma";

const LOOKBACK_MONTHS = 3;
const MIN_OCCURRENCES = 2;

export type RecurringSuggestion = {
  productId: string;
  name: string;
  occurrences: number;
};

/**
 * Products the user bought (checked off in a completed list) at least
 * MIN_OCCURRENCES times in the last LOOKBACK_MONTHS months, and that are not
 * already on the given active list (spec 4.2: "קניתי חלב ב-4 מהחודשים
 * האחרונים").
 */
export async function getRecurringSuggestions(
  userId: string,
  activeListId: string
): Promise<RecurringSuggestion[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - LOOKBACK_MONTHS);

  const [pastItems, activeItems] = await Promise.all([
    prisma.shoppingListItem.findMany({
      where: {
        productId: { not: null },
        checked: true,
        list: { ownerId: userId, status: "completed", completedAt: { gte: since } },
      },
      include: { product: true },
    }),
    prisma.shoppingListItem.findMany({
      where: { listId: activeListId },
      select: { productId: true },
    }),
  ]);

  const alreadyOnList = new Set(activeItems.map((i) => i.productId));
  const counts = new Map<string, { name: string; count: number }>();

  for (const item of pastItems) {
    if (!item.productId || alreadyOnList.has(item.productId)) continue;
    const entry = counts.get(item.productId);
    if (entry) entry.count += 1;
    else counts.set(item.productId, { name: item.product!.name, count: 1 });
  }

  return [...counts.entries()]
    .filter(([, v]) => v.count >= MIN_OCCURRENCES)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([productId, v]) => ({ productId, name: v.name, occurrences: v.count }));
}
