import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import {
  formatDateParts,
  formatKoreanDate,
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  getTodayDateParts,
  getTodayString,
  parseDateString,
} from '../utils/dateUtils';

interface DatePickerCalendarProps {
  value: string;
  onChange: (nextDate: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  value,
  onChange,
}) => {
  const todayParts = useMemo(() => getTodayDateParts(), []);
  const todayStr = useMemo(() => getTodayString(), []);
  const initialParsed = parseDateString(value) ?? todayParts;

  const [viewYear, setViewYear] = useState<number>(initialParsed.year);
  const [viewMonth, setViewMonth] = useState<number>(initialParsed.month);

  const yearOptions = useMemo(() => {
    const startYear = 1940;
    const endYear = todayParts.year + 10;
    const list: number[] = [];
    for (let y = endYear; y >= startYear; y -= 1) {
      list.push(y);
    }
    return list;
  }, [todayParts.year]);

  const calendarCells = useMemo(() => {
    const firstWeekday = getFirstWeekdayOfMonth(viewYear, viewMonth);
    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const cells: Array<number | null> = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(day);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectToday = () => {
    setViewYear(todayParts.year);
    setViewMonth(todayParts.month);
    onChange(todayStr);
  };

  return (
    <div className="rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E9DFD0]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#493B32] hover:bg-[#E9DFD0]/70 transition-colors cursor-pointer"
          aria-label="이전 달"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1.5">
          <select
            aria-label="연도 선택"
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="min-h-[38px] rounded-xl border border-[#E9DFD0] bg-[#FFFFFF] px-2.5 py-1 text-sm font-semibold text-[#493B32] tabular-nums cursor-pointer focus:border-[#B58C6A] focus:outline-none"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>

          <select
            aria-label="월 선택"
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="min-h-[38px] rounded-xl border border-[#E9DFD0] bg-[#FFFFFF] px-2.5 py-1 text-sm font-semibold text-[#493B32] tabular-nums cursor-pointer focus:border-[#B58C6A] focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSelectToday}
            className="min-h-[38px] rounded-xl px-2.5 text-xs font-medium text-[#8F6849] hover:bg-[#E9DFD0]/60 transition-colors whitespace-nowrap cursor-pointer"
          >
            오늘
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#493B32] hover:bg-[#E9DFD0]/70 transition-colors cursor-pointer"
          aria-label="다음 달"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-xs font-medium text-[#6E5C50]">
        {WEEKDAYS.map((dayName, idx) => (
          <div
            key={dayName}
            className={cn(
              'py-1.5',
              idx === 0 && 'text-[#9F4A3B]',
              idx === 6 && 'text-[#8F6849]'
            )}
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

          const cellDate = formatDateParts({
            year: viewYear,
            month: viewMonth,
            day,
          });
          const isSelected = value === cellDate;
          const isToday = todayStr === cellDate;

          return (
            <button
              key={cellDate}
              type="button"
              onClick={() => onChange(cellDate)}
              className={cn(
                'h-10 w-full rounded-xl text-sm font-medium tabular-nums transition-colors cursor-pointer flex items-center justify-center',
                isSelected
                  ? 'bg-[#8F6849] text-[#FFFFFF] font-semibold'
                  : isToday
                    ? 'bg-[#E9DFD0] text-[#493B32] font-semibold'
                    : 'text-[#493B32] hover:bg-[#E9DFD0]/60'
              )}
              aria-pressed={isSelected}
              aria-label={formatKoreanDate(cellDate)}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="mt-3 pt-2.5 border-t border-[#E9DFD0] text-xs text-[#6E5C50]">
        선택된 날짜:{' '}
        <span className="font-semibold text-[#493B32]">
          {formatKoreanDate(value)}
        </span>
      </p>
    </div>
  );
};
