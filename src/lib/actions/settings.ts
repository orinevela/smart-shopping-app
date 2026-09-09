"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export type SettingsState = { error?: string; success?: boolean } | null;

export async function saveHomeLocationAction(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await requireSession();
  const label = String(formData.get("label") ?? "בית").trim() || "בית";
  const address = String(formData.get("address") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const radiusKm = Number(formData.get("radiusKm") ?? 5) || 5;

  if (!address || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: "נא להזין כתובת ומיקום תקינים" };
  }

  await prisma.homeLocation.upsert({
    where: { userId: session.userId },
    update: { label, address, lat, lng, radiusKm },
    create: { userId: session.userId, label, address, lat, lng, radiusKm },
  });

  revalidatePath("/settings");
  revalidatePath("/lists");
  return { success: true };
}
