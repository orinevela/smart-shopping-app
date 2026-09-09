"use client";

import { useActionState, useState } from "react";
import { LocateFixed } from "lucide-react";
import { saveHomeLocationAction } from "@/lib/actions/settings";

type Props = {
  initial: {
    label: string;
    address: string;
    lat: number;
    lng: number;
    radiusKm: number;
  } | null;
};

export function HomeLocationForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState(saveHomeLocationAction, null);
  const [lat, setLat] = useState(initial?.lat ?? 32.0853);
  const [lng, setLng] = useState(initial?.lng ?? 34.7818);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("שירות המיקום אינו זמין בדפדפן הזה");
      return;
    }
    setGeoStatus("מאתר מיקום...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoStatus("המיקום עודכן מה-GPS");
      },
      () => setGeoStatus("לא הצלחנו לאתר מיקום — ניתן להזין ידנית"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="label" className="text-sm font-medium">כינוי</label>
        <input
          id="label"
          name="label"
          defaultValue={initial?.label ?? "בית"}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium">כתובת</label>
        <input
          id="address"
          name="address"
          defaultValue={initial?.address ?? ""}
          required
          placeholder="רחוב, עיר"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lat" className="text-sm font-medium">קו רוחב</label>
          <input
            id="lat"
            name="lat"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lng" className="text-sm font-medium">קו אורך</label>
          <input
            id="lng"
            name="lng"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={useMyLocation}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-muted"
      >
        <LocateFixed size={14} />
        שימוש במיקום הנוכחי (GPS)
      </button>
      {geoStatus && <p className="text-xs text-foreground-muted">{geoStatus}</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="radiusKm" className="text-sm font-medium">רדיוס חיפוש חנויות</label>
        <select
          id="radiusKm"
          name="radiusKm"
          defaultValue={String(initial?.radiusKm ?? 5)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {[1, 3, 5, 10].map((km) => (
            <option key={km} value={km}>
              {km} ק&quot;מ
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">המיקום נשמר</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? "שומר..." : "שמירה"}
      </button>
    </form>
  );
}
