import Link from "next/link";
import { notFound } from "next/navigation";
import { Scale } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { getRecurringSuggestions } from "@/lib/recurring";
import {
  CATEGORY_LABELS,
  CATEGORY_ROUTE_ORDER,
  type ProductCategory,
  type Unit,
} from "@/lib/constants";
import { AddItemForm } from "@/components/add-item-form";
import { ItemRow } from "@/components/item-row";
import { RecurringSuggestions } from "@/components/recurring-suggestions";
import { ListHeaderActions } from "@/components/list-header-actions";
import { SharePanel } from "@/components/share-panel";

export default async function ListDetailPage({
  params,
}: PageProps<"/lists/[id]">) {
  const { id } = await params;
  const session = await requireSession();

  const list = await prisma.shoppingList.findFirst({
    where: { id, ownerId: session.userId },
    include: {
      items: { include: { product: true }, orderBy: { createdAt: "asc" } },
      shares: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!list) notFound();

  const suggestions = await getRecurringSuggestions(session.userId, list.id);

  const grouped = new Map<ProductCategory | "UNKNOWN", typeof list.items>();
  for (const item of list.items) {
    const category = (item.product?.category as ProductCategory) ?? "UNKNOWN";
    const bucket = grouped.get(category) ?? [];
    bucket.push(item);
    grouped.set(category, bucket);
  }
  const orderedCategories = [...CATEGORY_ROUTE_ORDER, "UNKNOWN" as const].filter(
    (c) => grouped.has(c)
  );

  return (
    <div className="flex flex-col gap-6">
      <ListHeaderActions listId={list.id} name={list.name} />

      <AddItemForm listId={list.id} />

      <RecurringSuggestions listId={list.id} suggestions={suggestions} />

      {list.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-foreground-muted">
          הרשימה ריקה. הוסיפו פריט למעלה.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {orderedCategories.map((category) => (
            <div key={category} className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold text-foreground-muted">
                {category === "UNKNOWN" ? "אחר" : CATEGORY_LABELS[category]}
              </h2>
              <ul className="flex flex-col gap-1.5">
                {grouped.get(category)!.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={{
                      id: item.id,
                      name: item.product?.name ?? item.freeTextName ?? "פריט",
                      quantity: item.quantity,
                      unit: item.unit as Unit,
                      checked: item.checked,
                    }}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <SharePanel listId={list.id} shares={list.shares} />
        <Link
          href={`/lists/${list.id}/compare`}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          <Scale size={16} />
          השוואת מחירים בין חנויות
        </Link>
      </div>
    </div>
  );
}
