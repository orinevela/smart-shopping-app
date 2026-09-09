"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { addItemAction } from "@/lib/actions/items";
import { UNITS, UNIT_LABELS, type Unit } from "@/lib/constants";

type Suggestion = { id: string; name: string; defaultUnit: Unit };

export function AddItemForm({ listId }: { listId: string }) {
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>("UNIT");
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query || productId) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, productId]);

  function pickSuggestion(s: Suggestion) {
    setQuery(s.name);
    setProductId(s.id);
    setUnit(s.defaultUnit);
    setOpen(false);
  }

  function submit() {
    if (!query.trim()) return;
    const formData = new FormData();
    formData.set("listId", listId);
    formData.set("query", query.trim());
    formData.set("productId", productId ?? "");
    formData.set("quantity", String(quantity));
    formData.set("unit", unit);
    startTransition(async () => {
      await addItemAction(formData);
      setQuery("");
      setProductId(null);
      setQuantity(1);
      setUnit("UNIT");
      setSuggestions([]);
    });
  }

  return (
    <div className="relative rounded-xl border border-border bg-surface p-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[10rem] flex-1">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setProductId(null);
            }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="הוסיפו פריט, למשל: חלב"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {open && query && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="block w-full px-3 py-2 text-right text-sm hover:bg-surface-muted"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="number"
          min={0.1}
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-center text-sm outline-none focus:border-primary"
        />

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {UNIT_LABELS[u]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={submit}
          disabled={isPending || !query.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Plus size={16} />
          הוספה
        </button>
      </div>
    </div>
  );
}
