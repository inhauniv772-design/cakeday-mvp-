import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CATEGORY_LABELS } from '../services/anniversaryStorage';
import type { Anniversary } from '../types';
import { cn } from '../utils/cn';
import {
  calculateDDay,
  doesAnniversaryOccurOnDate,
  formatDateParts,
  formatKoreanDate,
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  getTodayDateParts,
  getTodayString,
} from '../utils/dateUtils';

interface ConsumerCalendarViewProps {
  anniversaries: Anniversary[];
  onOpenCreateForDate: (date: string) => void;
  onOpenDetail: (anniversary: Anniversary) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const ConsumerCalendarView: React.FC<ConsumerCalendarViewProps> = ({
  anniversaries,
  onOpenCreateForDate,
  onOpenDetail,
}) => {
  const todayParts = useMemo(() => getTodayDateParts(), []);
  const todayStr = useMemo(() => getTodayString(), []);

  const [viewYear, setViewYear] = useState<number>(todayParts.year);
  const [viewMonth, setViewMonth] = useState<number>(todayParts.month);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const calendarCells = useMemo(() => {
    const firstWeekday = getFirstWeekdayOfMonth(viewYear, viewMonth);
    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const cells: Array<{ day: number; dateStr: string } | null> = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({
        day,
        dateStr: formatDateParts({ year: viewYear, month: viewMonth, day }),
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Anniversary[]>();
    for (const cell of calendarCells) {
      if (!cell) continue;
      const matching = anniversaries.filter((item) =>
        doesAnniversaryOccurOnDate(item, cell.dateStr)
      );
      if (matching.length > 0) {
        map.set(cell.dateStr, matching);
      }
    }
    return map;
  }, [calendarCells, anniversaries]);

  const selectedDayEvents = useMemo(() => {
    return anniversaries.filter((item) =>
      doesAnniversaryOccurOnDate(item, selectedDate)
    );
  }, [anniversaries, selectedDate]);

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

  const handleJumpToday = () => {
    setViewYear(todayParts.year);
    setViewMonth(todayParts.month);
    setSelectedDate(todayStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#8F6849]">
            월간 기념일 캘린더
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#493B32]">
            한눈에 보는 소중한 날짜
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onOpenCreateForDate(selectedDate)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>기념일 등록</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Monthly Calendar Card */}
        <Card className="lg:col-span-7 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E9DFD0]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#493B32] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-[#493B32] tabular-nums">
                {viewYear}년 {viewMonth}월
              </h2>
              <button
                type="button"
                onClick={handleJumpToday}
                className="min-h-[36px] px-3 rounded-xl bg-[#FAF8F3] border border-[#E9DFD0] text-xs font-medium text-[#8F6849] hover:border-[#B58C6A] transition-colors cursor-pointer"
              >
                오늘
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#493B32] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              aria-label="다음 달"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-[#6E5C50]">
            {WEEKDAYS.map((dayName, idx) => (
              <div
                key={dayName}
                className={cn(
                  'py-2',
                  idx === 0 && 'text-[#9F4A3B]',
                  idx === 6 && 'text-[#8F6849]'
                )}
              >
                {dayName}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;
              }

              const dayEvents = eventsByDate.get(cell.dateStr) ?? [];
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDate === cell.dateStr;
              const isToday = todayStr === cell.dateStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  aria-pressed={isSelected}
                  aria-label={`${formatKoreanDate(cell.dateStr)}${
                    hasEvents ? `, 기념일 ${dayEvents.length}건` : ''
                  }`}
                  className={cn(
                    'h-14 sm:h-16 rounded-2xl p-1.5 flex flex-col items-center justify-between transition-colors cursor-pointer border',
                    isSelected
                      ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                      : isToday
                        ? 'bg-[#E9DFD0]/70 text-[#493B32] border-[#B58C6A]/50'
                        : 'bg-[#FAF8F3]/60 text-[#493B32] border-transparent hover:border-[#E9DFD0] hover:bg-[#FAF8F3]'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs sm:text-sm font-semibold tabular-nums',
                      isSelected ? 'text-[#FFFFFF]' : 'text-[#493B32]'
                    )}
                  >
                    {cell.day}
                  </span>

                  {hasEvents ? (
                    <div className="flex flex-col items-center w-full">
                      {/* Dots on mobile, concise label + dots on tablet/desktop */}
                      <span className="hidden sm:block w-full truncate text-[10px] font-medium px-1">
                        {dayEvents.length > 1
                          ? `${dayEvents[0].title} 외 ${dayEvents.length - 1}`
                          : dayEvents[0].title}
                      </span>
                      <div className="flex items-center justify-center gap-0.5 sm:hidden">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected ? 'bg-[#FFFFFF]' : 'bg-[#B58C6A]'
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="h-3" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Date Events List */}
        <Card className="lg:col-span-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E9DFD0]">
            <div>
              <p className="text-xs font-medium text-[#8F6849]">선택한 날짜</p>
              <h2 className="mt-1 text-lg font-bold text-[#493B32]">
                {formatKoreanDate(selectedDate)}
              </h2>
            </div>
            <span className="text-xs text-[#6E5C50] tabular-nums">
              {selectedDayEvents.length}건
            </span>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-[#6E5C50]">
                이 날짜에 등록된 기념일이 없습니다.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onOpenCreateForDate(selectedDate)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>이 날짜에 기념일 등록</span>
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {selectedDayEvents.map((anniversary) => {
                const dDay = calculateDDay(anniversary);
                return (
                  <button
                    key={anniversary.id}
                    type="button"
                    onClick={() => onOpenDetail(anniversary)}
                    className="w-full text-left rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 transition-colors hover:border-[#B58C6A] cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-[#8F6849]">
                          {CATEGORY_LABELS[anniversary.category]}
                          {anniversary.repeatAnnually ? ' · 매년 반복' : ''}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-[#493B32]">
                          {anniversary.title}
                        </h3>
                      </div>
                      <span className="font-[var(--font-display)] text-base font-bold text-[#8F6849] tabular-nums shrink-0">
                        {dDay.label}
                      </span>
                    </div>

                    {anniversary.memo && (
                      <p className="mt-2 text-xs text-[#6E5C50] leading-relaxed">
                        {anniversary.memo}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-[#8F6849]">
                      눌러서 상세 확인 · 수정하기
                    </p>
                  </button>
                );
              })}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => onOpenCreateForDate(selectedDate)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>이 날짜에 기념일 추가</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
