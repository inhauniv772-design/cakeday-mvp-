import type { Anniversary, DDayInfo } from '../types';

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

const MS_PER_DAY = 86_400_000;

export function getTodayDateParts(): DateParts {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function formatDateParts(parts: DateParts): string {
  const y = String(parts.year).padStart(4, '0');
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayString(): string {
  return formatDateParts(getTodayDateParts());
}

export function parseDateString(dateStr: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  const maxDay = getDaysInMonth(year, month);
  if (day < 1 || day > maxDay) return null;
  return { year, month, day };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getFirstWeekdayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 (Sun) - 6 (Sat)
}

export function toUtcEpochDay(parts: DateParts): number {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY);
}

export function addDaysToDateParts(parts: DateParts, offsetDays: number): DateParts {
  const target = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + offsetDays)
  );
  return {
    year: target.getUTCFullYear(),
    month: target.getUTCMonth() + 1,
    day: target.getUTCDate(),
  };
}

export function resolveDayInYear(
  year: number,
  month: number,
  day: number
): DateParts {
  const clampedDay = Math.min(day, getDaysInMonth(year, month));
  return { year, month, day: clampedDay };
}

/**
 * Computes D-Day strictly using date-level integer math (timezone-safe).
 * - Same date as today -> D-Day (0)
 * - Future date -> D-N
 * - Past date -> rolls to next year's matching month/day when repeating (or if anniversary passed this year)
 */
export function calculateDDay(
  anniversary: Pick<Anniversary, 'date' | 'repeatAnnually'>,
  todayParts: DateParts = getTodayDateParts()
): DDayInfo {
  const parsed = parseDateString(anniversary.date);
  if (!parsed) {
    const fallbackDate = formatDateParts(todayParts);
    return {
      daysRemaining: 0,
      label: 'D-Day',
      occurrenceDate: fallbackDate,
      isToday: true,
      isPastOneTime: false,
    };
  }

  const todayEpoch = toUtcEpochDay(todayParts);
  const enteredEpoch = toUtcEpochDay(parsed);

  if (!anniversary.repeatAnnually) {
    const diff = enteredEpoch - todayEpoch;
    if (diff === 0) {
      return {
        daysRemaining: 0,
        label: 'D-Day',
        occurrenceDate: anniversary.date,
        isToday: true,
        isPastOneTime: false,
      };
    }
    if (diff > 0) {
      return {
        daysRemaining: diff,
        label: `D-${diff}`,
        occurrenceDate: anniversary.date,
        isToday: false,
        isPastOneTime: false,
      };
    }
    // Past non-repeating date: still calculate next year's same date if requested, or show D+N
    // Per requirement: "과거 날짜이면 다음 해의 동일한 날짜를 기준으로 계산한다. 생일과 매년 반복되는 기념일은 매년 자동으로 반복되도록 처리한다."
    const nextYearCandidate = resolveDayInYear(
      todayParts.year + (toUtcEpochDay(resolveDayInYear(todayParts.year, parsed.month, parsed.day)) < todayEpoch ? 1 : 0),
      parsed.month,
      parsed.day
    );
    const nextDiff = toUtcEpochDay(nextYearCandidate) - todayEpoch;
    return {
      daysRemaining: nextDiff,
      label: nextDiff === 0 ? 'D-Day' : `D-${nextDiff}`,
      occurrenceDate: formatDateParts(nextYearCandidate),
      isToday: nextDiff === 0,
      isPastOneTime: false,
    };
  }

  // Annual repeat or future target date
  if (enteredEpoch > todayEpoch) {
    const diff = enteredEpoch - todayEpoch;
    return {
      daysRemaining: diff,
      label: `D-${diff}`,
      occurrenceDate: anniversary.date,
      isToday: false,
      isPastOneTime: false,
    };
  }

  const thisYearOccurrence = resolveDayInYear(
    todayParts.year,
    parsed.month,
    parsed.day
  );
  const thisYearEpoch = toUtcEpochDay(thisYearOccurrence);

  const targetOccurrence =
    thisYearEpoch >= todayEpoch
      ? thisYearOccurrence
      : resolveDayInYear(todayParts.year + 1, parsed.month, parsed.day);

  const diff = toUtcEpochDay(targetOccurrence) - todayEpoch;

  return {
    daysRemaining: diff,
    label: diff === 0 ? 'D-Day' : `D-${diff}`,
    occurrenceDate: formatDateParts(targetOccurrence),
    isToday: diff === 0,
    isPastOneTime: false,
  };
}

export function doesAnniversaryOccurOnDate(
  anniversary: Pick<Anniversary, 'date' | 'repeatAnnually'>,
  targetDateStr: string
): boolean {
  const parsed = parseDateString(anniversary.date);
  const target = parseDateString(targetDateStr);
  if (!parsed || !target) return false;

  if (!anniversary.repeatAnnually) {
    return anniversary.date === targetDateStr;
  }

  const resolved = resolveDayInYear(target.year, parsed.month, parsed.day);
  return resolved.month === target.month && resolved.day === target.day;
}

const KOREAN_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;
  const weekdayIndex = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day)
  ).getUTCDay();
  return `${parsed.year}년 ${parsed.month}월 ${parsed.day}일 (${KOREAN_WEEKDAYS[weekdayIndex]})`;
}

export function formatKoreanShortDate(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;
  const weekdayIndex = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day)
  ).getUTCDay();
  return `${parsed.month}월 ${parsed.day}일 (${KOREAN_WEEKDAYS[weekdayIndex]})`;
}

export function formatRemainingSentence(daysRemaining: number): string {
  if (daysRemaining === 0) return '오늘이 바로 기념일이에요!';
  if (daysRemaining === 1) return '내일로 다가왔어요 (1일 남음)';
  return `${daysRemaining}일 남았어요`;
}
