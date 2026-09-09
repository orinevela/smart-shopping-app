"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

async function assertOwnsList(listId: string, userId: string) {
  const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
  if (!list || list.ownerId !== userId) throw new Error("NOT_FOUND");
  return list;
}

export async function createListAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim() || "רשימה חדשה";

  const list = await prisma.shoppingList.create({
    data: { ownerId: session.userId, name },
  });
  redirect(`/lists/${list.id}`);
}

export async function duplicateListAction(formData: FormData) {
  const session = await requireSession();
  const sourceId = String(formData.get("listId") ?? "");
  const source = await prisma.shoppingList.findFirst({
    where: { id: sourceId, ownerId: session.userId },
    include: { items: true },
  });
  if (!source) throw new Error("NOT_FOUND");

  const list = await prisma.shoppingList.create({
    data: {
      ownerId: session.userId,
      name: `${source.name} (עותק)`,
      items: {
        create: source.items.map((item) => ({
          productId: item.productId,
          freeTextName: item.freeTextName,
          quantity: item.quantity,
          unit: item.unit,
          checked: false,
        })),
      },
    },
  });
  redirect(`/lists/${list.id}`);
}

export async function renameListAction(formData: FormData) {
  const session = await requireSession();
  const listId = String(formData.get("listId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  await assertOwnsList(listId, session.userId);
  if (!name) return;

  await prisma.shoppingList.update({ where: { id: listId }, data: { name } });
  revalidatePath(`/lists/${listId}`);
  revalidatePath("/lists");
}

export async function completeListAction(formData: FormData) {
  const session = await requireSession();
  const listId = String(formData.get("listId") ?? "");
  await assertOwnsList(listId, session.userId);

  await prisma.shoppingList.update({
    where: { id: listId },
    data: { status: "completed", completedAt: new Date() },
  });
  revalidatePath("/lists");
  redirect("/history");
}

export async function deleteListAction(formData: FormData) {
  const session = await requireSession();
  const listId = String(formData.get("listId") ?? "");
  await assertOwnsList(listId, session.userId);

  await prisma.shoppingList.delete({ where: { id: listId } });
  revalidatePath("/lists");
  revalidatePath("/history");
}
