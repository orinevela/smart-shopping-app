import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const DAY = 24 * 60 * 60 * 1000;
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(Date.now() - d * DAY);

type ProductSeed = {
  name: string;
  category: string;
  defaultUnit: string;
  aliases?: string;
  prices: {
    store: { id: string };
    price: number;
    promoLabel?: string;
    promoUnitPrice?: number;
    promoMinQty?: number;
    source?: string;
    updatedAt?: Date;
  }[];
};

/**
 * Wipes and repopulates the database with a demo user, four stores, a
 * grocery catalog with prices/promos, and a couple of shopping lists —
 * used by both `prisma/seed.ts` (local/CI) and the `/api/admin/seed`
 * one-time endpoint (for hosts, like Vercel, with no shell access to the
 * production database).
 */
export async function seedDemoData(prisma: PrismaClient) {
  await prisma.listShare.deleteMany();
  await prisma.shoppingListItem.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.homeLocation.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("shop1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@shop.app",
      name: "דנה",
      passwordHash,
      homeLocation: {
        create: {
          label: "בית",
          address: "רחוב דיזנגוף 100, תל אביב",
          lat: 32.0809,
          lng: 34.7806,
          radiusKm: 5,
        },
      },
    },
  });

  const shufersal = await prisma.store.create({
    data: {
      chain: "שופרסל דיל",
      branch: "סניף אבן גבירול",
      address: "אבן גבירול 60, תל אביב",
      lat: 32.0836,
      lng: 34.7822,
    },
  });

  const ramiLevy = await prisma.store.create({
    data: {
      chain: "רמי לוי",
      branch: "סניף גבעתיים",
      address: "כביש ז'בוטינסקי 45, גבעתיים",
      lat: 32.0723,
      lng: 34.8107,
      hasDelivery: true,
      deliveryFee: 25,
      deliveryMinOrder: 150,
      deliveryEtaMin: 120,
    },
  });

  const victory = await prisma.store.create({
    data: {
      chain: "ויקטורי",
      branch: "סניף רמת אביב",
      address: "איינשטיין 10, תל אביב",
      lat: 32.1125,
      lng: 34.8034,
    },
  });

  // A distant store with no seeded prices, to demonstrate radius filtering.
  await prisma.store.create({
    data: {
      chain: "יינות ביתן",
      branch: "סניף רעננה",
      address: "אחוזה 100, רעננה",
      lat: 32.1847,
      lng: 34.8706,
    },
  });

  const products: ProductSeed[] = [
    {
      name: "חלב 3% (ליטר)",
      category: "DAIRY_CHILLED",
      defaultUnit: "LITER",
      aliases: "milk,חלב טרי",
      prices: [
        { store: shufersal, price: 6.9, updatedAt: hoursAgo(6) },
        {
          store: ramiLevy,
          price: 6.5,
          promoLabel: "2 ב-11 ₪",
          promoUnitPrice: 5.5,
          promoMinQty: 2,
          updatedAt: hoursAgo(10),
        },
        { store: victory, price: 7.2, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "גבינה לבנה 5%",
      category: "DAIRY_CHILLED",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 6.4, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 5.9, updatedAt: hoursAgo(10) },
        { store: victory, price: 6.9, source: "CROWD", updatedAt: daysAgo(3) },
      ],
    },
    {
      name: "יוגורט טבעי",
      category: "DAIRY_CHILLED",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 5.2, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 4.9, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "חמאה 200 גרם",
      category: "DAIRY_CHILLED",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 8.9, updatedAt: hoursAgo(6) },
        { store: victory, price: 9.4, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "עגבניות",
      category: "PRODUCE",
      defaultUnit: "KG",
      prices: [
        { store: shufersal, price: 7.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 6.9, updatedAt: hoursAgo(10) },
        { store: victory, price: 8.5, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "מלפפונים",
      category: "PRODUCE",
      defaultUnit: "KG",
      prices: [
        { store: shufersal, price: 5.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 4.9, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "בננות",
      category: "PRODUCE",
      defaultUnit: "KG",
      prices: [
        { store: shufersal, price: 6.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 5.9, updatedAt: hoursAgo(10) },
        { store: victory, price: 6.5, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "תפוחי אדמה",
      category: "PRODUCE",
      defaultUnit: "KG",
      prices: [
        { store: shufersal, price: 4.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 3.9, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "חזה עוף",
      category: "MEAT_FISH",
      defaultUnit: "KG",
      prices: [
        { store: shufersal, price: 39.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 34.9, updatedAt: hoursAgo(10) },
        { store: victory, price: 42.9, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "בשר טחון",
      category: "MEAT_FISH",
      defaultUnit: "KG",
      prices: [
        { store: shufersal, price: 54.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 49.9, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "אורז לבן 1 ק\"ג",
      category: "DRY_GOODS",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 8.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 7.5, updatedAt: hoursAgo(10) },
        { store: victory, price: 9.2, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "פסטה 500 גרם",
      category: "DRY_GOODS",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 5.9, updatedAt: hoursAgo(6) },
        {
          store: ramiLevy,
          price: 4.9,
          promoLabel: "3 ב-12 ₪",
          promoUnitPrice: 4,
          promoMinQty: 3,
          updatedAt: hoursAgo(10),
        },
      ],
    },
    {
      name: "קמח לבן 1 ק\"ג",
      category: "DRY_GOODS",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 5.5, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 4.9, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "קפה נמס",
      category: "DRY_GOODS",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 22.9, updatedAt: hoursAgo(6) },
        { store: victory, price: 24.9, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "לחם אחיד",
      category: "BAKERY",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 7.2, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 6.5, updatedAt: hoursAgo(10) },
        { store: victory, price: 7.9, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "חלה",
      category: "BAKERY",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 12.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 11.5, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "אפונה קפואה",
      category: "FROZEN",
      defaultUnit: "PACK",
      prices: [
        { store: shufersal, price: 9.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 8.5, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "פיצה קפואה",
      category: "FROZEN",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 19.9, updatedAt: hoursAgo(6) },
        { store: victory, price: 21.9, updatedAt: daysAgo(1) },
      ],
    },
    {
      name: "נייר טואלט 24 גלילים",
      category: "CLEANING_TOILETRIES",
      defaultUnit: "PACK",
      prices: [
        {
          store: shufersal,
          price: 34.9,
          promoLabel: "20% הנחה למועדון",
          promoUnitPrice: 27.9,
          promoMinQty: 1,
          updatedAt: hoursAgo(6),
        },
        { store: ramiLevy, price: 29.9, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "סבון כלים",
      category: "CLEANING_TOILETRIES",
      defaultUnit: "UNIT",
      prices: [
        { store: shufersal, price: 8.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 7.9, updatedAt: hoursAgo(10) },
      ],
    },
    {
      name: "אבקת כביסה",
      category: "CLEANING_TOILETRIES",
      defaultUnit: "PACK",
      prices: [
        { store: shufersal, price: 32.9, updatedAt: hoursAgo(6) },
        { store: victory, price: 35.9, source: "CROWD", updatedAt: daysAgo(2) },
      ],
    },
    {
      name: "שקיות זבל",
      category: "OTHER",
      defaultUnit: "PACK",
      prices: [
        { store: shufersal, price: 14.9, updatedAt: hoursAgo(6) },
        { store: ramiLevy, price: 12.9, updatedAt: hoursAgo(10) },
      ],
    },
  ];

  const createdProducts = new Map<string, string>();
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        category: p.category,
        defaultUnit: p.defaultUnit,
        aliases: p.aliases ?? "",
        prices: {
          create: p.prices.map((price) => ({
            storeId: price.store.id,
            price: price.price,
            promoLabel: price.promoLabel,
            promoUnitPrice: price.promoUnitPrice,
            promoMinQty: price.promoMinQty,
            source: price.source ?? "OFFICIAL_FEED",
            updatedAt: price.updatedAt ?? new Date(),
          })),
        },
      },
    });
    createdProducts.set(p.name, created.id);
  }

  const byName = (name: string) => createdProducts.get(name)!;

  // Two completed lists in the past few weeks, both containing milk and eggs-like
  // staples, so the recurring-item suggestion has something to detect.
  for (const weeksAgo of [2, 5]) {
    const completedAt = daysAgo(weeksAgo * 7);
    await prisma.shoppingList.create({
      data: {
        ownerId: user.id,
        name: "קניה שבועית",
        status: "completed",
        createdAt: new Date(completedAt.getTime() - 2 * DAY),
        completedAt,
        items: {
          create: [
            { productId: byName("חלב 3% (ליטר)"), quantity: 2, unit: "LITER", checked: true },
            { productId: byName("לחם אחיד"), quantity: 1, unit: "UNIT", checked: true },
            { productId: byName("עגבניות"), quantity: 1, unit: "KG", checked: true },
            { productId: byName("נייר טואלט 24 גלילים"), quantity: 1, unit: "PACK", checked: true },
          ],
        },
      },
    });
  }

  // The active demo list.
  await prisma.shoppingList.create({
    data: {
      ownerId: user.id,
      name: "קניה שבועית",
      status: "active",
      items: {
        create: [
          { productId: byName("עגבניות"), quantity: 1.5, unit: "KG" },
          { productId: byName("מלפפונים"), quantity: 1, unit: "KG" },
          { productId: byName("חזה עוף"), quantity: 1, unit: "KG" },
          { productId: byName("פסטה 500 גרם"), quantity: 2, unit: "UNIT" },
          { productId: byName("חלה"), quantity: 1, unit: "UNIT" },
          { freeTextName: "תבלין אישי (לא בקטלוג)", quantity: 1, unit: "UNIT" },
        ],
      },
    },
  });

  return { user: user.email, products: createdProducts.size, stores: 4 };
}
