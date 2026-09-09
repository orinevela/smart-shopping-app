import { PrismaClient } from "@prisma/client";
import { seedDemoData } from "../src/lib/seed-data";

const prisma = new PrismaClient();

seedDemoData(prisma)
  .then((summary) => console.log("Seed complete:", summary))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
