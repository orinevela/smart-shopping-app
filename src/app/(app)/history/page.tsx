import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { Copy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { duplicateListAction } from "@/lib/actions/lists";

export default async function HistoryPage() {
  const session = await requireSession();
  const lists = await prisma.shoppingList.findMany({
    where: { ownerId: session.userId, status: "completed" },
    include: { items: true },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">היסטוריית רשימות</h1>

      {lists.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-foreground-muted">
          עדיין לא הושלמו רשימות. כשתסמנו רשימה כ&quot;הושלמה&quot; היא תופיע כאן.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <div>
                <div className="font-semibold">{list.name}</div>
                <div className="text-xs text-foreground-muted">
                  {list.items.length} פריטים ·{" "}
                  {list.completedAt
                    ? `הושלמה לפני ${formatDistanceToNow(list.completedAt, { locale: he })}`
                    : ""}
                </div>
              </div>
              <form action={duplicateListAction}>
                <input type="hidden" name="listId" value={list.id} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-muted"
                >
                  <Copy size={13} />
                  שכפול כרשימה חדשה
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
