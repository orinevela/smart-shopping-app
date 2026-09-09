import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDemoData } from "@/lib/seed-data";

/**
 * One-time database seeding for hosts (e.g. Vercel) with no shell access to
 * the production database. Requires the SEED_SECRET env var to be set and
 * passed back as a bearer token — without it, the endpoint refuses to run.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "SEED_SECRET is not configured on the server" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const summary = await seedDemoData(prisma);
  return NextResponse.json({ ok: true, ...summary });
}
