// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Date arithmetic shared by the round-2 PSA hooks (leave, trips, timesheets).
 * Everything works on calendar dates at UTC midnight so a `YYYY-MM-DD` string,
 * an ISO timestamp and a Date all land on the same day.
 */

const DAY_MS = 86_400_000;

/** Parse a date-ish value to UTC midnight, or null when it is not a date. */
export function toUtcDay(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Calendar days from `start` to `end`, both inclusive; 0 when either is missing or reversed. */
export function calendarDays(start: unknown, end: unknown): number {
  const a = toUtcDay(start); const b = toUtcDay(end);
  if (!a || !b || b < a) return 0;
  return Math.round((b.getTime() - a.getTime()) / DAY_MS) + 1;
}

/** Working days (Mon–Fri) from `start` to `end`, both inclusive; 0 when either is missing or reversed. */
export function weekdaysBetween(start: unknown, end: unknown): number {
  const a = toUtcDay(start); const b = toUtcDay(end);
  if (!a || !b || b < a) return 0;
  let n = 0;
  for (let t = a.getTime(); t <= b.getTime(); t += DAY_MS) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) n += 1;
  }
  return n;
}

/** First and last calendar day of the month that contains `value`, or null. */
export function monthBounds(value: unknown): { start: Date; end: Date } | null {
  const d = toUtcDay(value);
  if (!d) return null;
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return { start, end };
}

/** Working days of [start, end] that fall inside the month containing `month`. */
export function weekdaysInMonth(start: unknown, end: unknown, month: unknown): number {
  const m = monthBounds(month); const a = toUtcDay(start); const b = toUtcDay(end);
  if (!m || !a || !b) return 0;
  const from = a > m.start ? a : m.start;
  const to = b < m.end ? b : m.end;
  return weekdaysBetween(from, to);
}

/** `YYYY-MM-DD` of a UTC day. */
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
