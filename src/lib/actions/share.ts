"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function createShareAction(formData: FormData) {
  const session = await requireSession();
  const listId = String(formData.get("listId") ?? "");
  const permission = String(formData.get("permission") ?? "EDIT");

  const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
  if (!list || list.ownerId !== session.userId) throw new Error("NOT_FOUND");

  await prisma.listShare.create({
    data: { listId, token: randomUUID(), permission },
  });
  revalidatePath(`/lists/${listId}`);
}

export async function revokeShareAction(formData: FormData) {
  const session = await requireSession();
  const shareId = String(formData.get("shareId") ?? "");
  const share = await prisma.listShare.findUnique({
    where: { id: shareId },
    include: { list: true },
  });
  if (!share || share.list.ownerId !== session.userId) throw new Error("NOT_FOUND");

  await prisma.listShare.delete({ where: { id: shareId } });
  revalidatePath(`/lists/${share.listId}`);
}
