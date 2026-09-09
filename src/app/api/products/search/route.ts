import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { aliases: { contains: q } },
      ],
    },
    take: 8,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      defaultUnit: p.defaultUnit,
    }))
  );
}
