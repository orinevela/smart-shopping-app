"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { ShoppingCart } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-2xl font-bold">עגלה חכמה</h1>
          <p className="text-sm text-foreground-muted">
            רשימות קניות והשוואת מחירים בין חנויות
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              סיסמה
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? "מתחבר..." : "התחברות"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          עדיין אין לך חשבון?{" "}
          <Link href="/signup" className="font-medium text-primary">
            הרשמה
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-foreground-muted">
          משתמש דמו: demo@shop.app — סיסמה: shop1234
        </p>
      </div>
    </div>
  );
}
