import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Truck, Car, MapPin, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { computeStoreBaskets } from "@/lib/basket";
import { PRICE_SOURCE_LABELS } from "@/lib/constants";
import { updateItemQuantityAction } from "@/lib/actions/items";

export default async function ComparePage({
  params,
}: PageProps<"/lists/[id]/compare">) {
  const { id } = await params;
  const session = await requireSession();

  const list = await prisma.shoppingList.findFirst({
    where: { id, ownerId: session.userId },
  });
  if (!list) notFound();

  const homeLocation = await prisma.homeLocation.findUnique({
    where: { userId: session.userId },
  });

  const baskets = await computeStoreBaskets(
    list.id,
    homeLocation ? { lat: homeLocation.lat, lng: homeLocation.lng } : null,
    homeLocation?.radiusKm ?? 999
  );

  const withPrices = baskets.filter((b) => b.matchedCount > 0);
  const sorted = [...withPrices].sort((a, b) => a.total - b.total);
  const top3 = sorted.slice(0, 3);
  const cheapestId = top3[0]?.storeId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/lists/${list.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-muted"
        >
          <ArrowRight size={18} />
        </Link>
        <h1 className="text-xl font-bold">השוואת מחירים — {list.name}</h1>
      </div>

      {!homeLocation && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
          לא הוגדר מיקום בית, לכן מוצגות כל החנויות ללא סינון לפי מרחק.{" "}
          <Link href="/settings" className="font-semibold underline">
            הגדירו מיקום ורדיוס חיפוש
          </Link>
        </div>
      )}

      {top3.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-foreground-muted">
          לא נמצאו מחירים לפריטים ברשימה בחנויות הקרובות. נסו להרחיב את הרדיוס
          בהגדרות, או הוסיפו פריטים מהקטלוג (עם השלמה אוטומטית) במקום טקסט חופשי.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {top3.map((basket) => (
            <div
              key={basket.storeId}
              className={`flex flex-col gap-3 rounded-xl border p-4 ${
                basket.storeId === cheapestId
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold">
                      {basket.chain} — {basket.branch}
                    </h2>
                    {basket.storeId === cheapestId && (
                      <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                        <Award size={11} />
                        המחיר הזול ביותר
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-foreground-muted">
                    <MapPin size={12} />
                    {basket.address} · {basket.distanceKm.toFixed(1)} ק&quot;מ
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">₪{basket.total.toFixed(2)}</div>
                  <div className="text-xs text-foreground-muted">
                    {basket.matchedCount} מתוך {basket.matchedCount + basket.unmatchedCount} פריטים תומחרו
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                {basket.oldestPriceUpdatedAt && (
                  <span className="rounded-full bg-surface-muted px-2 py-1">
                    עודכן לפני{" "}
                    {formatDistanceToNow(basket.oldestPriceUpdatedAt, { locale: he })}
                  </span>
                )}
                <span className="rounded-full bg-surface-muted px-2 py-1">
                  {basket.hasCrowdSourcedPrice
                    ? `${PRICE_SOURCE_LABELS.OFFICIAL_FEED} + ${PRICE_SOURCE_LABELS.CROWD}`
                    : PRICE_SOURCE_LABELS.OFFICIAL_FEED}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1">
                  <Car size={12} />
                  כ-{basket.travelMinutes} דק&apos; נסיעה
                </span>
              </div>

              {basket.hasDelivery && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs">
                  <Truck size={14} className="shrink-0 text-accent" />
                  <span>
                    משלוח: ₪{basket.deliveryFee?.toFixed(2)}
                    {basket.deliveryEtaMin ? ` · זמן אספקה כ-${basket.deliveryEtaMin} דק'` : ""}
                    {basket.deliveryMinOrder
                      ? ` · מינימום הזמנה ₪${basket.deliveryMinOrder.toFixed(0)}`
                      : ""}
                  </span>
                  {!basket.meetsDeliveryMinimum && (
                    <span className="font-semibold text-warning">הסל קטן מהמינימום</span>
                  )}
                  {basket.totalWithDelivery != null && (
                    <span className="mr-auto font-semibold">
                      סה&quot;כ עם משלוח: ₪{basket.totalWithDelivery.toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              <details className="text-sm">
                <summary className="cursor-pointer text-xs font-medium text-foreground-muted">
                  פירוט פריטים
                </summary>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {basket.items.map((item) => (
                    <li
                      key={item.itemId}
                      className="flex flex-col gap-1 border-t border-border pt-1.5 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          {item.matched ? (
                            <>
                              ₪{item.lineTotal?.toFixed(2)}
                              {item.promoApplied && (
                                <span className="mr-1 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                                  {item.promoLabel}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-foreground-muted">אין מחיר</span>
                          )}
                        </span>
                      </div>
                      {item.promoSuggestion && (
                        <div className="flex items-center justify-between rounded-md bg-accent/10 px-2 py-1 text-[11px] text-accent">
                          <span>
                            יש מבצע {item.promoSuggestion.promoLabel} — הוסיפו{" "}
                            {item.promoSuggestion.unitsNeeded} יח׳ נוספות וחסכו כ-₪
                            {item.promoSuggestion.estimatedSavings.toFixed(2)}
                          </span>
                          <form action={updateItemQuantityAction}>
                            <input type="hidden" name="itemId" value={item.itemId} />
                            <input
                              type="hidden"
                              name="quantity"
                              value={item.quantity + item.promoSuggestion.unitsNeeded}
                            />
                            <button
                              type="submit"
                              className="rounded bg-accent px-2 py-0.5 font-semibold text-white"
                            >
                              התאמת כמות
                            </button>
                          </form>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
