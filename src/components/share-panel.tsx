"use client";

import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { createShareAction, revokeShareAction } from "@/lib/actions/share";

type Share = { id: string; token: string; permission: string };

export function SharePanel({ listId, shares }: { listId: string; shares: Share[] }) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(token: string, id: string) {
    const url = `${window.location.origin}/s/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard unavailable — the link is still visible for manual copy
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
      >
        <Share2 size={16} />
        שיתוף
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-80 rounded-xl border border-border bg-surface p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">שיתוף הרשימה</h3>
            <button type="button" onClick={() => setOpen(false)} aria-label="סגירה">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
              >
                <span className="flex-1 truncate font-mono">/s/{share.token}</span>
                <span className="text-foreground-muted">
                  {share.permission === "EDIT" ? "עריכה" : "צפייה"}
                </span>
                <button
                  type="button"
                  onClick={() => copyLink(share.token, share.id)}
                  className="text-foreground-muted hover:text-primary"
                  aria-label="העתקת קישור"
                >
                  {copiedId === share.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <form action={revokeShareAction}>
                  <input type="hidden" name="shareId" value={share.id} />
                  <button
                    type="submit"
                    className="text-foreground-muted hover:text-danger"
                    aria-label="ביטול שיתוף"
                  >
                    <X size={14} />
                  </button>
                </form>
              </div>
            ))}

            <form action={createShareAction} className="flex gap-2">
              <input type="hidden" name="listId" value={listId} />
              <select
                name="permission"
                className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                defaultValue="EDIT"
              >
                <option value="EDIT">קישור לעריכה</option>
                <option value="VIEW">קישור לצפייה</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                יצירת קישור
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
