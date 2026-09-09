"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

async function assertOwnsList(listId: string, userId: string) {
  const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
  if (!list || list.ownerId !== userId) throw new Error("NOT_FOUND");
}

export async function addItemAction(formData: FormData) {
  const session = await requireSession();
  const listId = String(formData.get("listId") ?? "");
  const productId = String(formData.get("productId") ?? "").trim() || null;
  const freeText = String(formData.get("query") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1) || 1;
  const unit = String(formData.get("unit") ?? "UNIT");

  await assertOwnsList(listId, session.userId);
  if (!productId && !freeText) return;

  const existing = productId
    ? await prisma.shoppingListItem.findFirst({
        where: { listId, productId, checked: false },
      })
    : null;

  if (existing) {
    await prisma.shoppingListItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.shoppingListItem.create({
      data: {
        listId,
        productId,
        freeTextName: productId ? null : freeText,
        quantity,
        unit,
      },
    });
  }

  revalidatePath(`/lists/${listId}`);
}

export async function toggleItemAction(formData: FormData) {
  const session = await requireSession();
  const itemId = String(formData.get("itemId") ?? "");
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { list: true },
  });
  if (!item || item.list.ownerId !== session.userId) throw new Error("NOT_FOUND");

  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { checked: !item.checked },
  });
  revalidatePath(`/lists/${item.listId}`);
}

export async function updateItemQuantityAction(formData: FormData) {
  const session = await requireSession();
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { list: true },
  });
  if (!item || item.list.ownerId !== session.userId) throw new Error("NOT_FOUND");
  if (quantity <= 0) return;

  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { quantity },
  });
  revalidatePath(`/lists/${item.listId}`);
}

export async function deleteItemAction(formData: FormData) {
  const session = await requireSession();
  const itemId = String(formData.get("itemId") ?? "");
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { list: true },
  });
  if (!item || item.list.ownerId !== session.userId) throw new Error("NOT_FOUND");

  await prisma.shoppingListItem.delete({ where: { id: itemId } });
  revalidatePath(`/lists/${item.listId}`);
}

export async function addSuggestedItemAction(formData: FormData) {
  const session = await requireSession();
  const listId = String(formData.get("listId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  await assertOwnsList(listId, session.userId);

  const existing = await prisma.shoppingListItem.findFirst({
    where: { listId, productId },
  });
  if (existing) return;

  await prisma.shoppingListItem.create({
    data: { listId, productId, quantity: 1, unit: "UNIT" },
  });
  revalidatePath(`/lists/${listId}`);
}
