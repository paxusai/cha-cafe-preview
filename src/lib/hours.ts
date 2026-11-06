import type { DayKey, Interval, Location } from "./types";

/** Chamorro Time: Pacific/Saipan, UTC+10, no daylight saving. */
export const SAIPAN_TZ = "Pacific/Saipan";

export const DAYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const DAY_LABEL: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};
const WEEK_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export interface SaipanNow {
  day: DayKey;
  minutes: number; // minutes since local midnight
}

export function saipanNow(date = new Date()): SaipanNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SAIPAN_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday").slice(0, 3).toLowerCase() as DayKey;
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 && h < 24 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

export function formatInterval([o, c]: Interval) {
  return `${formatTime(o)}–${formatTime(c)}`;
}

export interface OpenStatus {
  open: boolean;
  /** "Open now · Closes at 6 PM" / "Closed · Opens at 7 AM tomorrow" */
  label: string;
  short: string;
  closingSoon: boolean;
}

export function openStatus(loc: Pick<Location, "hours">, now: SaipanNow = saipanNow()): OpenStatus {
  const today = loc.hours[now.day] ?? [];
  for (const [o, c] of today) {
    const om = toMin(o);
    const cm = toMin(c);
    if (now.minutes >= om && now.minutes < cm) {
      const left = cm - now.minutes;
      return {
        open: true,
        label: `Open now · Closes at ${formatTime(c)}`,
        short: `Closes ${formatTime(c)}`,
        closingSoon: left <= 45,
      };
    }
  }
  // Later today?
  const later = today.find(([o]) => toMin(o) > now.minutes);
  if (later) {
    return { open: false, label: `Closed · Opens at ${formatTime(later[0])}`, short: `Opens ${formatTime(later[0])}`, closingSoon: false };
  }
  // Next day with hours
  const idx = DAYS.indexOf(now.day);
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(idx + i) % 7];
    const first = loc.hours[d]?.[0];
    if (first) {
      const when = i === 1 ? "tomorrow" : DAY_LABEL[d];
      return {
        open: false,
        label: `Closed · Opens at ${formatTime(first[0])} ${when}`,
        short: `Opens ${formatTime(first[0])} ${i === 1 ? "tmrw" : DAY_LABEL[d]}`,
        closingSoon: false,
      };
    }
  }
  return { open: false, label: "Closed", short: "Closed", closingSoon: false };
}

export function todayHours(loc: Pick<Location, "hours">, now: SaipanNow = saipanNow()) {
  const t = loc.hours[now.day] ?? [];
  return t.length ? t.map(formatInterval).join(", ") : "Closed today";
}

/** Collapse a weekly schedule into rows like "Mon–Fri 7 AM–6 PM". */
export function weeklyRows(loc: Pick<Location, "hours">) {
  const rows: { days: string; hours: string }[] = [];
  let start = 0;
  const key = (d: DayKey) => (loc.hours[d] ?? []).map(formatInterval).join(", ") || "Closed";
  for (let i = 1; i <= WEEK_ORDER.length; i++) {
    if (i === WEEK_ORDER.length || key(WEEK_ORDER[i]) !== key(WEEK_ORDER[start])) {
      const a = DAY_LABEL[WEEK_ORDER[start]];
      const b = DAY_LABEL[WEEK_ORDER[i - 1]];
      rows.push({ days: start === i - 1 ? a : start === 0 && i === 7 ? "Daily" : `${a}–${b}`, hours: key(WEEK_ORDER[start]) });
      start = i;
    }
  }
  return rows;
}

/** schema.org openingHoursSpecification */
export function openingHoursSpec(loc: Pick<Location, "hours">) {
  const map: Record<DayKey, string> = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  return WEEK_ORDER.flatMap((d) =>
    (loc.hours[d] ?? []).map(([opens, closes]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${map[d]}`,
      opens,
      closes,
    })),
  );
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Unconfirmed pins route by plus code or name so nobody is sent to a placeholder coordinate. */
export function directionsUrl(loc: Location) {
  if (loc.geo?.confirmed) return `https://www.google.com/maps/dir/?api=1&destination=${loc.geo.lat},${loc.geo.lng}`;
  const q = loc.plusCode ?? `${loc.address.street}, ${loc.address.locality}, Saipan`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
