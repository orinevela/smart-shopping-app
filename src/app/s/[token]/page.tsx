import { notFound } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_LABELS,
  CATEGORY_ROUTE_ORDER,
  UNIT_LABELS,
  type ProductCategory,
  type Unit,
} from "@/lib/constants";
import { toggleSharedItemAction } from "@/lib/actions/shared-list";

export default async function SharedListPage({
  params,
}: PageProps<"/s/[token]">) {
  const { token } = await params;

  const share = await prisma.listShare.findUnique({
    where: { token },
    include: {
      list: {
        include: { items: { include: { product: true }, orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!share) notFound();

  const editable = share.permission === "EDIT";
  const grouped = new Map<ProductCategory | "UNKNOWN", typeof share.list.items>();
  for (const item of share.list.items) {
    const category = (item.product?.category as ProductCategory) ?? "UNKNOWN";
    const bucket = grouped.get(category) ?? [];
    bucket.push(item);
    grouped.set(category, bucket);
  }
  const orderedCategories = [...CATEGORY_ROUTE_ORDER, "UNKNOWN" as const].filter(
    (c) => grouped.has(c)
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShoppingCart size={18} />
        </span>
        <div>
          <h1 className="font-bold">{share.list.name}</h1>
          <p className="text-xs text-foreground-muted">
            רשימה משותפת · {editable ? "ניתן לסמן פריטים" : "צפייה בלבד"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {orderedCategories.map((category) => (
          <div key={category} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-foreground-muted">
              {category === "UNKNOWN" ? "אחר" : CATEGORY_LABELS[category]}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {grouped.get(category)!.map((item) => {
                const name = item.product?.name ?? item.freeTextName ?? "פריט";
                const unit = item.unit as Unit;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
                  >
                    {editable ? (
                      <form action={toggleSharedItemAction}>
                        <input type="hidden" name="token" value={token} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs ${
                            item.checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {item.checked ? "✓" : ""}
                        </button>
                      </form>
                    ) : (
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs ${
                          item.checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                      >
                        {item.checked ? "✓" : ""}
                      </span>
                    )}
                    <span className={`flex-1 text-sm ${item.checked ? "text-foreground-muted line-through" : ""}`}>
                      {name}
                    </span>
                    <span className="text-xs text-foreground-muted">
                      {item.quantity} {UNIT_LABELS[unit]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
