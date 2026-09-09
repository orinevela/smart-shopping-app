"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleSharedItemAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const itemId = String(formData.get("itemId") ?? "");

  const share = await prisma.listShare.findUnique({ where: { token } });
  if (!share || share.permission !== "EDIT") return;

  const item = await prisma.shoppingListItem.findFirst({
    where: { id: itemId, listId: share.listId },
  });
  if (!item) return;

  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { checked: !item.checked },
  });
  revalidatePath(`/s/${token}`);
}
