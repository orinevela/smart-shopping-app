import Link from "next/link";
import { ShoppingCart, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionPayload } from "@/lib/auth";

export function AppHeader({ session }: { session: SessionPayload }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:px-6">
      <Link href="/lists" className="flex items-center gap-2 font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShoppingCart size={18} />
        </span>
        <span className="hidden sm:inline">עגלה חכמה</span>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden text-left text-xs sm:block">
          <div className="font-semibold">{session.name}</div>
          <div className="text-foreground-muted">{session.email}</div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            title="התנתקות"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
