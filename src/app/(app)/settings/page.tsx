import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { HomeLocationForm } from "@/components/home-location-form";

export default async function SettingsPage() {
  const session = await requireSession();
  const homeLocation = await prisma.homeLocation.findUnique({
    where: { userId: session.userId },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">הגדרות</h1>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground-muted">
          מיקום ורדיוס חיפוש חנויות
        </h2>
        <p className="mb-3 text-xs text-foreground-muted">
          המיקום משמש רק לחישוב מרחקים והשוואת מחירים בין חנויות, ולא נשלח החוצה.
        </p>
        <HomeLocationForm initial={homeLocation} />
      </div>
    </div>
  );
}
