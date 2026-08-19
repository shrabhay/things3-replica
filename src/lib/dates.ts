import {
  format,
  formatISO,
  isAfter,
  isBefore,
  isToday as dfIsToday,
  isTomorrow as dfIsTomorrow,
  isYesterday as dfIsYesterday,
  parseISO,
  startOfDay,
} from "date-fns";

export function todayISO(): string {
  return formatISO(startOfDay(new Date()), { representation: "date" });
}

export function toISODate(date: Date): string {
  return formatISO(startOfDay(date), { representation: "date" });
}

export function isPastDate(iso: string): boolean {
  return isBefore(parseISO(iso), startOfDay(new Date()));
}

export function isFutureDate(iso: string): boolean {
  return isAfter(parseISO(iso), startOfDay(new Date()));
}

export function isTodayDate(iso: string): boolean {
  return dfIsToday(parseISO(iso));
}

/** Friendly label like Things: "Today", "Tomorrow", "Mon 12 Aug", "12 Aug 2027". */
export function formatFriendlyDate(iso: string): string {
  const date = parseISO(iso);
  if (dfIsToday(date)) return "Today";
  if (dfIsTomorrow(date)) return "Tomorrow";
  if (dfIsYesterday(date)) return "Yesterday";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return format(date, sameYear ? "EEE d MMM" : "d MMM yyyy");
}

export function formatLogDate(iso: number): string {
  const date = new Date(iso);
  if (dfIsToday(date)) return "Today";
  if (dfIsYesterday(date)) return "Yesterday";
  return format(date, "EEEE d MMMM yyyy");
}
