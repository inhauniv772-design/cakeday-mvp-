import React from 'react';
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BRAND_CONTENT } from '../data/cakedayData';
import { CATEGORY_LABELS } from '../services/anniversaryStorage';
import type { Anniversary, DDayInfo } from '../types';
import { cn } from '../utils/cn';
import {
  calculateDDay,
  formatKoreanDate,
  formatKoreanShortDate,
  formatRemainingSentence,
} from '../utils/dateUtils';

interface ConsumerHomeViewProps {
  userName: string;
  anniversaries: Anniversary[];
  onOpenCreate: () => void;
  onOpenDetail: (anniversary: Anniversary) => void;
  onOpenCalendar: () => void;
  onToggleAcknowledge: (anniversaryId: string, occurrenceDate: string) => void;
}

interface EnrichedAnniversary {
  anniversary: Anniversary;
  dDay: DDayInfo;
}

export const ConsumerHomeView: React.FC<ConsumerHomeViewProps> = ({
  userName,
  anniversaries,
  onOpenCreate,
  onOpenDetail,
  onOpenCalendar,
  onToggleAcknowledge,
}) => {
  const sortedItems: EnrichedAnniversary[] = anniversaries
    .map((anniversary) => ({
      anniversary,
      dDay: calculateDDay(anniversary),
    }))
    .sort((a, b) => a.dDay.daysRemaining - b.dDay.daysRemaining);

  const closestItem = sortedItems[0] ?? null;
  const remainingItems = sortedItems.slice(1);

  const upcomingNotifications = sortedItems.filter(
    (item) => item.dDay.daysRemaining <= 14
  );
  const unreadCount = upcomingNotifications.filter(
    (item) =>
      item.anniversary.acknowledgedOccurrenceKey !== item.dDay.occurrenceDate
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Main Welcome Banner */}
      <Card tone="beige" className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-medium text-[#8F6849]">
              {userName}님의 기념일 플래너 · {BRAND_CONTENT.slogan}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#493B32] [text-wrap:balance]">
              특별한 날, 잊지 말고 준비하세요!
            </h1>
            <p className="text-sm sm:text-base text-[#6E5C50] max-w-xl leading-relaxed">
              소중한 사람들의 생일과 기념일을 등록해 두면 남은 날짜를 자동으로 계산해 드립니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <Button variant="primary" size="lg" onClick={onOpenCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>기념일 등록</span>
            </Button>
            <Button variant="outline" size="lg" onClick={onOpenCalendar}>
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>캘린더 보기</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content Grid: Upcoming Anniversaries + In-App Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Upcoming Anniversaries Section */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#493B32]">
              다가오는 기념일
            </h2>
            {sortedItems.length > 0 && (
              <span className="text-xs sm:text-sm text-[#6E5C50] tabular-nums">
                총 {sortedItems.length}개 등록됨
              </span>
            )}
          </div>

          {closestItem === null ? (
            <Card className="text-center py-10 sm:py-12">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] text-[#B58C6A]">
                <Calendar className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-4 text-base font-semibold text-[#493B32]">
                아직 등록된 기념일이 없어요.
              </p>
              <p className="mt-1.5 text-sm text-[#6E5C50]">
                소중한 날을 등록해 보세요!
              </p>
              <div className="mt-6">
                <Button variant="primary" size="lg" onClick={onOpenCreate}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>첫 기념일 등록하기</span>
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Closest Highlight Card */}
              <button
                type="button"
                onClick={() => onOpenDetail(closestItem.anniversary)}
                className="w-full text-left rounded-3xl bg-[#FFFFFF] border border-[#B58C6A]/55 p-6 sm:p-7 transition-all duration-150 hover:border-[#8F6849] active:scale-[0.995] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-[#8F6849]">
                      가장 가까운 기념일 ·{' '}
                      {CATEGORY_LABELS[closestItem.anniversary.category]}
                      {closestItem.anniversary.repeatAnnually
                        ? ' · 매년 반복'
                        : ''}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#493B32]">
                      {closestItem.anniversary.title}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] px-4 py-2 text-center shrink-0">
                    <span className="block font-[var(--font-display)] text-xl sm:text-2xl font-bold text-[#8F6849] tabular-nums">
                      {closestItem.dDay.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E9DFD0] flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-[#493B32]">
                    {formatKoreanDate(closestItem.dDay.occurrenceDate)}
                  </span>
                  <span className="text-[#6E5C50]">
                    {formatRemainingSentence(closestItem.dDay.daysRemaining)}
                  </span>
                </div>

                {closestItem.anniversary.memo && (
                  <p className="mt-3 text-xs sm:text-sm text-[#6E5C50] line-clamp-2">
                    메모: {closestItem.anniversary.memo}
                  </p>
                )}
              </button>

              {/* Remaining Upcoming List */}
              {remainingItems.length > 0 && (
                <Card className="p-0 sm:p-0 divide-y divide-[#E9DFD0] overflow-hidden">
                  {remainingItems.map(({ anniversary, dDay }) => (
                    <button
                      key={anniversary.id}
                      type="button"
                      onClick={() => onOpenDetail(anniversary)}
                      className="w-full min-h-[64px] px-5 py-4 sm:px-6 text-left flex items-center justify-between gap-4 hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-base font-semibold text-[#493B32] truncate">
                            {anniversary.title}
                          </span>
                          <span className="text-xs text-[#6E5C50]">
                            {CATEGORY_LABELS[anniversary.category]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-[#6E5C50]">
                          {formatKoreanShortDate(dDay.occurrenceDate)} ·{' '}
                          {formatRemainingSentence(dDay.daysRemaining)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-[var(--font-display)] text-base sm:text-lg font-bold text-[#8F6849] tabular-nums">
                          {dDay.label}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 text-[#B58C6A]"
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  ))}
                </Card>
              )}
            </>
          )}
        </div>

        {/* In-App Anniversary Notification UI */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#B58C6A]" aria-hidden="true" />
              <h2 className="text-lg sm:text-xl font-bold text-[#493B32]">
                가까운 기념일 알림
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-[#6E5C50] tabular-nums">
              {unreadCount > 0 ? `미확인 ${unreadCount}건` : '모두 확인됨'}
            </span>
          </div>

          <Card className="p-5 sm:p-6">
            {upcomingNotifications.length === 0 ? (
              <div className="py-4 text-center space-y-2">
                <p className="text-sm font-medium text-[#493B32]">
                  14일 이내로 다가오는 기념일 알림이 없습니다.
                </p>
                <p className="text-xs text-[#6E5C50] leading-relaxed">
                  기념일이 2주 이내로 가까워지면 이곳에서 남은 날짜와 확인 상태를 바로 살펴볼 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E9DFD0]">
                {upcomingNotifications.map(({ anniversary, dDay }) => {
                  const isAcknowledged =
                    anniversary.acknowledgedOccurrenceKey ===
                    dDay.occurrenceDate;

                  return (
                    <div
                      key={anniversary.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(anniversary)}
                          className="text-left group cursor-pointer"
                        >
                          <p className="text-xs font-medium text-[#8F6849]">
                            {isAcknowledged ? '확인 완료' : '미확인 알림'} ·{' '}
                            {dDay.label}
                          </p>
                          <p className="mt-1 text-base font-semibold text-[#493B32] group-hover:underline">
                            {anniversary.title}
                          </p>
                          <p className="mt-0.5 text-xs sm:text-sm text-[#6E5C50]">
                            {formatKoreanShortDate(dDay.occurrenceDate)} ·{' '}
                            {formatRemainingSentence(dDay.daysRemaining)}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onToggleAcknowledge(
                              anniversary.id,
                              dDay.occurrenceDate
                            )
                          }
                          className={cn(
                            'min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer inline-flex items-center gap-1.5 border',
                            isAcknowledged
                              ? 'bg-[#FAF8F3] text-[#6E5C50] border-[#E9DFD0] hover:border-[#B58C6A]'
                              : 'bg-[#E9DFD0]/70 text-[#493B32] border-[#E9DFD0] hover:bg-[#E9DFD0]'
                          )}
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{isAcknowledged ? '확인됨' : '확인하기'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
