import { addSuggestedItemAction } from "@/lib/actions/items";
import type { RecurringSuggestion } from "@/lib/recurring";

export function RecurringSuggestions({
  listId,
  suggestions,
}: {
  listId: string;
  suggestions: RecurringSuggestion[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-foreground-muted">
        קניתם לאחרונה — אולי כדאי להוסיף שוב?
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <form key={s.productId} action={addSuggestedItemAction}>
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="productId" value={s.productId} />
            <button
              type="submit"
              className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              + {s.name} · נקנה {s.occurrences} פעמים
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
