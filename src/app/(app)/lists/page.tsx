import Link from "next/link";
import { Plus, ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { createListAction } from "@/lib/actions/lists";

export default async function ListsPage() {
  const session = await requireSession();
  const lists = await prisma.shoppingList.findMany({
    where: { ownerId: session.userId, status: "active" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">הרשימות שלי</h1>
      </div>

      <form
        action={createListAction}
        className="flex gap-2 rounded-xl border border-border bg-surface p-3"
      >
        <input
          name="name"
          placeholder="שם לרשימה חדשה, למשל: קניה שבועית"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus size={16} />
          רשימה חדשה
        </button>
      </form>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center text-foreground-muted">
          <ListChecks size={28} />
          <p>אין עדיין רשימות פעילות. צרו רשימה חדשה כדי להתחיל.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lists.map((list) => {
            const checked = list.items.filter((i) => i.checked).length;
            return (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition hover:border-primary"
              >
                <span className="font-semibold">{list.name}</span>
                <span className="text-sm text-foreground-muted">
                  {list.items.length === 0
                    ? "רשימה ריקה"
                    : `${checked} / ${list.items.length} פריטים נאספו`}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
