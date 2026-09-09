"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleItemAction, deleteItemAction } from "@/lib/actions/items";
import { UNIT_LABELS, type Unit } from "@/lib/constants";

export function ItemRow({
  item,
}: {
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: Unit;
    checked: boolean;
  };
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const formData = new FormData();
    formData.set("itemId", item.id);
    startTransition(() => toggleItemAction(formData));
  }

  function remove() {
    const formData = new FormData();
    formData.set("itemId", item.id);
    startTransition(() => deleteItemAction(formData));
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs ${
          item.checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border"
        }`}
        aria-label="סמן כנקנה"
      >
        {item.checked ? "✓" : ""}
      </button>

      <span className={`flex-1 text-sm ${item.checked ? "text-foreground-muted line-through" : ""}`}>
        {item.name}
      </span>

      <span className="text-xs text-foreground-muted">
        {item.quantity} {UNIT_LABELS[item.unit]}
      </span>

      <button
        type="button"
        onClick={remove}
        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-danger/10 hover:text-danger"
        aria-label="מחיקת פריט"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}
