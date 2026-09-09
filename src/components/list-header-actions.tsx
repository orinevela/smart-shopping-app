"use client";

import { useState } from "react";
import { Pencil, Copy, CheckCircle2, Trash2 } from "lucide-react";
import {
  renameListAction,
  duplicateListAction,
  completeListAction,
  deleteListAction,
} from "@/lib/actions/lists";

export function ListHeaderActions({
  listId,
  name,
}: {
  listId: string;
  name: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {editing ? (
        <form
          action={renameListAction}
          className="flex items-center gap-2"
          onSubmit={() => setEditing(false)}
        >
          <input type="hidden" name="listId" value={listId} />
          <input
            name="name"
            defaultValue={name}
            autoFocus
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-lg font-bold outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            שמירה
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{name}</h1>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="עריכת שם"
            className="text-foreground-muted hover:text-foreground"
          >
            <Pencil size={15} />
          </button>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-1.5">
        <form action={duplicateListAction}>
          <input type="hidden" name="listId" value={listId} />
          <button
            type="submit"
            title="שכפול רשימה"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-muted"
          >
            <Copy size={16} />
          </button>
        </form>

        <form action={completeListAction}>
          <input type="hidden" name="listId" value={listId} />
          <button
            type="submit"
            title="סימון כהושלמה"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-success/10 hover:text-success"
          >
            <CheckCircle2 size={16} />
          </button>
        </form>

        <form
          action={deleteListAction}
          onSubmit={(e) => {
            if (!confirm("למחוק את הרשימה?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="listId" value={listId} />
          <button
            type="submit"
            title="מחיקת רשימה"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
