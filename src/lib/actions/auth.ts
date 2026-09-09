"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";

export type AuthState = { error?: string } | null;

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "נא למלא אימייל וסיסמה" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "אימייל או סיסמה שגויים" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "אימייל או סיסמה שגויים" };
  }

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);
  redirect("/lists");
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || !name) {
    return { error: "נא למלא את כל השדות" };
  }
  if (password.length < 6) {
    return { error: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "כבר קיים משתמש עם אימייל זה" };
  }

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password) },
  });

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);
  redirect("/lists");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
