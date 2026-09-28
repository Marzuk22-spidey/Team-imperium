import { DayOfWeek, Holiday } from '../types';

export const SEMESTER_START = '2026-08-29';
export const SEMESTER_END = '2026-11-29';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Parses YYYY-MM-DD string into a Date object at UTC midnight to avoid local timezone shifts.
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Formats a Date object into YYYY-MM-DD.
 */
export function toDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns user's dynamic browser/device date formatted as YYYY-MM-DD.
 */
export function getSystemDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns formatted human-readable date, e.g. "27 Sep 2026"
 */
export function formatReadableDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  return d.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns formatted date with weekday, e.g. "Sun, 27 Sep 2026"
 */
export function formatDateWithDay(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  return d.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns the DayOfWeek enum string for a given Date or YYYY-MM-DD.
 */
export function getDayOfWeek(dateInput: string | Date): DayOfWeek {
  const d = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  return DAYS_OF_WEEK[d.getUTCDay()];
}

/**
 * Calculates remaining days between two dates.
 */
export function getDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = parseDateString(startDateStr);
  const end = parseDateString(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Checks if a date falls on a weekend (Saturday or Sunday).
 */
export function isWeekend(dateInput: string | Date): boolean {
  const day = getDayOfWeek(dateInput);
  return day === 'Saturday' || day === 'Sunday';
}

/**
 * Checks if a date is registered in the holidays array.
 */
export function isHolidayDate(dateStr: string, holidays: Holiday[]): { isHoliday: boolean; holiday?: Holiday } {
  const found = holidays.find((h) => h.date === dateStr);
  return {
    isHoliday: !!found,
    holiday: found,
  };
}

/**
 * Determines effective calculation start date:
 * If today < SEMESTER_START (2026-08-29), use 2026-08-29.
 * If today > SEMESTER_END (2026-11-29), indicate semester ended.
 */
export function getEffectiveStartDate(simulatedDate?: string): {
  effectiveDate: string;
  isBeforeSemester: boolean;
  isAfterSemester: boolean;
} {
  const activeDate = simulatedDate || getSystemDateString();
  
  if (activeDate < SEMESTER_START) {
    return {
      effectiveDate: SEMESTER_START,
      isBeforeSemester: true,
      isAfterSemester: false,
    };
  }
  
  if (activeDate > SEMESTER_END) {
    return {
      effectiveDate: SEMESTER_END,
      isBeforeSemester: false,
      isAfterSemester: true,
    };
  }

  return {
    effectiveDate: activeDate,
    isBeforeSemester: false,
    isAfterSemester: false,
  };
}
