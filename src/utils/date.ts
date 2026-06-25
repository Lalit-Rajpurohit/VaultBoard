import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isThisYear,
  startOfDay,
  endOfDay,
  isWithinInterval,
  addDays,
} from 'date-fns';

import type { Timestamp } from '@/types';

export function now(): Timestamp {
  return Date.now();
}

/** "2h ago", "3 days ago" — for last-edited labels. */
export function relativeTime(ts: Timestamp): string {
  return formatDistanceToNow(ts, { addSuffix: true });
}

/** Human friendly due-date label. */
export function dueLabel(ts: Timestamp | null): string {
  if (ts == null) return '';
  const d = new Date(ts);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, isThisYear(d) ? 'MMM d' : 'MMM d, yyyy');
}

export function fullDate(ts: Timestamp): string {
  return format(ts, 'EEEE, MMM d');
}

export function isOverdue(ts: Timestamp | null): boolean {
  return ts != null && ts < startOfDay(new Date()).getTime();
}

export function isDueToday(ts: Timestamp | null): boolean {
  if (ts == null) return false;
  return isWithinInterval(ts, {
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
}

export function isUpcoming(ts: Timestamp | null, days = 7): boolean {
  if (ts == null) return false;
  return isWithinInterval(ts, {
    start: startOfDay(new Date()),
    end: endOfDay(addDays(new Date(), days)),
  });
}

export { startOfDay, endOfDay, addDays };
