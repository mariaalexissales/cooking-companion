export type ExpiryStatus = 'expired' | 'critical' | 'soon' | 'fresh' | 'none';

export interface ExpiryInfo {
  status: ExpiryStatus;
  days: number | null;
  label: string;
}

const CRITICAL_DAYS = 3;
const SOON_DAYS = 7;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole days from today to `date`, negative once the date has passed. */
export function daysUntil(date: Date, now: Date = new Date()): number {
  const msPerDay = 86_400_000;
  return Math.round((startOfDay(date) - startOfDay(now)) / msPerDay);
}

export function describeExpiry(expiresAt: Date | undefined, now: Date = new Date()): ExpiryInfo {
  if (!expiresAt) return { status: 'none', days: null, label: 'No date' };

  const days = daysUntil(expiresAt, now);

  if (days < 0) {
    const ago = Math.abs(days);
    return {
      status: 'expired',
      days,
      label: ago === 1 ? 'Expired yesterday' : `Expired ${ago} days ago`,
    };
  }
  if (days === 0) return { status: 'critical', days, label: 'Expires today' };
  if (days === 1) return { status: 'critical', days, label: 'Expires tomorrow' };
  if (days <= CRITICAL_DAYS) return { status: 'critical', days, label: `${days} days left` };
  if (days <= SOON_DAYS) return { status: 'soon', days, label: `${days} days left` };
  return { status: 'fresh', days, label: `${days} days left` };
}

/** Items worth acting on: already expired, or inside the critical window. */
export function isUrgent(expiresAt: Date | undefined, now: Date = new Date()): boolean {
  const { status } = describeExpiry(expiresAt, now);
  return status === 'expired' || status === 'critical';
}

/** `Date` to the `yyyy-mm-dd` a native date input expects, in local time. */
export function toDateInputValue(date: Date | undefined): string {
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `yyyy-mm-dd` from a native date input to a local-midnight `Date`. */
export function fromDateInputValue(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

/** Sort comparator: soonest expiry first, undated items last. */
export function byExpiry(a: { expiresAt?: Date }, b: { expiresAt?: Date }): number {
  if (!a.expiresAt && !b.expiresAt) return 0;
  if (!a.expiresAt) return 1;
  if (!b.expiresAt) return -1;
  return a.expiresAt.getTime() - b.expiresAt.getTime();
}
